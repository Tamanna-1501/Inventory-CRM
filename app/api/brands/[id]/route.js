import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'brand', 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid brand id' }, { status: 400 });
    const current = await prisma.brand.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    const body = await request.json();
    if (!String(body.name || '').trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    const data = { name: String(body.name).trim() };
    if (body.image !== undefined) data.image = body.image || null;
    const brand = await prisma.$transaction(async (tx) => {
      const updated = await tx.brand.update({ where: { id: current.id }, data });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Brand', entityId: current.id, details: { name: updated.name } });
      return updated;
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.error('PUT /api/brands/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update brand' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'brand', 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid brand id' }, { status: 400 });
    const brand = await prisma.brand.findFirst({ where: { id, companyId: user.companyId }, select: { id: true, name: true } });
    if (!brand) return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      await tx.brand.delete({ where: { id: brand.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Brand', entityId: brand.id, details: { name: brand.name } });
    });
    return NextResponse.json({ message: 'Brand deleted' });
  } catch (error) {
    if (error?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete a brand that is assigned to products' }, { status: 409 });
    console.error('DELETE /api/brands/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete brand' }, { status: 500 });
  }
}
