import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeAny } from '@/lib/apiAuth';

export async function GET(request) {
  try {
    const { user, error } = await authorizeAny(['Stock Report', 'Sales Report']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const startDate = startDateParam ? new Date(startDateParam) : null;
    const endDate = endDateParam ? new Date(`${endDateParam}T23:59:59.999`) : null;

    if ((startDate && Number.isNaN(startDate.getTime())) || (endDate && Number.isNaN(endDate.getTime()))) {
      return NextResponse.json({ message: 'Invalid date filter' }, { status: 400 });
    }

    const stockWhere = { companyId: user.companyId };
    if (warehouseId && warehouseId !== 'all') {
      const parsedWarehouseId = Number(warehouseId);
      if (!Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0) return NextResponse.json({ message: 'Invalid warehouse id' }, { status: 400 });
      const warehouse = await prisma.warehouse.findFirst({ where: { id: parsedWarehouseId, companyId: user.companyId }, select: { id: true } });
      if (!warehouse) return NextResponse.json({ message: 'Warehouse not found' }, { status: 404 });
      stockWhere.warehouseId = warehouse.id;
    }

    const stocks = await prisma.stock.findMany({
      where: {
        ...stockWhere,
        product: { is: { companyId: user.companyId } },
        warehouse: { is: { companyId: user.companyId } },
      },
      include: {
        product: { include: { category: true, unit: true } },
        warehouse: true,
      },
      orderBy: { productId: 'asc' },
    });

    if (!stocks.length) return NextResponse.json([]);

    const productIds = [...new Set(stocks.map((s) => s.productId))];
    const warehouseIds = [...new Set(stocks.map((s) => s.warehouseId))];

    const dateFilter = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // Raw rows nikalo, warehouseId (parent ke through) aur productId dono saath mein
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: {
        productId: { in: productIds },
        purchase: {
          companyId: user.companyId,
          warehouseId: { in: warehouseIds },
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
        },
      },
      select: {
        productId: true,
        quantity: true,
        purchase: { select: { warehouseId: true } },
      },
    });

    const saleItems = await prisma.saleItem.findMany({
      where: {
        productId: { in: productIds },
        sale: {
          companyId: user.companyId,
          warehouseId: { in: warehouseIds },
          ...(Object.keys(dateFilter).length && { createdAt: dateFilter }),
        },
      },
      select: {
        productId: true,
        quantity: true,
        sale: { select: { warehouseId: true } },
      },
    });

    // Manually productId+warehouseId ke hisaab se sum karo — yahi part groupBy nahi kar sakta tha
    const key = (productId, warehouseId) => `${productId}_${warehouseId}`;

    const receivedMap = new Map();
    for (const item of purchaseItems) {
      const k = key(item.productId, item.purchase.warehouseId);
      receivedMap.set(k, (receivedMap.get(k) || 0) + item.quantity);
    }

    const soldMap = new Map();
    for (const item of saleItems) {
      const k = key(item.productId, item.sale.warehouseId);
      soldMap.set(k, (soldMap.get(k) || 0) + item.quantity);
    }

    const result = stocks.map((s) => {
      const k = key(s.productId, s.warehouseId);
      const received = receivedMap.get(k) || 0;
      const sold = soldMap.get(k) || 0;
      const closingStock = s.quantity;
      // Clamp: agar data mismatch ki wajah se negative aaye (jaise stock seedha
      // seed kiya gaya bina Purchase entry ke), 0 dikhao, error mat do
      const openingStock = Math.max(0, closingStock - received + sold);

      return {
        id: s.id,
        productId: s.productId,
        warehouseId: s.warehouseId,
        product: s.product,
        warehouse: s.warehouse,
        quantity: s.quantity,
        openingStock,
        received,
        sold,
        closingStock,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/stock error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}
