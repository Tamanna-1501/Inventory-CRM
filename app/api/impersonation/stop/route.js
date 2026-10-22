import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, verifyToken } from '@/lib/auth';
import { writeAuditLog } from '@/lib/auditLog';

function setToken(response, token) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const decoded = verifyToken(cookieStore.get('token')?.value || '');
    const impersonatorId = Number(decoded?.impersonatorId);
    if (!decoded || !Number.isInteger(impersonatorId) || impersonatorId <= 0) {
      return NextResponse.json({ message: 'No active impersonation session' }, { status: 403 });
    }

    const superAdmin = await prisma.user.findFirst({
      where: { id: impersonatorId, isSuperAdmin: true, companyId: null },
      select: { id: true, name: true, email: true, role: { select: { name: true } } },
    });
    if (!superAdmin) return NextResponse.json({ message: 'Super Admin session is unavailable' }, { status: 403 });

    const target = await prisma.user.findFirst({
      where: { id: Number(decoded.id), isSuperAdmin: false },
      select: { id: true, email: true, companyId: true, company: { select: { name: true } } },
    });

    await prisma.$transaction((tx) => writeAuditLog(tx, superAdmin, {
      action: 'impersonation_stop',
      entity: 'CompanyAdminSession',
      entityId: decoded.id,
      companyId: target?.companyId ?? null,
      details: { targetAdminEmail: target?.email, companyName: target?.company?.name },
    }));

    const token = signToken({
      id: superAdmin.id,
      role: String(superAdmin.role?.name || 'SUPERADMIN').toUpperCase(),
      companyId: null,
      isSuperAdmin: true,
    });
    const response = NextResponse.json({ message: 'Impersonation ended', redirectTo: '/super-admin/dashboard' });
    setToken(response, token);
    return response;
  } catch (error) {
    console.error('POST /api/impersonation/stop error:', error);
    return NextResponse.json({ message: 'Unable to end impersonation session' }, { status: 500 });
  }
}
