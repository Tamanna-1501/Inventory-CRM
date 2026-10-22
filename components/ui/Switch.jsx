'use client';

import styles from './Switch.module.css';

export default function Switch({ label, description, className = '', ...props }) {
  return <label className={`${styles.root} ${className}`.trim()}><span className={styles.copy}><span className={styles.label}>{label}</span>{description && <span className={styles.description}>{description}</span>}</span><input type="checkbox" role="switch" className={styles.input} {...props} /><span className={styles.track} aria-hidden="true"><span /></span></label>;
}
