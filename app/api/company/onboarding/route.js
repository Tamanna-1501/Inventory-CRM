import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeLogin } from '@/lib/apiAuth';

export async function GET() {
  try {
    const { user, error } = await authorizeLogin();
    if (error) return error;
    if (!user.companyId || user.isSuperAdmin) {
      return NextResponse.json({ message: 'Company access required' }, { status: 403 });
    }

    const companyId = user.companyId;
    const [warehouseCount, productCount, saleCount] = await Promise.all([
      prisma.warehouse.count({ where: { companyId } }),
      prisma.product.count({ where: { companyId } }),
      prisma.sale.count({ where: { companyId } }),
    ]);

    return NextResponse.json({
      steps: [
        { key: 'warehouse', title: 'Add your first warehouse', done: warehouseCount > 0, count: warehouseCount, href: '/warehouse' },
        { key: 'product', title: 'Add your first product', done: productCount > 0, count: productCount, href: '/products/add-product' },
        { key: 'sale', title: 'Record your first sale', done: saleCount > 0, count: saleCount, href: '/trading/sales/new-sales' },
      ],
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('GET /api/company/onboarding error:', error);
    return NextResponse.json({ message: 'Unable to load onboarding progress' }, { status: 500 });
  }
}
