import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

const ALLOWED_METHODS = ['cash', 'card', 'upi', 'bank_transfer', 'credit'];
const ALLOWED_STATUSES = ['pending', 'completed'];
class ExpenseNotFoundError extends Error {}

export async function POST(request, { params }) {
  const { user, error } = await authorize('exp_payment', 'add');
  if (error) return error;

  try {
    const { id } = await params;
    const expenseId = Number(id);
    const { status, amountPaid, paymentMethod, cardNumber, note } = await request.json();
    const amount = Number(amountPaid);
    if (!Number.isInteger(expenseId) || expenseId <= 0) return NextResponse.json({ message: 'Invalid expense id' }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 });
    const method = paymentMethod || 'cash';
    if (!ALLOWED_METHODS.includes(method)) return NextResponse.json({ message: 'Invalid payment method' }, { status: 400 });
    const paymentStatus = status || 'completed';
    if (!ALLOWED_STATUSES.includes(paymentStatus)) return NextResponse.json({ message: 'Invalid payment status' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findFirst({
        where: { id: expenseId, companyId: user.companyId },
        include: { payments: true },
      });

      if (!expense) throw new ExpenseNotFoundError('Expense not found');

      const alreadyPaid = expense.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
      const remainingDue = Number(expense.amount) - alreadyPaid;

      if (amount > remainingDue + 0.005) {
        throw new Error(`Payment exceeds due amount. Due is only ₹${remainingDue}`);
      }

      const cardLast4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : null;

      const payment = await tx.expensePayment.create({
        data: {
          expenseId,
          status: paymentStatus,
          amountPaid: amount,
          paymentMethod: method,
          cardLast4,
          note,
        },
      });
      await writeAuditLog(tx, user, { action: 'payment', entity: 'Expense', entityId: expense.id, details: { reference: expense.reference, paymentId: payment.id, amount, paymentMethod: method, status: paymentStatus } });

      return expense;
    });

    return NextResponse.json({ message: 'Payment recorded', expense: result });
  } catch (error) {
    if (error instanceof ExpenseNotFoundError) return NextResponse.json({ message: error.message }, { status: 404 });
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
