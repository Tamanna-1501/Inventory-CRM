import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { createCompanyWithAdmin } from '@/lib/companyRegistration';
import { writeAuditLog } from '@/lib/auditLog';

function setLoginCookie(response, user, companyId) {
  response.cookies.set('token', signToken({ id: user.id, role: 'ADMIN', companyId, isSuperAdmin: false }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const creator = await getUserFromRequest();

    // Logged-out requests create a company and its first ADMIN account.
    if (!creator) {
      const companyName = String(body.companyName || '').trim();
      const adminName = String(body.adminName || body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const phone = String(body.phone || '').trim();
      if (!companyName || !adminName || !email || !password) {
        return NextResponse.json({ message: 'Company name, admin name, email and password are required' }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: 'Enter a valid email address' }, { status: 400 });
      if (password.length < 8) return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
      if (Buffer.byteLength(password, 'utf8') > 72) return NextResponse.json({ message: 'Password cannot exceed 72 UTF-8 bytes' }, { status: 400 });
      const created = await prisma.$transaction((tx) => createCompanyWithAdmin(tx, {
        companyName, adminName, email, password, phone, source: 'self',
      }));
      const response = NextResponse.json({
        message: 'Company registered successfully',
        redirectTo: '/dashboard',
        user: { id: created.user.id, name: created.user.name, email: created.user.email, role: 'ADMIN', companyId: created.company.id },
      }, { status: 201 });
      setLoginCookie(response, created.user, created.company.id);
      return response;
    }

    if (creator.isSuperAdmin || !creator.companyId) {
      return NextResponse.json({ message: 'A company admin session is required to create staff' }, { status: 403 });
    }
    if (!hasPermission(creator, 'user', 'add')) {
      return NextResponse.json({ message: 'You cannot create users' }, { status: 403 });
    }
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const roleId = Number(body.roleId);
    if (!name || !email || !password || !Number.isInteger(roleId)) {
      return NextResponse.json({ message: 'Name, email, password and a valid role are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: 'Enter a valid email address' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    if (Buffer.byteLength(password, 'utf8') > 72) return NextResponse.json({ message: 'Password cannot exceed 72 UTF-8 bytes' }, { status: 400 });
    const role = await prisma.role.findFirst({ where: { id: roleId, companyId: creator.companyId } });
    if (!role || ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(role.name.toUpperCase())) {
      return NextResponse.json({ message: 'Please select a valid staff role' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const newUser = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          companyId: creator.companyId,
          name,
          email,
          phone: body.phone ? String(body.phone).trim() : null,
          address: body.address ? String(body.address).trim() : null,
          password: passwordHash,
          roleId: role.id,
        },
      });
      await writeAuditLog(tx, creator, { action: 'create', entity: 'User', entityId: created.id, details: { email: created.email, role: role.name } });
      return created;
    });
    return NextResponse.json({
      message: 'User created successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: role.name },
    }, { status: 201 });
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'Email or company email is already in use' }, { status: 409 });
    console.error('POST /api/auth/register error:', error);
    return NextResponse.json({ message: 'Unable to complete registration' }, { status: 500 });
  }
}
