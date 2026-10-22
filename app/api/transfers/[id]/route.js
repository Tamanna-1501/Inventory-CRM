import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorize } from '@/lib/apiAuth';
import { moveStock, reverseStock } from '@/lib/transferStock';
import { writeAuditLog } from '@/lib/auditLog';

const STATUSES = ['pending', 'completed', 'rejected'];

const httpError = (message, status) => Object.assign(new Error(message), { status });
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function GET(request, { params }) {
  try {
    const { user, error } = await authorize('transfer', 'view');
    if (error) return error;

    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) return NextResponse.json({ message: 'Invalid transfer id' }, { status: 400 });
    const transfer = await prisma.transfer.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        items: { include: { product: true } },
      },
    });
    if (!transfer) {
      return NextResponse.json({ message: 'Transfer not found' }, { status: 404 });
    }
    return NextResponse.json(transfer);
  } catch (error) {
    console.error('GET /api/transfers/[id] error:', error);
    return NextResponse.json({ message: error.message || 'Something went wrong' }, { status: 500 });
  }
}

// Status badalna (pending -> completed / rejected) aur details edit karna
export async function PUT(request, { params }) {
  try {
    const user = await getUserFromRequest();
    if (!user || !hasPermission(user, 'transfer', 'edit')) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const transferId = parseId((await params).id);
    if (!transferId) return NextResponse.json({ message: 'Invalid transfer id' }, { status: 400 });
    const { status, reason, authorizedBy, note } = await request.json();

    if (status !== undefined && !STATUSES.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findFirst({
        where: { id: transferId, companyId: user.companyId },
        include: { items: true },
      });
      if (!transfer) throw httpError('Transfer not found', 404);

      if (status && status !== transfer.status) {
        // Completed / Rejected final hain, sirf Pending ka status badal sakta hai
        if (transfer.status !== 'pending') {
          throw httpError('Only pending transfers can change status', 400);
        }
        if (status === 'completed') {
          await moveStock(tx, { ...transfer, companyId: user.companyId });
        }
      }

      const updated = await tx.transfer.update({
        where: { id: transferId },
        data: { status, reason, authorizedBy, note },
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          items: { include: { product: true } },
        },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Transfer', entityId: transferId, details: { status: updated.status, reference: updated.reference } });
      return updated;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/transfers/[id] error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: error.status || 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getUserFromRequest();
    // Delete mein stock rollback ho sakta hai, isliye sirf owner/admin
    if (!user || !hasPermission(user, 'transfer', 'delete')) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const transferId = parseId((await params).id);
    if (!transferId) return NextResponse.json({ message: 'Invalid transfer id' }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findFirst({
        where: { id: transferId, companyId: user.companyId },
        include: { items: true },
      });
      if (!transfer) throw httpError('Transfer not found', 404);

      // Stock sirf completed transfer ne move kiya tha, wahi wapas karna hai
      if (transfer.status === 'completed') {
        await reverseStock(tx, { ...transfer, companyId: user.companyId });
      }

      await tx.transferItem.deleteMany({ where: { transferId } });
      await tx.transfer.delete({ where: { id: transferId } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Transfer', entityId: transferId, details: { reference: transfer.reference, status: transfer.status, itemCount: transfer.items.length } });
    });

    return NextResponse.json({ message: 'Transfer deleted' });
  } catch (error) {
    console.error('DELETE /api/transfers/[id] error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: error.status || 400 }
    );
  }
}
