import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize, isAdmin, isAdminRole } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function PUT(request, { params }) {
  try {
    const { user, error } = await authorize('user', 'edit');
    if (error) return error;
    if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });

    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user id' }, { status: 400 });
    }

    const target = await prisma.user.findFirst({ where: { id, companyId: user.companyId }, include: { role: true } });
    if (!target) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // Non-admin kisi admin ko edit nahi kar sakta
    if (!isAdmin(user) && isAdminRole(target.role?.name)) {
      return NextResponse.json({ message: 'Only admin can edit an admin' }, { status: 403 });
    }

    const { name, phone, address, roleId, status } = await request.json();
    const data = { name, phone, address, status };

    if (roleId !== undefined) {
      if (!isAdmin(user) && id === user.id) {
        return NextResponse.json({ message: 'You cannot change your own role' }, { status: 403 });
      }
      if (roleId) {
        const newRole = await prisma.role.findFirst({ where: { id: Number(roleId), companyId: user.companyId } });
        if (!newRole) return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
        if (isAdminRole(newRole.name) && target.roleId !== newRole.id) {
          return NextResponse.json({ message: 'New users cannot be assigned the company admin role' }, { status: 403 });
        }
        data.roleId = newRole.id;
      } else {
        data.roleId = null;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.user.update({ where: { id }, data, include: { role: true } });
      await writeAuditLog(tx, user, { action: 'update', entity: 'User', entityId: id, details: { email: row.email, role: row.role?.name, status: row.status, changedFields: Object.keys(data) } });
      return row;
    });
    const { password: _pw, ...userWithoutPassword } = updated;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'Email is already in use' }, { status: 409 });
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authorize('user', 'delete');
    if (error) return error;
    if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });

    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid user id' }, { status: 400 });
    }
    if (id === user.id) {
      return NextResponse.json({ message: 'You cannot delete yourself' }, { status: 400 });
    }

    const target = await prisma.user.findFirst({ where: { id, companyId: user.companyId }, include: { role: true } });
    if (!target) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    if (!isAdmin(user) && isAdminRole(target.role?.name)) {
      return NextResponse.json({ message: 'Only admin can delete an admin' }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'User', entityId: id, details: { email: target.email, role: target.role?.name } });
    });
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
