// Page URL -> kaunsi permission chahiye. Yehi ek jagah hai, Sidebar aur AppShell dono yahin se padhte hain.
const RULES = [
  ['/administrative-tools', { admin: true }],
  ['/user-management/create-role', { admin: true }],
  ['/user-management/add-user', { key: 'user', action: 'add' }],
  ['/user-management/user-list', { key: 'user', action: 'view' }],

  ['/products/add-product', { key: 'prod', action: 'add' }],
  ['/products/product-list', { key: 'prod', action: 'view' }],
  ['/products/category', { key: 'category', action: 'view' }],
  ['/products/brand', { key: 'brand', action: 'view' }],
  ['/products/unit-value', { key: 'unit', action: 'view' }],
  ['/products/generate-barcode', { key: 'barcode', action: 'view' }],
  ['/products/add-adjustment', { key: 'adjustment', action: 'add' }],
  ['/products/adjustment', { key: 'adjustment', action: 'view' }],

  ['/trading/sales/new-sales', { key: 'sales', action: 'add' }],
  ['/trading/sales/pos-sales', { key: 'pos', action: 'add' }],
  ['/trading/sales/sales-list', { key: 'sales', action: 'view' }],
  ['/trading/sales/sales-returns', { key: 'sale_return', action: 'view' }],
  ['/trading/purchase/add-purchase', { key: 'purchase', action: 'add' }],
  ['/trading/purchase/manage-purchase', { key: 'purchase', action: 'view' }],
  ['/trading/purchase/purchase-returns', { key: 'purchase_return', action: 'view' }],

  ['/expense/add-expense', { key: 'expense', action: 'add' }],
  ['/expense/expense-list', { key: 'expense', action: 'view' }],
  ['/expense/expense-category', { key: 'exp_cat', action: 'view' }],
  ['/expense/payment-expense', { key: 'exp_payment', action: 'view' }],

  ['/people/add-customer', { key: 'customer', action: 'add' }],
  ['/people/customer-list', { key: 'customer', action: 'view' }],
  ['/people/add-supplier', { key: 'supplier', action: 'add' }],
  ['/people/supplier-list', { key: 'supplier', action: 'view' }],
  ['/people/add-biller', { key: 'biller', action: 'add' }],
  ['/people/biller-list', { key: 'biller', action: 'view' }],

  ['/transfer/add-transfer', { key: 'transfer', action: 'add' }],
  ['/transfer/transfer-list', { key: 'transfer', action: 'view' }],

  ['/warehouse', { key: 'wh', action: 'view' }],

  // Reports (grid checkbox: action nahi chahiye)
  ['/reports/sales-report', { key: 'Sales Report' }],
  ['/reports/customer-report', { key: 'Customer Report' }],
  ['/reports/product-report', { key: 'Products Report' }],
  ['/reports/payment-report', { key: 'Payment Report' }],
  ['/reports/discount-report', { key: 'Discount Report' }],
  ['/reports/supplier-report', { key: 'Supplier Report' }],
  ['/reports/tax-report', { key: 'Tax Report' }],
  ['/reports/purchase-report', { key: 'Purchase Report' }],
  ['/reports/user-report', { key: 'User Report' }],
  ['/reports/stock-report', { key: 'Stock Report' }],
  ['/reports/warehouse-report', { key: 'Warehouse Report' }],
  ['/reports/shipping-charge', { key: 'Shipping Charge' }],
  ['/reports/expense-report', { key: 'Expense Report' }],
];

export function getRouteRule(pathname) {
  const hit = RULES.find(([p]) => pathname === p || pathname.startsWith(p + '/'));
  return hit ? hit[1] : null;
}
