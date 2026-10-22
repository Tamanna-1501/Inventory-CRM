import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeLogin } from '@/lib/apiAuth';

export async function GET() {
  try {
    const { error } = await authorizeLogin();
    if (error) return error;

    const now = new Date();
    const items = await prisma.announcement.findMany({
      where: {
        isActive: true,
        startsAt: { lte: now },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, title: true, body: true, startsAt: true, expiresAt: true, createdAt: true },
      take: 20,
    });
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('GET /api/announcements error:', error);
    return NextResponse.json({ message: 'Unable to load announcements' }, { status: 500 });
  }
}
