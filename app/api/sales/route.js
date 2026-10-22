import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorizeAny } from '@/lib/apiAuth';
import { generateInvoiceNumber, generateSaleReference } from '@/lib/referenceHelper';
import { getFinalPrice } from '@/lib/price';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const { user, error } = await authorizeAny(['sales', 'pos', 'sale_return', 'sale_invoice', 'sale_payment', 'Sales Report', 'Customer Report', 'Discount Report', 'Shipping Charge', 'Tax Report', 'Payment Report']);
  if (error) return error;

  try {
    const sales = await prisma.sale.findMany({
      where: { companyId: user.companyId },
      include: {
        customer: true,
        warehouse: true,
        biller: true,
        items: {
          include: {
            product: {
              include: {
                unit: true,
                stocks: { where: { companyId: user.companyId } },
              },
            },
          },
        },
        invoice: {
          include: {
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Sales report API error:', error);

    return NextResponse.json(
      { message: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'sales', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    const {
      customerId, warehouseId, billerId, paymentMethod, items,
      discount = 0, shippingCharge = 0, status, note, staffRemark,
      paidAmount = 0, // amount received while creating the sale (default 0 = full due)
      payFull = false, // POS: customer pays the whole bill at the counter
    } = await request.json();

    if (!customerId || !warehouseId || !items?.length) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    for (const [label, value] of [['Discount', discount], ['Shipping charge', shippingCharge]]) {
      if (!Number.isFinite(Number(value)) || Number(value) < 0) return NextResponse.json({ message: `${label} must be a non-negative number` }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const [customer, warehouse, biller, company] = await Promise.all([
        tx.customer.findFirst({ where: { id: Number(customerId), companyId: user.companyId }, select: { id: true } }),
        tx.warehouse.findFirst({ where: { id: Number(warehouseId), companyId: user.companyId }, select: { id: true, name: true } }),
        billerId ? tx.biller.findFirst({ where: { id: Number(billerId), companyId: user.companyId }, select: { id: true } }) : null,
        tx.company.findUnique({ where: { id: user.companyId }, select: { settings: true } }),
      ]);
      if (!customer || !warehouse || (billerId && !biller)) throw new Error('Customer, warehouse or biller not found in this company');
      const settings = company?.settings && typeof company.settings === 'object' && !Array.isArray(company.settings) ? company.settings : {};
      const configuredTaxPercent = Number(settings.taxPercent ?? 0);
      const taxPercent = Number.isFinite(configuredTaxPercent) && configuredTaxPercent >= 0 && configuredTaxPercent <= 100 ? configuredTaxPercent : 0;

      // 1) Read every product from the database and fix the price on the server.
      const pricedItems = [];
      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for product ID ${item.productId}`);
        }

        const product = await tx.product.findFirst({
          where: { id: Number(item.productId), companyId: user.companyId },
        });
        if (!product) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        const stock = await tx.stock.findUnique({
          where: {
            companyId_productId_warehouseId: {
              companyId: user.companyId,
              productId: product.id,
              warehouseId: Number(warehouseId),
            },
          },
        });
        if (!stock || stock.quantity < quantity) {
          const wh = warehouse;
          throw new Error(
            `Insufficient stock for ${product.name} in ${wh?.name || 'selected warehouse'}. ` +
              `Available: ${stock?.quantity ?? 0}, requested: ${quantity}`
          );
        }

        const price = getFinalPrice(product);
        const lineTax = Math.round((Number(price) * quantity * taxPercent / 100 + Number.EPSILON) * 100) / 100;
        pricedItems.push({
          productId: product.id,
          batchNo: item.batchNo,
          quantity,
          price,
          tax: lineTax,
          discount: item.discount || 0,
        });
      }

      const reference = await generateSaleReference(user.companyId, tx);

      const sale = await tx.sale.create({
        data: {
          companyId: user.companyId,
          reference,
          customerId: Number(customerId),
          warehouseId: Number(warehouseId),
          billerId: billerId ? Number(billerId) : null,
          paymentMethod: paymentMethod || 'cash',
          shippingCharge,
          status: status || 'pending',
          note,
          staffRemark,
        },
      });

      // 2) Save the items and reduce the stock
      for (const item of pricedItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            batchNo: item.batchNo,
            quantity: item.quantity,
            price: item.price,
            tax: item.tax,
            discount: item.discount,
          },
        });

        await tx.stock.update({
          where: {
            companyId_productId_warehouseId: {
              companyId: user.companyId,
              productId: item.productId,
              warehouseId: Number(warehouseId),
            },
          },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // 3) Totals are built from the server-side prices
      const subtotal = pricedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
      const taxAmount = pricedItems.reduce((sum, item) => sum + item.tax, 0);
      const grandTotal = subtotal + taxAmount - discount + Number(shippingCharge);
      if (grandTotal < 0) throw new Error('Discount cannot exceed the sale total');

      // 4) How much is paid right now. Default 0, so the whole amount stays due.
      let paidNow = payFull ? grandTotal : Number(paidAmount) || 0;
      if (paidNow < 0) paidNow = 0;
      if (paidNow > grandTotal) {
        throw new Error(`Paid amount cannot be more than the total (₹${grandTotal.toFixed(2)})`);
      }

      const paymentStatus =
        paidNow >= grandTotal - 0.005 && grandTotal > 0 ? 'paid' : paidNow > 0 ? 'partial' : 'unpaid';

      const invoiceNumber = await generateInvoiceNumber(user.companyId, tx);

      const invoice = await tx.invoice.create({
        data: {
          companyId: user.companyId,
          invoiceNumber,
          saleId: sale.id,
          subtotal,
          taxAmount,
          taxPercent,
          discount,
          grandTotal,
          paymentStatus,
        },
      });

      if (paidNow > 0) {
        await tx.payment.create({
          data: {
            invoiceId: invoice.id,
            amountPaid: paidNow,
            paymentMethod: paymentMethod || 'cash',
          },
        });
      }

      await writeAuditLog(tx, user, { action: 'create', entity: 'Sale', entityId: sale.id, details: { reference: sale.reference, invoiceNumber: invoice.invoiceNumber, grandTotal, itemCount: pricedItems.length } });
      return { sale, invoice };
    });

    return NextResponse.json({ message: 'Sale created', ...result }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
