'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { usePreferences } from '@/context/PreferencesContext';
import ChartTooltip from './ChartTooltip';
import { getChartTheme } from './chartTheme';
import styles from './TransactionTotalsChart.module.css';

function formatCompactCurrency(value) {
  const amount = Number(value || 0);
  const absoluteAmount = Math.abs(amount);
  const formatUnit = (divisor) => (amount / divisor).toLocaleString('en-IN', { maximumFractionDigits: 1 });

  if (absoluteAmount >= 10000000) return `₹${formatUnit(10000000)}Cr`;
  if (absoluteAmount >= 100000) return `₹${formatUnit(100000)}L`;
  if (absoluteAmount >= 1000) return `₹${formatUnit(1000)}K`;
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function TransactionTotalsChart({ metrics = {} }) {
  const { formatCurrency } = usePreferences();
  const theme = useMemo(() => getChartTheme(), []);
  const data = [
    { name: 'Sales', amount: Number(metrics.totalSales || 0), color: theme.success, tone: 'sales' },
    { name: 'Purchases', amount: Number(metrics.totalPurchase || 0), color: theme.brand, tone: 'purchase' },
    { name: 'Expenses', amount: Number(metrics.totalExpense || 0), color: theme.star, tone: 'expense' },
  ];
  const hasData = data.some((item) => item.amount > 0);

  return (
    <Card
      title="Transaction totals"
      description="Recorded sales, purchases, and expenses."
      className={styles.chartCard}
    >
      {hasData ? (
        <div className={styles.chart} role="img" aria-label={data.map((item) => `${item.name} ${formatCurrency(item.amount)}`).join('; ')}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 18, bottom: 4, left: 8 }}>
              <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray="4 5" />
              <XAxis dataKey="name" interval={0} tick={{ fill: theme.text, fontSize: 14 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatCompactCurrency} tick={{ fill: theme.text, fontSize: 14 }} axisLine={false} tickLine={false} width={68} />
              <Tooltip content={<ChartTooltip formatValue={formatCurrency} />} cursor={false} />
              <Bar dataKey="amount" name="Total" radius={[7, 7, 0, 0]} maxBarSize={44} minPointSize={6} animationDuration={700} animationEasing="ease-out">
                {data.map((item) => <Cell key={item.name} fill={item.color} />)}
                <LabelList dataKey="amount" position="top" formatter={formatCompactCurrency} fill="var(--color-text-muted)" fontSize={14} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyState title="No transaction totals yet" description="Sales, purchases, and expenses will appear after they are recorded." />
      )}
    </Card>
  );
}
