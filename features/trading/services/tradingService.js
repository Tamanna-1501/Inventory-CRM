async function read(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || data.error || 'The request failed.'), { status: response.status, data });
  return data;
}

export async function loadTradingData() {
  const list = (url, options) => fetch(url, options).then(read).then((data) => Array.isArray(data) ? data : []).catch(() => []);
  const [customers, suppliers, billers, warehouses, products, branding] = await Promise.all([
    list('/api/customers'), list('/api/suppliers'), list('/api/billers'),
    list('/api/warehouses'), list('/api/products', { cache: 'no-store' }),
    fetch('/api/company/branding', { cache: 'no-store' }).then((response) => response.ok ? response.json() : null).catch(() => null),
  ]);
  return { customers, suppliers, billers, warehouses, products, branding };
}
export async function getSales() { return read(await fetch('/api/sales', { cache: 'no-store' })); }
export async function getPurchases() { return read(await fetch('/api/purchases', { cache: 'no-store' })); }
export async function getSaleReturns() { return read(await fetch('/api/sale-returns', { cache: 'no-store' })); }
export async function getPurchaseReturns() { return read(await fetch('/api/purchase-returns', { cache: 'no-store' })); }
export async function createSale(body) { return read(await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function createPurchase(body) { return read(await fetch('/api/purchases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function updateSale(id, body) { return read(await fetch(`/api/sales/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function deleteSale(id) { return read(await fetch(`/api/sales/${id}`, { method: 'DELETE' })); }
export async function createSalePayment(invoiceId, body) { return read(await fetch(`/api/invoices/${invoiceId}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function updatePurchase(id, body) { return read(await fetch(`/api/purchases/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function deletePurchase(id, force = false) { return read(await fetch(`/api/purchases/${id}${force ? '?force=true' : ''}`, { method: 'DELETE' })); }
export async function createPurchasePayment(id, body) { return read(await fetch(`/api/purchases/${id}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function createSaleReturn(body) { return read(await fetch('/api/sale-returns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function createPurchaseReturn(body) { return read(await fetch('/api/purchase-returns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function updateReturn(kind, id, body) { const base = kind === 'sale' ? '/api/sale-returns' : '/api/purchase-returns'; return read(await fetch(`${base}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function deleteReturn(kind, id) { const base = kind === 'sale' ? '/api/sale-returns' : '/api/purchase-returns'; return read(await fetch(`${base}/${id}`, { method: 'DELETE' })); }
export async function getSale(id) { return read(await fetch(`/api/sales/${id}`, { cache: 'no-store' })); }
export async function getBranding() { try { const response = await fetch('/api/company/branding', { cache: 'no-store' }); return response.ok ? await response.json() : null; } catch { return null; } }
