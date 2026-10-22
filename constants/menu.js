import { Boxes, ChartNoAxesCombined, ClipboardList, CreditCard, LayoutDashboard, Mail, Settings2, Users, Warehouse } from 'lucide-react';

export const COMPANY_MENU = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', icon: Boxes, children: [
    { label: 'Add Product', href: '/products/add-product' }, { label: 'Product List', href: '/products/product-list' },
    { label: 'Category', href: '/products/category' }, { label: 'Brand', href: '/products/brand' }, { label: 'Unit/Value', href: '/products/unit-value' },
    { label: 'Generate Barcode', href: '/products/generate-barcode' }, { label: 'Add Adjustment', href: '/products/add-adjustment' }, { label: 'Adjustment', href: '/products/adjustment' },
  ] },
  { label: 'Trading', icon: CreditCard, children: [
    { label: 'New Sales', href: '/trading/sales/new-sales' }, { label: 'POS Sales', href: '/trading/sales/pos-sales' },
    { label: 'Sales List', href: '/trading/sales/sales-list' }, { label: 'Sales Returns', href: '/trading/sales/sales-returns' },
    { label: 'Add Purchase', href: '/trading/purchase/add-purchase' }, { label: 'Manage Purchase', href: '/trading/purchase/manage-purchase' },
    { label: 'Purchase Returns', href: '/trading/purchase/purchase-returns' },
  ] },
  { label: 'Expense', icon: ClipboardList, children: [
    { label: 'Add Expense', href: '/expense/add-expense' }, { label: 'Expense List', href: '/expense/expense-list' },
    { label: 'Expense Category', href: '/expense/expense-category' }, { label: 'Payment Expense', href: '/expense/payment-expense' },
  ] },
  { label: 'People', icon: Users, children: [
    { label: 'Add Customer', href: '/people/add-customer' }, { label: 'Customer List', href: '/people/customer-list' },
    { label: 'Add Supplier', href: '/people/add-supplier' }, { label: 'Supplier List', href: '/people/supplier-list' },
    { label: 'Add Biller', href: '/people/add-biller' }, { label: 'Biller List', href: '/people/biller-list' },
  ] },
  { label: 'User Management', icon: Users, children: [
    { label: 'Add User', href: '/user-management/add-user' }, { label: 'User List', href: '/user-management/user-list' }, { label: 'Create Role', href: '/user-management/create-role' },
  ] },
  { label: 'Transfer', icon: Boxes, children: [{ label: 'Add Transfer', href: '/transfer/add-transfer' }, { label: 'Transfer List', href: '/transfer/transfer-list' }] },
  { label: 'Reports', icon: ChartNoAxesCombined, children: [
    { label: 'Sales Report', href: '/reports/sales-report' }, { label: 'Purchase Report', href: '/reports/purchase-report' },
    { label: 'Payment Report', href: '/reports/payment-report' }, { label: 'Product Report', href: '/reports/product-report' },
    { label: 'Stock Report', href: '/reports/stock-report' }, { label: 'Expense Report', href: '/reports/expense-report' },
    { label: 'User Report', href: '/reports/user-report' }, { label: 'Customer Report', href: '/reports/customer-report' },
    { label: 'Supplier Report', href: '/reports/supplier-report' }, { label: 'Warehouse Report', href: '/reports/warehouse-report' },
    { label: 'Tax Report', href: '/reports/tax-report' }, { label: 'Shipping Charge', href: '/reports/shipping-charge' }, { label: 'Discount Report', href: '/reports/discount-report' },
  ] },
  { label: 'Warehouse', href: '/warehouse', icon: Warehouse },
  { label: 'Internal mail', href: '/email', icon: Mail },
  { label: 'Administrative Tools', icon: Settings2, children: [
    { label: 'Role Permission', href: '/administrative-tools/settings/role-permission' }, { label: 'Audit Log', href: '/administrative-tools/audit-log' },
    { label: 'Settings', children: [
      { label: 'System Setting', href: '/administrative-tools/settings/system' }, { label: 'Theme Setting', href: '/administrative-tools/settings/theme' },
      { label: 'Currency Setting', href: '/administrative-tools/settings/currency' }, { label: 'POS Setting', href: '/administrative-tools/settings/pos' },
      { label: 'Language', href: '/administrative-tools/settings/language' }, { label: 'Time & Date', href: '/administrative-tools/settings/time-date' },
      { label: 'Create Role', href: '/administrative-tools/settings/roles' }, { label: 'Backup Database', href: '/administrative-tools/settings/backup' },
    ] },
  ] },
];

export const SUPER_ADMIN_MENU = [
  { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
  { label: 'Companies', href: '/super-admin/companies', icon: Warehouse },
  { label: 'Announcements', href: '/super-admin/announcements', icon: Mail },
  { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: ClipboardList },
];
