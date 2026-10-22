import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const customers = await prisma.customer.findMany({ where: { companyId: user.companyId }, orderBy: { id: 'desc' } });
  return NextResponse.json(customers);
}

export async function POST(request) {
  const { user, error } = await authorize('customer', 'add');
  if (error) return error;

  const { name, phone, email, address, customerGroup, rewardPoints } = await request.json();
  if (!String(name || '').trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

  const parsedRewardPoints = rewardPoints === '' || rewardPoints == null ? 0 : Number(rewardPoints);
  if (!Number.isInteger(parsedRewardPoints) || parsedRewardPoints < 0) return NextResponse.json({ message: 'Reward points must be a non-negative whole number' }, { status: 400 });

  const customer = await prisma.$transaction(async (tx) => {
    const created = await tx.customer.create({ data: {
      companyId: user.companyId,
      name: name.trim(), phone, email, address,
      customerGroup: customerGroup || 'General',
      rewardPoints: parsedRewardPoints,
    },
  });
    await writeAuditLog(tx, user, { action: 'create', entity: 'Customer', entityId: created.id, details: { name: created.name, email: created.email } });
    return created;
  });
  return NextResponse.json(customer, { status: 201 });
}
