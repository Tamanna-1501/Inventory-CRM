import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeLogin, isAdmin } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

async function getScopedRole(id, companyId) {
  return prisma.role.findFirst({ where: { id, companyId } });
}

export async function GET(request, { params }) {
  try {
    const { user, error } = await authorizeLogin();
    if (error) return error;
    if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid role id' }, { status: 400 });
    const role = await getScopedRole(id, user.companyId);
    if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    return NextResponse.json(role);
  } catch (error) {
    console.error('GET /api/roles/[id] error:', error);
    return NextResponse.json({ message: 'Unable to load role' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { user, error } = await authorizeLogin();
    if (error) return error;
    if (!isAdmin(user) || user.isSuperAdmin || !user.companyId) {
      return NextResponse.json({ message: 'Access denied: only company admin can manage roles' }, { status: 403 });
    }
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid role id' }, { status: 400 });
    const current = await getScopedRole(id, user.companyId);
    if (!current) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    const body = await request.json();
    const data = {};
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ message: 'Role name is required' }, { status: 400 });
      if (name.toUpperCase() === 'SUPERADMIN') return NextResponse.json({ message: 'SUPERADMIN is reserved' }, { status: 400 });
      data.name = name;
    }
    if (body.description !== undefined) data.description = body.description || null;
    if (body.permissions !== undefined) {
      if (!body.permissions || typeof body.permissions !== 'object' || Array.isArray(body.permissions)) {
        return NextResponse.json({ message: 'Permissions must be an object' }, { status: 400 });
      }
      data.permissions = body.permissions;
    }
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.role.update({ where: { id: current.id }, data });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Role', entityId: current.id, details: { name: row.name, changedFields: Object.keys(data) } });
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'A role with this name already exists' }, { status: 409 });
    console.error('PUT /api/roles/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update role' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authorizeLogin();
    if (error) return error;
    if (!isAdmin(user) || user.isSuperAdmin || !user.companyId) {
      return NextResponse.json({ message: 'Access denied: only company admin can manage roles' }, { status: 403 });
    }
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid role id' }, { status: 400 });
    const role = await getScopedRole(id, user.companyId);
    if (!role) return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    const linkedUsers = await prisma.user.count({ where: { companyId: user.companyId, roleId: role.id } });
    if (linkedUsers) return NextResponse.json({ message: `Cannot delete: ${linkedUsers} user(s) are still assigned to this role` }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      await tx.role.delete({ where: { id: role.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Role', entityId: role.id, details: { name: role.name } });
    });
    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/roles/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete role' }, { status: 500 });
  }
}
