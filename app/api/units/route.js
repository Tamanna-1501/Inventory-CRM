import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const units = await prisma.unit.findMany({ where: { companyId: user.companyId }, orderBy: { id: 'desc' } });
  return NextResponse.json(units);
}

export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'unit', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { name, shortName } = await request.json();
  if (!String(name || '').trim() || !String(shortName || '').trim()) {
    return NextResponse.json({ message: 'Name and short name are required' }, { status: 400 });
  }

  const unit = await prisma.$transaction(async (tx) => {
    const created = await tx.unit.create({ data: { companyId: user.companyId, name: name.trim(), shortName: shortName.trim() } });
    await writeAuditLog(tx, user, { action: 'create', entity: 'Unit', entityId: created.id, details: { name: created.name, shortName: created.shortName } });
    return created;
  });
  return NextResponse.json(unit, { status: 201 });
}
