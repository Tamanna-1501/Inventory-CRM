import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorizeAny } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

class HttpError extends Error {
  constructor(message, status = 400, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function errorResponse(error) {
  if (error instanceof HttpError) {
    return NextResponse.json({ message: error.message, code: error.code }, { status: error.status });
  }
  if (error?.code === 'P2025') {
    return NextResponse.json({ message: 'Record not found' }, { status: 404 });
  }
  if (error?.code === 'P2003') {
    return NextResponse.json(
      { message: 'Cannot delete: other records (e.g. purchase returns) are linked to this purchase. Remove them first.', code: 'LINKED_RECORDS' },
      { status: 409 }
    );
  }
  return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
}

export async function GET(request, { params }) {
  const { user, error } = await authorizeAny(['purchase', 'purchase_return', 'purchase_invoice', 'purchase_payment', 'Purchase Report', 'Supplier Report', 'Shipping Charge', 'Tax Report', 'Payment Report']);
  if (error) return error;

  const { id } = await params;
  const purchase = await prisma.purchase.findFirst({
    where: { id: Number(id), companyId: user.companyId },
    include: {
      supplier: true,
      warehouse: true,
      items: { include: { product: true } },
      payments: true,
    },
  });

  if (!purchase) {
    return NextResponse.json({ message: 'Purchase not found' }, { status: 404 });
  }
  return NextResponse.json(purchase);
}

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'purchases', 'edit')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { id } = await params;
  const purchaseId = Number(id);
  // NOTE: totalAmount, shippingCharge, reference and warehouse are intentionally NOT editable here.
  // Changing them after payments/stock exist breaks due and stock accounting.
  const { supplierId, note, status, warehouseId } = await request.json();

  try {
    const existing = await prisma.purchase.findFirst({ where: { id: purchaseId, companyId: user.companyId } });
    if (!existing) throw new HttpError('Purchase not found', 404);

    if (supplierId) {
      const supplier = await prisma.supplier.findFirst({ where: { id: Number(supplierId), companyId: user.companyId }, select: { id: true } });
      if (!supplier) throw new HttpError('Supplier not found in this company', 404);
    }

    if (warehouseId && Number(warehouseId) !== existing.warehouseId) {
      throw new HttpError('Warehouse cannot be changed after purchase (stock is already added to it).', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          supplierId: supplierId ? Number(supplierId) : undefined,
          note,
          status,
        },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Purchase', entityId: purchaseId, details: { supplierId, status } });
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  // Delete zyada risky hai (stock rollback hota hai), isliye sirf owner/admin
  if (!user || !hasPermission(user, 'purchases', 'delete')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { id } = await params;
  const purchaseId = Number(id);
  // ?force=true -> delete even if stock was already used (stock is set to 0 instead of going negative)
  const force = new URL(request.url).searchParams.get('force') === 'true';

  try {
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findFirst({
        where: { id: purchaseId, companyId: user.companyId },
        include: { items: { include: { product: true } } },
      });
      if (!purchase) throw new HttpError('Purchase not found', 404);

      // Purchase Return se linked hai to pehle wahan se delete karna hoga
      const returnCount = await tx.purchaseReturn.count({ where: { purchaseId, companyId: user.companyId } });
      if (returnCount > 0) {
        throw new HttpError(
          'This purchase is linked to a Purchase Return. First delete it from Purchase Return, then delete it from Purchase List.',
          409,
          'LINKED_PURCHASE_RETURN'
        );
      }

      // Stock rollback: jo quantity purchase se add hui thi, wo ghata do
      for (const item of purchase.items) {
        const where = {
          companyId_productId_warehouseId: {
            companyId: user.companyId,
            productId: item.productId,
            warehouseId: purchase.warehouseId,
          },
        };
        const stock = await tx.stock.findUnique({ where });
        if (!stock) continue; // nothing to roll back (this was crashing the old code)

        const qty = Number(item.quantity);
        const notEnough = Number(stock.quantity) < qty;
        if (notEnough && !force) {
          throw new HttpError(
            `"${item.product?.name || item.productId}" has only ${stock.quantity} in stock but this purchase added ${qty} (some of it is already sold/used).`,
            409,
            'STOCK_CONFLICT'
          );
        }

        await tx.stock.update({
          where,
          data: { quantity: notEnough ? 0 : { decrement: item.quantity } },
        });
      }

      await tx.purchasePayment.deleteMany({ where: { purchaseId } });
      await tx.purchaseItem.deleteMany({ where: { purchaseId } });
      await tx.purchase.delete({ where: { id: purchaseId } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Purchase', entityId: purchaseId, details: { reference: purchase.reference, totalAmount: purchase.totalAmount, forcedStockRollback: force } });
    });

    return NextResponse.json({ message: 'Purchase deleted and stock rolled back' });
  } catch (error) {
    return errorResponse(error);
  }
}
