'use client';

import { Package } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './RecentProducts.module.css';

export default function RecentProducts({ products = [] }) {
  const { formatCurrency } = usePreferences();
  return (
    <Card title="Recently added products" description="Latest items in your company catalog." className={styles.dashboardCard}>
      {products.length ? (
        <ul className={styles.list}>
          {products.slice(0, 5).map((product) => (
            <li className={styles.product} key={product.id}>
              <span className={styles.icon}><Package size={18} aria-hidden="true" /></span>
              <span className={styles.name}><strong>{product.name}</strong><span>{product.sku || 'No SKU'}</span></span>
              <strong className={styles.price}>{formatCurrency(Number(product.price || 0))}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="No products yet" description="Products added to your catalog will appear here." />
      )}
    </Card>
  );
}
