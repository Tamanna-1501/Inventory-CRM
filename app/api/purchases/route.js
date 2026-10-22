import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorizeAny } from '@/lib/apiAuth';
import { generatePurchaseReference } from '@/lib/referenceHelper';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const { user, error } = await authorizeAny(['purchase', 'purchase_return', 'purchase_invoice', 'purchase_payment', 'Purchase Report', 'Supplier Report', 'Shipping Charge', 'Tax Report', 'Payment Report']);
  if (error) return error;

  const purchases = await prisma.purchase.findMany({
    where: { companyId: user.companyId },
    include: {
      supplier: true,
      warehouse: true,
      items: { include: { product: true } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const purchasesWithPaymentInfo = purchases.map((purchase) => {
    const totalPaid = purchase.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
    const due = Number(purchase.totalAmount) - totalPaid;

    let paymentStatus = 'unpaid';
    if (totalPaid >= Number(purchase.totalAmount)) paymentStatus = 'paid';
    else if (totalPaid > 0) paymentStatus = 'partial';

    return { ...purchase, totalPaid, due, paymentStatus };
  });

  return NextResponse.json(purchasesWithPaymentInfo);
}

export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'purchases', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    const { supplierId, warehouseId, items, shippingCharge = 0, note, status } = await request.json();

    if (!supplierId || !warehouseId || !items?.length) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const purchase = await prisma.$transaction(async (tx) => {
      const [supplier, warehouse] = await Promise.all([
        tx.supplier.findFirst({ where: { id: Number(supplierId), companyId: user.companyId }, select: { id: true } }),
        tx.warehouse.findFirst({ where: { id: Number(warehouseId), companyId: user.companyId }, select: { id: true } }),
      ]);
      if (!supplier || !warehouse) throw new Error('Supplier or warehouse not found in this company');

      const pricedItems = [];
      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) throw new Error('Each product quantity must be a positive integer');
        const product = await tx.product.findFirst({ where: { id: Number(item.productId), companyId: user.companyId } });
        if (!product) throw new Error(`Product ${item.productId} not found in this company`);
        const tax = Number(item.tax || 0);
        const discount = Number(item.discount || 0);
        if (!Number.isFinite(tax) || tax < 0 || !Number.isFinite(discount) || discount < 0) throw new Error('Tax and discount must be non-negative amounts');
        pricedItems.push({ product, quantity, price: Number(product.costPrice), tax, discount });
      }
      const itemsTotal = pricedItems.reduce((sum, item) => sum + item.quantity * item.price + item.tax - item.discount, 0);
      const totalAmount = itemsTotal + Number(shippingCharge || 0);
      if (!Number.isFinite(totalAmount) || totalAmount < 0) throw new Error('Purchase total must be a non-negative amount');
      const reference = await generatePurchaseReference(user.companyId, tx);
      const newPurchase = await tx.purchase.create({
        data: {
          companyId: user.companyId,
          reference,
          supplierId: Number(supplierId),
          warehouseId: Number(warehouseId),
          shippingCharge,
          note,
          status: status || 'pending',
          totalAmount,
        },
      });

      for (const item of pricedItems) {
        await tx.purchaseItem.create({
          data: {
            purchaseId: newPurchase.id,
            productId: item.product.id,
            quantity: item.quantity,
            price: item.price,
          },
        });

        await tx.stock.upsert({
          where: {
            companyId_productId_warehouseId: {
              companyId: user.companyId,
              productId: item.product.id,
              warehouseId: Number(warehouseId),
            },
          },
          update: { quantity: { increment: item.quantity } },
          create: {
            companyId: user.companyId,
            productId: item.product.id,
            warehouseId: Number(warehouseId),
            quantity: item.quantity,
          },
        });
      }

      await writeAuditLog(tx, user, { action: 'create', entity: 'Purchase', entityId: newPurchase.id, details: { reference: newPurchase.reference, totalAmount, itemCount: pricedItems.length } });
      return newPurchase;
    });

    return NextResponse.json({ message: 'Purchase created', purchase }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
