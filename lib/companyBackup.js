import { Prisma } from '@prisma/client';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';

const MAX_ROWS_PER_TABLE = 25000;
const SAFE_SETTING_KEYS = [
  'companyLogo', 'footerText', 'taxPercent', 'invoicePrefix', 'themeMode', 'themeBgColor',
  'currencyName', 'currencyCode', 'currencySymbol', 'currencyPosition', 'decimalDigits',
  'defaultWarehouseId', 'defaultBillerId', 'defaultCustomerId', 'defaultLanguage',
  'timezone', 'dateFormat', 'timeFormat', 'soundEffect', 'autoPrintReceipt',
];

export class ExportLimitError extends Error {
  constructor(table) {
    super(`The ${table} table exceeds the ${MAX_ROWS_PER_TABLE.toLocaleString()} row export limit.`);
    this.name = 'ExportLimitError';
  }
}

function assertTableLimit(name, rows) {
  if (rows.length > MAX_ROWS_PER_TABLE) throw new ExportLimitError(name);
  return rows;
}

function safeCompanySettings(value) {
  const settings = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return Object.fromEntries(SAFE_SETTING_KEYS.filter((key) => Object.hasOwn(settings, key)).map((key) => [key, settings[key]]));
}

export async function getCompanyBackupData(companyId) {
  return prisma.$transaction(async (tx) => {
    const company = await tx.company.findFirst({
      where: { id: companyId },
      select: { id: true, name: true, email: true, phone: true, address: true, status: true, source: true, createdAt: true, settings: true },
    });
    if (!company) throw new Error('Company not found');

    const where = { companyId };
    const [roles, users, categories, warehouses, products, stocks, customers, suppliers, purchases, sales, expenses,
      expenseCategories, transfers, purchaseReturns, saleReturns, billers, brands, units, adjustments, messages, notifications, auditLogs] = await Promise.all([
      tx.role.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.user.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, select: { id: true, companyId: true, isSuperAdmin: true, email: true, name: true, phone: true, address: true, status: true, roleId: true, createdAt: true, updatedAt: true } }),
      tx.category.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.warehouse.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.product.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.stock.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.customer.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.supplier.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.purchase.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, include: { items: true, payments: true } }),
      tx.sale.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, include: { items: true, invoice: { include: { payments: true } } } }),
      tx.expense.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, include: { payments: true } }),
      tx.expenseCategory.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.transfer.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, include: { items: true } }),
      tx.purchaseReturn.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, include: { items: true } }),
      tx.saleReturn.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, include: { items: true } }),
      tx.biller.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.brand.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.unit.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
      tx.adjustment.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' }, include: { items: true } }),
      tx.message.findMany({
        where: { sender: { is: { companyId } }, recipient: { is: { companyId } } },
        take: MAX_ROWS_PER_TABLE + 1, orderBy: { createdAt: 'asc' },
      }),
      tx.notification.findMany({ where: { user: { is: { companyId } } }, take: MAX_ROWS_PER_TABLE + 1, orderBy: { createdAt: 'asc' } }),
      tx.auditLog.findMany({ where, take: MAX_ROWS_PER_TABLE + 1, orderBy: { id: 'asc' } }),
    ]);

    const tables = {
      Roles: roles,
      Users: users,
      Categories: categories,
      Warehouses: warehouses,
      Products: products,
      Stock: stocks,
      Customers: customers,
      Suppliers: suppliers,
      Purchases: purchases.map(({ items, payments, ...row }) => row),
      PurchaseItems: purchases.flatMap((row) => row.items),
      PurchasePayments: purchases.flatMap((row) => row.payments),
      Sales: sales.map(({ items, invoice, ...row }) => row),
      SaleItems: sales.flatMap((row) => row.items),
      Invoices: sales.flatMap((row) => row.invoice ? [{ ...(({ payments, ...invoice }) => invoice)(row.invoice) }] : []),
      Payments: sales.flatMap((row) => row.invoice?.payments || []),
      Expenses: expenses.map(({ payments, ...row }) => row),
      ExpensePayments: expenses.flatMap((row) => row.payments),
      ExpenseCategories: expenseCategories,
      Transfers: transfers.map(({ items, ...row }) => row),
      TransferItems: transfers.flatMap((row) => row.items),
      PurchaseReturns: purchaseReturns.map(({ items, ...row }) => row),
      PurchaseReturnItems: purchaseReturns.flatMap((row) => row.items),
      SaleReturns: saleReturns.map(({ items, ...row }) => row),
      SaleReturnItems: saleReturns.flatMap((row) => row.items),
      Billers: billers,
      Brands: brands,
      Units: units,
      Adjustments: adjustments.map(({ items, ...row }) => row),
      AdjustmentItems: adjustments.flatMap((row) => row.items),
      Messages: messages,
      Notifications: notifications,
      AuditLogs: auditLogs,
    };
    for (const [table, rows] of Object.entries(tables)) assertTableLimit(table, rows);

    return {
      company: { ...company, settings: safeCompanySettings(company.settings) },
      tables,
    };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 60000 });
}

function excelCell(value) {
  if (value == null) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    const text = JSON.stringify(value);
    return text.length > 32000 ? `${text.slice(0, 31970)} [truncated for Excel cell limit]` : text;
  }
  if (typeof value === 'string' && value.length > 32000) return `${value.slice(0, 31970)} [truncated for Excel cell limit]`;
  return value;
}

export async function createCompanyWorkbook(backup) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Inventual';
  workbook.created = new Date();

  const companySheet = workbook.addWorksheet('Company');
  companySheet.addRow(['Field', 'Value']);
  for (const [key, value] of Object.entries(backup.company)) companySheet.addRow([key, excelCell(value)]);
  companySheet.getRow(1).font = { bold: true };
  companySheet.columns = [{ width: 28 }, { width: 60 }];

  for (const [name, rows] of Object.entries(backup.tables)) {
    const sheet = workbook.addWorksheet(name.slice(0, 31));
    if (!rows.length) {
      sheet.addRow(['No records']);
      continue;
    }
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    sheet.addRow(columns);
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
    sheet.columns = columns.map((key) => ({ header: key, key, width: Math.min(36, Math.max(14, key.length + 2)) }));
    for (const row of rows) {
      sheet.addRow(Object.fromEntries(columns.map((key) => [key, excelCell(row[key])])));
    }
  }
  const result = await workbook.xlsx.writeBuffer();
  return Buffer.from(result);
}
