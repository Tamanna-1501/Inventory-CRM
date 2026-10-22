'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Printer, RefreshCw, Trash2 } from 'lucide-react';
import { Button, FormField, Input, PageHeader, Select } from '@/components/ui';
import { useProductData } from '@/features/products/hooks/useProductData';
import { getProducts } from '@/features/products/services/productService';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './GenerateBarcodePage.module.css';

const PAPER = [{ value: 'a4', label: 'A4 sheet' }, { value: 'single', label: 'Single 50 × 30 mm label' }];
const STORAGE_KEY = 'inventual-product-barcode-selection-v1';
const hasPromo = (product) => product.promotionalPrice != null && product.promotionalPrice !== '' && Number(product.promotionalPrice) > 0;

function BarcodeSvg({ sku }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !sku) return;
    const formats = /^\d{13}$/.test(sku) ? ['EAN13', 'CODE128'] : ['CODE128'];
    for (const format of formats) {
      try { JsBarcode(ref.current, sku, { format, displayValue: false, height: 42, margin: 4, width: 1.6 }); return; }
      catch { ref.current.replaceChildren(); }
    }
  }, [sku]);
  return <svg ref={ref} className={styles.barcode} aria-label={`Barcode for ${sku}`} />;
}

function BarcodeLabel({ row, options }) {
  const { formatCurrency: money } = usePreferences();
  const promo = hasPromo(row);
  return <article className={styles.label}>
    {options.name && <strong className={styles.labelName}>{row.name}</strong>}
    <BarcodeSvg sku={String(row.sku || '').trim()} />
    {options.code && <span className={styles.code}>{row.sku}</span>}
    {options.price && options.promo && promo && <s className={styles.oldPrice}>{money(row.price)}</s>}
    {options.promo && promo && <span className={styles.labelPrice}>{money(row.promotionalPrice)}</span>}
    {options.price && !(options.promo && promo) && <span className={styles.labelPrice}>{money(row.price)}</span>}
  </article>;
}

