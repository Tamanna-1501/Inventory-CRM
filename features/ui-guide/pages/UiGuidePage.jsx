'use client';

import { useState } from 'react';
import { Boxes, CirclePlus, Download, PackageSearch } from 'lucide-react';
import {
  ActionMenu, Button, Card, Checkbox, ConfirmDialog, DataTable, EmptyState,
  FormField, Input, Modal, NoticeDialog, PageHeader, Pagination, Select,
  Skeleton, Spinner, StatCard, StatusBadge, Switch, Tabs, Textarea, Toast,
} from '@/components/ui';
import styles from './UiGuidePage.module.css';

const SAMPLE_ROWS = [
  { id: 'p-1001', name: 'Classic Notebook', sku: 'NB-1001', quantity: 240, status: 'Active' },
  { id: 'p-1002', name: 'Desk Organizer', sku: 'DO-1044', quantity: 38, status: 'Low stock' },
  { id: 'p-1003', name: 'Packing Tape', sku: 'PT-2090', quantity: 0, status: 'Inactive' },
];

export default function UiGuidePage() {
  const [tab, setTab] = useState('controls');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [page, setPage] = useState(1);
  const columns = [
    { key: 'name', label: 'Product', render: (value) => <strong>{value}</strong> },
    { key: 'sku', label: 'SKU' },
    { key: 'quantity', label: 'Quantity', align: 'right' },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value === 'Active' ? 'success' : value === 'Low stock' ? 'warning' : 'danger'}>{value}</StatusBadge> },
  ];

  return (
    <main className={styles.page}>
      <Card title="Palette and typography" description="Review the shared palette and readable type scale used across Inventual.">
        <div className={styles.palette} aria-label="Inventual color palette">
          <div className={`${styles.swatch} ${styles.navy}`}><strong>Navy</strong><span>Headings and sidebar</span></div>
          <div className={`${styles.swatch} ${styles.brand}`}><strong>Brand orange</strong><span>Primary actions</span></div>
          <div className={`${styles.swatch} ${styles.cream}`}><strong>Cream</strong><span>Page background</span></div>
          <div className={`${styles.swatch} ${styles.surface}`}><strong>Surface</strong><span>Panels and headers</span></div>
          <div className={`${styles.swatch} ${styles.strip}`}><strong>Strip</strong><span>Zebra rows</span></div>
          <div className={`${styles.swatch} ${styles.star}`}><strong>Star</strong><span>Warnings and highlights</span></div>
          <div className={`${styles.swatch} ${styles.muted}`}><strong>Muted</strong><span>Decorative only</span></div>
          <div className={`${styles.swatch} ${styles.price}`}><strong>Price red</strong><span>Returns and danger</span></div>
        </div>
        <div className={styles.typeSamples}>
          <div><span>Page title - 30px</span><strong className={styles.pageType}>Clear page heading</strong></div>
          <div><span>Card title - 20px</span><strong className={styles.cardType}>Readable card heading</strong></div>
          <div><span>Body - 16px</span><p>Body copy stays comfortable to read on every surface.</p></div>
          <div><span>Table - 15px</span><p className={styles.tableType}>Product rows remain easy to scan.</p></div>
        </div>
      </Card>
      <PageHeader title="UI component guide" description="Phase 1 foundation for the refreshed Inventual interface." breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'UI guide' }]} actions={<Button leadingIcon={<Download size={17} />} variant="secondary">Download sample</Button>} />
      <div className={styles.stats}><StatCard label="Products" value="1,284" icon={Boxes} change="8.2%" changeLabel="this month" trend="up" /><StatCard label="Low stock" value="12" icon={PackageSearch} changeLabel="needs review" trend="down" /><StatCard label="New records" value="48" icon={CirclePlus} changeLabel="this week" /></div>

      <Tabs label="UI guide sections" value={tab} onChange={setTab} items={[{ value: 'controls', label: 'Form controls' }, { value: 'data', label: 'Data & states' }, { value: 'dialogs', label: 'Dialogs & feedback' }]} />

      {tab === 'controls' && <div className={styles.columns}>
        <Card title="Form controls" description="Inputs share sizing, labels, focus states, and validation styles.">
          <div className={styles.formGrid}>
            <FormField label="Product name" required hint="Use the name shown on receipts."><Input placeholder="e.g. Classic Notebook" /></FormField>
            <FormField label="Category"><Select defaultValue=""><option value="" disabled>Select category</option><option>Stationery</option><option>Office supplies</option></Select></FormField>
            <FormField label="SKU" error="This SKU is already in use."><Input invalid defaultValue="NB-1001" /></FormField>
            <FormField label="Notes"><Textarea placeholder="Optional notes" rows={3} /></FormField>
          </div>
          <div className={styles.controlOptions}><Checkbox label="Track stock" defaultChecked description="Keep quantity changes in stock history." /><Switch label="Available for sale" defaultChecked description="Allow this product in sales and POS." /></div>
          <div className={styles.buttonRow}><Button leadingIcon={<CirclePlus size={17} />}>Add product</Button><Button variant="secondary">Cancel</Button><Button variant="ghost">Text action</Button><Button variant="danger">Delete</Button></div>
        </Card>
        <Card title="Status badges" description="Muted status colors remain readable on light surfaces."><div className={styles.badges}><StatusBadge status="success">Active</StatusBadge><StatusBadge status="warning">Low stock</StatusBadge><StatusBadge status="danger">Suspended</StatusBadge><StatusBadge status="info">Processing</StatusBadge><StatusBadge>Draft</StatusBadge></div><div className={styles.loadingSample}><Spinner label="Saving changes" /><Skeleton variant="line" count={3} /></div></Card>
      </div>}

      {tab === 'data' && <div className={styles.dataStack}><Card title="Products" description="Scrollable table with readable rows and action menu."><DataTable caption="Products" columns={columns} rows={SAMPLE_ROWS} renderActions={(row) => <ActionMenu label={`Actions for ${row.name}`} items={[{ label: 'View details', onSelect: () => setToast(true) }, { label: 'Edit product', onSelect: () => setModalOpen(true) }, { label: 'Delete product', danger: true, onSelect: () => setConfirmOpen(true) }]} />} /></Card><Card title="Empty state"><EmptyState icon={PackageSearch} title="No matching products" description="Try changing the search or filters." action={<Button variant="secondary">Clear filters</Button>} /></Card><Pagination page={page} pageCount={4} itemCount={32} pageSize={10} onPageChange={setPage} /></div>}

      {tab === 'dialogs' && <Card title="Dialogs and feedback" description="Use application dialogs for confirmations and notices."><div className={styles.buttonRow}><Button onClick={() => setModalOpen(true)}>Open modal</Button><Button variant="danger" onClick={() => setConfirmOpen(true)}>Confirm delete</Button><Button variant="secondary" onClick={() => setNoticeOpen(true)}>Show notice</Button><Button variant="secondary" onClick={() => setToast(true)}>Show toast</Button></div></Card>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Product details" description="A standard dialog with keyboard dismissal and focus handling." footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button><Button onClick={() => { setModalOpen(false); setToast(true); }}>Save changes</Button></>}><p className={styles.modalCopy}>This content area can hold a view form, payment panel, or record details.</p></Modal>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => { setConfirmOpen(false); setToast(true); }} title="Delete product?" description="This action cannot be undone. Related stock rules still apply." confirmLabel="Delete product" />
      <NoticeDialog open={noticeOpen} onClose={() => setNoticeOpen(false)} title="Action blocked" message="This record is linked to another transaction and cannot be removed yet." variant="warning" />
      {toast && <div className={styles.toastDock}><Toast title="Changes saved" message="The UI guide action completed." onDismiss={() => setToast(false)} /></div>}
    </main>
  );
}
