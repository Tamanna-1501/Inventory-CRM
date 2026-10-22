import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { companyId: user.companyId },
    include: {
      parent: true,
      children: { where: { companyId: user.companyId } },
      products: { where: { companyId: user.companyId } },
    },
  });
  return NextResponse.json(categories);
}

export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'category', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { name, image, parentId } = await request.json();
  if (!String(name || '').trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  let tenantParentId = null;
  if (parentId) {
    const parsedParentId = Number(parentId);
    if (!Number.isInteger(parsedParentId) || parsedParentId <= 0) return NextResponse.json({ message: 'Invalid parent category' }, { status: 400 });
    const parent = await prisma.category.findFirst({
      where: { id: parsedParentId, companyId: user.companyId },
      select: { id: true },
    });
    if (!parent) return NextResponse.json({ message: 'Parent category not found in this company' }, { status: 404 });
    tenantParentId = parent.id;
  }

  const category = await prisma.$transaction(async (tx) => {
    const created = await tx.category.create({
      data: { companyId: user.companyId, name: name.trim(), image: image || null, parentId: tenantParentId },
    });
    await writeAuditLog(tx, user, { action: 'create', entity: 'Category', entityId: created.id, details: { name: created.name, parentId: created.parentId } });
    return created;
  });
  return NextResponse.json(category, { status: 201 });
}
