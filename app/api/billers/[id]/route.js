import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request, { params }) {
  const { user, error } = await authorize('biller', 'edit');
  if (error) return error;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid biller id' }, { status: 400 });
    const current = await prisma.biller.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Biller not found' }, { status: 404 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

    let parsedWarehouseId = null;
    if (body.warehouseId) {
      parsedWarehouseId = Number(body.warehouseId);
      if (!Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0) return NextResponse.json({ message: 'Invalid warehouse' }, { status: 400 });
      const warehouse = await prisma.warehouse.findFirst({ where: { id: parsedWarehouseId, companyId: user.companyId }, select: { id: true } });
      if (!warehouse) return NextResponse.json({ message: 'Warehouse not found in this company' }, { status: 404 });
    }
    const data = {
      name,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
      nidPassport: body.nidPassport || null,
      warehouseId: parsedWarehouseId,
      zipCode: body.zipCode || null,
      billerCode: body.billerCode ? String(body.billerCode).trim() : null,
    };
    if (body.dateOfJoin !== undefined) {
      if (body.dateOfJoin === null || body.dateOfJoin === '') data.dateOfJoin = null;
      else {
        const date = new Date(body.dateOfJoin);
        if (Number.isNaN(date.getTime())) return NextResponse.json({ message: 'Invalid date of joining' }, { status: 400 });
        data.dateOfJoin = date;
      }
    }
    const biller = await prisma.$transaction(async (tx) => {
      const updated = await tx.biller.update({ where: { id: current.id }, data });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Biller', entityId: current.id, details: { name: updated.name, billerCode: updated.billerCode } });
      return updated;
    });
    return NextResponse.json(biller);
  } catch (err) {
    if (err?.code === 'P2002') return NextResponse.json({ message: 'Biller code already exists in this company' }, { status: 409 });
    console.error('PUT /api/billers/[id] error:', err);
    return NextResponse.json({ message: 'Unable to update biller' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { user, error } = await authorize('biller', 'delete');
  if (error) return error;
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid biller id' }, { status: 400 });
    const biller = await prisma.biller.findFirst({ where: { id, companyId: user.companyId }, select: { id: true, name: true, billerCode: true } });
    if (!biller) return NextResponse.json({ message: 'Biller not found' }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      await tx.biller.delete({ where: { id: biller.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Biller', entityId: biller.id, details: { name: biller.name, billerCode: biller.billerCode } });
    });
    return NextResponse.json({ message: 'Biller deleted' });
  } catch (err) {
    if (err?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete: biller is used in sales' }, { status: 409 });
    console.error('DELETE /api/billers/[id] error:', err);
    return NextResponse.json({ message: 'Unable to delete biller' }, { status: 500 });
  }
}
