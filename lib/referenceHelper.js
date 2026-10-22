import { prisma } from './prisma';
import { getUserFromRequest } from './apiAuth';

// Next number = (highest existing number with this prefix) + 1
// so deleting old records never causes a duplicate reference.
async function nextNumber(model, field, prefix, companyId, pad = 6) {
  // Company id request se nahi, signed-in user ke DB record se liya jata hai.
  const user = companyId == null ? await getUserFromRequest() : null;
  const tenantId = Number(companyId ?? user?.companyId);
  if (!Number.isInteger(tenantId) || tenantId <= 0 || user?.isSuperAdmin) throw new Error('Valid company is required for references');
  const last = await model.findFirst({
    where: { companyId: tenantId, [field]: { startsWith: prefix } },
    orderBy: { [field]: 'desc' },
    select: { [field]: true },
  });
  const lastNum = last?.[field] ? parseInt(last[field].slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastNum + 1).padStart(pad, '0')}`;
}

export async function generateInvoiceNumber(companyId, db = prisma) {
  const year = new Date().getFullYear();
  const company = await db.company.findUnique({ where: { id: Number(companyId) }, select: { settings: true } });
  const settings = company?.settings && typeof company.settings === 'object' && !Array.isArray(company.settings) ? company.settings : {};
  const rawPrefix = String(settings.invoicePrefix || 'INV').trim().toUpperCase();
  const prefix = /^[A-Z0-9_-]{1,16}$/.test(rawPrefix) ? rawPrefix : 'INV';
  return nextNumber(db.invoice, 'invoiceNumber', `${prefix}-${year}-`, companyId, 3);
}

export async function generatePurchaseReference(companyId, db = prisma) {
  return nextNumber(db.purchase, 'reference', 'P-', companyId);
}

export async function generatePurchaseReturnReference(companyId, db = prisma) {
  return nextNumber(db.purchaseReturn, 'reference', 'PR-', companyId);
}

export async function generateSaleReference(companyId, db = prisma) {
  return nextNumber(db.sale, 'reference', 'S-', companyId);
}

export async function generateSaleReturnReference(companyId, db = prisma) {
  return nextNumber(db.saleReturn, 'reference', 'SR-', companyId);
}

export async function generateExpenseReference(companyId, db = prisma) {
  return nextNumber(db.expense, 'reference', 'EXP-', companyId);
}
