import { Boxes } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import styles from './StockAnalysis.module.css';

export default function StockAnalysis() {
  return (
    <Card title="Stock analysis" description="Opening and closing stock comparison.">
      <div className={styles.unavailable}><EmptyState
        icon={Boxes}
        title="Opening stock data unavailable"
        description="The dashboard API returns closing stock only. Opening stock by period is needed for this comparison."
      /></div>
    </Card>
  );
}
