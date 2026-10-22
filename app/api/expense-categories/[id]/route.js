import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'expense', 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid expense category id' }, { status: 400 });
    const category = await prisma.expenseCategory.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    const body = await request.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.expenseCategory.update({
      where: { id: category.id },
      data: { name, subCategory: body.subCategory ? String(body.subCategory).trim() : null },
      });
      await writeAuditLog(tx, user, { action: 'update', entity: 'ExpenseCategory', entityId: category.id, details: { name: row.name, subCategory: row.subCategory } });
      return row;
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/expense-categories/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update expense category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'expense', 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = parseId((await params).id);
    if (!id) return NextResponse.json({ message: 'Invalid expense category id' }, { status: 400 });
    const category = await prisma.expenseCategory.findFirst({ where: { id, companyId: user.companyId }, select: { id: true, name: true, subCategory: true } });
    if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    const used = await prisma.expense.count({ where: { companyId: user.companyId, categoryId: category.id } });
    if (used > 0) return NextResponse.json({ message: `Cannot delete: ${used} expense(s) use this category. Delete or change those expenses first.` }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      await tx.expenseCategory.delete({ where: { id: category.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'ExpenseCategory', entityId: category.id, details: { name: category.name, subCategory: category.subCategory } });
    });
    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    if (error?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete: this category is in use.' }, { status: 409 });
    console.error('DELETE /api/expense-categories/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete expense category' }, { status: 500 });
  }
}
