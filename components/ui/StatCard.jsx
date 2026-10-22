import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import styles from './StatCard.module.css';

export default function StatCard({ label, value, icon: Icon, change, changeLabel, trend, tone = 'brand', className = '' }) {
  const trendClass = trend === 'down' ? styles.down : styles.up;
  const valueTitle = typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
  return <article className={`${styles.card} ${className}`.trim()}><div className={styles.top}><span>{label}</span>{Icon && <span className={`${styles.icon} ${styles[`icon-${tone}`] || styles['icon-brand']}`}><Icon size={20} aria-hidden="true" /></span>}</div><strong className={styles.value} title={valueTitle}>{value}</strong>{(change !== undefined || changeLabel) && <div className={`${styles.change} ${trendClass}`}>{trend === 'down' ? <ArrowDownRight size={17} /> : <ArrowUpRight size={17} />}{change !== undefined && <strong>{change}</strong>}{changeLabel && <span>{changeLabel}</span>}</div>}</article>;
}
