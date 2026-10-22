'use client';

import { useMemo } from 'react';
import { Package } from 'lucide-react';
import AnnouncementList from '../components/AnnouncementList';
import OnboardingChecklist from '../components/OnboardingChecklist';
import OverallReport from '../components/OverallReport';
import ProfitLossOverview from '../components/ProfitLossOverview';
import RecentActivity from '../components/RecentActivity';
import RecentProducts from '../components/RecentProducts';
import StatsGrid from '../components/StatsGrid';
import TransactionTotalsChart from '../components/TransactionTotalsChart';
import UsersPanel from '../components/UsersPanel';
import styles from './AdminDashboardPage.module.css';

const GREETING = ['Good morning', 'Good afternoon', 'Good evening'];

function greetingForNow() {
  const hour = new Date().getHours();
  return GREETING[hour < 12 ? 0 : hour < 18 ? 1 : 2];
}

export default function AdminDashboardPage({ user, data }) {
  const greeting = useMemo(greetingForNow, []);
  const metrics = data?.metrics || {};

  return (
    <div className={styles.page}>
      <header className={styles.welcome}>
        <div className={styles.welcomeCopy}>
          <span className={styles.eyebrow}>COMPANY OVERVIEW</span>
          <h1>{greeting}, {user.name || 'there'}</h1>
          <p>Your business activity and operations at a glance.</p>
        </div>
        <span className={styles.company}><Package size={18} aria-hidden="true" /><span>{user.company?.name || 'Company workspace'}</span></span>
      </header>

      <OnboardingChecklist />

      <section className={styles.overviewStack} aria-label="Company summary">
        <AnnouncementList />
        <StatsGrid metrics={metrics} />
      </section>

      <section className={styles.reportGrid} aria-label="Financial reports">
        <ProfitLossOverview metrics={metrics} />
        <OverallReport metrics={metrics} />
      </section>

      <section className={styles.dashboardCards} aria-label="Company details">
        <RecentProducts products={data?.topProducts || []} />
        <UsersPanel users={data?.systemUsers || []} />
        <TransactionTotalsChart metrics={metrics} />
      </section>

      <RecentActivity data={data || {}} />
    </div>
  );
}
