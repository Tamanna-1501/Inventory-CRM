import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, authorizeAny, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function GET() {
  const { user, error } = await authorizeAny(['prod', 'barcode', 'sales', 'pos', 'purchase', 'purchase_return', 'sale_return', 'adjustment', 'transfer', 'Products Report', 'Stock Report']);
  if (error) return error;

  // No "select" here, so promotionalPrice and batchNo are returned automatically
  const products = await prisma.product.findMany({
    where: { companyId: user.companyId },
    include: {
      category: { include: { parent: true } },
      brand: true,
      unit: true,
      stocks: { where: { companyId: user.companyId }, include: { warehouse: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(request) {
  const user = await getUserFromRequest();

  if (!user || !hasPermission(user, 'products', 'add')) {
    return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  }

  try {
    const {
      name,
      sku,
      price,
      costPrice,
      categoryId,
      brandId,
      unitId,
      warehouseId,
      openingStock = 0,
      promotionalPrice,
      batchNo,
    } = await request.json();

    if (!name || !sku || !price || !categoryId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Promotional price: optional, but if given it must be > 0 and below the selling price
    let promo = null;
    if (promotionalPrice !== undefined && promotionalPrice !== null && promotionalPrice !== '') {
      promo = Number(promotionalPrice);
      if (!Number.isFinite(promo) || promo <= 0) {
        return NextResponse.json({ message: 'Promotional price must be greater than 0' }, { status: 400 });
      }
      if (promo >= Number(price)) {
        return NextResponse.json({ message: 'Promotional price must be lower than the selling price' }, { status: 400 });
      }
    }

    const batch = batchNo ? String(batchNo).trim().slice(0, 30) : '';

    const result = await prisma.$transaction(async (tx) => {
      const [category, brand, unit, warehouse] = await Promise.all([
        tx.category.findFirst({ where: { id: Number(categoryId), companyId: user.companyId }, select: { id: true } }),
        brandId ? tx.brand.findFirst({ where: { id: Number(brandId), companyId: user.companyId }, select: { id: true } }) : null,
        unitId ? tx.unit.findFirst({ where: { id: Number(unitId), companyId: user.companyId }, select: { id: true } }) : null,
        warehouseId ? tx.warehouse.findFirst({ where: { id: Number(warehouseId), companyId: user.companyId }, select: { id: true } }) : null,
      ]);
      if (!category || (brandId && !brand) || (unitId && !unit) || (warehouseId && !warehouse)) {
        throw new Error('Category, brand, unit or warehouse not found in this company');
      }
      const openingQty = Number(openingStock);
      if (!Number.isInteger(openingQty) || openingQty < 0) throw new Error('Opening stock must be a non-negative integer');
      const product = await tx.product.create({
        data: {
          companyId: user.companyId,
          name,
          sku,
          price,
          costPrice: costPrice || 0,
          promotionalPrice: promo,
          batchNo: batch || null,
          categoryId: Number(categoryId),
          brandId: brandId ? Number(brandId) : null,
          unitId: unitId ? Number(unitId) : null,
        },
      });

      if (warehouseId) {
        await tx.stock.create({
          data: {
            companyId: user.companyId,
            productId: product.id,
            warehouseId: Number(warehouseId),
            quantity: openingQty,
          },
        });
      }

      await writeAuditLog(tx, user, { action: 'create', entity: 'Product', entityId: product.id, details: { name: product.name, sku: product.sku, openingStock: openingQty } });

      return product;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'SKU already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
