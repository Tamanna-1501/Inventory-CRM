import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/apiAuth';
import { isAdminRole } from '@/lib/permissions';

function parseFilters(searchParams) {
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(searchParams.get('pageSize') || 25);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) return null;
  const search = String(searchParams.get('search') || '').trim().slice(0, 100);
  const action = String(searchParams.get('action') || '').trim().slice(0, 191);
  const entity = String(searchParams.get('entity') || '').trim().slice(0, 191);
  const startValue = searchParams.get('startDate');
  const endValue = searchParams.get('endDate');
  const startDate = startValue ? new Date(startValue) : null;
  const endDate = endValue ? new Date(`${endValue}T23:59:59.999Z`) : null;
  if ((startDate && Number.isNaN(startDate.getTime())) || (endDate && Number.isNaN(endDate.getTime()))) return null;
  const where = {
    ...(action ? { action } : {}),
    ...(entity ? { entity } : {}),
    ...(search ? { OR: [
      { actorName: { contains: search } },
      { actorEmail: { contains: search } },
      { entity: { contains: search } },
      { entityId: { contains: search } },
    ] } : {}),
    ...((startDate || endDate) ? { createdAt: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } } : {}),
  };
  return { page, pageSize, where };
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (user.isSuperAdmin || !user.companyId || !isAdminRole(user.role?.name)) {
      return NextResponse.json({ message: 'Only company admins can view this audit log' }, { status: 403 });
    }

    const filters = parseFilters(new URL(request.url).searchParams);
    if (!filters) return NextResponse.json({ message: 'Invalid audit log filters' }, { status: 400 });
    const where = { ...filters.where, companyId: user.companyId };
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        select: { id: true, companyId: true, userId: true, actorName: true, actorEmail: true, action: true, entity: true, entityId: true, details: true, createdAt: true },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return NextResponse.json({ items, total, page: filters.page, pageSize: filters.pageSize });
  } catch (error) {
    console.error('GET /api/audit-logs error:', error);
    return NextResponse.json({ message: 'Unable to load audit log' }, { status: 500 });
  }
}
