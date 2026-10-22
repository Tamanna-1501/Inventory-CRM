const SOURCE_MAP = {
  sales: ['/api/sales'],
  customers: ['/api/customers', '/api/sales'],
  discounts: ['/api/sales'],
  expenses: ['/api/expenses'],
  payments: ['/api/reports/payments'],
  products: ['/api/products'],
  purchases: ['/api/purchases'],
  stock: ['/api/stock'],
  suppliers: ['/api/suppliers', '/api/purchases'],
  tax: ['/api/sales', '/api/purchases'],
  users: ['/api/users'],
  warehouses: ['/api/warehouses'],
  shipping: ['/api/sales', '/api/purchases'],
};

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { throw new Error(`Unexpected response from ${response.url}`); }
}

async function fetchSource(path, filters) {
  const url = new URL(path, window.location.origin);
  if (path === '/api/reports/payments') {
    if (filters.startDate) url.searchParams.set('startDate', filters.startDate);
    if (filters.endDate) url.searchParams.set('endDate', filters.endDate);
    if (filters.type && filters.type !== 'all') url.searchParams.set('type', filters.type);
    if (filters.paymentMethod && filters.paymentMethod !== 'all') url.searchParams.set('paymentMethod', filters.paymentMethod);
  }
  if (path === '/api/stock') {
    if (filters.warehouseId && filters.warehouseId !== 'all') url.searchParams.set('warehouseId', filters.warehouseId);
    if (filters.startDate) url.searchParams.set('startDate', filters.startDate);
    if (filters.endDate) url.searchParams.set('endDate', filters.endDate);
  }
  const response = await fetch(url.pathname + url.search, { cache: 'no-store', credentials: 'include' });
  const data = await readJson(response);
  if (!response.ok) throw new Error(data.message || data.error || `Unable to load ${path}`);
  return data;
}

function unwrap(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.payments)) return value.payments;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function normalize(source, rows, kind) {
  const entity = source.split('/').filter(Boolean).pop();
  return rows.flatMap((row) => {
    if (entity === 'sales' || entity === 'purchases') {
      const amount = kind === 'tax'
        ? Number(row.taxAmount ?? (row.items || []).reduce((sum, item) => sum + Number(item.tax || 0), 0))
        : kind === 'discounts'
        ? Number(row.discount ?? (row.items || []).reduce((sum, item) => sum + Number(item.discount || 0), 0))
        : kind === 'shipping'
        ? Number(row.shippingCharge || 0)
        : Number(row.totalAmount ?? row.grandTotal ?? row.total ?? 0);
      const type = kind === 'tax' ? 'Tax' : kind === 'discounts' ? 'Discount' : kind === 'shipping' ? 'Shipping' : entity === 'sales' ? 'Sale' : 'Purchase';
      return [{ id: `${entity}-${row.id}`, date: row.date || row.createdAt, reference: row.reference || row.invoiceNumber || `#${row.id}`, type, party: row.customer?.name || row.supplier?.name || '', warehouse: row.warehouse?.name || '', warehouseId: row.warehouseId, amount, status: row.paymentStatus || row.status || '', raw: row }];
    }
    if (entity === 'expenses') return [{ id: `expense-${row.id}`, date: row.date || row.createdAt, reference: row.reference || row.voucherNo || `#${row.id}`, type: 'Expense', party: row.category?.name || '', warehouse: row.warehouse?.name || '', warehouseId: row.warehouseId, amount: Number(row.amount || 0), status: row.paymentStatus || '', raw: row }];
    if (entity === 'stock') return [{ id: `stock-${row.id}`, date: row.updatedAt || row.createdAt, reference: row.product?.sku || `#${row.productId || row.id}`, type: 'Stock', party: row.product?.name || row.name || '', warehouse: row.warehouse?.name || '', warehouseId: row.warehouseId || row.warehouse?.id, amount: Number(row.quantity ?? row.qty ?? 0), status: Number(row.quantity ?? row.qty ?? 0) <= Number(row.product?.alertQty || row.product?.minStock || 5) ? 'Low stock' : 'In stock', raw: row }];
    if (entity === 'users') return [{ id: `user-${row.id}`, date: row.createdAt, reference: row.email || '', type: 'User', party: row.name || '', warehouse: row.role?.name || '', amount: 0, status: row.status || '', raw: row }];
    if (entity === 'products') return [{ id: `product-${row.id}`, date: row.createdAt, reference: row.sku || row.code || `#${row.id}`, type: 'Product', party: row.name || '', warehouse: row.category?.name || '', amount: Number(row.quantity ?? row.stock ?? 0), status: row.status || '', raw: row }];
    if (entity === 'warehouses') return [{ id: `warehouse-${row.id}`, date: row.createdAt, reference: `#${row.id}`, type: 'Warehouse', party: row.name || '', warehouse: row.address || '', amount: 0, status: '', raw: row }];
    if (entity === 'customers' || entity === 'suppliers') return [{ id: `${entity}-${row.id}`, date: row.createdAt, reference: row.customerCode || row.supplierCode || `#${row.id}`, type: entity === 'customers' ? 'Customer' : 'Supplier', party: row.name || '', warehouse: row.phone || '', amount: Number(row.rewardPoints || 0), status: row.email || '', raw: row }];
    if (entity === 'payments') return [{ id: row.id || `payment-${row.originalId}`, date: row.date || row.paidAt || row.createdAt, reference: row.reference || `#${row.originalId || row.id}`, type: row.type || 'Payment', party: row.party || row.customer?.name || row.supplier?.name || row.expense?.category?.name || '', warehouse: row.warehouse?.name || row.warehouse || '', warehouseId: row.warehouseId, amount: Number(row.amount || row.amountPaid || 0), status: row.paymentMethod || row.status || '', raw: row }];
    return [];
  });
}

export async function getReportData(kind, filters = {}) {
  const paths = SOURCE_MAP[kind] || [];
  const results = await Promise.all(paths.map((path) => fetchSource(path, filters)));
  const records = paths.flatMap((path, index) => normalize(path, unwrap(results[index]), kind));
  return { records, sources: paths };
}

export { SOURCE_MAP };
