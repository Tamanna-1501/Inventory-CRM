'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { getBranding, getSale } from '@/features/trading/services/tradingService';
import { formatInvoiceMoney } from '@/lib/invoice';
import styles from './SaleInvoicePage.module.css';

export default function SaleInvoicePage() {
  const { id } = useParams(); const router = useRouter();
  const [sale, setSale] = useState(null); const [branding, setBranding] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; Promise.all([getSale(id), getBranding()]).then(([saleData, brandData]) => { if (active) { setSale(saleData); setBranding(brandData || {}); } }).catch((e) => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [id]);
  const money = (value) => formatInvoiceMoney(value, branding || {});
  if (loading) return <div className={styles.loading}><Skeleton /><Skeleton /><Skeleton /></div>;
  if (error || !sale) return <div className={styles.error}><h1>Invoice unavailable</h1><p>{error || 'The sale could not be found.'}</p><Button onClick={() => router.back()} leadingIcon={<ArrowLeft size={17} />}>Go back</Button></div>;
  const invoice = sale.invoice || {}; const paid = invoice.payments?.reduce((total, payment) => total + Number(payment.amountPaid || 0), 0) || 0;
  return <main className={styles.page}><div className={`${styles.actions} no-print`}><Button variant="secondary" onClick={() => router.back()} leadingIcon={<ArrowLeft size={17} />}>Back</Button><Button onClick={() => window.print()} leadingIcon={<Printer size={17} />}>Print invoice</Button></div><Card className={styles.invoice}><div className={styles.top}><div className={styles.company}><div className={styles.identity}>{branding?.companyLogo && <img className={styles.logo} src={branding.companyLogo} alt={`${branding.companyName || 'Company'} logo`} />}<div><h1>{branding?.companyName || 'Sales Invoice'}</h1>{branding?.companyAddress && <p>{branding.companyAddress}</p>}{[branding?.companyEmail, branding?.companyPhone].filter(Boolean).join(' · ') && <p>{[branding?.companyEmail, branding?.companyPhone].filter(Boolean).join(' · ')}</p>}</div></div></div><div className={styles.invoiceTitle}><strong>INVOICE</strong><span>{invoice.invoiceNumber || sale.reference}</span><span>{new Date(sale.createdAt).toLocaleDateString()}</span></div></div><div className={styles.parties}><div><span>Bill to</span><strong>{sale.customer?.name || 'Customer'}</strong><p>{sale.customer?.address || ''}</p><p>{sale.customer?.phone || ''}</p></div><div><span>Warehouse</span><strong>{sale.warehouse?.name || '—'}</strong><p>Biller: {sale.biller?.name || '—'}</p><p>Reference: {sale.reference || '—'}</p></div></div><div className={styles.tableWrap}><table><thead><tr><th>Product</th><th>Batch</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{(sale.items || []).map((item) => <tr key={item.id}><td>{item.product?.name || 'Product'}</td><td>{item.batchNo || '—'}</td><td>{item.quantity}</td><td>{money(item.price)}</td><td>{money(Number(item.price) * Number(item.quantity))}</td></tr>)}</tbody></table></div><div className={styles.totals}><div><span>Status</span><strong>{sale.status}</strong></div><div><span>Total</span><strong>{money(invoice.grandTotal ?? sale.totalAmount)}</strong></div><div><span>Paid</span><strong>{money(paid)}</strong></div><div><span>Due</span><strong>{money(Math.max(0, Number(invoice.grandTotal ?? sale.totalAmount) - paid))}</strong></div></div>{sale.note && <p className={styles.note}><strong>Note:</strong> {sale.note}</p>}{branding?.footerText && <p className={styles.footer}>{branding.footerText}</p>}</Card></main>;
}
