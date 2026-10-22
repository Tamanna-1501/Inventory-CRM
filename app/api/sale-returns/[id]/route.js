import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

const MODULE = 'sale-returns';
class HttpError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function errorResponse(error) {
  if (error instanceof HttpError) return NextResponse.json({ message: error.message }, { status: error.status });
  console.error('Sale return mutation error:', error);
  return NextResponse.json({ message: 'Unable to update sale return' }, { status: 500 });
}

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, MODULE, 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid return id' }, { status: 400 });
    const current = await prisma.saleReturn.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Return not found' }, { status: 404 });
    const { reason } = await request.json();
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.saleReturn.update({ where: { id: current.id }, data: { reason: reason?.trim() || null } });
      await writeAuditLog(tx, user, { action: 'update', entity: 'SaleReturn', entityId: current.id, details: { reason: row.reason } });
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

// Return delete ke waqt added stock wapas minus hota hai.
export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, MODULE, 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ message: 'Invalid return id' }, { status: 400 });
  try {
    await prisma.$transaction(async (tx) => {
      const ret = await tx.saleReturn.findFirst({
        where: { id, companyId: user.companyId },
        include: { items: { include: { product: true } } },
      });
      if (!ret) throw new HttpError('Return not found', 404);
      for (const item of ret.items) {
        const where = { companyId_productId_warehouseId: { companyId: user.companyId, productId: item.productId, warehouseId: ret.warehouseId } };
        const stock = await tx.stock.findUnique({ where });
        if (!stock || stock.quantity < item.quantity) {
          throw new HttpError(`Cannot delete: stock returned for product ${item.product?.name || item.productId} has already been sold or used.`, 409);
        }
        await tx.stock.update({ where, data: { quantity: { decrement: item.quantity } } });
      }
      await tx.saleReturnItem.deleteMany({ where: { saleReturnId: ret.id } });
      await tx.saleReturn.delete({ where: { id: ret.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'SaleReturn', entityId: ret.id, details: { reference: ret.reference, totalAmount: ret.totalAmount, itemCount: ret.items.length } });
    });
    return NextResponse.json({ message: 'Return deleted and stock adjusted' });
  } catch (error) {
    return errorResponse(error);
  }
}
