import styles from './Skeleton.module.css';

export default function Skeleton({ variant = 'line', count = 1, className = '', label = 'Loading content' }) {
  return <div className={`${styles.group} ${className}`.trim()} aria-label={label} aria-busy="true">{Array.from({ length: Math.max(1, count) }, (_, index) => <span key={index} className={`${styles.skeleton} ${styles[variant] || styles.line}`} />)}</div>;
}
