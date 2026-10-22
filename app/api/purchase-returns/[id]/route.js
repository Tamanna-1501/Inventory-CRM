import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

const MODULE = 'purchase-returns';
class HttpError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function errorResponse(error) {
  if (error instanceof HttpError) return NextResponse.json({ message: error.message }, { status: error.status });
  console.error('Purchase return mutation error:', error);
  return NextResponse.json({ message: 'Unable to process purchase return' }, { status: 500 });
}

// Sirf reason editable hai; items aur stock impact locked rahte hain.
export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, MODULE, 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid return id' }, { status: 400 });
    const current = await prisma.purchaseReturn.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Return not found' }, { status: 404 });
    const { reason } = await request.json();
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.purchaseReturn.update({ where: { id: current.id }, data: { reason: reason?.trim() || null } });
      await writeAuditLog(tx, user, { action: 'update', entity: 'PurchaseReturn', entityId: current.id, details: { reason: row.reason } });
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

// Return delete ke waqt stock supplier return se wapas aata hai.
export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, MODULE, 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ message: 'Invalid return id' }, { status: 400 });
  try {
    await prisma.$transaction(async (tx) => {
      const ret = await tx.purchaseReturn.findFirst({ where: { id, companyId: user.companyId }, include: { items: true } });
      if (!ret) throw new HttpError('Return not found', 404);
      for (const item of ret.items) {
        await tx.stock.upsert({
          where: { companyId_productId_warehouseId: { companyId: user.companyId, productId: item.productId, warehouseId: ret.warehouseId } },
          update: { quantity: { increment: item.quantity } },
          create: { companyId: user.companyId, productId: item.productId, warehouseId: ret.warehouseId, quantity: item.quantity },
        });
      }
      await tx.purchaseReturnItem.deleteMany({ where: { purchaseReturnId: ret.id } });
      await tx.purchaseReturn.delete({ where: { id: ret.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'PurchaseReturn', entityId: ret.id, details: { reference: ret.reference, totalAmount: ret.totalAmount, itemCount: ret.items.length } });
    });
    return NextResponse.json({ message: 'Return deleted and stock restored' });
  } catch (error) {
    return errorResponse(error);
  }
}
