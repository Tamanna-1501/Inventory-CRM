import { PackageSearch } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import styles from './TopSellers.module.css';

export default function TopSellers() {
  return (
    <Card title="Top sellers" description="Top 5 products by units sold">
      <div className={styles.unavailable}><EmptyState
        icon={PackageSearch}
        title="Seller totals unavailable"
        description="The dashboard API returns recently added products, but not products ranked by sales quantity or amount."
      /></div>
    </Card>
  );
}
