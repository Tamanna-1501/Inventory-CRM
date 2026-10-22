import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorize } from '@/lib/apiAuth';
import { generateSaleReturnReference } from '@/lib/referenceHelper';
import { writeAuditLog } from '@/lib/auditLog';

class TenantRecordError extends Error {}
class RequestError extends Error {}

export async function GET() {
  const { user, error } = await authorize('sale_return', 'view');
  if (error) return error;
  const returns = await prisma.saleReturn.findMany({
    where: { companyId: user.companyId },
    include: {
      sale: { include: { customer: true, biller: true } },
      warehouse: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(returns);
}

export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  if (!hasPermission(user, 'sale-returns', 'add')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });

  try {
    const { saleId, warehouseId, items, reason } = await request.json();
    const parsedSaleId = Number(saleId);
    const parsedWarehouseId = Number(warehouseId);
    if (!Number.isInteger(parsedSaleId) || parsedSaleId <= 0 || !Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0 || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ message: 'A sale, warehouse and at least one item are required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const [sale, warehouse] = await Promise.all([
        tx.sale.findFirst({ where: { id: parsedSaleId, companyId: user.companyId }, include: { items: true } }),
        tx.warehouse.findFirst({ where: { id: parsedWarehouseId, companyId: user.companyId }, select: { id: true } }),
      ]);
      if (!sale || !warehouse) throw new TenantRecordError('Sale or warehouse not found in this company');

      const oldReturns = await tx.saleReturn.findMany({ where: { saleId: sale.id, companyId: user.companyId }, include: { items: true } });
      const sold = new Map();
      for (const line of sale.items) {
        const entry = sold.get(line.productId) || { quantity: 0, value: 0 };
        entry.quantity += line.quantity;
        entry.value += Number(line.price) * line.quantity;
        sold.set(line.productId, entry);
      }
      const alreadyReturned = new Map();
      for (const ret of oldReturns) for (const line of ret.items) {
        alreadyReturned.set(line.productId, (alreadyReturned.get(line.productId) || 0) + line.quantity);
      }

      const requested = new Map();
      for (const line of items) {
        const productId = Number(line.productId);
        const quantity = Number(line.quantity);
        if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) throw new RequestError('Return quantities must be positive whole numbers');
        requested.set(productId, (requested.get(productId) || 0) + quantity);
      }
      const pricedItems = [];
      for (const [productId, quantity] of requested) {
        const soldLine = sold.get(productId);
        if (!soldLine) throw new RequestError(`Product ${productId} is not part of this sale`);
        const available = soldLine.quantity - (alreadyReturned.get(productId) || 0);
        if (quantity > available) throw new RequestError(`Return quantity exceeds the remaining sold quantity for product ${productId}`);
        pricedItems.push({ productId, quantity, price: soldLine.value / soldLine.quantity });
      }
      const reference = await generateSaleReturnReference(user.companyId, tx);
      const totalAmount = pricedItems.reduce((sum, line) => sum + line.quantity * line.price, 0);
      const saleReturn = await tx.saleReturn.create({
        data: { companyId: user.companyId, reference, saleId: sale.id, warehouseId: warehouse.id, totalAmount, reason: reason || null },
      });
      for (const line of pricedItems) {
        await tx.saleReturnItem.create({ data: { saleReturnId: saleReturn.id, ...line } });
        await tx.stock.upsert({
          where: { companyId_productId_warehouseId: { companyId: user.companyId, productId: line.productId, warehouseId: warehouse.id } },
          update: { quantity: { increment: line.quantity } },
          create: { companyId: user.companyId, productId: line.productId, warehouseId: warehouse.id, quantity: line.quantity },
        });
      }
      await writeAuditLog(tx, user, { action: 'create', entity: 'SaleReturn', entityId: saleReturn.id, details: { reference, saleId: sale.id, totalAmount, itemCount: pricedItems.length } });
      return saleReturn;
    });
    return NextResponse.json({ message: 'Sale return created', return: result }, { status: 201 });
  } catch (error) {
    if (error instanceof TenantRecordError) return NextResponse.json({ message: error.message }, { status: 404 });
    return NextResponse.json({ message: error.message || 'Unable to create sale return' }, { status: 400 });
  }
}
