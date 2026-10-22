'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ActionMenu, Button, Card, ConfirmDialog, DataTable, FormField, Input, ListExportTools, Modal, NoticeDialog, PageHeader, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useToast } from '@/context/ToastContext';
import { useProductData } from '@/features/products/hooks/useProductData';
import { deleteProduct, getBrands, getCategories, getProducts, getUnits, saveProduct, updateProduct } from '@/features/products/services/productService';
import { parseImportFile } from '@/lib/peopleUtils';
import styles from './ProductListPage.module.css';

const promoOn = (product) => product.promotionalPrice != null && Number(product.promotionalPrice) > 0;

export default function ProductListPage() {
  const router = useRouter();
  const toast = useToast();
  const { can } = useAuth();
  const { formatCurrency: money } = usePreferences();
  const { data: products, loading, error, refresh } = useProductData(getProducts);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [lookups, setLookups] = useState({ categories: [], brands: [], units: [] });
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');
  const [updateNotice, setUpdateNotice] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const importRef = useRef(null);
  const rows = useMemo(() => products.filter((p) => `${p.name} ${p.sku} ${p.category?.name || ''} ${p.brand?.name || ''}`.toLowerCase().includes(query.toLowerCase())), [products, query]);

  async function openEdit(product) {
    setUpdateNotice(null);
    setSaveError('');
    setEditing(product);
    setForm({ name: product.name || '', sku: product.sku || '', price: product.price ?? '', costPrice: product.costPrice ?? '', promotionalPrice: promoOn(product) ? String(product.promotionalPrice) : '', batchNo: product.batchNo || '', categoryId: product.categoryId || product.category?.id || '', brandId: product.brandId || product.brand?.id || '', unitId: product.unitId || product.unit?.id || '' });
    try { const [categories, brands, units] = await Promise.all([getCategories(), getBrands(), getUnits()]); setLookups({ categories, brands, units }); }
    catch (e) { toast({ title: 'Lookup data unavailable', message: e.message, variant: 'danger' }); }
  }
  function change(key, value) { setSaveError(''); setUpdateNotice(null); setForm((old) => ({ ...old, [key]: value })); }
  async function save(event) {
    event.preventDefault();
    const promo = String(form.promotionalPrice).trim() ? Number(form.promotionalPrice) : null;
    if (promo !== null && (!Number.isFinite(promo) || promo <= 0 || promo >= Number(form.price))) { toast({ title: 'Check promotional price', message: 'It must be greater than 0 and lower than the selling price.', variant: 'danger' }); return; }
    setSaving(true);
    try {
      await updateProduct(editing.id, { name: form.name, sku: form.sku, price: Number(form.price), costPrice: Number(form.costPrice) || 0, promotionalPrice: promo, batchNo: form.batchNo.trim() || null, categoryId: Number(form.categoryId), brandId: form.brandId ? Number(form.brandId) : null, unitId: form.unitId ? Number(form.unitId) : null });
      setEditing(null); await refresh(); setSaveError(''); setUpdateNotice({ variant: 'success', message: 'Product updated successfully. Your changes have been saved.' });
    } catch (e) {
      const duplicateSku = /sku already exists/i.test(e.message || '');
      const message = duplicateSku ? 'This SKU already exists. Please enter a unique SKU and try again.' : e.message;
      setSaveError(message);
    }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!pendingDelete) return;
    setDeleting(true);
    try { await deleteProduct(pendingDelete.id); setPendingDelete(null); await refresh(); toast({ title: 'Product deleted', variant: 'success' }); }
    catch (e) { setPendingDelete(null); setNotice(e.message); }
    finally { setDeleting(false); }
  }
  async function importProducts(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setImportBusy(true);
    try {
      const fields = [{field:'name',label:'Product name'},{field:'sku',label:'SKU'},{field:'price',label:'Price',type:'number'},{field:'costPrice',label:'Cost price',type:'number'},{field:'promotionalPrice',label:'Promotional price',type:'number'},{field:'batchNo',label:'Batch number'},{field:'categoryId',label:'Category ID',type:'number'},{field:'brandId',label:'Brand ID',type:'number'},{field:'unitId',label:'Unit ID',type:'number'}];
      const parsed = await parseImportFile(file, fields); let imported = 0; let firstError = '';
      for (const row of parsed) {
        if (!row.name || !row.sku || !row.price || !row.categoryId) { firstError ||= 'Product rows need Product name, SKU, Price, and Category ID.'; continue; }
        try { await saveProduct({ ...row, price: Number(row.price), costPrice: Number(row.costPrice || 0), promotionalPrice: row.promotionalPrice || null, categoryId: Number(row.categoryId), brandId: row.brandId ? Number(row.brandId) : null, unitId: row.unitId ? Number(row.unitId) : null }); imported += 1; }
        catch (error) { firstError ||= error.message; }
      }
      if (imported) { await refresh(); toast({ title: `${imported} products imported`, variant: 'success' }); }
      if (firstError) toast({ title: 'Some CSV rows were skipped', message: firstError, variant: 'warning' });
      if (!parsed.length) toast({ title: 'CSV contains no records', variant: 'warning' });
    } catch (error) { toast({ title: 'Import failed', message: error.message, variant: 'danger' }); }
    finally { setImportBusy(false); }
  }
  const columns = [
    { key: 'id', label: 'ID' }, { key: 'name', label: 'Product' }, { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category', render: (_, p) => p.category?.parent?.name ? `${p.category.parent.name} / ${p.category.name}` : p.category?.name || '—' },
    { key: 'brand', label: 'Brand', render: (_, p) => p.brand?.name || '—' }, { key: 'unit', label: 'Unit', render: (_, p) => p.unit ? `${p.unit.name} (${p.unit.shortName})` : '—' },
    { key: 'stock', label: 'Stock', align: 'right', render: (_, p) => p.stocks?.reduce((sum, s) => sum + Number(s.quantity || 0), 0) || 0 },
    { key: 'price', label: 'Price', align: 'right', render: (_, p) => <span className={styles.price}>{promoOn(p) ? money(p.promotionalPrice) : money(p.price)}{promoOn(p) && <small>{money(p.price)}</small>}</span> },
  ];
  const exportColumns = columns.map((column) => ({ ...column, exportText: (product) => {
    if (column.key === 'category') return product.category?.parent?.name ? `${product.category.parent.name} / ${product.category.name}` : product.category?.name || '';
    if (column.key === 'brand') return product.brand?.name || '';
    if (column.key === 'unit') return product.unit ? `${product.unit.name} (${product.unit.shortName})` : '';
    if (column.key === 'stock') return product.stocks?.reduce((sum, stock) => sum + Number(stock.quantity || 0), 0) || 0;
    if (column.key === 'price') return money(promoOn(product) ? product.promotionalPrice : product.price);
    return product[column.key] ?? '';
  } }));
  return <section className={styles.page}>
    <PageHeader title="Products" description="Manage your product catalogue, prices and stock." breadcrumbs={[{ label: 'Products', href: '/products' }, { label: 'Product list' }]} actions={can('prod', 'add') && <Button className={styles.addProduct} leadingIcon={<Plus size={18} />} onClick={() => router.push('/products/add-product')}>Add product</Button>} />
    <Card className={styles.card}>
      <div className={styles.toolbar}><label className={styles.search}><Search size={18} aria-hidden="true" /><Input aria-label="Search products" placeholder="Search name, SKU, category or brand" value={query} onChange={(e) => setQuery(e.target.value)} /></label><div className={styles.toolbarActions}>{can('prod', 'add')&&<><Button variant="success" size="sm" leadingIcon={<FileUp size={16}/>} disabled={importBusy} onClick={()=>importRef.current?.click()}>Import CSV</Button><input ref={importRef} className={styles.hiddenInput} type="file" accept=".csv,text/csv" onChange={importProducts}/></>}<ListExportTools title="Products" fileName="products" columns={exportColumns} rows={rows}/></div><div className={styles.countGroup}>{updateNotice && <p className={`${styles.updateNotice} ${updateNotice.variant === 'success' ? styles.successNotice : styles.errorNotice}`} role={updateNotice.variant === 'success' ? 'status' : 'alert'}>{updateNotice.message}</p>}<span className={styles.count}>{rows.length} products</span></div></div>
      {error ? <p className={styles.error} role="alert">{error} <Button variant="secondary" onClick={refresh}>Retry</Button></p> : loading ? <p className={styles.loading}>Loading products…</p> : <DataTable className={styles.table} caption="Product list" columns={columns} rows={rows} emptyState="No matching products. Add a product to get started." renderActions={(p) => <ActionMenu label={`Details for ${p.name}`} triggerText="Details" items={[
        ...(can('prod', 'edit') ? [{ label: 'Edit', icon: <Pencil size={16} />, onSelect: () => openEdit(p) }] : []),
        ...(can('prod', 'delete') ? [{ label: 'Delete', icon: <Trash2 size={16} />, danger: true, onSelect: () => setPendingDelete(p) }] : []),
      ]} />} />}
    </Card>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`Edit product${editing ? ` #${editing.id}` : ''}`} size="lg" footer={<div className={styles.modalActions}><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="edit-product-form" loading={saving}>Save changes</Button></div>}>
      <form id="edit-product-form" className={styles.form} onSubmit={save}>
        {saveError && <p className={styles.formError} role="alert">{saveError}</p>}
        <FormField label="Product name" required><Input value={form.name || ''} onChange={(e) => change('name', e.target.value)} required /></FormField>
        <FormField label="SKU / code" required><Input value={form.sku || ''} onChange={(e) => change('sku', e.target.value)} required /></FormField>
        <FormField label="Selling price" required><Input type="number" min="0" step="0.01" value={form.price ?? ''} onChange={(e) => change('price', e.target.value)} required /></FormField>
        <FormField label="Cost price"><Input type="number" min="0" step="0.01" value={form.costPrice ?? ''} onChange={(e) => change('costPrice', e.target.value)} /></FormField>
        <FormField label="Promotional price"><Input type="number" min="0" step="0.01" value={form.promotionalPrice || ''} onChange={(e) => change('promotionalPrice', e.target.value)} /></FormField>
        <FormField label="Batch number"><Input maxLength={30} value={form.batchNo || ''} onChange={(e) => change('batchNo', e.target.value)} /></FormField>
        <FormField label="Category" required><Select value={form.categoryId || ''} onChange={(e) => change('categoryId', e.target.value)} required><option value="">Select category</option>{lookups.categories.map((c) => <option key={c.id} value={c.id}>{c.parent?.name ? `${c.parent.name} / ` : ''}{c.name}</option>)}</Select></FormField>
        <FormField label="Brand"><Select value={form.brandId || ''} onChange={(e) => change('brandId', e.target.value)}><option value="">No brand</option>{lookups.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></FormField>
        <FormField label="Unit"><Select value={form.unitId || ''} onChange={(e) => change('unitId', e.target.value)}><option value="">No unit</option>{lookups.units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>)}</Select></FormField>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={remove} loading={deleting} title="Delete product?" description={`Delete “${pendingDelete?.name || ''}”? This cannot be undone.`} confirmLabel="Delete product" />
    <NoticeDialog open={Boolean(notice)} onClose={() => setNotice('')} title="Product could not be deleted" message={notice} variant="warning" />
  </section>;
}
