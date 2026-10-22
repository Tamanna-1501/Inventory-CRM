'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button, Card, FormField, Input, PageHeader, Select, Textarea } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useTradingData } from '@/features/trading/hooks/useTradingData';
import { createSale } from '@/features/trading/services/tradingService';
import { getFinalPrice, hasPromo } from '@/lib/price';
import { stockElsewhere, stockIn } from '@/lib/stock';
import styles from './SaleComposerPage.module.css';

const blank = { productId: '', batchNo: '', quantity: '', price: '', discount: '0' };

export default function SaleComposerPage({ pos = false }) {
  const router = useRouter(); const toast = useToast();
  const { formatCurrency: money } = usePreferences();
  const { customers, billers, warehouses, products, branding, loading, error: lookupError } = useTradingData();
  const [customerId, setCustomerId] = useState(''); const [warehouseId, setWarehouseId] = useState(''); const [billerId, setBillerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); const [shipping, setShipping] = useState('0'); const [paidAmount, setPaidAmount] = useState('0');
  const [status, setStatus] = useState('pending'); const [note, setNote] = useState(''); const [staffRemark, setStaffRemark] = useState('');
  const [items, setItems] = useState([]); const [search, setSearch] = useState(''); const [saving, setSaving] = useState(false);
  const [posNotice, setPosNotice] = useState(''); const [posError, setPosError] = useState('');
  const taxPercent = Number(branding?.taxPercent || 0);
  const filteredProducts = useMemo(() => products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => warehouseId ? Number(stockIn(b, warehouseId) > 0) - Number(stockIn(a, warehouseId) > 0) : 0), [products, search, warehouseId]);
  const updateItem = (index, key, value) => setItems((current) => current.map((item, i) => {
    if (i !== index) return item;
    const next = { ...item, [key]: value };
    if (key === 'productId') { const product = products.find((p) => p.id === Number(value)); next.price = product ? String(getFinalPrice(product)) : ''; next.quantity = product ? '1' : ''; next.batchNo = product?.batchNo || ''; }
    if (key === 'quantity') { const product = products.find((p) => p.id === Number(item.productId)); const available = product ? stockIn(product, warehouseId) : null; if (available !== null && Number(value) > available) next.quantity = String(available); }
    return next;
  }));
  function addProduct(product) {
    setPosError('');
    if (!warehouseId) { setPosNotice('Choose a warehouse first'); return; }
    setPosNotice('');
    const available = stockIn(product, warehouseId);
    if (available !== null && available < 1) { const elsewhere = stockElsewhere(product, warehouseId); setPosNotice(`Product is out of stock here. ${product.name}${elsewhere ? ` is available in ${elsewhere}` : ''}.`); return; }
    const found = items.findIndex((item) => Number(item.productId) === product.id);
    if (found >= 0) updateItem(found, 'quantity', String(Number(items[found].quantity) + 1));
    else setItems((current) => [...current, { ...blank, productId: String(product.id), quantity: '1', price: String(getFinalPrice(product)), batchNo: product.batchNo || '' }]);
  }
  const lineTotal = (item) => { const base = Number(item.price || 0) * Number(item.quantity || 0); return base + Math.round((base * taxPercent / 100 + Number.EPSILON) * 100) / 100 - Number(item.discount || 0); };
  const total = items.reduce((sum, item) => sum + lineTotal(item), 0) + Number(shipping || 0);
  async function submit(event) {
    event.preventDefault();
    if (pos && (!customerId || !billerId || !warehouseId || !items.length)) { setPosNotice('Choose a customer, biller, warehouse and at least one product.'); return; }
    setSaving(true);
    try {
      const body = pos ? { customerId, billerId, warehouseId, paymentMethod: 'cash', payFull: true, shippingCharge: Number(shipping), items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity), price: Number(item.price), discount: Number(item.discount || 0) })) } : { customerId, warehouseId, billerId: billerId || null, paymentMethod, shippingCharge: Number(shipping), paidAmount: Number(paidAmount || 0), status, note, staffRemark, items: items.map((item) => ({ productId: item.productId, batchNo: item.batchNo, quantity: Number(item.quantity), price: Number(item.price), discount: Number(item.discount || 0) })) };
      await createSale(body);
      sessionStorage.setItem('sale-created-notice', '1');
      router.push('/trading/sales/sales-list');
    } catch (err) { if (pos) setPosError(err.message || 'Could not save sale'); else toast({ title: 'Could not save sale', message: err.message, variant: 'danger' }); }
    finally { setSaving(false); }
  }
  const pageTitle = pos ? 'Point of sale' : 'New sale';
  return <section className={`${styles.page} ${pos ? styles.posPage : ''}`}><PageHeader title={pageTitle} description={pos ? 'Select products, build the cart, and complete checkout.' : 'Create a sale with customer, warehouse, and payment details.'} breadcrumbs={[{ label: 'Trading', href: '/trading' }, { label: 'Sales', href: '/trading/sales' }, { label: pageTitle }]} />
    {lookupError && <p className={styles.error} role="alert">{lookupError}</p>}
    <form onSubmit={submit} className={styles.form}>
      {pos && <Card title="Product catalogue"><FormField label="Search products"><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or SKU" /></FormField><div className={styles.productGrid}>{filteredProducts.map((product) => { const stock = stockIn(product, warehouseId); return <button type="button" className={styles.productTile} key={product.id} onClick={() => addProduct(product)} disabled={loading || (stock !== null && stock < 1)}><strong>{product.name}</strong><span>{product.sku}</span><b>{money(getFinalPrice(product))}{hasPromo(product) && <s>{money(product.price)}</s>}</b><small>{warehouseId ? stock === null ? 'Stock not tracked' : `Stock: ${stock}` : 'Choose a warehouse'}</small></button>; })}</div></Card>}
      <div className={styles.content}>
        {pos && posNotice && <p className={styles.posNotice} role="status">{posNotice}</p>}
        {pos && posError && <p className={styles.posError} role="alert">{posError}</p>}
        <Card title="Sale details"><div className={styles.grid}><FormField label="Customer" required><Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required><option value="">Select customer</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField><FormField label="Warehouse" required><Select value={warehouseId} onChange={(e) => { setWarehouseId(e.target.value); setItems([]); setPosNotice(''); setPosError(''); }} required><option value="">Select warehouse</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField><FormField label="Biller" required={pos}><Select value={billerId} onChange={(e) => setBillerId(e.target.value)} required={pos}><option value="">Select biller</option>{billers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></FormField>{!pos && <FormField label="Payment method"><Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="bank_transfer">Bank transfer</option></Select></FormField>}</div></Card>
        {!pos && <Card title="Products"><SaleItems items={items} products={products} warehouseId={warehouseId} taxPercent={taxPercent} money={money} updateItem={updateItem} removeItem={(index) => setItems((current) => current.filter((_, i) => i !== index))} addRow={() => setItems((current) => [...current, { ...blank }])} />{!warehouseId && <p className={styles.hint}>Choose a warehouse first to see available stock.</p>}</Card>}
        <Card title={pos ? 'Cart' : 'Payment and notes'}>{pos ? <SaleItems items={items} products={products} warehouseId={warehouseId} taxPercent={taxPercent} money={money} updateItem={updateItem} removeItem={(index) => setItems((current) => current.filter((_, i) => i !== index))} /> : <div className={styles.grid}><FormField label="Shipping charge"><Input type="number" min="0" step="0.01" value={shipping} onChange={(e) => setShipping(e.target.value)} /></FormField><FormField label="Amount paid"><Input type="number" min="0" step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} /></FormField><FormField label="Sale status"><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></Select></FormField><FormField label="Sale note"><Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} /></FormField><FormField label="Staff remark"><Textarea rows={3} value={staffRemark} onChange={(e) => setStaffRemark(e.target.value)} /></FormField></div>}{pos && <div className={styles.grid}><FormField label="Shipping charge"><Input type="number" min="0" step="0.01" value={shipping} onChange={(e) => setShipping(e.target.value)} /></FormField></div>}<div className={styles.total}><span>Total incl. tax</span><strong>{money(total)}</strong></div><div className={styles.submit}><Button type="submit" loading={saving} leadingIcon={<ShoppingCart size={18} />}>{pos ? 'Complete sale' : 'Save sale'}</Button></div></Card>
      </div>
    </form>
  </section>;
}

