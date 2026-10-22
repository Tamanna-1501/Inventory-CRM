'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { usePreferences } from '@/context/PreferencesContext';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import ChartTooltip from './ChartTooltip';
import { getChartTheme } from './chartTheme';
import styles from './OverallReport.module.css';

function PercentageLabel({ cx, cy, midAngle, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const radians = -midAngle * (Math.PI / 180);
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(radians);
  const y = cy + radius * Math.sin(radians);
  return <text x={x} y={y} className={styles.pieLabel} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">{`${Math.round(percent * 100)}%`}</text>;
}

export default function OverallReport({ metrics = {} }) {
  const { formatCurrency } = usePreferences();
  const theme = useMemo(() => getChartTheme(), []);
  const grossProfit = Number(metrics.grossProfit || 0);
  const data = [
    { name: 'Purchase', value: Number(metrics.totalPurchase || 0), color: theme.brand, tone: 'purchase' },
    { name: 'Sales', value: Number(metrics.totalSales || 0), color: theme.success, tone: 'sales' },
    { name: 'Expense', value: Number(metrics.totalExpense || 0), color: theme.star, tone: 'expense' },
    { name: 'Gross profit', value: grossProfit, color: theme.successDark, tone: 'grossProfit' },
  ];
  const hasNegativeGrossProfit = grossProfit < 0;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const hasData = data.some((item) => item.value > 0);

  return (
    <Card title="Overall report" description="Relative size of the available company totals." className={styles.reportCard}>
      {hasNegativeGrossProfit ? (
        <EmptyState title="Report chart unavailable" description="Gross profit is negative, so a proportional chart would be misleading." />
      ) : !hasData ? (
        <EmptyState title="No report totals yet" description="Sales, purchases, and expenses will appear here when recorded." />
      ) : (
        <div className={styles.layout}>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="57%" outerRadius="77%" paddingAngle={2} minAngle={6} labelLine={false} label={PercentageLabel} animationDuration={750} animationEasing="ease-out">
                  {data.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="var(--color-white)" strokeWidth={3} />)}
                </Pie>
                <Tooltip content={<ChartTooltip formatValue={formatCurrency} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.center} aria-label={`Sum of reported totals: ${formatCurrency(total)}`}>
              <span>Reported total</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
          </div>
          <ul className={styles.legend}>
            {data.map((item) => (
              <li key={item.name}>
                <span className={`${styles.legendDot} ${styles[`legendDot${item.tone[0].toUpperCase()}${item.tone.slice(1)}`]}`} />
                <span>{item.name}</span>
                <strong>{formatCurrency(item.value)}</strong>
              </li>
            ))}
          </ul>
          <p className={styles.note}>Gross profit is derived from sales and purchases, so these are comparisons rather than additive accounting categories.</p>
        </div>
      )}
    </Card>
  );
}
