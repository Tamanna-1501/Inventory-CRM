'use client';

import { useMemo, useState } from 'react';
import { ReceiptText } from 'lucide-react';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import Tabs from '@/components/ui/Tabs';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './RecentActivity.module.css';

const TABS = [
  { value: 'sales', label: 'Sales' },
  { value: 'purchases', label: 'Purchases' },
  { value: 'payments', label: 'Payments' },
  { value: 'returns', label: 'Returns' },
  { value: 'expenses', label: 'Expenses' },
];

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusTone(value) {
  const normalized = String(value || '').toLowerCase();
  if (['completed', 'paid', 'approved'].includes(normalized)) return 'success';
  if (['cancelled', 'rejected', 'unpaid'].includes(normalized)) return 'danger';
  return 'warning';
}

export default function RecentActivity({ data = {} }) {
  const { formatCurrency } = usePreferences();
  const [active, setActive] = useState('sales');
  const records = {
    sales: data.recentSales || [],
    purchases: data.recentPurchases || [],
    expenses: data.recentExpenses || [],
  };
  const rows = records[active] || [];
  const columns = useMemo(() => {
    const amountColumn = (key, label) => ({
      key,
      label,
      align: 'right',
      render: (value) => formatCurrency(Number(value || 0)),
    });
    const referenceColumn = { key: 'reference', label: 'Reference', render: (value, row) => value || `#${row.id}` };
    const dateColumn = { key: 'date', label: 'Date', render: (_, row) => dateLabel(row.createdAt || row.date) };

    if (active === 'sales') return [
      dateColumn,
      referenceColumn,
      { key: 'customer', label: 'Customer', render: (_, row) => row.customer?.name || '—' },
      { key: 'status', label: 'Status', render: (value) => <StatusBadge className={styles.statusBadge} status={statusTone(value)}>{value || 'Pending'}</StatusBadge> },
    ];
    if (active === 'purchases') return [
      dateColumn,
      referenceColumn,
      { key: 'supplier', label: 'Supplier', render: (_, row) => row.supplier?.name || '—' },
      amountColumn('totalAmount', 'Amount'),
    ];
    return [
      { key: 'date', label: 'Date', render: (_, row) => dateLabel(row.date || row.createdAt) },
      referenceColumn,
      { key: 'category', label: 'Category', render: (_, row) => row.category?.name || '—' },
      amountColumn('amount', 'Amount'),
    ];
  }, [active, formatCurrency]);

  const missingData = active === 'payments'
    ? 'Payment records are not included in the dashboard API response.'
    : 'Sales and purchase return records are not included in the dashboard API response.';

  return (
    <Card
      title="Recent activity"
      description="Latest transactions returned by your company dashboard."
      actions={<Tabs items={TABS} value={active} onChange={setActive} label="Recent activity type" className={styles.tabs} />}
      className={styles.activityCard}
      bodyClassName={styles.body}
    >
      {['sales', 'purchases', 'expenses'].includes(active)
        ? <DataTable className={styles.tableWrap} caption={`Recent ${active}`} columns={columns} rows={rows} emptyState={`No recent ${active} to show.`} />
        : <EmptyState icon={ReceiptText} title={`${active === 'payments' ? 'Payment' : 'Return'} activity unavailable`} description={missingData} />}
    </Card>
  );
}
