import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeLogin, isAdmin, hasPermission } from '@/lib/apiAuth';

export async function GET() {
  const { user, error: authError } = await authorizeLogin();
  if (authError) return authError;
  if (user.isSuperAdmin || !user.companyId) return NextResponse.json({ message: 'Company access required' }, { status: 403 });

  try {
    if (!isAdmin(user)) {
      const canSeeSales = hasPermission(user, 'sales', 'view') || hasPermission(user, 'pos', 'view');
      const canSeePurchases = hasPermission(user, 'purchase', 'view');
      const canSeeExpenses = hasPermission(user, 'expense', 'view');
      const canSeeProducts = hasPermission(user, 'prod', 'view');
      const canSeeWarehouses = hasPermission(user, 'wh', 'view');
      const [salesCount, purchaseCount, expenseCount, productCount, stockAgg, warehouseCount] = await Promise.all([
        canSeeSales ? prisma.sale.count({ where: { companyId: user.companyId } }) : null,
        canSeePurchases ? prisma.purchase.count({ where: { companyId: user.companyId } }) : null,
        canSeeExpenses ? prisma.expense.count({ where: { companyId: user.companyId } }) : null,
        canSeeProducts ? prisma.product.count({ where: { companyId: user.companyId } }) : null,
        canSeeProducts ? prisma.stock.aggregate({ where: { companyId: user.companyId }, _sum: { quantity: true } }) : null,
        canSeeWarehouses ? prisma.warehouse.count({ where: { companyId: user.companyId } }) : null,
      ]);

      return NextResponse.json({
        roleDashboard: true,
        metrics: {
          ...(canSeeSales ? { salesCount } : {}),
          ...(canSeePurchases ? { purchaseCount } : {}),
          ...(canSeeExpenses ? { expenseCount } : {}),
          ...(canSeeProducts ? { productCount, stockQuantity: Number(stockAgg?._sum.quantity || 0) } : {}),
          ...(canSeeWarehouses ? { warehouseCount } : {}),
        },
      }, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    // 1. Live aggregations from Database
    const [
      expensesAgg,
      purchasesAgg,
      invoicesAgg,
      salesReturnsAgg,
      purchaseReturnsAgg,
      stocksAgg,
      warehouseCount,
    ] = await Promise.all([
      prisma.expense.aggregate({ where: { companyId: user.companyId }, _sum: { amount: true } }),
      prisma.purchase.aggregate({ where: { companyId: user.companyId }, _sum: { totalAmount: true } }),
      prisma.invoice.aggregate({ where: { companyId: user.companyId }, _sum: { grandTotal: true } }),
      prisma.saleReturn.aggregate({ where: { companyId: user.companyId }, _sum: { totalAmount: true } }),
      prisma.purchaseReturn.aggregate({ where: { companyId: user.companyId }, _sum: { totalAmount: true } }),
      prisma.stock.aggregate({ where: { companyId: user.companyId }, _sum: { quantity: true } }),
      prisma.warehouse.count({ where: { companyId: user.companyId } }),
    ]);

    const totalExpense = Number(expensesAgg._sum.amount || 0);
    const totalPurchase = Number(purchasesAgg._sum.totalAmount || 0);
    const totalSales = Number(invoicesAgg._sum.grandTotal || 0);
    const salesReturns = Number(salesReturnsAgg._sum.totalAmount || 0);
    const purchaseReturns = Number(purchaseReturnsAgg._sum.totalAmount || 0);
    const closingStock = Number(stocksAgg._sum.quantity || 0);
    const grossProfit = totalSales - totalPurchase;

    // 2. Live recent records
    const [recentSales, recentPurchases, recentExpenses, topProducts, systemUsers] = await Promise.all([
      prisma.sale.findMany({
        where: { companyId: user.companyId },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.purchase.findMany({
        where: { companyId: user.companyId },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { supplier: true },
      }),
      prisma.expense.findMany({
        where: { companyId: user.companyId },
        take: 6,
        orderBy: { date: 'desc' },
        include: { category: true },
      }),
      prisma.product.findMany({
        where: { companyId: user.companyId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        where: { companyId: user.companyId },
        take: 5,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalExpense,
        totalSales,
        totalPurchase,
        grossProfit,
        closingStock,
        warehouseCount,
        salesReturns,
        purchaseReturns,
      },
      recentSales,
      recentPurchases,
      recentExpenses,
      topProducts,
      systemUsers,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
