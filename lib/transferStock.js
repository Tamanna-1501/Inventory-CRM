import { getUserFromRequest } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/auditLog';

const stockWhere = (companyId, productId, warehouseId) => ({
  companyId_productId_warehouseId: { companyId, productId, warehouseId },
});

// Source warehouse se stock ghatao, destination mein badhao.
export async function moveStock(tx, { companyId, fromWarehouseId, toWarehouseId, items }) {
  for (const { productId, quantity } of items) {
    const stock = await tx.stock.findUnique({ where: stockWhere(companyId, productId, fromWarehouseId) });
    if (!stock || stock.quantity < quantity) throw new Error(`Insufficient stock for product ID ${productId} in source warehouse`);
  }
  for (const { productId, quantity } of items) {
    await tx.stock.update({
      where: stockWhere(companyId, productId, fromWarehouseId),
      data: { quantity: { decrement: quantity } },
    });
    await tx.stock.upsert({
      where: stockWhere(companyId, productId, toWarehouseId),
      update: { quantity: { increment: quantity } },
      create: { companyId, productId, warehouseId: toWarehouseId, quantity },
    });
  }
}

// Completed transfer delete par destination se ghata kar source mein wapas do.
export async function reverseStock(tx, { companyId, fromWarehouseId, toWarehouseId, items }) {
  for (const { productId, quantity } of items) {
    const stock = await tx.stock.findUnique({ where: stockWhere(companyId, productId, toWarehouseId) });
    if (!stock || stock.quantity < quantity) throw new Error(`Cannot reverse: destination has insufficient stock for product ID ${productId}`);
  }
  for (const { productId, quantity } of items) {
    await tx.stock.update({
      where: stockWhere(companyId, productId, toWarehouseId),
      data: { quantity: { decrement: quantity } },
    });
    await tx.stock.upsert({
      where: stockWhere(companyId, productId, fromWarehouseId),
      update: { quantity: { increment: quantity } },
      create: { companyId, productId, warehouseId: fromWarehouseId, quantity },
    });
  }
}

// Normal create aur Excel import dono same tenant validation / stock transaction use karte hain.
export async function createTransfer({
  companyId,
  date,
  reference,
  fromWarehouseId,
  toWarehouseId,
  items,
  reason,
  authorizedBy,
  status,
  note,
  actor,
}) {
  const authenticatedUser = companyId == null ? await getUserFromRequest() : null;
  const tenantId = Number(companyId ?? authenticatedUser?.companyId);
  if (!Number.isInteger(tenantId) || tenantId <= 0 || authenticatedUser?.isSuperAdmin) {
    throw new Error('Authenticated company is required to create a transfer');
  }

  return prisma.$transaction(async (tx) => {
    const [fromWarehouse, toWarehouse, products] = await Promise.all([
      tx.warehouse.findFirst({ where: { id: fromWarehouseId, companyId: tenantId }, select: { id: true } }),
      tx.warehouse.findFirst({ where: { id: toWarehouseId, companyId: tenantId }, select: { id: true } }),
      tx.product.findMany({
        where: { companyId: tenantId, id: { in: [...new Set(items.map((item) => item.productId))] } },
        select: { id: true },
      }),
    ]);
    if (!fromWarehouse || !toWarehouse) throw new Error('Source or destination warehouse not found in this company');
    if (fromWarehouse.id === toWarehouse.id) throw new Error('Source and destination warehouse must be different');
    if (products.length !== new Set(items.map((item) => item.productId)).size) throw new Error('One or more products were not found in this company');

    const transferData = { companyId: tenantId, fromWarehouseId: fromWarehouse.id, toWarehouseId: toWarehouse.id, items };
    if (status === 'completed') await moveStock(tx, transferData);

    const created = await tx.transfer.create({
      data: {
        companyId: tenantId,
        reference: reference?.trim() || null,
        date,
        fromWarehouseId: fromWarehouse.id,
        toWarehouseId: toWarehouse.id,
        reason: reason?.trim() || null,
        authorizedBy: authorizedBy?.trim() || null,
        status,
        note: note?.trim() || null,
        items: { create: items },
      },
    });
    if (!created.reference) {
      const updated = await tx.transfer.update({
        where: { id: created.id },
        data: { reference: `TRF-${String(created.id).padStart(6, '0')}` },
      });
      await writeAuditLog(tx, actor, { action: 'create', entity: 'Transfer', entityId: updated.id, details: { reference: updated.reference, status: updated.status, itemCount: items.length } });
      return updated;
    }
    await writeAuditLog(tx, actor, { action: 'create', entity: 'Transfer', entityId: created.id, details: { reference: created.reference, status: created.status, itemCount: items.length } });
    return created;
  });
}
