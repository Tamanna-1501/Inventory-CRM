'use client';

import { Boxes, ChartNoAxesCombined, CircleDollarSign, RotateCcw, ShoppingCart, Warehouse } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './StatsGrid.module.css';

export default function StatsGrid({ metrics = {} }) {
  const { formatCurrency } = usePreferences();
  const stats = [
    { label: 'Total expense', value: formatCurrency(Number(metrics.totalExpense || 0)), icon: CircleDollarSign, tone: 'price' },
    { label: 'Gross profit', value: formatCurrency(Number(metrics.grossProfit || 0)), icon: ChartNoAxesCombined, tone: Number(metrics.grossProfit || 0) < 0 ? 'price' : 'brand' },
    { label: 'Closing stock', value: Number(metrics.closingStock || 0).toLocaleString(), icon: Boxes, tone: 'navy' },
    { label: 'Warehouses', value: Number(metrics.warehouseCount || 0).toLocaleString(), icon: Warehouse, tone: 'star' },
    { label: 'Sales returns', value: formatCurrency(Number(metrics.salesReturns || 0)), icon: RotateCcw, tone: 'price' },
    { label: 'Purchase returns', value: formatCurrency(Number(metrics.purchaseReturns || 0)), icon: ShoppingCart, tone: 'success' },
  ];

  return (
    <section className={styles.grid} aria-label="Company metrics">
      {stats.map((stat) => <StatCard key={stat.label} {...stat} className={styles.stat} />)}
    </section>
  );
}
