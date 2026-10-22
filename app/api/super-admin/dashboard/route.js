import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';

export async function GET() {
  try {
    const { error } = await authorizeSuperAdmin();
    if (error) return error;

    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const [totalCompanies, activeCompanies, suspendedCompanies, newCompaniesThisMonth, totalUsers, recentCompanies] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: 'active' } }),
      prisma.company.count({ where: { status: 'suspended' } }),
      // Migration se banaya Default Company real registration nahi hai.
      prisma.company.count({ where: { id: { not: 1 }, createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { isSuperAdmin: false, companyId: { not: null } } }),
      prisma.company.findMany({
        where: { id: { not: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true, name: true, email: true, status: true, source: true, createdAt: true,
          _count: { select: { users: true } },
        },
      }),
    ]);

    return NextResponse.json({
      metrics: { totalCompanies, activeCompanies, suspendedCompanies, newCompaniesThisMonth, totalUsers },
      recentCompanies: recentCompanies.map(({ _count, ...company }) => ({ ...company, usersCount: _count.users })),
    });
  } catch (error) {
    console.error('GET /api/super-admin/dashboard error:', error);
    return NextResponse.json({ message: 'Unable to load Super Admin dashboard' }, { status: 500 });
  }
}
