import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const suppliers = await prisma.supplier.findMany({ where: { companyId: user.companyId }, orderBy: { id: 'desc' } });
  return NextResponse.json(suppliers);
}

export async function POST(request) {
  const { user, error } = await authorize('supplier', 'add');
  if (error) return error;

  const { name, phone, email, address, country, city, zipCode, company, supplierCode } = await request.json();
  if (!String(name || '').trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  try {
    const supplier = await prisma.$transaction(async (tx) => {
      const created = await tx.supplier.create({ data: {
      companyId: user.companyId,
      name: name.trim(), phone, email, address, country, city, zipCode, company,
      supplierCode: supplierCode ? String(supplierCode).trim() : null,
      } });
      await writeAuditLog(tx, user, { action: 'create', entity: 'Supplier', entityId: created.id, details: { name: created.name, supplierCode: created.supplierCode } });
      return created;
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (err) {
    if (err?.code === 'P2002') return NextResponse.json({ message: 'Supplier code already exists in this company' }, { status: 409 });
    console.error('POST /api/suppliers error:', err);
    return NextResponse.json({ message: 'Unable to create supplier' }, { status: 500 });
  }
}
