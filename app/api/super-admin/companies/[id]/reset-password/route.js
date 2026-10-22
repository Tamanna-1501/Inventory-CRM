import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';

export async function POST(request, { params }) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ message: 'Invalid company id' }, { status: 400 });
    const body = await request.json();
    const password = String(body.password || '');
    if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json({ message: 'Password must be at least 12 characters and at most 72 UTF-8 bytes' }, { status: 400 });
    }

    const admin = await prisma.user.findFirst({
      where: { companyId: id, isSuperAdmin: false, role: { is: { companyId: id, name: 'ADMIN' } } },
      select: { id: true, email: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!admin) {
      const company = await prisma.company.findUnique({ where: { id }, select: { id: true } });
      return NextResponse.json({ message: company ? 'No company admin account was found' : 'Company not found' }, { status: company ? 409 : 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: admin.id }, data: { password: hashedPassword } });
      await tx.auditLog.create({
        data: {
          companyId: id,
          userId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          action: 'password_reset',
          entity: 'user',
          entityId: String(admin.id),
          details: { targetEmail: admin.email },
        },
      });
    });
    return NextResponse.json({ message: 'Company admin password reset successfully', adminEmail: admin.email });
  } catch (error) {
    console.error('POST /api/super-admin/companies/[id]/reset-password error:', error);
    return NextResponse.json({ message: 'Unable to reset company admin password' }, { status: 500 });
  }
}
