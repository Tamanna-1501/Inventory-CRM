import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

const ALLOWED_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'credit'];

export async function POST(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'purchases', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  const { id } = await params;
  const purchaseId = Number(id);
  const { amountPaid, paymentMethod } = await request.json();

  try {
    const amount = Number(amountPaid);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 });
    }

    const method = paymentMethod || 'cash';
    if (!ALLOWED_METHODS.includes(method)) {
      return NextResponse.json({ message: 'Invalid payment method' }, { status: 400 });
    }

    const purchase = await prisma.purchase.findFirst({
      where: { id: purchaseId, companyId: user.companyId },
      include: { payments: true },
    });
    if (!purchase) {
      return NextResponse.json({ message: 'Purchase not found' }, { status: 404 });
    }

    const alreadyPaid = purchase.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
    const due = Number(purchase.totalAmount) - alreadyPaid;

    if (due <= 0) {
      return NextResponse.json({ message: 'This purchase is already fully paid' }, { status: 400 });
    }
    if (amount > due + 0.001) {
      return NextResponse.json(
        { message: `Amount exceeds due (₹${due.toFixed(2)})` },
        { status: 400 }
      );
    }

    // note / cardLast4 / cardExpiry are sent by the Add Payment popup,
    // but PurchasePayment has no columns for them, so they are ignored here.
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.purchasePayment.create({
        data: {
        purchaseId,
        amountPaid: amount,
        paymentMethod: method,
        },
      });
      await writeAuditLog(tx, user, { action: 'payment', entity: 'Purchase', entityId: purchaseId, details: { reference: purchase.reference, paymentId: created.id, amount, paymentMethod: created.paymentMethod } });
      return created;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
