import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const brands = await prisma.brand.findMany({ where: { companyId: user.companyId }, orderBy: { id: 'desc' } });
  return NextResponse.json(brands);
}

export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'brand', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { name, image } = await request.json();
  if (!String(name || '').trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  const brand = await prisma.$transaction(async (tx) => {
    const created = await tx.brand.create({ data: { companyId: user.companyId, name: name.trim(), image: image || null } });
    await writeAuditLog(tx, user, { action: 'create', entity: 'Brand', entityId: created.id, details: { name: created.name } });
    return created;
  });
  return NextResponse.json(brand, { status: 201 });
}
