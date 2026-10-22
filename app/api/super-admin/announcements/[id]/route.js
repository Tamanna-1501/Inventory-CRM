import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';
import { parseAnnouncementFields } from '@/lib/announcementValidation';

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function PATCH(request, { params }) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid announcement id' }, { status: 400 });
    const body = await request.json();
    const current = await prisma.announcement.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    let data;
    try { data = parseAnnouncementFields(body, false, current); } catch (validationError) {
      return NextResponse.json({ message: validationError.message }, { status: 400 });
    }
    if (!Object.keys(data).length) return NextResponse.json({ message: 'No announcement changes supplied' }, { status: 400 });
    const item = await prisma.$transaction(async (tx) => {
      const updated = await tx.announcement.update({ where: { id }, data });
      await writeAuditLog(tx, user, { action: 'update', entity: 'announcement', entityId: id, details: { title: updated.title, isActive: updated.isActive } });
      return updated;
    });
    return NextResponse.json({ item });
  } catch (error) {
    console.error('PATCH /api/super-admin/announcements/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update announcement' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid announcement id' }, { status: 400 });
    const deleted = await prisma.$transaction(async (tx) => {
      const current = await tx.announcement.findUnique({ where: { id }, select: { id: true, title: true } });
      if (!current) return false;
      await tx.announcement.delete({ where: { id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'announcement', entityId: id, details: { title: current.title } });
      return true;
    });
    if (!deleted) return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    return NextResponse.json({ message: 'Announcement deleted' });
  } catch (error) {
    console.error('DELETE /api/super-admin/announcements/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete announcement' }, { status: 500 });
  }
}
