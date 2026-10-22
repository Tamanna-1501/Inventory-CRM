import { LoaderCircle } from 'lucide-react';
import styles from './Spinner.module.css';

export default function Spinner({ size = 'md', label = 'Loading', className = '' }) {
  return <span className={`${styles.root} ${styles[size] || styles.md} ${className}`.trim()} role="status"><LoaderCircle className={styles.icon} aria-hidden="true" /><span className={styles.label}>{label}</span></span>;
}
