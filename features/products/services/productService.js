const json = async (response) => {
  const body = await response.text();
  let data = {};
  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    if (response.ok) throw new Error('The server returned an invalid response.');
  }
  if (!response.ok) throw new Error(data.message || data.error || `The request could not be completed (HTTP ${response.status}).`);
  return data;
};

export async function getProducts() { return json(await fetch('/api/products', { cache: 'no-store' })); }
export async function getCategories() { return json(await fetch('/api/categories', { cache: 'no-store' })); }
export async function getBrands() { return json(await fetch('/api/brands', { cache: 'no-store' })); }
export async function getUnits() { return json(await fetch('/api/units', { cache: 'no-store' })); }
export async function getWarehouses() { return json(await fetch('/api/warehouses', { cache: 'no-store' })); }
export async function getAdjustments() { return json(await fetch('/api/adjustments', { cache: 'no-store' })); }
export async function saveProduct(body) { return json(await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function updateProduct(id, body) { return json(await fetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }
export async function deleteProduct(id) { return json(await fetch(`/api/products/${id}`, { method: 'DELETE' })); }
export async function saveAdjustment(body) { return json(await fetch('/api/adjustments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })); }

export async function createCatalogItem(kind, body) {
  const endpoint = { category: '/api/categories', brand: '/api/brands', unit: '/api/units' }[kind];
  return json(await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}
export async function updateCatalogItem(kind, id, body) {
  const endpoint = { brand: `/api/brands/${id}`, unit: `/api/units/${id}` }[kind];
  return json(await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}
export async function deleteCatalogItem(kind, id) {
  const endpoint = { brand: `/api/brands/${id}`, unit: `/api/units/${id}` }[kind];
  return json(await fetch(endpoint, { method: 'DELETE' }));
}
