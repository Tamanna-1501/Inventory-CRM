import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const billers = await prisma.biller.findMany({
    where: { companyId: user.companyId },
    include: { warehouse: true },
    orderBy: { id: 'desc' },
  });
  return NextResponse.json(billers);
}

export async function POST(request) {
  try {
    const { user, error } = await authorize('biller', 'add');
    if (error) return error;

    const {
      name,
      phone,
      email,
      address,
      dateOfJoin,
      nidPassport,
      warehouseId,
      zipCode,
      billerCode,
    } = await request.json();

    if (!String(name || '').trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const parsedWarehouseId = warehouseId ? Number(warehouseId) : null;
    if (parsedWarehouseId !== null) {
      if (!Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0) return NextResponse.json({ message: 'Invalid warehouse' }, { status: 400 });
      const warehouse = await prisma.warehouse.findFirst({ where: { id: parsedWarehouseId, companyId: user.companyId }, select: { id: true } });
      if (!warehouse) return NextResponse.json({ message: 'Warehouse not found in this company' }, { status: 404 });
    }
    const joinDate = dateOfJoin ? new Date(dateOfJoin) : new Date();
    if (Number.isNaN(joinDate.getTime())) return NextResponse.json({ message: 'Invalid date of joining' }, { status: 400 });

    const biller = await prisma.$transaction(async (tx) => {
      const created = await tx.biller.create({
      data: {
        companyId: user.companyId,
        name: name.trim(),
        phone: phone || null,
        email: email || null,
        address: address || null,
        dateOfJoin: joinDate,
        nidPassport: nidPassport || null,
        warehouseId: parsedWarehouseId,
        zipCode: zipCode || null,
        billerCode: billerCode || null,
      },
      });
      await writeAuditLog(tx, user, { action: 'create', entity: 'Biller', entityId: created.id, details: { name: created.name, billerCode: created.billerCode } });
      return created;
    });

    return NextResponse.json(biller, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Biller code already exists in this company' }, { status: 409 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
