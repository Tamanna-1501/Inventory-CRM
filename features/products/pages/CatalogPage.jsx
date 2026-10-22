'use client';

import { PageHeader } from '@/components/ui';
import CatalogManager from '@/features/products/components/CatalogManager';
import styles from './CatalogPage.module.css';

const TITLES = { category: 'Categories', brand: 'Brands', unit: 'Units' };
export default function CatalogPage({ kind }) {
  return <section className={styles.page}><PageHeader title={TITLES[kind]} description={`Manage product ${kind === 'unit' ? 'units' : `${kind}s`} for this company.`} breadcrumbs={[{ label: 'Products', href: '/products' }, { label: TITLES[kind] }]} /><CatalogManager kind={kind} /></section>;
}
