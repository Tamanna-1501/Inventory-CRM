import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeLogin, authorizeAdmin, isAdmin } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

// Add User page ko role dropdown chahiye, isliye GET login walon ke liye hai.
// Par permissions sirf admin ko dikhti hain.
export async function GET() {
  try {
    const { user, error } = await authorizeLogin();
    if (error) return error;

    if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });
    const roles = await prisma.role.findMany({ where: { companyId: user.companyId }, orderBy: { id: 'asc' } });
    if (isAdmin(user)) return NextResponse.json(roles);

    return NextResponse.json(
      roles.map(({ id, name, description }) => ({ id, name, description }))
    );
  } catch (error) {
    console.error('GET /api/roles error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authorizeAdmin();
    if (error) return error;
    if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });

    const { name, description } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Role name is required' }, { status: 400 });
    }
    if (name.trim().toUpperCase() === 'SUPERADMIN') {
      return NextResponse.json({ message: 'SUPERADMIN is a reserved system account type' }, { status: 400 });
    }

    const existing = await prisma.role.findFirst({ where: { companyId: user.companyId, name: name.trim() } });
    if (existing) {
      return NextResponse.json({ message: 'A role with this name already exists' }, { status: 409 });
    }

    const role = await prisma.$transaction(async (tx) => {
      const created = await tx.role.create({
        data: { companyId: user.companyId, name: name.trim(), description: description || null, permissions: {} },
      });
      await writeAuditLog(tx, user, { action: 'create', entity: 'Role', entityId: created.id, details: { name: created.name } });
      return created;
    });
    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('POST /api/roles error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
