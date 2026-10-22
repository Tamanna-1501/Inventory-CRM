'use client';

import Link from 'next/link';
import { Building2, CircleAlert, Users, UserPlus, CheckCircle2 } from 'lucide-react';
import { Button, Card, DataTable, PageHeader, Skeleton, StatCard, StatusBadge } from '@/components/ui';
import { useSuperAdminDashboard } from '../hooks';
import styles from './SuperAdminDashboardPage.module.css';

const numberFormat = new Intl.NumberFormat('en-IN');
export default function SuperAdminDashboardPage() {
  const { data, error, loading } = useSuperAdminDashboard();
  const metrics = data?.metrics || {};
  const cards = [
    ['Total companies', metrics.totalCompanies, Building2], ['Active companies', metrics.activeCompanies, CheckCircle2],
    ['Suspended companies', metrics.suspendedCompanies, CircleAlert], ['New this month', metrics.newCompaniesThisMonth, UserPlus], ['Company users', metrics.totalUsers, Users],
  ];
  const columns = [
    { key: 'name', label: 'Company', render: (value, row) => <><strong>{value}</strong><span className={styles.email}>{row.email}</span></> },
    { key: 'usersCount', label: 'Users', render: (value) => numberFormat.format(value || 0) },
    { key: 'source', label: 'Source', render: (value) => <span className={styles.capitalize}>{value}</span> },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
    { key: 'createdAt', label: 'Registered', render: (value) => value ? new Date(value).toLocaleDateString() : '—' },
  ];
  return <main className={styles.page}><PageHeader title="Platform dashboard" description="Company registrations and account overview." actions={<Link href="/super-admin/companies" className={styles.linkButton}>Manage companies</Link>} />
    {error && <div className={styles.error} role="alert">{error}<Button size="sm" variant="secondary" onClick={() => window.location.reload()}>Retry</Button></div>}
    <section className={styles.stats} aria-label="Platform summary">{cards.map(([label, value, icon]) => <StatCard key={label} label={label} value={loading ? '—' : numberFormat.format(value || 0)} icon={icon} />)}</section>
    <Card title="Recent registrations" description="Latest companies added to Inventual." actions={<Link className={styles.textLink} href="/super-admin/companies">View all</Link>}>
      {loading ? <div className={styles.skeletons}><Skeleton count={3}/></div> : <DataTable caption="Recent company registrations" columns={columns} rows={data?.recentCompanies || []} emptyState="No company registrations yet." />}
    </Card>
  </main>;
}
