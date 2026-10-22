'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, PackagePlus } from 'lucide-react';
import { Button, Card, Checkbox, FormField, Input, PageHeader, Select } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { getBrands, getCategories, getUnits, getWarehouses, saveProduct } from '@/features/products/services/productService';
import styles from './AddProductPage.module.css';

export default function AddProductPage() {
  const router = useRouter(); const toast = useToast();
  const [lookups, setLookups] = useState({ categories: [], brands: [], units: [], warehouses: [] });
  const [loadingLookups, setLoadingLookups] = useState(true); const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', productType: 'Standard', price: '', costPrice: '', categoryId: '', brandId: '', unitId: '', warehouseId: '', openingStock: '0', productTax: '0', taxMethod: 'Exclusive', discount: '0', stockAlert: '10', promotionalPrice: '', batchNo: '', isFeatured: false, differentPrice: false, hasExpiry: false, promotionalSale: false, multiVariant: false, hasImei: false });
  useEffect(() => { Promise.all([getCategories(), getBrands(), getUnits(), getWarehouses()]).then(([categories, brands, units, warehouses]) => setLookups({ categories, brands, units, warehouses })).catch((e) => toast({ title: 'Could not load product options', message: e.message, variant: 'danger' })).finally(() => setLoadingLookups(false)); }, [toast]);
  function change(key, value) { setForm((old) => ({ ...old, [key]: value })); }
  async function submit(event) {
    event.preventDefault();
    let promo = null;
    if (form.promotionalSale && form.promotionalPrice !== '') { promo = Number(form.promotionalPrice); if (!Number.isFinite(promo) || promo <= 0) { toast({ title: 'Invalid promotional price', message: 'Promotional price must be greater than 0.', variant: 'danger' }); return; } if (promo >= Number(form.price)) { toast({ title: 'Invalid promotional price', message: 'Promotional price must be lower than the selling price.', variant: 'danger' }); return; } }
    setSaving(true);
    try { await saveProduct({ name: form.name, sku: form.sku || form.barcode, price: Number(form.price), costPrice: Number(form.costPrice) || 0, categoryId: Number(form.categoryId), brandId: form.brandId ? Number(form.brandId) : null, unitId: form.unitId ? Number(form.unitId) : null, warehouseId: form.warehouseId ? Number(form.warehouseId) : null, openingStock: Number(form.openingStock) || 0, promotionalPrice: promo, batchNo: form.batchNo.trim() || null }); toast({ title: 'Product created', variant: 'success' }); router.push('/products/product-list'); }
    catch (e) { toast({ title: 'Could not add product', message: e.message, variant: 'danger' }); }
    finally { setSaving(false); }
  }
  const productOptions = lookups.categories.filter((c) => !c.parentId);
  return <section className={styles.page}><PageHeader title="Add product" description="Enter product, pricing and opening stock details." breadcrumbs={[{ label: 'Products', href: '/products' }, { label: 'Add product' }]} />
    <form className={styles.form} onSubmit={submit}>
      <Card title="Product details" description="Name, identification and catalogue classification."><div className={styles.grid}>
        <FormField label="Product name" required><Input value={form.name} onChange={(e) => change('name', e.target.value)} placeholder="e.g. HP EliteBook" required /></FormField>
        <FormField label="Product type"><Select value={form.productType} onChange={(e) => change('productType', e.target.value)}><option>Standard</option><option>Variable</option><option>Service</option></Select></FormField>
        <FormField label="Category" required><Select value={form.categoryId} onChange={(e) => change('categoryId', e.target.value)} required disabled={loadingLookups}><option value="">Select category</option>{productOptions.map((parent) => <optgroup key={parent.id} label={parent.name}><option value={parent.id}>{parent.name} (Main)</option>{lookups.categories.filter((c) => c.parentId === parent.id).map((child) => <option key={child.id} value={child.id}>{parent.name} / {child.name}</option>)}</optgroup>)}</Select></FormField>
        <FormField label="Product code / SKU" required><Input value={form.sku} onChange={(e) => change('sku', e.target.value)} required /></FormField>
        <FormField label="Brand"><Select value={form.brandId} onChange={(e) => change('brandId', e.target.value)}><option value="">Select brand</option>{lookups.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></FormField>
        <FormField label="Barcode"><Input value={form.barcode} onChange={(e) => change('barcode', e.target.value)} /></FormField>
        <FormField label="Product unit"><Select value={form.unitId} onChange={(e) => change('unitId', e.target.value)}><option value="">Select unit</option>{lookups.units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>)}</Select></FormField>
        <FormField label="Batch number"><Input maxLength={30} value={form.batchNo} onChange={(e) => change('batchNo', e.target.value)} /></FormField>
        <FormField label="Product image"><label className={styles.upload}><ImagePlus size={20} /><span>{imagePreview ? 'Image selected' : 'Choose an image'}</span><Input className={styles.file} type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImagePreview(String(reader.result)); reader.readAsDataURL(file); }} /></label>{imagePreview && <img className={styles.preview} src={imagePreview} alt="Product preview" />}</FormField>
      </div></Card>
      <Card title="Pricing and stock"><div className={styles.grid}>
        <FormField label="Selling price" required><Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => change('price', e.target.value)} required /></FormField>
        <FormField label="Cost price"><Input type="number" min="0" step="0.01" value={form.costPrice} onChange={(e) => change('costPrice', e.target.value)} /></FormField>
        <FormField label="Warehouse"><Select value={form.warehouseId} onChange={(e) => change('warehouseId', e.target.value)}><option value="">Select warehouse</option>{lookups.warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField>
        <FormField label="Opening stock"><Input type="number" min="0" step="1" value={form.openingStock} onChange={(e) => change('openingStock', e.target.value)} /></FormField>
        <FormField label="Promotional price"><Input type="number" min="0" step="0.01" value={form.promotionalPrice} onChange={(e) => change('promotionalPrice', e.target.value)} disabled={!form.promotionalSale} /></FormField>
        <FormField label="Stock alert"><Input type="number" min="0" value={form.stockAlert} onChange={(e) => change('stockAlert', e.target.value)} /></FormField>
      </div><div className={styles.checks}>{[['promotionalSale', 'Promotional sale'], ['isFeatured', 'Featured product'], ['differentPrice', 'Different price'], ['hasExpiry', 'Has expiry'], ['multiVariant', 'Multiple variants'], ['hasImei', 'IMEI / serial tracking']].map(([key, label]) => <Checkbox key={key} label={label} checked={form[key]} onChange={(e) => change(key, e.target.checked)} />)}</div></Card>
      <div className={styles.footer}><Button className={styles.footerButton} variant="secondary" onClick={() => router.back()}>Cancel</Button><Button className={styles.footerButton} type="submit" loading={saving} leadingIcon={<PackagePlus size={18} />}>Save product</Button></div>
    </form>
  </section>;
}
