import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request, { params }) {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ message: 'Invalid warehouse id' }, { status: 400 });
  const warehouse = await prisma.warehouse.findFirst({ where: { id, companyId: user.companyId } });
  if (!warehouse) return NextResponse.json({ message: 'Warehouse not found' }, { status: 404 });
  return NextResponse.json(warehouse);
}

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'warehouse', 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid warehouse id' }, { status: 400 });
    const current = await prisma.warehouse.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Warehouse not found' }, { status: 404 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ message: 'Warehouse name is required' }, { status: 400 });
    const updatedWarehouse = await prisma.$transaction(async (tx) => {
      const updated = await tx.warehouse.update({
        where: { id: current.id },
        data: { name, phone: body.phone || null, email: body.email || null, address: body.address || null },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Warehouse', entityId: current.id, details: { name: updated.name } });
      return updated;
    });
    return NextResponse.json({ message: 'Warehouse updated successfully', warehouse: updatedWarehouse });
  } catch (error) {
    console.error('PUT /api/warehouses/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update warehouse' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'warehouse', 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const warehouseId = parseId((await params).id);
    if (!warehouseId) return NextResponse.json({ message: 'Invalid warehouse id' }, { status: 400 });
    const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, companyId: user.companyId }, select: { id: true, name: true } });
    if (!warehouse) return NextResponse.json({ message: 'Warehouse not found' }, { status: 404 });

    const [hasStock, hasSales, hasPurchases] = await Promise.all([
      prisma.stock.findFirst({ where: { companyId: user.companyId, warehouseId, quantity: { gt: 0 } }, select: { id: true } }),
      prisma.sale.findFirst({ where: { companyId: user.companyId, warehouseId }, select: { id: true } }),
      prisma.purchase.findFirst({ where: { companyId: user.companyId, warehouseId }, select: { id: true } }),
    ]);
    if (hasStock || hasSales || hasPurchases) {
      return NextResponse.json({ message: 'Cannot delete warehouse with active stock, sales, or purchase records.' }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.warehouse.delete({ where: { id: warehouse.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Warehouse', entityId: warehouse.id, details: { name: warehouse.name } });
    });
    return NextResponse.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    if (error?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete warehouse because related records exist.' }, { status: 409 });
    console.error('DELETE /api/warehouses/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete warehouse' }, { status: 500 });
  }
}
