'use client';

import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-react';
import styles from './Toast.module.css';

const ICONS = { success: CircleCheck, danger: CircleX, warning: TriangleAlert, info: Info };

export default function Toast({ title, message, variant = 'success', onDismiss, role, className = '' }) {
  const Icon = ICONS[variant] || ICONS.info;
  return <div className={`${styles.toast} ${styles[variant] || styles.info} ${className}`.trim()} role={role || (variant === 'danger' ? 'alert' : 'status')} aria-live={variant === 'danger' ? 'assertive' : 'polite'}><Icon className={styles.icon} size={21} /><div className={styles.copy}>{title && <strong>{title}</strong>}{message && <span>{message}</span>}</div>{onDismiss && <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss notification"><X size={18} /></button>}</div>;
}