function SaleItems({ items, products, warehouseId, taxPercent, money, updateItem, removeItem, addRow }) {
  return <div className={styles.items}><div className={styles.itemsHead}><strong>Product items</strong>{addRow && <Button type="button" variant="secondary" size="sm" leadingIcon={<Plus size={16} />} onClick={addRow}>Add row</Button>}</div>{items.length ? items.map((item, index) => <div className={styles.itemRow} key={index}><FormField label="Product"><Select value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} required><option value="">Select product</option>{products.map((product) => { const stock = stockIn(product, warehouseId); return <option key={product.id} value={product.id} disabled={stock !== null && stock <= 0}>{product.name} — {money(getFinalPrice(product))}{stock !== null ? ` (Stock: ${stock})` : ''}</option>; })}</Select></FormField><FormField label="Batch"><Input value={item.batchNo} onChange={(e) => updateItem(index, 'batchNo', e.target.value)} /></FormField><FormField label="Quantity"><Input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} required /></FormField><FormField label="Price"><Input type="number" min="0" step="0.01" value={item.price} readOnly required /></FormField><FormField label="Discount"><Input type="number" min="0" step="0.01" value={item.discount} onChange={(e) => updateItem(index, 'discount', e.target.value)} /></FormField><Button type="button" variant="danger" size="sm" aria-label={`Remove item ${index + 1}`} leadingIcon={<Trash2 size={16} />} onClick={() => removeItem(index)}>Remove</Button></div>) : <p className={styles.hint}>No products in the cart yet. Add products above.</p>}</div>;
}
