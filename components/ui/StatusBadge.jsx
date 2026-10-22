import styles from './StatusBadge.module.css';

export default function StatusBadge({ status, variant, children, className = '' }) {
  const tone = variant || String(status || 'neutral').toLowerCase().replaceAll(' ', '-');
  return <span className={`${styles.badge} ${styles[tone] || styles.neutral} ${className}`.trim()}>{children ?? status}</span>;
}
