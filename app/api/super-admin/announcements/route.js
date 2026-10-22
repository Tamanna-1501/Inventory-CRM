import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';
import { parseAnnouncementFields } from '@/lib/announcementValidation';

export async function GET() {
  try {
    const { error } = await authorizeSuperAdmin();
    if (error) return error;
    const items = await prisma.announcement.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('GET /api/super-admin/announcements error:', error);
    return NextResponse.json({ message: 'Unable to load announcements' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authorizeSuperAdmin();
    if (error) return error;
    const body = await request.json();
    let data;
    try { data = parseAnnouncementFields(body, true); } catch (validationError) {
      return NextResponse.json({ message: validationError.message }, { status: 400 });
    }
    const item = await prisma.$transaction(async (tx) => {
      const created = await tx.announcement.create({ data: { ...data, createdById: user.id } });
      await writeAuditLog(tx, user, { action: 'create', entity: 'announcement', entityId: created.id, details: { title: created.title } });
      return created;
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('POST /api/super-admin/announcements error:', error);
    return NextResponse.json({ message: 'Unable to create announcement' }, { status: 500 });
  }
}

