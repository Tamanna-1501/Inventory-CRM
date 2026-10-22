import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function POST(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'sales', 'edit')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { amountPaid, paymentMethod } = await request.json();

    const amount = Number(amountPaid);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: 'Enter an amount greater than 0' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: { id: Number(id), companyId: user.companyId },
        include: { payments: true },
      });
      if (!invoice) throw new Error('Invoice not found');

      const grandTotal = Number(invoice.grandTotal);
      const alreadyPaid = invoice.payments.reduce((s, p) => s + Number(p.amountPaid), 0);
      const due = Math.round((grandTotal - alreadyPaid) * 100) / 100;

      if (due <= 0) throw new Error('This invoice is already fully paid');
      if (amount > due + 0.005) {
        throw new Error(`Amount is more than the due amount (₹${due.toFixed(2)})`);
      }

      const payment = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amountPaid: amount,
          paymentMethod: paymentMethod || 'cash',
        },
      });

      const newPaid = alreadyPaid + amount;
      const paymentStatus = newPaid >= grandTotal - 0.005 ? 'paid' : 'partial';

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: { paymentStatus },
      });
      await writeAuditLog(tx, user, { action: 'payment', entity: 'Invoice', entityId: invoice.id, details: { invoiceNumber: invoice.invoiceNumber, paymentId: payment.id, amount, paymentMethod: payment.paymentMethod, paymentStatus } });

      return { payment, invoice: updatedInvoice, due: Math.max(0, grandTotal - newPaid) };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
