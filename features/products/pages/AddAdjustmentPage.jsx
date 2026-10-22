'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Card, FormField, Input, PageHeader, Select, Textarea } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { getProducts, getWarehouses, saveAdjustment } from '@/features/products/services/productService';
import styles from './AddAdjustmentPage.module.css';

export default function AddAdjustmentPage() {
  const router = useRouter(); const toast = useToast();
  const [warehouses, setWarehouses] = useState([]); const [products, setProducts] = useState([]);
  const [warehouseId, setWarehouseId] = useState(''); const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: '', type: 'addition' }]); const [saving, setSaving] = useState(false);
  useEffect(() => { Promise.all([getWarehouses(), getProducts()]).then(([w, p]) => { setWarehouses(w); setProducts(p); }).catch((e) => toast({ title: 'Could not load adjustment options', message: e.message, variant: 'danger' })); }, [toast]);
  function setItem(index, key, value) { setItems((current) => current.map((item, i) => i === index ? { ...item, [key]: value } : item)); }
  async function submit(event) {
    event.preventDefault(); setSaving(true);
    try { await saveAdjustment({ warehouseId, remarks, items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity), type: item.type })) }); toast({ title: 'Adjustment created', variant: 'success' }); router.push('/products/adjustment'); }
    catch (e) { toast({ title: 'Could not create adjustment', message: e.message, variant: 'danger' }); }
    finally { setSaving(false); }
  }
  return <section className={styles.page}><PageHeader title="Add stock adjustment" description="Record additions or deductions for a warehouse." breadcrumbs={[{ label: 'Products', href: '/products' }, { label: 'Adjustments', href: '/products/adjustment' }, { label: 'Add adjustment' }]} />
    <form onSubmit={submit} className={styles.form}><Card title="Adjustment details"><div className={styles.grid}><FormField label="Warehouse" required><Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required><option value="">Select warehouse</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField><FormField label="Remarks"><Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} /></FormField></div></Card>
      <Card title="Products" description="Enter a positive quantity and choose whether to add or subtract it."><div className={styles.items}>{items.map((item, index) => <div className={styles.item} key={index}><FormField label={`Product ${index + 1}`} required><Select value={item.productId} onChange={(e) => setItem(index, 'productId', e.target.value)} required><option value="">Select product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</Select></FormField><FormField label="Quantity" required><Input type="number" min="1" step="1" value={item.quantity} onChange={(e) => setItem(index, 'quantity', e.target.value)} required /></FormField><FormField label="Type"><Select value={item.type} onChange={(e) => setItem(index, 'type', e.target.value)}><option value="addition">Addition</option><option value="subtraction">Subtraction</option></Select></FormField><Button type="button" variant="danger" aria-label={`Remove product row ${index + 1}`} leadingIcon={<Trash2 size={18} />} disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>Remove</Button></div>)}</div><Button type="button" variant="secondary" leadingIcon={<Plus size={18} />} onClick={() => setItems((old) => [...old, { productId: '', quantity: '', type: 'addition' }])}>Add product row</Button></Card>
      <div className={styles.footer}><Button variant="secondary" onClick={() => router.back()}>Cancel</Button><Button type="submit" loading={saving}>Save adjustment</Button></div>
    </form></section>;
}
