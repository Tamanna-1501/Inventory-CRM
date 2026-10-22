async function jsonRequest(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
export const getRoles = () => jsonRequest('/api/roles', { cache: 'no-store' });
export const createRole = (body) => jsonRequest('/api/roles', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
export const updateRole = (id, body) => jsonRequest(`/api/roles/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
export const deleteRole = (id) => jsonRequest(`/api/roles/${id}`, { method:'DELETE' });
