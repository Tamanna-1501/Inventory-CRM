import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';
import { signToken } from '@/lib/auth';
import { writeAuditLog } from '@/lib/auditLog';

function setToken(response, token) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  });
}

export async function POST(_request, { params }) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;

    const companyId = Number((await params).id);
    if (!Number.isInteger(companyId) || companyId <= 0) {
      return NextResponse.json({ message: 'Invalid company id' }, { status: 400 });
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId, status: 'active' },
      select: { id: true, name: true },
    });
    if (!company) return NextResponse.json({ message: 'Active company not found' }, { status: 404 });

    const admin = await prisma.user.findFirst({
      where: {
        companyId: company.id,
        isSuperAdmin: false,
        status: { notIn: ['inactive', 'disabled', 'blocked', 'suspended'] },
        role: { is: { companyId: company.id, name: { in: ['ADMIN', 'OWNER'] } } },
      },
      include: { role: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!admin) return NextResponse.json({ message: 'No active company admin account found' }, { status: 404 });

    const token = signToken({
      id: admin.id,
      role: String(admin.role.name).toUpperCase(),
      companyId: company.id,
      isSuperAdmin: false,
      impersonatorId: user.id,
    }, '1h');
    const response = NextResponse.json({
      message: `Now viewing Inventual as ${admin.name || admin.email}`,
      redirectTo: '/dashboard',
      company: { id: company.id, name: company.name },
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
    setToken(response, token);
    await prisma.$transaction((tx) => writeAuditLog(tx, user, {
      action: 'impersonation_start',
      entity: 'CompanyAdminSession',
      entityId: admin.id,
      companyId: company.id,
      details: { companyName: company.name, targetAdminEmail: admin.email },
    }));
    return response;
  } catch (error) {
    console.error('POST /api/super-admin/companies/[id]/impersonate error:', error);
    return NextResponse.json({ message: 'Unable to start company admin session' }, { status: 500 });
  }
}
