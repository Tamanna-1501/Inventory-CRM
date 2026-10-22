'use client';

import Link from 'next/link';
import { ArrowUpRight, BadgeDollarSign, ClipboardList, CreditCard, FileText, PackageCheck, ShoppingCart, Undo2 } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import styles from './TradingHomePage.module.css';

const links = [
  { title: 'New sale', description: 'Create a customer sale and invoice.', href: '/trading/sales/new-sales', permission: ['sales', 'add'], icon: ShoppingCart },
  { title: 'Point of sale', description: 'Build a cart and check out at the counter.', href: '/trading/sales/pos-sales', permission: ['pos', 'add'], icon: BadgeDollarSign },
  { title: 'Sales list', description: 'Review sales, payments, and invoices.', href: '/trading/sales/sales-list', permission: ['sales', 'view'], icon: ClipboardList },
  { title: 'Sales returns', description: 'Record and manage customer returns.', href: '/trading/sales/sales-returns', permission: ['sale_return', 'view'], icon: Undo2 },
  { title: 'Add purchase', description: 'Record supplier purchases and deliveries.', href: '/trading/purchase/add-purchase', permission: ['purchase', 'add'], icon: PackageCheck },
  { title: 'Manage purchases', description: 'Review purchases, supplier payments, and invoices.', href: '/trading/purchase/manage-purchase', permission: ['purchase', 'view'], icon: CreditCard },
  { title: 'Purchase returns', description: 'Record and manage supplier returns.', href: '/trading/purchase/purchase-returns', permission: ['purchase_return', 'view'], icon: Undo2 },
  { title: 'Invoice billing', description: 'Open available invoice and billing screens.', href: '/trading/invoice-billing', permission: ['sale_invoice', 'view'], icon: FileText },
];

export default function TradingHomePage() {
  const { can } = useAuth();
  return <section className={styles.page}><PageHeader title="Trading" description="Manage sales, purchases, returns, and transaction invoices." /><div className={styles.grid}>{links.filter((item) => item.title === 'Invoice billing' ? can('sale_invoice', 'view') || can('purchase_invoice', 'view') : can(item.permission[0], item.permission[1])).map(({ title, description, href, icon: Icon }) => <Link className={styles.tile} href={href} key={href}><span className={styles.icon}><Icon size={22} /></span><span className={styles.copy}><strong>{title}</strong><span>{description}</span></span><ArrowUpRight size={19} className={styles.arrow} /></Link>)}</div></section>;
}
