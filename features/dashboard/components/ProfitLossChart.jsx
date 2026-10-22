'use client';

import { ChartNoAxesCombined } from 'lucide-react';
import Card from '@/components/ui/Card';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './ProfitLossChart.module.css';

export default function ProfitLossChart({ metrics = {} }) {
  const { formatCurrency } = usePreferences();
  const grossProfit = Number(metrics.grossProfit || 0);
  const expenses = Number(metrics.totalExpense || 0);
  const net = grossProfit - expenses;
  const profit = Math.max(net, 0);
  const loss = Math.max(-net, 0);
  const maximum = Math.max(profit, loss, 1);
  const entries = [
    { label: 'Profit', value: profit, style: styles.profit },
    { label: 'Loss', value: loss, style: styles.loss },
  ];

  return <Card title="Profit & loss" description="Estimated from gross profit less recorded expenses." className={styles.card}>
    <div className={styles.summary}>
      <span className={net < 0 ? styles.lossValue : styles.profitValue}>{net < 0 ? 'Net loss' : 'Net profit'}</span>
      <strong className={net < 0 ? styles.lossValue : styles.profitValue}>{formatCurrency(Math.abs(net))}</strong>
    </div>
    <div className={styles.chart} role="img" aria-label={`Profit ${formatCurrency(profit)}; loss ${formatCurrency(loss)}`}>
      {entries.map((entry) => {
        const width = entry.value > 0 ? Math.max(2, (entry.value / maximum) * 100) : 0;
        return <div className={styles.row} key={entry.label}>
          <div className={styles.label}><span>{entry.label}</span><strong>{formatCurrency(entry.value)}</strong></div>
          <div className={styles.track}><span className={`${styles.bar} ${entry.style}`} style={{ '--bar-width': `${width}%` }} /></div>
        </div>;
      })}
    </div>
    <div className={styles.caption}><ChartNoAxesCombined size={17} /><span>Gross profit {formatCurrency(grossProfit)} · Expenses {formatCurrency(expenses)}</span></div>
  </Card>;
}
