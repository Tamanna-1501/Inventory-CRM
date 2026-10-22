const ADMIN_ROLES = ['ADMIN', 'OWNER'];

export function isAdminRole(name) {
  return ADMIN_ROLES.includes(String(name || '').toUpperCase().trim());
}

// API / folder ka naam -> Role Permission page ka key
const KEY_MAP = {
  products: 'prod', product: 'prod', barcode: 'barcode',
  categories: 'category', category: 'category', brands: 'brand', brand: 'brand',
  units: 'unit', unit: 'unit', adjustments: 'adjustment', adjustment: 'adjustment',
  sales: 'sales', sale: 'sales', pos: 'pos', 'sale-returns': 'sale_return', sale_return: 'sale_return',
  purchases: 'purchase', purchase: 'purchase', 'purchase-returns': 'purchase_return', purchase_return: 'purchase_return',
  expenses: 'expense', expense: 'expense', 'expense-categories': 'exp_cat', exp_cat: 'exp_cat',
  warehouses: 'wh', warehouse: 'wh', wh: 'wh', customers: 'customer', customer: 'customer',
  suppliers: 'supplier', supplier: 'supplier', billers: 'biller', biller: 'biller',
  users: 'user', user: 'user', transfers: 'transfer', transfer: 'transfer',
};

function toObject(p) {
  if (!p) return {};
  if (typeof p === 'string') {
    try { return JSON.parse(p); } catch { return {}; }
  }
  return typeof p === 'object' ? p : {};
}

export function hasPermission(userOrRole, key, action = 'view') {
  if (!userOrRole) return false;
  const role = typeof userOrRole === 'object' && 'role' in userOrRole ? userOrRole.role : userOrRole;
  const roleName = typeof role === 'string' ? role : role?.name;
  if (isAdminRole(roleName)) return true;
  if (!role || typeof role === 'string') return false;
  const perms = toObject(role.permissions);
  const k = String(key || '').trim();
  const entry = perms[KEY_MAP[k.toLowerCase()] ?? k];
  if (entry && typeof entry === 'object') {
    const a = String(action || 'view').toLowerCase();
    const act = { create: 'add', update: 'edit' }[a] || a;
    return entry[act] === true;
  }
  return entry === true;
}
