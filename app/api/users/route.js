import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeAny } from '@/lib/apiAuth';

export async function GET() {
  try {
    const { user, error } = await authorizeAny(['user', 'User Report']);
    if (error) return error;
    if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });

    const users = await prisma.user.findMany({
      where: { companyId: user.companyId },
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role ? { id: u.role.id, name: u.role.name } : null,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
