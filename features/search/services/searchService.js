const SOURCES = {
  products: { url: '/api/products', label: 'Products', href: '/products/product-list', fields: (row) => [row.name, row.sku, row.barcode, row.brand?.name, row.category?.name] },
  sales: { url: '/api/sales', label: 'Sales', href: '/trading/sales/sales-list', fields: (row) => [row.reference, row.invoice?.invoiceNumber, row.customer?.name, row.customer?.phone, row.warehouse?.name] },
  purchases: { url: '/api/purchases', label: 'Purchases', href: '/trading/purchase/manage-purchase', fields: (row) => [row.reference, row.supplier?.name, row.supplier?.phone, row.warehouse?.name] },
  customers: { url: '/api/customers', label: 'Customers', href: '/people/customer-list', fields: (row) => [row.name, row.email, row.phone, row.customerCode, row.address] },
  suppliers: { url: '/api/suppliers', label: 'Suppliers', href: '/people/supplier-list', fields: (row) => [row.name, row.email, row.phone, row.supplierCode, row.address] },
  expenses: { url: '/api/expenses', label: 'Expenses', href: '/expense/expense-list', fields: (row) => [row.reference, row.voucherNo, row.category?.name, row.description, row.warehouse?.name] },
  warehouses: { url: '/api/warehouses', label: 'Warehouses', href: '/warehouse', fields: (row) => [row.name, row.address, row.phone] },
  transfers: { url: '/api/transfers', label: 'Transfers', href: '/transfer/transfer-list', fields: (row) => [row.reference, row.reason, row.authorizedBy, row.fromWarehouse?.name, row.toWarehouse?.name, ...(row.items || []).flatMap((item) => [item.product?.name, item.product?.sku])] },
  users: { url: '/api/users', label: 'Users', href: '/user-management/user-list', fields: (row) => [row.name, row.email, row.phone, row.role?.name] },
};

function rowsFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function loadSource(source, signal) {
  const response = await fetch(source.url, { credentials: 'include', cache: 'no-store', signal });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Unable to search ${source.label.toLowerCase()}.`);
  return rowsFromResponse(data);
}

export async function searchCompanyRecords(query, allowedTypes, signal) {
  const term = query.trim().toLocaleLowerCase();
  const entries = allowedTypes.map((type) => [type, SOURCES[type]]).filter(([, source]) => source);
  const settled = await Promise.allSettled(entries.map(([, source]) => loadSource(source, signal)));
  const results = [];
  const errors = [];

  settled.forEach((result, index) => {
    const [type, source] = entries[index];
    if (result.status === 'rejected') {
      if (result.reason?.name !== 'AbortError') errors.push(`${source.label}: ${result.reason?.message || 'Request failed'}`);
      return;
    }
    for (const row of result.value) {
      const fields = source.fields(row).filter((value) => value !== null && value !== undefined).map(String);
      if (!fields.some((value) => value.toLocaleLowerCase().includes(term))) continue;
      results.push({
        id: `${type}-${row.id}`,
        type,
        typeLabel: source.label,
        title: row.name || row.reference || row.invoice?.invoiceNumber || row.voucherNo || row.email || `${source.label.slice(0, -1)} #${row.id}`,
        detail: [row.sku, row.email, row.phone, row.customer?.name, row.supplier?.name, row.category?.name, row.warehouse?.name].filter(Boolean).join(' · '),
        date: row.createdAt || row.date || null,
        href: source.href,
      });
    }
  });

  return { results: results.slice(0, 100), errors };
}
