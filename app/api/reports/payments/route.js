import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorize } from '@/lib/apiAuth';

export async function GET(request) {
  const { user, error } = await authorize('Payment Report');
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type') || 'all'; // 'all' | 'sale' | 'purchase' | 'expense'
    const paymentMethod = searchParams.get('paymentMethod') || 'all';

    // Date range filter helper
    const dateFilter = {};
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const hasDateFilter = Object.keys(dateFilter).length > 0;

    // 1. Fetch Customer / Invoice Payments (Inflow)
    let salePaymentsPromise = Promise.resolve([]);
    if (type === 'all' || type === 'sale') {
      salePaymentsPromise = prisma.payment.findMany({
        where: {
          invoice: { is: { companyId: user.companyId } },
          ...(hasDateFilter && { paidAt: dateFilter }),
          ...(paymentMethod !== 'all' && { paymentMethod }),
        },
        include: {
          invoice: {
            include: {
              sale: {
                include: {
                  customer: true,
                  warehouse: true,
                },
              },
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      });
    }

    // 2. Fetch Supplier / Purchase Payments (Outflow)
    let purchasePaymentsPromise = Promise.resolve([]);
    if (type === 'all' || type === 'purchase') {
      purchasePaymentsPromise = prisma.purchasePayment.findMany({
        where: {
          purchase: { is: { companyId: user.companyId } },
          ...(hasDateFilter && { paidAt: dateFilter }),
          ...(paymentMethod !== 'all' && { paymentMethod }),
        },
        include: {
          purchase: {
            include: {
              supplier: true,
              warehouse: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      });
    }

    // 3. Fetch Expense Payments (Outflow)
    let expensePaymentsPromise = Promise.resolve([]);
    if (type === 'all' || type === 'expense') {
      expensePaymentsPromise = prisma.expensePayment.findMany({
        where: {
          expense: { is: { companyId: user.companyId } },
          ...(hasDateFilter && { paidAt: dateFilter }),
          ...(paymentMethod !== 'all' && { paymentMethod }),
        },
        include: {
          expense: {
            include: {
              category: true,
              warehouse: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
      });
    }

    const [salePayments, purchasePayments, expensePayments] = await Promise.all([
      salePaymentsPromise,
      purchasePaymentsPromise,
      expensePaymentsPromise,
    ]);

    // Normalize all records into a single uniform structure
    const normalizedSalePayments = salePayments.map((p) => ({
      id: `sale-${p.id}`,
      originalId: p.id,
      date: p.paidAt,
      type: 'Sale',
      direction: 'inflow',
      reference: p.referenceNo || p.invoice?.invoiceNumber || 'N/A',
      party: p.invoice?.sale?.customer?.name || 'Walk-in Customer',
      warehouse: p.invoice?.sale?.warehouse?.name || 'N/A',
      warehouseId: p.invoice?.sale?.warehouseId || null,
      paymentMethod: p.paymentMethod,
      amount: Number(p.amountPaid || 0),
      note: `Invoice #${p.invoice?.invoiceNumber || ''}`,
    }));

    const normalizedPurchasePayments = purchasePayments.map((p) => ({
      id: `purchase-${p.id}`,
      originalId: p.id,
      date: p.paidAt,
      type: 'Purchase',
      direction: 'outflow',
      reference: p.purchase?.reference || `PUR-${p.purchaseId}`,
      party: p.purchase?.supplier?.name || 'Supplier',
      warehouse: p.purchase?.warehouse?.name || 'N/A',
      warehouseId: p.purchase?.warehouseId || null,
      paymentMethod: p.paymentMethod,
      amount: Number(p.amountPaid || 0),
      note: p.purchase?.note || '',
    }));

    const normalizedExpensePayments = expensePayments.map((p) => ({
      id: `expense-${p.id}`,
      originalId: p.id,
      date: p.paidAt,
      type: 'Expense',
      direction: 'outflow',
      reference: p.expense?.reference || p.expense?.voucherNo || `EXP-${p.expenseId}`,
      party: p.expense?.category?.name || 'Expense',
      warehouse: p.expense?.warehouse?.name || 'N/A',
      warehouseId: p.expense?.warehouseId || null,
      paymentMethod: p.paymentMethod,
      amount: Number(p.amountPaid || 0),
      note: p.note || p.expense?.description || '',
    }));

    // Combine and sort by date descending
    const allPayments = [
      ...normalizedSalePayments,
      ...normalizedPurchasePayments,
      ...normalizedExpensePayments,
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate totals
    const totalReceived = normalizedSalePayments.reduce((sum, item) => sum + item.amount, 0);
    const totalPaidPurchases = normalizedPurchasePayments.reduce((sum, item) => sum + item.amount, 0);
    const totalPaidExpenses = normalizedExpensePayments.reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = totalPaidPurchases + totalPaidExpenses;

    return NextResponse.json({
      payments: allPayments,
      summary: {
        totalReceived,
        totalPaid,
        netCashFlow: totalReceived - totalPaid,
        totalTransactions: allPayments.length,
      },
    });
  } catch (error) {
    console.error('Payment Report API Error:', error);
    return NextResponse.json({ message: error.message || 'Server error' }, { status: 500 });
  }
}
