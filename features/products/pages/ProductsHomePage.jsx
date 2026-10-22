'use client';

import Link from 'next/link';
import { ArrowRight, Barcode, Boxes, ClipboardList, Layers3, PackagePlus, Tags, Ruler, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import styles from './ProductsHomePage.module.css';

const links = [
  { title: 'Product list', description: 'Browse products, stock, prices and details.', href: '/products/product-list', permission: ['prod', 'view'], icon: Boxes },
  { title: 'Add product', description: 'Create a product and set opening stock.', href: '/products/add-product', permission: ['prod', 'add'], icon: PackagePlus },
  { title: 'Categories', description: 'Group your products by category.', href: '/products/category', permission: ['category', 'view'], icon: Layers3 },
  { title: 'Brands', description: 'Maintain product brands.', href: '/products/brand', permission: ['brand', 'view'], icon: Tags },
  { title: 'Units', description: 'Set product units and short names.', href: '/products/unit-value', permission: ['unit', 'view'], icon: Ruler },
  { title: 'Generate barcodes', description: 'Prepare barcode labels for printing.', href: '/products/generate-barcode', permission: ['barcode', 'view'], icon: Barcode },
  { title: 'Adjustments', description: 'Review stock adjustment history.', href: '/products/adjustment', permission: ['adjustment', 'view'], icon: SlidersHorizontal },
  { title: 'Add adjustment', description: 'Record a stock addition or deduction.', href: '/products/add-adjustment', permission: ['adjustment', 'add'], icon: ClipboardList },
];

export default function ProductsHomePage() {
  const { can } = useAuth();
  const visible = links.filter((item) => can(item.permission[0], item.permission[1]));
  return <section className={styles.page}><PageHeader title="Products" description="Manage the catalogue and inventory operations for your company." /><div className={styles.grid}>{visible.map(({ title, description, href, icon: Icon }) => <Link key={href} href={href} className={styles.tile}><span className={styles.icon}><Icon size={22} /></span><span className={styles.copy}><strong>{title}</strong><span>{description}</span></span><ArrowRight size={20} className={styles.arrow} /></Link>)}</div></section>;
}
