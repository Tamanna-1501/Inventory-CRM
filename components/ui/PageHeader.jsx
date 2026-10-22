'use client';

import Link from 'next/link';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './PageHeader.module.css';

export default function PageHeader({ title, description, breadcrumbs, actions, className = '' }) {
  const { t } = usePreferences();
  return <header className={`${styles.header} ${className}`.trim()}>{breadcrumbs?.length > 0 && <nav className={styles.breadcrumbs} aria-label="Breadcrumb">{breadcrumbs.map((item, index) => <span key={`${item.label}-${index}`} aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>{item.href ? <Link href={item.href}>{t(item.label)}</Link> : t(item.label)}</span>)}</nav>}<div className={styles.row}><div className={styles.copy}><h1>{t(title)}</h1>{description && <p>{t(description)}</p>}</div>{actions && <div className={styles.actions}>{actions}</div>}</div></header>;
}
