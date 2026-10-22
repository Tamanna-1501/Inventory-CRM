import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, authorizeAny, hasPermission } from '@/lib/apiAuth';
import { generateExpenseReference } from '@/lib/referenceHelper';
import { writeAuditLog } from '@/lib/auditLog';

class TenantRecordError extends Error {}

export async function GET() {
  try {
    const { user, error } = await authorizeAny(['expense', 'exp_payment', 'exp_invoice', 'Expense Report']);
    if (error) return error;

    const expenses = await prisma.expense.findMany({
      where: { companyId: user.companyId },
      include: { category: true, warehouse: true, payments: true },
      orderBy: { date: 'desc' },
    });

    const expensesWithPaymentInfo = expenses.map((expense) => {
      const totalPaid = expense.payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
      const due = Number(expense.amount) - totalPaid;

      let paymentStatus = 'unpaid';
      if (totalPaid >= Number(expense.amount)) paymentStatus = 'paid';
      else if (totalPaid > 0) paymentStatus = 'partial';

      return { ...expense, totalPaid, due, paymentStatus };
    });

    return NextResponse.json(expensesWithPaymentInfo);
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Owner, Admin, Manager, Supervisor
    if (!user || !hasPermission(user, 'expense', 'add')) {
      return NextResponse.json({ message: 'Access denied: Insufficient permissions' }, { status: 403 });
    }

    const { categoryId, warehouseId, expenseType, voucherNo, amount, description, date } = await request.json();
    const parsedCategoryId = Number(categoryId);
    const parsedWarehouseId = Number(warehouseId);
    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0 || !Number.isInteger(parsedWarehouseId) || parsedWarehouseId <= 0 || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    if (expenseType && !['direct', 'indirect'].includes(expenseType)) return NextResponse.json({ message: 'Invalid expense type' }, { status: 400 });
    const expenseDate = date ? new Date(date) : new Date();
    if (Number.isNaN(expenseDate.getTime())) return NextResponse.json({ message: 'Invalid expense date' }, { status: 400 });

    const expense = await prisma.$transaction(async (tx) => {
      const [category, warehouse] = await Promise.all([
        tx.expenseCategory.findFirst({ where: { id: parsedCategoryId, companyId: user.companyId }, select: { id: true } }),
        tx.warehouse.findFirst({ where: { id: parsedWarehouseId, companyId: user.companyId }, select: { id: true } }),
      ]);
      if (!category || !warehouse) throw new TenantRecordError('Category or warehouse not found in this company');
      const reference = await generateExpenseReference(user.companyId, tx);
      const created = await tx.expense.create({
        data: {
          companyId: user.companyId,
          reference,
          voucherNo: voucherNo ? String(voucherNo) : null,
          categoryId: category.id,
          warehouseId: warehouse.id,
          expenseType: expenseType || 'direct',
          amount: parsedAmount,
          description: description || null,
          date: expenseDate,
        },
      });
      await writeAuditLog(tx, user, { action: 'create', entity: 'Expense', entityId: created.id, details: { reference, amount: parsedAmount, expenseType: created.expenseType } });
      return created;
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof TenantRecordError) return NextResponse.json({ message: error.message }, { status: 404 });
    console.error('POST /api/expenses error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
