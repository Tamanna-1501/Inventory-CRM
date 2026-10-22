async function jsonRequest(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const getUsers = () => jsonRequest('/api/users', { cache: 'no-store' });
export const getRoles = () => jsonRequest('/api/roles', { cache: 'no-store' });
export const createUser = (body) => jsonRequest('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updateUser = (id, body) => jsonRequest(`/api/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const deleteUser = (id) => jsonRequest(`/api/users/${id}`, { method: 'DELETE' });
