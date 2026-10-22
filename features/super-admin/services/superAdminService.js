async function request(url, options = {}) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Super Admin request failed');
  return data;
}

export const getDashboard = () => request('/api/super-admin/dashboard');
export const getCompanies = (filters) => {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request(`/api/super-admin/companies?${query}`);
};
export const getCompany = (id) => request(`/api/super-admin/companies/${id}`);
export const createCompany = (body) => request('/api/super-admin/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updateCompanyStatus = (id, status) => request(`/api/super-admin/companies/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
export const resetCompanyAdminPassword = (id, password) => request(`/api/super-admin/companies/${id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
export const impersonateCompanyAdmin = (id) => request(`/api/super-admin/companies/${id}/impersonate`, { method: 'POST', credentials: 'include' });
export const getAnnouncements = () => request('/api/super-admin/announcements');
export const saveAnnouncement = (id, payload) => request(id ? `/api/super-admin/announcements/${id}` : '/api/super-admin/announcements', { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
export const updateAnnouncement = (id, payload) => request(`/api/super-admin/announcements/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
export const deleteAnnouncement = (id) => request(`/api/super-admin/announcements/${id}`, { method: 'DELETE' });
export const getPlatformAuditLogs = (params) => request(`/api/super-admin/audit-logs?${params}`);
