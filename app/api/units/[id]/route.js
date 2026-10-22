import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'unit', 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid unit id' }, { status: 400 });
    const current = await prisma.unit.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Unit not found' }, { status: 404 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    const shortName = String(body.shortName || '').trim();
    if (!name || !shortName) return NextResponse.json({ message: 'Name and short name are required' }, { status: 400 });
    const unit = await prisma.$transaction(async (tx) => {
      const updated = await tx.unit.update({ where: { id: current.id }, data: { name, shortName } });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Unit', entityId: current.id, details: { name: updated.name, shortName: updated.shortName } });
      return updated;
    });
    return NextResponse.json(unit);
  } catch (error) {
    console.error('PUT /api/units/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update unit' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'unit', 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid unit id' }, { status: 400 });
    const unit = await prisma.unit.findFirst({ where: { id, companyId: user.companyId }, select: { id: true, name: true, shortName: true } });
    if (!unit) return NextResponse.json({ message: 'Unit not found' }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      await tx.unit.delete({ where: { id: unit.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Unit', entityId: unit.id, details: { name: unit.name, shortName: unit.shortName } });
    });
    return NextResponse.json({ message: 'Unit deleted' });
  } catch (error) {
    if (error?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete a unit that is assigned to products' }, { status: 409 });
    console.error('DELETE /api/units/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete unit' }, { status: 500 });
  }
}
