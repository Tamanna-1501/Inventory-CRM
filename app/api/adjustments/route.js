import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

class TenantRecordError extends Error {}

export async function GET() {
  const { user, error } = await authorize('adjustment', 'view');
  if (error) return error;
  const adjustments = await prisma.adjustment.findMany({
    where: { companyId: user.companyId },
    include: {
      warehouse: true,
      items: { include: { product: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(adjustments);
}

// body: { warehouseId, remarks, items: [{ productId, batchNo, quantity, type }] }
export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'adjustment', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    const { warehouseId, remarks, items } = await request.json();
    const parsedWarehouseId = Number(warehouseId);
    if (!Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0 || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ message: 'A valid warehouse and at least one item are required' }, { status: 400 });
    }
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(Number(item.productId)) || Number(item.productId) <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ message: 'Each item needs a valid product and positive whole quantity' }, { status: 400 });
      }
      if (!['addition', 'subtraction'].includes(item.type)) {
        return NextResponse.json({ message: 'Adjustment type must be addition or subtraction' }, { status: 400 });
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const [warehouse, products] = await Promise.all([
        tx.warehouse.findFirst({ where: { id: parsedWarehouseId, companyId: user.companyId }, select: { id: true } }),
        tx.product.findMany({
          where: { companyId: user.companyId, id: { in: [...new Set(items.map((item) => Number(item.productId)))] } },
          select: { id: true, name: true },
        }),
      ]);
      if (!warehouse) throw new TenantRecordError('Warehouse not found in this company');
      if (products.length !== new Set(items.map((item) => Number(item.productId))).size) {
        throw new TenantRecordError('One or more products were not found in this company');
      }

      // Duplicate subtraction lines ko combine karke stock negative hone se roko.
      const subtractByProduct = new Map();
      for (const item of items) {
        if (item.type === 'subtraction') {
          const id = Number(item.productId);
          subtractByProduct.set(id, (subtractByProduct.get(id) || 0) + Number(item.quantity));
        }
      }
      for (const [productId, quantity] of subtractByProduct) {
        const stock = await tx.stock.findUnique({
          where: { companyId_productId_warehouseId: { companyId: user.companyId, productId, warehouseId: parsedWarehouseId } },
        });
        if (!stock || stock.quantity < quantity) {
          const product = products.find((p) => p.id === productId);
          throw new Error(`Insufficient stock for ${product?.name || `product ID ${productId}`}`);
        }
      }

      const adjustment = await tx.adjustment.create({
        data: { companyId: user.companyId, warehouseId: parsedWarehouseId, remarks },
      });

      for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);
        await tx.adjustmentItem.create({
          data: { adjustmentId: adjustment.id, productId, batchNo: item.batchNo || null, quantity, type: item.type },
        });

        if (item.type === 'addition') {
          await tx.stock.upsert({
            where: { companyId_productId_warehouseId: { companyId: user.companyId, productId, warehouseId: parsedWarehouseId } },
            update: { quantity: { increment: quantity } },
            create: { companyId: user.companyId, productId, warehouseId: parsedWarehouseId, quantity },
          });
        } else {
          await tx.stock.update({
            where: { companyId_productId_warehouseId: { companyId: user.companyId, productId, warehouseId: parsedWarehouseId } },
            data: { quantity: { decrement: quantity } },
          });
        }
      }
      await writeAuditLog(tx, user, { action: 'create', entity: 'Adjustment', entityId: adjustment.id, details: { warehouseId: parsedWarehouseId, remarks: adjustment.remarks, itemCount: items.length, items: items.map(({ productId, quantity, type }) => ({ productId: Number(productId), quantity: Number(quantity), type })) } });
      return adjustment;
    });

    return NextResponse.json({ message: 'Adjustment created', adjustment: result }, { status: 201 });
  } catch (error) {
    if (error instanceof TenantRecordError) return NextResponse.json({ message: error.message }, { status: 404 });
    console.error('POST /api/adjustments error:', error);
    return NextResponse.json({ message: error.message || 'Unable to create adjustment' }, { status: 400 });
  }
}
