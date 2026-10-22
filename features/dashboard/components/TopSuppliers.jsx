import { Truck } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import styles from './TopSuppliers.module.css';

export default function TopSuppliers() {
  return (
    <Card title="Top suppliers" description="Top 5 suppliers by purchase amount">
      <div className={styles.unavailable}><EmptyState
        icon={Truck}
        title="Supplier totals unavailable"
        description="The dashboard API returns recent purchases, but not supplier totals ranked by purchase amount."
      /></div>
    </Card>
  );
}
