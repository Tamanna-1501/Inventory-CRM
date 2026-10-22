import { NextResponse } from 'next/server';
import { getUserFromRequest, isAdmin } from '@/lib/apiAuth';

export async function GET() {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: (user.role?.name || '').toUpperCase(),
      isAdmin: isAdmin(user),
      companyId: user.companyId,
      company: user.company ? { id: user.company.id, name: user.company.name } : null,
      isSuperAdmin: user.isSuperAdmin,
      isImpersonating: Boolean(user.isImpersonating),
      impersonator: user.impersonator || null,
      permissions: user.role?.permissions || {},
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
