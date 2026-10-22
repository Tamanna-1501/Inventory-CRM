import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorize } from '@/lib/apiAuth';
import { generatePurchaseReturnReference } from '@/lib/referenceHelper';
import { writeAuditLog } from '@/lib/auditLog';

class TenantRecordError extends Error {}
class RequestError extends Error {}

export async function GET() {
  const { user, error } = await authorize('purchase_return', 'view');
  if (error) return error;
  const returns = await prisma.purchaseReturn.findMany({
    where: { companyId: user.companyId },
    include: {
      purchase: { include: { supplier: true } },
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
  if (!hasPermission(user, 'purchase-returns', 'add')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });

  try {
    const { purchaseId, warehouseId, items, reason } = await request.json();
    const parsedPurchaseId = Number(purchaseId);
    const parsedWarehouseId = Number(warehouseId);
    if (!Number.isInteger(parsedPurchaseId) || parsedPurchaseId <= 0 || !Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0 || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ message: 'A purchase, warehouse and at least one item are required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const [purchase, warehouse] = await Promise.all([
        tx.purchase.findFirst({ where: { id: parsedPurchaseId, companyId: user.companyId }, include: { items: true } }),
        tx.warehouse.findFirst({ where: { id: parsedWarehouseId, companyId: user.companyId }, select: { id: true } }),
      ]);
      if (!purchase || !warehouse) throw new TenantRecordError('Purchase or warehouse not found in this company');

      const oldReturns = await tx.purchaseReturn.findMany({ where: { purchaseId: purchase.id, companyId: user.companyId }, include: { items: true } });
      const purchased = new Map();
      for (const line of purchase.items) {
        const entry = purchased.get(line.productId) || { quantity: 0, value: 0 };
        entry.quantity += line.quantity;
        entry.value += Number(line.price) * line.quantity;
        purchased.set(line.productId, entry);
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
        const purchasedLine = purchased.get(productId);
        if (!purchasedLine) throw new RequestError(`Product ${productId} is not part of this purchase`);
        const available = purchasedLine.quantity - (alreadyReturned.get(productId) || 0);
        if (quantity > available) throw new RequestError(`Return quantity exceeds the remaining purchased quantity for product ${productId}`);
        pricedItems.push({ productId, quantity, price: purchasedLine.value / purchasedLine.quantity });
      }
      for (const line of pricedItems) {
        const stock = await tx.stock.findUnique({
          where: { companyId_productId_warehouseId: { companyId: user.companyId, productId: line.productId, warehouseId: warehouse.id } },
        });
        if (!stock || stock.quantity < line.quantity) throw new RequestError(`Insufficient stock to return for product ID ${line.productId}`);
      }

      const reference = await generatePurchaseReturnReference(user.companyId, tx);
      const totalAmount = pricedItems.reduce((sum, line) => sum + line.quantity * line.price, 0);
      const purchaseReturn = await tx.purchaseReturn.create({
        data: { companyId: user.companyId, reference, purchaseId: purchase.id, warehouseId: warehouse.id, totalAmount, reason: reason || null },
      });
      for (const line of pricedItems) {
        await tx.purchaseReturnItem.create({ data: { purchaseReturnId: purchaseReturn.id, ...line } });
        await tx.stock.update({
          where: { companyId_productId_warehouseId: { companyId: user.companyId, productId: line.productId, warehouseId: warehouse.id } },
          data: { quantity: { decrement: line.quantity } },
        });
      }
      await writeAuditLog(tx, user, { action: 'create', entity: 'PurchaseReturn', entityId: purchaseReturn.id, details: { reference, purchaseId: purchase.id, totalAmount, itemCount: pricedItems.length } });
      return purchaseReturn;
    });
    return NextResponse.json({ message: 'Purchase return created', return: result }, { status: 201 });
  } catch (error) {
    if (error instanceof TenantRecordError) return NextResponse.json({ message: error.message }, { status: 404 });
    return NextResponse.json({ message: error.message || 'Unable to create purchase return' }, { status: 400 });
  }
}
