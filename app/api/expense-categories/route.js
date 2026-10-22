import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

// 1. Fetch Expense Categories (GET)
export async function GET() {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'expense', 'view')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    const categories = await prisma.expenseCategory.findMany({
      where: { companyId: user.companyId },
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. Create Expense Category & Sub-Category (POST)
export async function POST(request) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'expense', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    const { name, subCategory } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const category = await prisma.$transaction(async (tx) => {
      const created = await tx.expenseCategory.create({
      data: {
        companyId: user.companyId,
        name: name.trim(),
        subCategory: subCategory ? subCategory.trim() : null, // 👈 Database mein Sub-Category save karein
      },
      });
      await writeAuditLog(tx, user, { action: 'create', entity: 'ExpenseCategory', entityId: created.id, details: { name: created.name, subCategory: created.subCategory } });
      return created;
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
