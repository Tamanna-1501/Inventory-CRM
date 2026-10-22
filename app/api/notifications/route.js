import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/apiAuth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ error: "Company access required" }, { status: 403 });

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({ items, unreadCount });
}

// "Mark all as read" ya ek notification read karna
export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ error: "Company access required" }, { status: 403 });

  const body = await req.json().catch(() => ({}));

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false, ...(body.id ? { id: body.id } : {}) },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
