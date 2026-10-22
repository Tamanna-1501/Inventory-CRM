import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request, { params }) {
  const { user, error } = await authorize('supplier', 'edit');
  if (error) return error;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid supplier id' }, { status: 400 });
    const current = await prisma.supplier.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    const supplier = await prisma.$transaction(async (tx) => {
      const updated = await tx.supplier.update({
        where: { id: current.id },
        data: {
        name, phone: body.phone ?? null, email: body.email ?? null, address: body.address ?? null,
        country: body.country ?? null, city: body.city ?? null, zipCode: body.zipCode ?? null,
        company: body.company ?? null,
        supplierCode: body.supplierCode ? String(body.supplierCode).trim() : null,
        },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Supplier', entityId: current.id, details: { name: updated.name, supplierCode: updated.supplierCode } });
      return updated;
    });
    return NextResponse.json(supplier);
  } catch (err) {
    if (err?.code === 'P2002') return NextResponse.json({ message: 'Supplier code already exists in this company' }, { status: 409 });
    console.error('PUT /api/suppliers/[id] error:', err);
    return NextResponse.json({ message: 'Unable to update supplier' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = await authorize('supplier', 'delete');
  if (error) return error;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid supplier id' }, { status: 400 });
    const supplier = await prisma.supplier.findFirst({ where: { id, companyId: user.companyId }, select: { id: true, name: true, supplierCode: true } });
    if (!supplier) return NextResponse.json({ message: 'Supplier not found' }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      await tx.supplier.delete({ where: { id: supplier.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Supplier', entityId: supplier.id, details: { name: supplier.name, supplierCode: supplier.supplierCode } });
    });
    return NextResponse.json({ message: 'Supplier deleted' });
  } catch (err) {
    if (err?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete: supplier is used in purchases' }, { status: 409 });
    console.error('DELETE /api/suppliers/[id] error:', err);
    return NextResponse.json({ message: 'Unable to delete supplier' }, { status: 500 });
  }
}
