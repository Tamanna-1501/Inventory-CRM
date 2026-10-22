import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request, { params }) {
  const { user, error } = await authorize('customer', 'edit');
  if (error) return error;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid customer id' }, { status: 400 });
    const current = await prisma.customer.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    const data = {
      name,
      phone: body.phone ?? null,
      email: body.email ?? null,
      address: body.address ?? null,
      customerGroup: body.customerGroup || 'General',
    };
    if (body.rewardPoints !== undefined) {
      const points = body.rewardPoints === '' || body.rewardPoints === null ? 0 : Number(body.rewardPoints);
      if (!Number.isInteger(points) || points < 0) return NextResponse.json({ message: 'Reward points must be a non-negative whole number' }, { status: 400 });
      data.rewardPoints = points;
    }
    const customer = await prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({ where: { id: current.id }, data });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Customer', entityId: current.id, details: { changedFields: Object.keys(data), name: updated.name } });
      return updated;
    });
    return NextResponse.json(customer);
  } catch (err) {
    console.error('PUT /api/customers/[id] error:', err);
    return NextResponse.json({ message: 'Unable to update customer' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = await authorize('customer', 'delete');
  if (error) return error;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid customer id' }, { status: 400 });
    const customer = await prisma.customer.findFirst({ where: { id, companyId: user.companyId }, select: { id: true, name: true, email: true } });
    if (!customer) return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      await tx.customer.delete({ where: { id: customer.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Customer', entityId: customer.id, details: { name: customer.name, email: customer.email } });
    });
    return NextResponse.json({ message: 'Customer deleted' });
  } catch (err) {
    if (err?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete: customer is used in sales' }, { status: 409 });
    console.error('DELETE /api/customers/[id] error:', err);
    return NextResponse.json({ message: 'Unable to delete customer' }, { status: 500 });
  }
}
