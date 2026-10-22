'use client';

import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

export default function Select({ className = '', invalid = false, children, ...props }) {
  return <span className={styles.wrap}><select className={`${styles.select} ${invalid ? styles.invalid : ''} ${className}`.trim()} aria-invalid={invalid || undefined} {...props}>{children}</select><ChevronDown className={styles.chevron} size={17} aria-hidden="true" /></span>;
}
