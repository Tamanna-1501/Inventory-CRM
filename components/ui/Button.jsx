'use client';

import { LoaderCircle } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './Button.module.css';

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, leadingIcon, trailingIcon, className = '', type = 'button', children, ...props }) {
  const { t } = usePreferences();
  const label = typeof children === 'string' ? t(children) : children;
  return (
    <button type={type} className={`${styles.button} ${styles[variant] || styles.primary} ${styles[size] || ''} ${className}`.trim()} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <LoaderCircle className={styles.spinner} size={17} aria-hidden="true" /> : leadingIcon}
      <span>{label}</span>
      {!loading && trailingIcon}
    </button>
  );
}
