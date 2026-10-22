import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';
import { createCompanyWithAdmin } from '@/lib/companyRegistration';

export async function GET(request) {
  try {
    const { error } = await authorizeSuperAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const search = String(searchParams.get('search') || '').trim();
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const where = {
      ...(status === 'active' || status === 'suspended' ? { status } : {}),
      ...(source === 'self' || source === 'superadmin' ? { source } : {}),
      ...(search ? { OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ] } : {}),
    };

    const companies = await prisma.company.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true, status: true, source: true, createdAt: true,
        _count: { select: { users: true, sales: true } },
      },
    });
    const companyIds = companies.map((company) => company.id);
    const latestLogins = companyIds.length ? await prisma.user.groupBy({
      by: ['companyId'],
      where: { companyId: { in: companyIds }, isSuperAdmin: false },
      _max: { lastLoginAt: true },
    }) : [];
    const lastLoginByCompany = new Map(latestLogins.map((row) => [row.companyId, row._max.lastLoginAt]));
    return NextResponse.json(companies.map(({ _count, ...company }) => ({
      ...company,
      usersCount: _count.users,
      salesCount: _count.sales,
      lastLoginAt: lastLoginByCompany.get(company.id) || null,
    })), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('GET /api/super-admin/companies error:', error);
    return NextResponse.json({ message: 'Unable to load companies' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;
    const body = await request.json();
    const companyName = String(body.companyName || '').trim();
    const adminName = String(body.adminName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const phone = String(body.phone || '').trim();

    if (!companyName || !adminName || !email || !password) {
      return NextResponse.json({ message: 'Company name, admin name, email and password are required' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: 'Enter a valid admin email address' }, { status: 400 });
    if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json({ message: 'Password must be at least 12 characters and at most 72 UTF-8 bytes' }, { status: 400 });
    }

    const created = await prisma.$transaction((tx) => createCompanyWithAdmin(tx, {
      companyName, adminName, email, password, phone, source: 'superadmin', actor: user,
    }));
    return NextResponse.json({
      message: 'Company created successfully',
      company: { id: created.company.id, name: created.company.name, email: created.company.email, phone: created.company.phone, status: created.company.status, source: created.company.source, createdAt: created.company.createdAt, usersCount: 1 },
      admin: { id: created.user.id, name: created.user.name, email: created.user.email },
    }, { status: 201 });
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'Company or admin email is already in use' }, { status: 409 });
    console.error('POST /api/super-admin/companies error:', error);
    return NextResponse.json({ message: 'Unable to create company' }, { status: 500 });
  }
}
