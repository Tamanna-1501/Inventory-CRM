import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorize } from '@/lib/apiAuth';
import { createTransfer } from '@/lib/transferStock';

const STATUSES = ['pending', 'completed', 'rejected'];

export async function GET() {
  try {
    const { user, error } = await authorize('transfer', 'view');
    if (error) return error;

    const transfers = await prisma.transfer.findMany({
      where: { companyId: user.companyId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { product: true } },
      },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
    return NextResponse.json(transfers);
  } catch (error) {
    console.error('GET /api/transfers error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest();
    if (!user || !hasPermission(user, 'transfer', 'add')) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const {
      date,
      reference,
      fromWarehouseId,
      toWarehouseId,
      items,
      reason,
      authorizedBy,
      status = 'pending',
      note,
    } = await request.json();

    const fromId = Number(fromWarehouseId);
    const toId = Number(toWarehouseId);

    if (!fromId || !toId || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    if (fromId === toId) {
      return NextResponse.json(
        { message: 'Source and destination warehouse must be different' },
        { status: 400 }
      );
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const transferDate = date ? new Date(date) : new Date();
    if (Number.isNaN(transferDate.getTime())) {
      return NextResponse.json({ message: 'Invalid date' }, { status: 400 });
    }

    // Same product do baar aaye toh quantity jod do
    const merged = new Map();
    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { message: 'Each item needs a product and a whole-number quantity above 0' },
          { status: 400 }
        );
      }
      merged.set(productId, (merged.get(productId) || 0) + quantity);
    }
    const mergedItems = [...merged].map(([productId, quantity]) => ({ productId, quantity }));

    const transfer = await createTransfer({
      companyId: user.companyId,
      date: transferDate,
      reference,
      fromWarehouseId: fromId,
      toWarehouseId: toId,
      items: mergedItems,
      reason,
      authorizedBy,
      status,
      note,
      actor: user,
    });

    return NextResponse.json({ message: 'Transfer created', transfer }, { status: 201 });
  } catch (error) {
    console.error('POST /api/transfers error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Reference already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 400 });
  }
}
