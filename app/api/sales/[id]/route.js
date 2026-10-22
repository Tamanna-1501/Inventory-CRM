import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorizeAny } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

const LINKED_RETURN_MESSAGE =
  'You cannot delete this entry because it is linked with a sale return. First delete it from Sale Return.';
const LINKED_RETURN_EDIT_MESSAGE =
  'You cannot edit this entry because it is linked with a sale return. First delete it from Sale Return.';

export async function GET(request, { params }) {
  const { user, error } = await authorizeAny(['sales', 'pos', 'sale_return', 'sale_invoice', 'sale_payment', 'Sales Report', 'Customer Report', 'Discount Report', 'Shipping Charge', 'Tax Report', 'Payment Report']);
  if (error) return error;

  const { id } = await params;
  const sale = await prisma.sale.findFirst({
    where: { id: Number(id), companyId: user.companyId },
    include: {
      customer: true,
      warehouse: true,
      biller: true,
      items: { include: { product: true } },
      invoice: { include: { payments: true } },
    },
  });

  if (!sale) {
    return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
  }

  const returnCount = await prisma.saleReturn.count({ where: { saleId: sale.id, companyId: user.companyId } });

  return NextResponse.json({ ...sale, returnCount });
}

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'sales', 'edit')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { id } = await params;
  const saleId = Number(id);
  const existing = await prisma.sale.findFirst({ where: { id: saleId, companyId: user.companyId }, select: { id: true } });
  if (!existing) return NextResponse.json({ message: 'Sale not found' }, { status: 404 });
  const { note, staffRemark, status } = await request.json();

  try {
    // Guard: sale ke against return bana hua hai toh edit allowed nahi
    const linkedReturns = await prisma.saleReturn.count({ where: { saleId, companyId: user.companyId } });
    if (linkedReturns > 0) {
      return NextResponse.json({ message: LINKED_RETURN_EDIT_MESSAGE }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.sale.update({
        where: { id: saleId },
        data: { note, staffRemark, status },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Sale', entityId: saleId, details: { status } });
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

class LinkedReturnError extends Error {}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'sales', 'delete')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { id } = await params;
  const saleId = Number(id);

  try {
    await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, companyId: user.companyId },
        include: { items: true, invoice: { include: { payments: true } } },
      });
      if (!sale) throw new Error('Sale not found');

      // Guard: sale ke against return bana hua hai toh delete allowed nahi
      const linkedReturns = await tx.saleReturn.count({ where: { saleId, companyId: user.companyId } });
      if (linkedReturns > 0) {
        throw new LinkedReturnError(LINKED_RETURN_MESSAGE);
      }

      // Stock rollback: jo quantity sale se ghati thi, wo wapas add karo
      for (const item of sale.items) {
        await tx.stock.update({
          where: {
            companyId_productId_warehouseId: {
              companyId: user.companyId,
              productId: item.productId,
              warehouseId: sale.warehouseId,
            },
          },
          data: { quantity: { increment: item.quantity } },
        });
      }

      if (sale.invoice) {
        await tx.payment.deleteMany({ where: { invoiceId: sale.invoice.id } });
        await tx.invoice.delete({ where: { id: sale.invoice.id } });
      }

      await tx.saleItem.deleteMany({ where: { saleId } });
      await tx.sale.delete({ where: { id: saleId } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Sale', entityId: saleId, details: { reference: sale.reference, invoiceNumber: sale.invoice?.invoiceNumber } });
    });

    return NextResponse.json({ message: 'Sale deleted and stock restored' });
  } catch (error) {
    if (error instanceof LinkedReturnError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
