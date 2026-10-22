import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission, authorizeAny } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

class TenantRecordError extends Error {}
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request, { params }) {
  try {
    const { user, error } = await authorizeAny(['expense', 'exp_payment', 'exp_invoice', 'Expense Report']);
    if (error) return error;
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid expense id' }, { status: 400 });
    const expense = await prisma.expense.findFirst({
      where: { id, companyId: user.companyId },
      include: { category: true, warehouse: true, payments: true },
    });
    if (!expense) return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    return NextResponse.json(expense);
  } catch (error) {
    console.error('GET /api/expenses/[id] error:', error);
    return NextResponse.json({ message: 'Unable to load expense' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'expense', 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid expense id' }, { status: 400 });
    const current = await prisma.expense.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!current) return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    const body = await request.json();
    const data = {};

    if (body.categoryId !== undefined) {
      const categoryId = Number(body.categoryId);
      const category = await prisma.expenseCategory.findFirst({ where: { id: categoryId, companyId: user.companyId }, select: { id: true } });
      if (!category) return NextResponse.json({ message: 'Category not found in this company' }, { status: 404 });
      data.categoryId = category.id;
    }
    if (body.warehouseId !== undefined) {
      if (body.warehouseId === null || body.warehouseId === '') data.warehouseId = null;
      else {
        const warehouseId = Number(body.warehouseId);
        const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, companyId: user.companyId }, select: { id: true } });
        if (!warehouse) return NextResponse.json({ message: 'Warehouse not found in this company' }, { status: 404 });
        data.warehouseId = warehouse.id;
      }
    }
    if (body.expenseType !== undefined) {
      if (!['direct', 'indirect'].includes(body.expenseType)) return NextResponse.json({ message: 'Invalid expense type' }, { status: 400 });
      data.expenseType = body.expenseType;
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 });
      data.amount = amount;
    }
    for (const field of ['voucherNo', 'description']) if (body[field] !== undefined) data[field] = body[field] || null;
    if (body.date !== undefined) {
      const date = new Date(body.date);
      if (Number.isNaN(date.getTime())) return NextResponse.json({ message: 'Invalid expense date' }, { status: 400 });
      data.date = date;
    }
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.expense.update({
        where: { id: current.id }, data,
        include: { category: true, warehouse: true, payments: true },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Expense', entityId: current.id, details: { changedFields: Object.keys(data), amount: row.amount } });
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/expenses/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update expense' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'expense', 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid expense id' }, { status: 400 });
    await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.findFirst({ where: { id, companyId: user.companyId }, select: { id: true, reference: true, amount: true } });
      if (!expense) throw new TenantRecordError('Expense not found');
      await tx.expensePayment.deleteMany({ where: { expenseId: expense.id } });
      await tx.expense.delete({ where: { id: expense.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Expense', entityId: expense.id, details: { reference: expense.reference, amount: expense.amount } });
    });
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error) {
    if (error instanceof TenantRecordError) return NextResponse.json({ message: error.message }, { status: 404 });
    console.error('DELETE /api/expenses/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete expense' }, { status: 500 });
  }
}
