import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/apiAuth";
import { writeAuditLog } from "@/lib/auditLog";

// GET /api/messages?folder=inbox|sent|starred|drafts|deleted
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ error: "Company access required" }, { status: 403 });

  const folder = new URL(req.url).searchParams.get("folder") ?? "inbox";

  const where =
    folder === "sent"
      ? { senderId: user.id, isDraft: false, senderDeleted: false }
      : folder === "drafts"
      ? { senderId: user.id, isDraft: true }
      : folder === "starred"
      ? { recipientId: user.id, isStarred: true, recipientDeleted: false }
      : folder === "deleted"
      ? { recipientId: user.id, recipientDeleted: true }
      : { recipientId: user.id, isDraft: false, recipientDeleted: false };

  const [messages, unread] = await Promise.all([
    prisma.message.findMany({
      where: {
        ...where,
        AND: [
          { sender: { is: { companyId: user.companyId } } },
          { recipient: { is: { companyId: user.companyId } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { name: true, email: true } },
        recipient: { select: { name: true, email: true } },
      },
      take: 50,
    }),
    prisma.message.count({
      where: {
        recipientId: user.id, isRead: false, isDraft: false, recipientDeleted: false,
        sender: { is: { companyId: user.companyId } },
        recipient: { is: { companyId: user.companyId } },
      },
    }),
  ]);

  return NextResponse.json({ messages, unread });
}

// Compose / Send / Save draft
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ error: "Company access required" }, { status: 403 });

  const { recipientId: rawRecipientId, subject, body, isDraft = false } = await req.json();
  const recipientId = Number(rawRecipientId);

  if (!Number.isInteger(recipientId) || recipientId <= 0 || !subject?.trim()) {
    return NextResponse.json({ error: "Recipient aur subject zaruri hai" }, { status: 400 });
  }

  const recipient = await prisma.user.findFirst({
    where: { id: recipientId, companyId: user.companyId, isSuperAdmin: false },
    select: { id: true },
  });
  if (!recipient) return NextResponse.json({ error: "Recipient not found in this company" }, { status: 404 });

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({
      data: { senderId: user.id, recipientId: recipient.id, subject: subject.trim(), body: body ?? "", isDraft: Boolean(isDraft) },
    });
    // Message aur notification ek saath commit honge.
    if (!isDraft) {
      await tx.notification.create({
        data: {
          userId: recipient.id,
          title: "Naya message",
          message: `${user.name ?? "Someone"}: ${subject.trim()}`,
          type: "MESSAGE",
          link: "/email",
        },
      });
    }
    await writeAuditLog(tx, user, { action: isDraft ? 'create_draft' : 'create', entity: 'Message', entityId: created.id, details: { recipientId: recipient.id, subject: subject.trim() } });
    return created;
  });

  return NextResponse.json({ success: true, id: message.id });
}
