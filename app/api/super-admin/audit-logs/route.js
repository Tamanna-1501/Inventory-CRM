import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeSuperAdmin } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    const { error } = await authorizeSuperAdmin();
    if (error) return error;
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || 1);
    const pageSize = Number(searchParams.get('pageSize') || 25);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ message: 'Invalid audit log pagination' }, { status: 400 });
    }

    const search = String(searchParams.get('search') || '').trim().slice(0, 100);
    const action = String(searchParams.get('action') || '').trim().slice(0, 191);
    const entity = String(searchParams.get('entity') || '').trim().slice(0, 191);
    const startValue = searchParams.get('startDate');
    const endValue = searchParams.get('endDate');
    const startDate = startValue ? new Date(startValue) : null;
    const endDate = endValue ? new Date(`${endValue}T23:59:59.999Z`) : null;
    if ((startDate && Number.isNaN(startDate.getTime())) || (endDate && Number.isNaN(endDate.getTime()))) {
      return NextResponse.json({ message: 'Invalid audit log date filters' }, { status: 400 });
    }
    const companyIdParam = searchParams.get('companyId');
    const companyId = companyIdParam ? Number(companyIdParam) : null;
    if (companyIdParam && (!Number.isInteger(companyId) || companyId <= 0)) return NextResponse.json({ message: 'Invalid company id' }, { status: 400 });
    const where = {
      ...(companyId ? { companyId } : {}),
      ...(action ? { action } : {}),
      ...(entity ? { entity } : {}),
      ...((startDate || endDate) ? { createdAt: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } } : {}),
      ...(search ? { OR: [
        { actorName: { contains: search } },
        { actorEmail: { contains: search } },
        { entity: { contains: search } },
        { entityId: { contains: search } },
        { company: { is: { name: { contains: search } } } },
      ] } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, companyId: true, userId: true, actorName: true, actorEmail: true,
          action: true, entity: true, entityId: true, details: true, createdAt: true,
          company: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error('GET /api/super-admin/audit-logs error:', error);
    return NextResponse.json({ message: 'Unable to load platform audit log' }, { status: 500 });
  }
}
