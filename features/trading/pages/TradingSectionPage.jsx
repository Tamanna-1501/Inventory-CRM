'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardList, Plus, Undo2 } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import styles from './TradingSectionPage.module.css';

const ITEMS = {
  sales: { title: 'Sales', items: [['New sale', 'Create a sale and invoice.', '/trading/sales/new-sales', 'sales', 'add', Plus], ['Point of sale', 'Check out a customer sale.', '/trading/sales/pos-sales', 'pos', 'add', Plus], ['Sales list', 'Review invoices and payments.', '/trading/sales/sales-list', 'sales', 'view', ClipboardList], ['Sales returns', 'Manage customer returns.', '/trading/sales/sales-returns', 'sale_return', 'view', Undo2]] },
  purchases: { title: 'Purchases', items: [['Add purchase', 'Record supplier inventory.', '/trading/purchase/add-purchase', 'purchase', 'add', Plus], ['Manage purchases', 'Review supplier invoices and payments.', '/trading/purchase/manage-purchase', 'purchase', 'view', ClipboardList], ['Purchase returns', 'Manage supplier returns.', '/trading/purchase/purchase-returns', 'purchase_return', 'view', Undo2]] },
};
export default function TradingSectionPage({ kind = 'sales' }) {
  const { can } = useAuth(); const section = ITEMS[kind];
  return <section className={styles.page}><PageHeader title={section.title} description={`Manage ${kind === 'sales' ? 'customer sales and returns' : 'supplier purchases and returns'}.`} breadcrumbs={[{ label: 'Trading', href: '/trading' }, { label: section.title }]} /><div className={styles.grid}>{section.items.filter((item) => can(item[3], item[4])).map(([title, description, href, , , Icon]) => <Link key={href} href={href} className={styles.tile}><span className={styles.icon}><Icon size={22} /></span><span className={styles.copy}><strong>{title}</strong><span>{description}</span></span><ArrowRight size={19} /></Link>)}</div></section>;
}
