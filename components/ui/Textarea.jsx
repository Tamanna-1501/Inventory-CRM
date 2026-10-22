'use client';

import styles from './Textarea.module.css';

export default function Textarea({ className = '', invalid = false, rows = 4, ...props }) {
  return <textarea rows={rows} className={`${styles.textarea} ${invalid ? styles.invalid : ''} ${className}`.trim()} aria-invalid={invalid || undefined} {...props} />;
}
