async function request(url, options = {}) {
  const response = await fetch(url, { credentials:'include', cache:'no-store', ...options });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data.message || data.error || 'Request failed');
  return data;
}
export const getRoles=()=>request('/api/roles');
export const createRole=(name,description='')=>request('/api/roles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,description})});
export const saveRole=(id,body)=>request(`/api/roles/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
export const getAuditLogs=()=>request('/api/audit-logs');
export const getCompanySettings=()=>request('/api/settings');
export const updateCompanySettings=(settings)=>request('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)});
export const getWarehouses=()=>request('/api/warehouses');
export const getBillers=()=>request('/api/billers');
export const getCustomers=()=>request('/api/customers');
export async function downloadCompanyData(kind){
  const isExcel=kind==='excel';
  const response=await fetch(isExcel?'/api/company/export':'/api/company/backup',{method:'GET',credentials:'include',cache:'no-store'});
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.message||'Unable to prepare company data file');}
  return response.blob();
}
