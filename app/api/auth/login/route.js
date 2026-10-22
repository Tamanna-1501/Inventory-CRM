import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { isAdminRole } from '@/lib/permissions';
import { clearEmailLoginFailures, getClientIp, getLoginBlock, recordLoginFailure } from '@/lib/loginRateLimit';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase().slice(0, 191);
    const password = String(body.password || '');
    const clientIp = getClientIp(request);
    const retryAfter = await getLoginBlock(email, clientIp);
    if (retryAfter) {
      return NextResponse.json(
        { message: `Too many failed sign-in attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email }, include: { role: true, company: true } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await recordLoginFailure(email, clientIp);
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    if (['inactive', 'disabled', 'blocked', 'suspended'].includes(String(user.status || '').toLowerCase())) {
      return NextResponse.json({ message: 'Your account is inactive' }, { status: 403 });
    }
    if (!user.isSuperAdmin && (!user.companyId || !user.company || user.company.status !== 'active')) {
      return NextResponse.json({ message: 'This company account is suspended or unavailable' }, { status: 403 });
    }
    if (!user.role && !user.isSuperAdmin) {
      return NextResponse.json({ message: 'No role assigned. Contact admin.' }, { status: 403 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await clearEmailLoginFailures(email);

    const roleName = String(user.role?.name || '').toUpperCase();
    const token = signToken({ id: user.id, role: roleName, companyId: user.companyId, isSuperAdmin: user.isSuperAdmin });
    const response = NextResponse.json({
      message: 'Login successful',
      redirectTo: user.isSuperAdmin ? '/super-admin/dashboard' : '/dashboard',
      user: {
        id: user.id, name: user.name, email: user.email, role: roleName,
        isAdmin: user.isSuperAdmin || isAdminRole(roleName),
        companyId: user.companyId, isSuperAdmin: user.isSuperAdmin,
      },
    });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.delete('user_role');
    return response;
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ message: 'Unable to sign in' }, { status: 500 });
  }
}
