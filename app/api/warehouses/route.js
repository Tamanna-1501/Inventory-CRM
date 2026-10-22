import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const warehouses = await prisma.warehouse.findMany({ where: { companyId: user.companyId }, orderBy: { id: 'desc' } });
  return NextResponse.json(warehouses);
}

export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'warehouse', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { name, phone, email, address } = await request.json();
  if (!String(name || '').trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  const warehouse = await prisma.$transaction(async (tx) => {
    const created = await tx.warehouse.create({ data: { companyId: user.companyId, name: name.trim(), phone: phone || null, email: email || null, address: address || null } });
    await writeAuditLog(tx, user, { action: 'create', entity: 'Warehouse', entityId: created.id, details: { name: created.name } });
    return created;
  });
  return NextResponse.json(warehouse, { status: 201 });
}
