const readJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return { message: text.slice(0, 200) || `Server error (${response.status})` }; }
};

async function request(url, options) {
  const response = await fetch(url, options);
  const data = await readJson(response);
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}

export const list = (url) => request(url, { cache: 'no-store' });
export const create = (url, body) => request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const update = (url, body) => request(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const remove = (url) => request(url, { method: 'DELETE' });
export const payExpense = (id, body) => create(`/api/expenses/${id}/payments`, body);
export const transferExport = async (ids) => {
  const response = await fetch('/api/transfers/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
  if (!response.ok) { const data = await readJson(response); throw new Error(data.message || 'Export failed'); }
  return response.blob();
};
export const transferTemplate = async () => {
  const response = await fetch('/api/transfers/import');
  if (!response.ok) { const data = await readJson(response); throw new Error(data.message || 'Template download failed'); }
  return response.blob();
};
export const transferImport = (formData) => request('/api/transfers/import', { method: 'POST', body: formData });
export { readJson };
