'use client';

import { AlertCircle, ArrowRight } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import AdminDashboardPage from './AdminDashboardPage';
import RoleDashboardPage from './RoleDashboardPage';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { dashboardData, loading, error, reload } = useDashboard();
  if (loading) return <section className={styles.loading} aria-label="Loading dashboard"><Skeleton variant="title" /><div className={styles.skeletonGrid}>{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} variant="card" />)}</div><Skeleton variant="card" /></section>;
  if (error || !user) return <section className={styles.errorPage}><div className={styles.errorCard} role="alert"><span className={styles.errorIcon}><AlertCircle size={24} /></span><h1>Dashboard unavailable</h1><p>{error || 'Please sign in again to continue.'}</p><Button leadingIcon={<ArrowRight size={17} />} onClick={reload}>Try again</Button></div></section>;
  if (['ADMIN', 'OWNER'].includes(user.role)) return <AdminDashboardPage user={user} data={dashboardData} />;
  return <RoleDashboardPage user={user} dashboardData={dashboardData} />;
}
