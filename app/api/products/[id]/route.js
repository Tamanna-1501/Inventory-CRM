import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/auditLog';

export async function PUT(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'products', 'edit')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });

  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    const current = await prisma.product.findFirst({ where: { id, companyId: user.companyId } });
    if (!current) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    const body = await request.json();
    const data = {};

    for (const field of ['name', 'sku', 'price', 'costPrice']) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.categoryId !== undefined) {
      const categoryId = Number(body.categoryId);
      const category = await prisma.category.findFirst({ where: { id: categoryId, companyId: user.companyId }, select: { id: true } });
      if (!category) return NextResponse.json({ message: 'Category not found in this company' }, { status: 404 });
      data.categoryId = category.id;
    }
    for (const field of ['brandId', 'unitId']) {
      if (body[field] === undefined) continue;
      if (body[field] === null || body[field] === '') {
        data[field] = null;
        continue;
      }
      const related = await prisma[field === 'brandId' ? 'brand' : 'unit'].findFirst({
        where: { id: Number(body[field]), companyId: user.companyId },
        select: { id: true },
      });
      if (!related) return NextResponse.json({ message: `${field === 'brandId' ? 'Brand' : 'Unit'} not found in this company` }, { status: 404 });
      data[field] = related.id;
    }

    if ('promotionalPrice' in body) {
      if (body.promotionalPrice === null || body.promotionalPrice === '') data.promotionalPrice = null;
      else {
        const promo = Number(body.promotionalPrice);
        if (!Number.isFinite(promo) || promo <= 0) return NextResponse.json({ message: 'Promotional price must be greater than 0' }, { status: 400 });
        if (promo >= Number(body.price ?? current.price)) return NextResponse.json({ message: 'Promotional price must be lower than the selling price' }, { status: 400 });
        data.promotionalPrice = promo;
      }
    }
    if ('batchNo' in body) data.batchNo = body.batchNo ? String(body.batchNo).trim().slice(0, 30) || null : null;

    const product = await prisma.$transaction(async (tx) => {
      const row = await tx.product.update({ where: { id: current.id }, data });
      await writeAuditLog(tx, user, { action: 'update', entity: 'Product', entityId: current.id, details: { changedFields: Object.keys(data), sku: row.sku, name: row.name } });
      return row;
    });
    return NextResponse.json(product);
  } catch (error) {
    if (error?.code === 'P2002') return NextResponse.json({ message: 'SKU already exists in this company' }, { status: 409 });
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json({ message: 'Unable to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest();
  if (!user || !hasPermission(user, 'products', 'delete')) return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ message: 'Invalid product id' }, { status: 400 });
    const product = await prisma.product.findFirst({ where: { id, companyId: user.companyId }, select: { id: true } });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findFirst({ where: { id: product.id, companyId: user.companyId }, select: { id: true, name: true, sku: true } });
      if (!existing) throw new Error('Product not found');
      await tx.product.delete({ where: { id: existing.id } });
      await writeAuditLog(tx, user, { action: 'delete', entity: 'Product', entityId: existing.id, details: { name: existing.name, sku: existing.sku } });
    });
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    if (error?.code === 'P2003') return NextResponse.json({ message: 'Cannot delete: this product is used in Purchase/Sale/Stock records' }, { status: 409 });
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json({ message: 'Unable to delete product' }, { status: 500 });
  }
}
