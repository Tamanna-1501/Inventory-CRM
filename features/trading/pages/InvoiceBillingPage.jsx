'use client';

import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';
import { Card, PageHeader } from '@/components/ui';
import styles from './InvoiceBillingPage.module.css';

const PAGES = {
  home: { title: 'Invoice billing', description: 'Open transaction lists and print invoices.', links: [['Sales invoices', 'Review sales and open printable invoices.', '/trading/sales/sales-list'], ['Purchase invoices', 'Review purchases and print transaction details.', '/trading/purchase/manage-purchase']] },
  sale: { title: 'Sale invoice', description: 'Sales invoices are available from the sales list.', links: [['Open sales list', 'Choose a sale and open its invoice.', '/trading/sales/sales-list']] },
  saleList: { title: 'Sales list invoices', description: 'Choose a sale to view or print its invoice.', links: [['Open sales list', 'Browse sales and print invoices.', '/trading/sales/sales-list']] },
  purchase: { title: 'Purchase invoice', description: 'Purchase invoices are available from purchase management.', links: [['Manage purchases', 'Browse purchases and print invoice details.', '/trading/purchase/manage-purchase']] },
  purchaseList: { title: 'Purchase list invoices', description: 'Choose a purchase to view or print its invoice.', links: [['Manage purchases', 'Browse purchase records.', '/trading/purchase/manage-purchase']] },
  expense: { title: 'Expense invoice', description: 'Open expenses to review invoice records.', links: [['Expense list', 'Browse company expenses.', '/expense/expense-list']] },
  expenseList: { title: 'Expense list invoices', description: 'Open expense records to review invoice details.', links: [['Expense list', 'Browse company expenses.', '/expense/expense-list']] },
};

export default function InvoiceBillingPage({ kind = 'home' }) {
  const page = PAGES[kind];
  return <section className={styles.page}><PageHeader title={page.title} description={page.description} breadcrumbs={[{ label: 'Trading', href: '/trading' }, { label: 'Invoice billing' }, { label: page.title }]} /><div className={styles.grid}>{page.links.map(([title, description, href]) => <Link href={href} key={href} className={styles.link}><Card bodyClassName={styles.cardBody}><span className={styles.icon}><FileText size={22} /></span><span className={styles.copy}><strong>{title}</strong><span>{description}</span></span><ArrowRight size={19} /></Card></Link>)}</div></section>;
}
