'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { ChartNoAxesCombined } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import ChartTooltip from './ChartTooltip';
import { getChartTheme } from './chartTheme';
import styles from './ProfitLossOverview.module.css';

function ResultAxisTick({ x, y, payload }) {
  const isLoss = payload.value === 'Net loss';
  return (
    <text
      x={x}
      y={y}
      dy={4}
      fill={isLoss ? 'var(--color-danger)' : 'var(--color-text-muted)'}
      fontSize={14}
      fontWeight={500}
      textAnchor="end"
    >
      {payload.value}
    </text>
  );
}

export default function ProfitLossOverview({ metrics = {} }) {
  const { formatCurrency } = usePreferences();
  const theme = useMemo(() => getChartTheme(), []);
  const grossProfit = Number(metrics.grossProfit || 0);
  const totalExpense = Number(metrics.totalExpense || 0);
  const netAfterExpenses = grossProfit - totalExpense;
  const data = [
    { name: 'Net profit', amount: Math.max(netAfterExpenses, 0), tone: 'profit' },
    { name: 'Net loss', amount: Math.max(-netAfterExpenses, 0), tone: 'loss' },
  ];
  const hasData = grossProfit !== 0 || totalExpense !== 0;

  return (
    <Card title="Profit & loss overview" description="Current net result from recorded sales, purchases, and expenses." className={styles.reportCard}>
      {!hasData ? <EmptyState
        icon={ChartNoAxesCombined}
        title="No profit or loss totals yet"
        description="The chart will appear when your company records sales, purchases, or expenses."
      /> : <>
        <div className={styles.summary}>
          <span className={styles.summaryIcon}><ChartNoAxesCombined size={20} aria-hidden="true" /></span>
          <div><span>Gross profit less expenses</span><strong className={netAfterExpenses < 0 ? styles.negative : ''}>{formatCurrency(netAfterExpenses)}</strong></div>
        </div>
        <div className={styles.chart} role="img" aria-label={`Net profit ${formatCurrency(data[0].amount)}; net loss ${formatCurrency(data[1].amount)}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, bottom: 8, left: 4 }} barCategoryGap="34%">
              <CartesianGrid horizontal={false} stroke={theme.grid} strokeDasharray="4 5" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} tick={{ fill: theme.text, fontSize: 14 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={78} tick={<ResultAxisTick />} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatValue={formatCurrency} />} cursor={false} position={{ x: 8, y: 4 }} wrapperStyle={{ pointerEvents: 'none' }} />
              <Legend verticalAlign="top" align="right" content={() => (
                <div className={styles.legend}>
                  <span><i className={styles.profitDot} />Net profit</span>
                  <span><i className={styles.lossDot} />Net loss</span>
                </div>
              )} />
              <Bar dataKey="amount" name="Net result" radius={[0, 7, 7, 0]} maxBarSize={30} animationDuration={700} animationEasing="ease-out">
                {data.map((entry) => <Cell key={entry.name} fill={entry.tone === 'loss' ? theme.danger : theme.success} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className={styles.note}>This is a current total, not a time trend. The dashboard API does not provide dated profit and loss values.</p>
      </>}
    </Card>
  );
}
