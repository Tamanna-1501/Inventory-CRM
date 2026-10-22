'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, Receipt, Trash2, Wallet } from 'lucide-react';
import { Button, Card, ConfirmDialog, DataTable, FormField, Input, ListExportTools, Modal, NoticeDialog, PageHeader, Select, Textarea } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useTradingListData } from '@/features/trading/hooks/useTradingListData';
import { createPurchasePayment, createSalePayment, deletePurchase, deleteSale, getPurchases, getSales, updatePurchase, updateSale } from '@/features/trading/services/tradingService';
import styles from './TradingListPage.module.css';
import { normalizeInvoice, printInvoice } from '@/lib/invoice';

const paidSale = (row) => row.invoice?.payments?.reduce((sum, payment) => sum + Number(payment.amountPaid || 0), 0) || 0;
const totalSale = (row) => Number(row.invoice?.grandTotal || 0);
const dueSale = (row) => Math.max(0, totalSale(row) - paidSale(row));
const loaderByKind = { sales: getSales, purchases: getPurchases };

export default function TradingListPage({ kind = 'sales' }) {
  const isSale = kind === 'sales'; const entity = isSale ? 'sale' : 'purchase';
  const title = isSale ? 'Sales list' : 'Manage purchases';
  const router = useRouter(); const toast = useToast();
  const { can } = useAuth();
  const { formatCurrency: money, preferences } = usePreferences();
  const { data: records, setData: setRecords, loading, error, refresh } = useTradingListData(loaderByKind[kind]);
  const [search, setSearch] = useState(''); const [editing, setEditing] = useState(null); const [editForm, setEditForm] = useState({ status: 'pending', note: '', staffRemark: '' });
  const [paying, setPaying] = useState(null); const [payForm, setPayForm] = useState({ amountPaid: '', paymentMethod: 'cash' });
  const [deleting, setDeleting] = useState(null); const [forceDelete, setForceDelete] = useState(null); const [undo, setUndo] = useState(null); const [notice, setNotice] = useState(null); const [busy, setBusy] = useState(false); const undoTimer = useRef(null);
  const [listNotice, setListNotice] = useState('');
  const noticeTimer = useRef(null);
  const showListNotice = useCallback((message) => {
    window.clearTimeout(noticeTimer.current);
    setListNotice(message);
    noticeTimer.current = window.setTimeout(() => setListNotice(''), 2000);
  }, []);
  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);
  useEffect(() => {
    const noticeKey = isSale ? 'sale-created-notice' : 'purchase-created-notice';
    if (sessionStorage.getItem(noticeKey) !== '1') return undefined;
    sessionStorage.removeItem(noticeKey);
    showListNotice(isSale ? 'Sale created successfully' : 'Purchase created successfully');
    return undefined;
  }, [isSale, showListNotice]);
  const filtered = useMemo(() => records.filter((row) => `${row.reference || ''} ${row.customer?.name || row.supplier?.name || ''} ${row.warehouse?.name || ''} ${row.invoice?.invoiceNumber || ''}`.toLowerCase().includes(search.toLowerCase())), [records, search]);

  function openEdit(row) {
    if (Number(row.returnCount || 0) > 0) { setNotice({ title: `Cannot edit this ${entity}`, message: `This ${entity} has a linked return. Delete the return before editing the ${entity}.` }); return; }
    setEditing(row); setEditForm({ status: row.status || 'pending', note: row.note || '', staffRemark: row.staffRemark || '' });
  }
  async function saveEdit(event) {
    event.preventDefault(); setBusy(true);
    try { await (isSale ? updateSale(editing.id, editForm) : updatePurchase(editing.id, { status: editForm.status, note: editForm.note })); setEditing(null); await refresh(); showListNotice(`${entity[0].toUpperCase()}${entity.slice(1)} updated successfully`); }
    catch (e) { setEditing(null); if (e.status === 409) setNotice({ title: `Cannot edit this ${entity}`, message: `This ${entity} is linked with a return. Delete the return first.` }); else toast({ title: `Could not update ${entity}`, message: e.message, variant: 'danger' }); }
    finally { setBusy(false); }
  }
  async function savePayment(event) {
    event.preventDefault(); setBusy(true);
    try {
      if (isSale) await createSalePayment(paying.invoice.id, { amountPaid: Number(payForm.amountPaid), paymentMethod: payForm.paymentMethod });
      else await createPurchasePayment(paying.id, { amountPaid: Number(payForm.amountPaid), paymentMethod: payForm.paymentMethod });
      setPaying(null); await refresh(); showListNotice('Payment recorded');
    } catch (e) { toast({ title: 'Payment failed', message: e.message, variant: 'danger' }); }
    finally { setBusy(false); }
  }
  function askDelete(row) {
    if (Number(row.returnCount || 0) > 0) { setNotice({ title: `Cannot delete this ${entity}`, message: `This ${entity} has a linked return. Delete the return before deleting the ${entity}.` }); return; }
    setDeleting(row);
  }
  async function executeDelete(target, force = false) {
    if (!target) return; setBusy(true);
    try { if (isSale) await deleteSale(target.id); else await deletePurchase(target.id, force); setDeleting(null); setForceDelete(null); await refresh(); showListNotice(`${entity[0].toUpperCase()}${entity.slice(1)} deleted successfully`); }
    catch (e) {
      if (e.status === 409 && e.data?.code === 'STOCK_CONFLICT' && !force) { setDeleting(null); setForceDelete({ ...target, message: e.message }); }
      else if (e.status === 409) { setDeleting(null); setForceDelete(null); setNotice({ title: `Cannot delete this ${entity}`, message: `This ${entity} is linked with a return or other records. Remove the linked record first.` }); await refresh(); }
      else toast({ title: `Could not delete ${entity}`, message: e.message, variant: 'danger' });
    } finally { setBusy(false); }
  }
  function confirmDelete(force = false) {
    const target = forceDelete || deleting;
    if (!target) return;
    if (!isSale && !force) {
      if (undo) { window.clearTimeout(undo.timer); executeDelete(undo.target); }
      setDeleting(null);
      setRecords((current) => current.filter((row) => row.id !== target.id));
      const timer = window.setTimeout(() => { setUndo(null); executeDelete(target); }, 5000);
      setUndo({ target, timer });
      return;
    }
    executeDelete(target, force);
  }
  function undoPurchaseDelete() {
    if (!undo) return;
    window.clearTimeout(undo.timer);
    setUndo(null);
    setRecords((current) => [undo.target, ...current].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }
  const columns = isSale ? [
    { key: 'createdAt', label: 'Date', render: (value) => value ? new Date(value).toLocaleDateString() : '—' }, { key: 'reference', label: 'Reference' }, { key: 'customer', label: 'Customer', render: (_, row) => row.customer?.name || '—' }, { key: 'warehouse', label: 'Warehouse', render: (_, row) => row.warehouse?.name || '—' }, { key: 'grandTotal', label: 'Total', align: 'right', render: (_, row) => money(totalSale(row)) }, { key: 'paid', label: 'Paid', align: 'right', render: (_, row) => money(paidSale(row)) }, { key: 'due', label: 'Due', align: 'right', render: (_, row) => money(dueSale(row)) }, { key: 'status', label: 'Status', render: (value) => <span className={styles.status} data-status={String(value || 'unknown').toLowerCase()}>{value || '—'}</span> },
  ] : [
    { key: 'createdAt', label: 'Date', render: (value) => value ? new Date(value).toLocaleDateString() : '—' }, { key: 'reference', label: 'Reference' }, { key: 'supplier', label: 'Supplier', render: (_, row) => row.supplier?.name || '—' }, { key: 'warehouse', label: 'Warehouse', render: (_, row) => row.warehouse?.name || '—' }, { key: 'totalAmount', label: 'Total', align: 'right', render: (value) => money(value) }, { key: 'totalPaid', label: 'Paid', align: 'right', render: (value) => money(value) }, { key: 'due', label: 'Due', align: 'right', render: (value) => money(value) }, { key: 'status', label: 'Status', render: (value) => <span className={styles.status} data-status={String(value || 'unknown').toLowerCase()}>{value || '—'}</span> },
  ];
  const exportColumns = columns.map((column) => ({ ...column, exportText: (row) => {
    if (column.key === 'createdAt') return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '';
    if (column.key === 'customer') return row.customer?.name || '';
    if (column.key === 'supplier') return row.supplier?.name || '';
    if (column.key === 'warehouse') return row.warehouse?.name || '';
    if (column.key === 'grandTotal') return money(totalSale(row));
    if (column.key === 'paid') return money(paidSale(row));
    if (column.key === 'totalAmount') return money(row.totalAmount);
    if (column.key === 'totalPaid') return money(row.totalPaid);
    if (column.key === 'due') return money(isSale ? dueSale(row) : row.due);
    return row[column.key] ?? '';
  } }));
  return <section className={styles.page}><PageHeader title={title} description={`Review ${isSale ? 'sales, invoices, and customer payments' : 'purchases, supplier payments, and stock receipts'}.`} breadcrumbs={[{ label: 'Trading', href: '/trading' }, { label: isSale ? 'Sales' : 'Purchases' }, { label: title }]} actions={<>{can(isSale ? 'pos' : 'purchase_return', isSale ? 'add' : 'view') && <Button variant="secondary" onClick={() => router.push(isSale ? '/trading/sales/pos-sales' : '/trading/purchase/purchase-returns')}>{isSale ? 'Open POS' : 'Purchase returns'}</Button>}{can(isSale ? 'sales' : 'purchase', 'add') && <Button leadingIcon={<Plus size={18} />} onClick={() => router.push(isSale ? '/trading/sales/new-sales' : '/trading/purchase/add-purchase')}>{isSale ? 'Add sale' : 'Add purchase'}</Button>}</>} />
    <Card><div className={styles.toolbar}><FormField label={`Search ${isSale ? 'sales' : 'purchases'}`}><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference, person, invoice or warehouse" /></FormField><ListExportTools title={title} fileName={isSale ? 'sales' : 'purchases'} columns={exportColumns} rows={filtered}/><div className={styles.toolbarMeta}>{listNotice && <span className={styles.saleCreatedNotice} role="status">{listNotice}</span>}<span>{filtered.length} records</span></div></div>{error ? <div className={styles.state} role="alert">{error}<Button variant="secondary" onClick={refresh}>Retry</Button></div> : loading ? <div className={styles.state}>Loading records…</div> : <DataTable caption={title} columns={columns} rows={filtered} emptyState={`No ${isSale ? 'sales' : 'purchases'} found.`} renderActions={(row) => <div className={styles.actions}>{can(isSale ? 'sale_invoice' : 'purchase_invoice', 'view') && <Button size="sm" variant="secondary" onClick={() => isSale ? window.open(`/trading/sales/invoice/${row.id}`, '_blank') : printInvoice(normalizeInvoice('purchase', row, preferences))} leadingIcon={<Receipt size={15} />}>Invoice</Button>}{can(isSale ? 'sales' : 'purchase', 'edit') && <Button size="sm" variant="secondary" onClick={() => openEdit(row)} leadingIcon={<Pencil size={15} />}>Edit</Button>}{can(isSale ? 'sales' : 'purchase', isSale ? 'edit' : 'add') && (isSale || Number(row.due || 0) > 0) && <Button size="sm" variant="secondary" disabled={isSale ? dueSale(row) <= 0 : Number(row.due || 0) <= 0} title={isSale && dueSale(row) <= 0 ? "This sale is fully paid" : undefined} onClick={() => { setPaying(row); setPayForm({ amountPaid: String(isSale ? dueSale(row) : row.due), paymentMethod: 'cash' }); }} leadingIcon={<Wallet size={15} />}>{isSale ? 'Add payment' : 'Payment'}</Button>}{can(isSale ? 'sales' : 'purchase', 'delete') && <Button size="sm" variant="danger" onClick={() => askDelete(row)} leadingIcon={<Trash2 size={15} />}>Delete</Button>}</div>} />}</Card>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`Edit ${entity}`} footer={<div className={styles.modalActions}><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="trading-edit" loading={busy}>Save changes</Button></div>}><form id="trading-edit" className={styles.modalForm} onSubmit={saveEdit}><FormField label="Status"><Select value={editForm.status} onChange={(e) => setEditForm((old) => ({ ...old, status: e.target.value }))}><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="received">Received</option></Select></FormField><FormField label="Note"><Textarea value={editForm.note} onChange={(e) => setEditForm((old) => ({ ...old, note: e.target.value }))} rows={3} /></FormField>{isSale && <FormField label="Staff remark"><Textarea value={editForm.staffRemark} onChange={(e) => setEditForm((old) => ({ ...old, staffRemark: e.target.value }))} rows={3} /></FormField>}<p className={styles.hint}>Product lines and prices are fixed after the transaction is created.</p></form></Modal>
    <Modal open={Boolean(paying)} onClose={() => setPaying(null)} title="Record payment" footer={<div className={styles.modalActions}><Button variant="secondary" onClick={() => setPaying(null)}>Cancel</Button><Button type="submit" form="trading-payment" loading={busy}>Save payment</Button></div>}><form id="trading-payment" className={styles.modalForm} onSubmit={savePayment}><FormField label="Amount paid" required><Input type="number" min="0.01" max={isSale ? dueSale(paying || {}) : paying?.due} step="0.01" value={payForm.amountPaid} onChange={(e) => setPayForm((old) => ({ ...old, amountPaid: e.target.value }))} required /></FormField><FormField label="Payment method"><Select value={payForm.paymentMethod} onChange={(e) => setPayForm((old) => ({ ...old, paymentMethod: e.target.value }))}><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="bank_transfer">Bank transfer</option></Select></FormField></form></Modal>
    <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => confirmDelete(false)} loading={busy} title={`Delete ${entity}?`} description={`Delete ${deleting?.reference || `#${deleting?.id}`}? Related stock and invoice records will be handled by the server.`} confirmLabel={`Delete ${entity}`} />
    <ConfirmDialog open={Boolean(forceDelete)} onClose={() => setForceDelete(null)} onConfirm={() => confirmDelete(true)} loading={busy} title="Stock conflict" description={forceDelete?.message || 'Deleting this purchase will affect stock. Continue?'} confirmLabel="Delete anyway" />
    <NoticeDialog open={Boolean(notice)} onClose={() => setNotice(null)} title={notice?.title} message={notice?.message} variant="warning" />
    {undo && <div className={styles.undoBar} role="status"><span>Purchase deleted.</span><Button size="sm" variant="secondary" onClick={undoPurchaseDelete}>Undo</Button></div>}
  </section>;
}
