import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function PATCH(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ error: 'Company access required' }, { status: 403 });

  const id = String((await params).id || '').trim();
  const { action } = await req.json();
  if (!id) return NextResponse.json({ error: 'Invalid message id' }, { status: 400 });

  const msg = await prisma.message.findFirst({
    where: {
      id,
      OR: [{ recipientId: user.id }, { senderId: user.id }],
      sender: { is: { companyId: user.companyId } },
      recipient: { is: { companyId: user.companyId } },
    },
  });
  if (!msg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (action === 'read' && msg.recipientId === user.id) {
    await prisma.message.update({ where: { id: msg.id }, data: { isRead: true } });
  } else if (action === 'star') {
    await prisma.message.update({ where: { id: msg.id }, data: { isStarred: !msg.isStarred } });
  } else if (action === 'delete') {
    await prisma.$transaction(async (tx) => {
      await tx.message.update({
        where: { id: msg.id },
        data: msg.recipientId === user.id ? { recipientDeleted: true } : { senderDeleted: true },
      });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Message', entityId: msg.id, details: { subject: msg.subject } });
    });
  }

  return NextResponse.json({ success: true });
}
