import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function GET(_request, { params }) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid company id' }, { status: 400 });

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
        users: {
          where: { isSuperAdmin: false, role: { is: { name: 'ADMIN', companyId: id } } },
          select: { id: true, name: true, email: true, status: true, createdAt: true, lastLoginAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!company) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    const [salesCount, latestLogin] = await Promise.all([
      prisma.sale.count({ where: { companyId: id } }),
      prisma.user.aggregate({ where: { companyId: id, isSuperAdmin: false }, _max: { lastLoginAt: true } }),
    ]);
    const { _count, users, ...safeCompany } = company;
    return NextResponse.json({ ...safeCompany, usersCount: _count.users, salesCount, lastLoginAt: latestLogin._max.lastLoginAt, admins: users }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('GET /api/super-admin/companies/[id] error:', error);
    return NextResponse.json({ message: 'Unable to load company details' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid company id' }, { status: 400 });
    const body = await request.json();
    if (!['active', 'suspended'].includes(body.status)) {
      return NextResponse.json({ message: 'Status must be active or suspended' }, { status: 400 });
    }
    const current = await prisma.company.findUnique({ where: { id }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Company not found' }, { status: 404 });
    const company = await prisma.$transaction(async (tx) => {
      const updated = await tx.company.update({ where: { id: current.id }, data: { status: body.status } });
      await tx.auditLog.create({
        data: {
          companyId: current.id,
          userId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          action: 'status_change',
          entity: 'company',
          entityId: String(current.id),
          details: { status: body.status },
        },
      });
      return updated;
    });
    return NextResponse.json({ message: `Company ${body.status === 'active' ? 'activated' : 'suspended'}`, company });
  } catch (error) {
    console.error('PATCH /api/super-admin/companies/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update company status' }, { status: 500 });
  }
}
