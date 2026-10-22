'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button, Card, DataTable, ListExportTools, PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useProductData } from '@/features/products/hooks/useProductData';
import { getAdjustments } from '@/features/products/services/productService';
import styles from './StockAdjustmentPage.module.css';

export default function StockAdjustmentPage() {
  const router = useRouter(); const { can } = useAuth();
  const { data, loading, error, refresh } = useProductData(getAdjustments);
  const rows = data.map((entry) => ({ ...entry, productNames: entry.items?.map((item) => item.product?.name).filter(Boolean).join(', ') || '—', types: [...new Set(entry.items?.map((item) => item.type) || [])].join(', ') || '—', quantity: entry.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0 }));
  const columns = [{ key: 'id', label: 'Reference' }, { key: 'warehouse', label: 'Warehouse', render: (_, row) => row.warehouse?.name || '—', exportText: (row) => row.warehouse?.name || '' }, { key: 'remarks', label: 'Remarks', render: (value) => value || '—' }, { key: 'productNames', label: 'Products' }, { key: 'types', label: 'Adjustment type' }, { key: 'quantity', label: 'Total quantity', align: 'right' }, { key: 'createdAt', label: 'Date', render: (value) => value ? new Date(value).toLocaleDateString() : '—', exportText: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '' }];
  return <section className={styles.page}><PageHeader title="Stock adjustments" description="Review recorded stock additions and deductions." breadcrumbs={[{ label: 'Products', href: '/products' }, { label: 'Adjustments' }]} actions={can('adjustment', 'add') && <Button leadingIcon={<Plus size={18} />} onClick={() => router.push('/products/add-adjustment')}>Add adjustment</Button>} /><Card><div className={styles.exportTools}><ListExportTools title="Stock adjustments" fileName="stock-adjustments" columns={columns} rows={rows}/></div>{error ? <div className={styles.state} role="alert">{error} <Button variant="secondary" onClick={refresh}>Retry</Button></div> : loading ? <div className={styles.state}>Loading adjustments…</div> : <DataTable caption="Stock adjustments" columns={columns} rows={rows} emptyState="No stock adjustments have been recorded." />}</Card></section>;
}
