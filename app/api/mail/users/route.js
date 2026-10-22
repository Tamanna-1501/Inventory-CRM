import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/apiAuth";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (me.isSuperAdmin || !me.companyId) return NextResponse.json({ error: "Company access required" }, { status: 403 });

    // Apne alawa saare users (status ka koi filter nahi)
    const users = await prisma.user.findMany({
      where: { companyId: me.companyId, id: { not: me.id } },
      select: { id: true, name: true, email: true, role: { select: { name: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        name: u.name ?? u.email,
        email: u.email,
        role: u.role?.name ?? null,
      }))
    );
  } catch (error) {
    console.error("GET /api/mail/users error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
