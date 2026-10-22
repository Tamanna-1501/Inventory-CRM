import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import styles from './UnauthorizedPage.module.css';

export default function UnauthorizedPage() {
  return (
    <AuthLayout eyebrow="ACCOUNT ACCESS">
      <div className={styles.content}>
        <span className={styles.icon}><ShieldX size={28} aria-hidden="true" /></span>
        <p className={styles.kicker}>ACCESS RESTRICTED</p>
        <h2>Access denied</h2>
        <p className={styles.description}>You do not have permission to open this page. If you think you should have access, contact your company administrator.</p>
        <div className={styles.actions}>
          <Link className={styles.action} href="/dashboard">Return to dashboard</Link>
          <Link className={styles.loginLink} href="/login">Sign in with another account</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
