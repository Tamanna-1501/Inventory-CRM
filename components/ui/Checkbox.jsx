'use client';

import styles from './Checkbox.module.css';

export default function Checkbox({ label, description, className = '', ...props }) {
  return <label className={`${styles.root} ${className}`.trim()}><input type="checkbox" className={styles.input} {...props} /><span className={styles.mark} aria-hidden="true" /><span className={styles.copy}><span className={styles.label}>{label}</span>{description && <span className={styles.description}>{description}</span>}</span></label>;
}
