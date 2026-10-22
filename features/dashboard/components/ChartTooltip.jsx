import styles from './ChartTooltip.module.css';

export default function ChartTooltip({ active, payload, label, formatValue }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      {label && <strong className={styles.label}>{label}</strong>}
      {payload.map((item) => (
        <div className={styles.row} key={`${item.dataKey}-${item.name}`}>
          <span className={`${styles.dot} ${styles[`dot${(item.payload?.tone || 'default')[0].toUpperCase()}${(item.payload?.tone || 'default').slice(1)}`] || styles.dotDefault}`} />
          <span>{item.name || item.dataKey}</span>
          <strong>{formatValue ? formatValue(item.value) : item.value}</strong>
        </div>
      ))}
    </div>
  );
}