export default function GenerateBarcodePage() {
  const { data: products, loading, error, refresh } = useProductData(getProducts);
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [paper, setPaper] = useState('a4');
  const [options, setOptions] = useState({ name: false, code: true, price: true, promo: false });
  const [printRoot, setPrintRoot] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [restored, setRestored] = useState(false);
  const inputRef = useRef(null);
  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.sku}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8), [products, query]);
  const totalLabels = rows.reduce((sum, row) => sum + row.quantity, 0);

  useEffect(() => {
    const node = document.createElement('div');
    node.className = styles.printRoot;
    document.body.appendChild(node);
    setPrintRoot(node);
    return () => node.remove();
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && Array.isArray(saved.rows)) {
        setRows(saved.rows.filter((row) => row && row.id != null).map((row) => ({
          id: row.id,
          name: String(row.name || ''),
          sku: String(row.sku || ''),
          price: row.price,
          promotionalPrice: row.promotionalPrice,
          quantity: Math.max(1, Math.min(500, Number(row.quantity) || 1)),
          batch: String(row.batch || ''),
        })));
      }
      if (saved?.options && typeof saved.options === 'object') setOptions((current) => ({ ...current, ...saved.options }));
      if (PAPER.some((item) => item.value === saved?.paper)) setPaper(saved.paper);
    } catch {
      // Browser storage unavailable ho to barcode page phir bhi kaam karega.
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        rows: rows.map(({ id, name, sku, price, promotionalPrice, quantity, batch }) => ({ id, name, sku, price, promotionalPrice, quantity, batch })),
        options,
        paper,
      }));
    } catch {
      // Storage full ho to current page state par koi asar nahi hona chahiye.
    }
  }, [restored, rows, options, paper]);

  useEffect(() => {
    if (loading || error || !restored) return;
    const latest = new Map(products.map((product) => [product.id, product]));
    setRows((current) => current.flatMap((row) => {
      const product = latest.get(row.id);
      return product ? [{ ...product, quantity: row.quantity, batch: row.batch }] : [];
    }));
  }, [products, loading, error, restored]);

  function addProduct(product) {
    setRows((current) => current.some((row) => row.id === product.id)
      ? current.map((row) => row.id === product.id ? { ...row, quantity: Math.min(500, row.quantity + 1) } : row)
      : [...current, { ...product, quantity: 1, batch: product.batchNo || '' }]);
    setQuery('');
    inputRef.current?.focus();
  }

  function updateRow(id, key, value) {
    setRows((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));
  }

  function onSearchKeyDown(event) {
    if (event.key === 'ArrowDown') { event.preventDefault(); setHighlight((value) => Math.min(value + 1, Math.max(filtered.length - 1, 0))); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setHighlight((value) => Math.max(value - 1, 0)); }
    if (event.key === 'Enter' && filtered.length) { event.preventDefault(); addProduct(filtered[highlight] || filtered[0]); }
    if (event.key === 'Escape') setQuery('');
  }

  async function updateProducts() {
    setUpdating(true);
    try { await refresh(); }
    finally { setUpdating(false); }
  }

  function renderLabels(isPrint = false) {
    const visibleRows = isPrint ? rows : rows.flatMap((row) => Array.from({ length: Math.min(row.quantity, 40) }, (_, index) => ({ ...row, labelKey: `${row.id}-${index}` }))).slice(0, 40);
    return visibleRows.flatMap((row) => Array.from({ length: isPrint ? row.quantity : 1 }, (_, index) => <BarcodeLabel key={isPrint ? `print-${row.id}-${index}` : row.labelKey} row={row} options={options} />));
  }

  return <section className={styles.page}>
    <PageHeader title="Generate Barcode" description="Select products, choose label details, and print barcode labels." breadcrumbs={[{ label: 'Products', href: '/products' }, { label: 'Generate Barcode' }]} />
    <div className={styles.workspace}>
      <section className={styles.controls} aria-label="Barcode settings">
        <FormField label="Select Product">
          <div className={styles.searchBox}>
            <Input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setHighlight(0); }} onKeyDown={onSearchKeyDown} autoComplete="off" placeholder={loading ? 'Loading products…' : 'Scan / search products by name'} aria-expanded={Boolean(query && filtered.length)} aria-controls="barcode-product-results" />
            {query && <div className={styles.results} id="barcode-product-results" role="listbox">{filtered.length ? filtered.map((product, index) => <button key={product.id} type="button" role="option" aria-selected={index === highlight} onMouseEnter={() => setHighlight(index)} onClick={() => addProduct(product)}><span>{product.name}</span><small>{product.sku}</small></button>) : <p>No matching products.</p>}</div>}
          </div>
        </FormField>

        {error && <div className={styles.error} role="alert">{error}<Button variant="secondary" onClick={updateProducts}>Retry</Button></div>}
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead><tr><th>Product</th><th>Batch No.</th><th>Quantity</th><th>Action</th></tr></thead>
            <tbody>{rows.length ? rows.map((row) => <tr key={row.id}>
              <td><span className={styles.productName}>{row.name}</span><small className={styles.sku}>{row.sku}</small></td>
              <td><Input aria-label={`Batch number for ${row.name}`} value={row.batch} maxLength={30} onChange={(event) => updateRow(row.id, 'batch', event.target.value)} /></td>
              <td><Input aria-label={`Barcode quantity for ${row.name}`} type="number" min="1" max="500" value={row.quantity} onFocus={(event) => event.currentTarget.select()} onChange={(event) => updateRow(row.id, 'quantity', Math.max(1, Math.min(500, Number(event.target.value) || 1)))} /></td>
              <td><Button variant="danger" size="sm" aria-label={`Remove ${row.name}`} leadingIcon={<Trash2 size={16} />} onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}>Remove</Button></td>
            </tr>) : <tr><td colSpan={4} className={styles.empty}>No data found!</td></tr>}</tbody>
          </table>
        </div>

        <fieldset className={styles.options}>
          <legend className={styles.visuallyHidden}>Details printed on each label</legend>
          {[["name", "Name"], ["code", "Code"], ["price", "Price"], ["promo", "Promotional Price"]].map(([key, label]) => <label key={key} className={styles.check}><input type="checkbox" checked={options[key]} onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.checked }))} /><span>{label}</span></label>)}
        </fieldset>

        <FormField label="Paper Size"><Select value={paper} onChange={(event) => setPaper(event.target.value)}>{PAPER.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></FormField>
        {options.promo && <p className={styles.priceHint}>When a product has a promotional price, that price prints as the selling price. The regular price is shown beside it when Price is also selected.</p>}
        <div className={styles.footerActions}><Button variant="secondary" leadingIcon={<RefreshCw size={17} />} loading={updating} onClick={updateProducts}>Update</Button><Button leadingIcon={<Printer size={17} />} onClick={() => window.print()} disabled={!totalLabels || totalLabels > 2000}>Print</Button></div>
      </section>

      <section className={styles.preview} aria-label="Barcode label preview"><div className={styles.previewGrid}>{renderLabels()}</div>{!rows.length && <div className={styles.previewEmpty}>Barcode labels will appear here after you select products.</div>}</section>
    </div>
    {printRoot && createPortal(<div className={paper === 'single' ? styles.singlePage : ''}><div className={styles.printGrid}>{renderLabels(true)}</div></div>, printRoot)}
  </section>;
}
