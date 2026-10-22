'use client';

import Link from 'next/link';
import { ArrowUpRight, Boxes, ChartNoAxesCombined, CircleDollarSign, ClipboardList, CreditCard, Package, Users, Warehouse } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import AnnouncementList from '../components/AnnouncementList';
import OnboardingChecklist from '../components/OnboardingChecklist';
import styles from './RoleDashboardPage.module.css';

const NUMBER = new Intl.NumberFormat('en-IN');

const ROLE_CONTENT = {
  MANAGER: { title: 'Management dashboard', description: 'Your overview of the company areas enabled for your role.', focus: 'Business overview', shortcuts: ['sales', 'pos', 'purchases', 'products', 'warehouses', 'expenses', 'users', 'salesReport', 'purchaseReport'] },
  SUPERVISOR: { title: 'Operations dashboard', description: 'Keep daily inventory and sales work moving across your team.', focus: 'Daily operations', shortcuts: ['sales', 'pos', 'products', 'warehouses', 'purchases', 'transfers', 'adjustments'] },
  STAFF: { title: 'My workbench', description: 'Your permitted tools and current company workflow at a glance.', focus: 'My workspace', shortcuts: ['pos', 'sales', 'products', 'warehouses', 'transfers', 'adjustments'] },
  BILLER: { title: 'Billing desk', description: 'Start a sale and access the customer tools assigned to your account.', focus: 'Sales workspace', shortcuts: ['pos', 'sales', 'customers'] },
};

const SHORTCUTS = {
  pos: { label: 'Open POS', href: '/trading/sales/pos-sales', permission: ['pos', 'add'], icon: CreditCard },
  sales: { label: 'New sale', href: '/trading/sales/new-sales', permission: ['sales', 'add'], icon: CircleDollarSign },
  salesList: { label: 'Sales list', href: '/trading/sales/sales-list', permission: ['sales', 'view'], icon: ClipboardList },
  purchases: { label: 'Manage purchases', href: '/trading/purchase/manage-purchase', permission: ['purchase', 'view'], icon: ClipboardList },
  products: { label: 'Products', href: '/products/product-list', permission: ['prod', 'view'], icon: Package },
  warehouses: { label: 'Warehouses', href: '/warehouse', permission: ['wh', 'view'], icon: Warehouse },
  expenses: { label: 'Expenses', href: '/expense/expense-list', permission: ['expense', 'view'], icon: CircleDollarSign },
  users: { label: 'Team members', href: '/user-management/user-list', permission: ['user', 'view'], icon: Users },
  salesReport: { label: 'Sales report', href: '/reports/sales-report', permission: ['Sales Report'], icon: ChartNoAxesCombined },
  purchaseReport: { label: 'Purchase report', href: '/reports/purchase-report', permission: ['Purchase Report'], icon: ChartNoAxesCombined },
  transfers: { label: 'Transfers', href: '/transfer/transfer-list', permission: ['transfer', 'view'], icon: Boxes },
  adjustments: { label: 'Stock adjustments', href: '/products/adjustment', permission: ['adjustment', 'view'], icon: Boxes },
  customers: { label: 'Customers', href: '/people/customer-list', permission: ['customer', 'view'], icon: Users },
};

const METRICS = [
  { key: 'salesCount', label: 'Sales records', icon: CircleDollarSign },
  { key: 'purchaseCount', label: 'Purchase records', icon: ClipboardList },
  { key: 'productCount', label: 'Products', icon: Package },
  { key: 'stockQuantity', label: 'Units in stock', icon: Boxes },
  { key: 'warehouseCount', label: 'Warehouses', icon: Warehouse },
  { key: 'expenseCount', label: 'Expense records', icon: CircleDollarSign },
];

export default function RoleDashboardPage({ user, dashboardData }) {
  const { can, canPath } = useAuth();
  const role = String(user?.role || 'STAFF').toUpperCase();
  const content = ROLE_CONTENT[role] || { title: 'My dashboard', description: 'Your permitted tools and company workflow at a glance.', focus: 'My workspace', shortcuts: ['sales', 'pos', 'products', 'warehouses', 'purchases', 'expenses'] };
  const metrics = dashboardData?.metrics || {};
  const tiles = METRICS.filter(({ key }) => Object.hasOwn(metrics, key));
  const shortcutKeys = content.shortcuts.includes('sales') && can('sales', 'view') ? [...content.shortcuts, 'salesList'] : content.shortcuts;
  const shortcuts = [...new Set(shortcutKeys)].map((key) => SHORTCUTS[key]).filter((item) => item && can(item.permission[0], item.permission[1] || 'view') && canPath(item.href));
  return <div className={styles.page}>
    <header className={styles.welcome}><div><span className={styles.eyebrow}>{role} WORKSPACE</span><h1>{content.title}</h1><p>{content.description}</p></div><span className={styles.userPill}><span className={styles.avatar}>{(user.name || user.email || 'U').slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>{role}</small></span></span></header>
    <AnnouncementList />
    <OnboardingChecklist />
    {tiles.length > 0 && <section className={styles.metrics} aria-label={`${role} dashboard summary`}>{tiles.map(({ key, label, icon }) => <StatCard key={key} label={label} value={NUMBER.format(Number(metrics[key] || 0))} icon={icon} className={styles.stat} />)}</section>}
    <Card title="Your shortcuts" description="Each link follows the permissions assigned to your role." actions={<span className={styles.accessBadge}>Personal workspace</span>}>
      {shortcuts.length ? <div className={styles.shortcutGrid}>{shortcuts.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={styles.shortcut}><span className={styles.shortcutIcon}><Icon size={20} /></span><strong>{item.label}</strong><ArrowUpRight className={styles.arrow} size={18} /></Link>; })}</div> : <EmptyState icon={Boxes} title="Your workspace is ready" description="No module permissions are assigned yet. Ask your company admin to enable the tools you need." />}
    </Card>
  </div>;
}
