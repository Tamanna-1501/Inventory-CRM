import { Barcode, Boxes, ChartNoAxesCombined, ClipboardCheck, ContactRound, ShieldCheck } from 'lucide-react';
import styles from './FeatureHighlights.module.css';

const ITEMS = [
  { icon: Boxes, title: 'Organized product catalog', text: 'Manage products with categories, brands, units, barcode generation, and stock adjustments.' },
  { icon: ClipboardCheck, title: 'Warehouse stock control', text: 'Track stock by warehouse and record transfers between locations.' },
  { icon: Barcode, title: 'Sales and POS', text: 'Create sales, work at the point of sale, and keep invoices and payments connected.' },
  { icon: ContactRound, title: 'Purchases and returns', text: 'Manage purchases, supplier payments, and purchase or sales returns.' },
  { icon: ChartNoAxesCombined, title: 'Expenses and reports', text: 'Record expenses and review business reports with PDF and Excel exports.' },
  { icon: ShieldCheck, title: 'Teams and company access', text: 'Manage users and role permissions in company-isolated workspaces, with a separate Super Admin panel.' },
];

export default function FeatureHighlights() {
  return (
    <section className={styles.section} aria-labelledby="public-features-title">
      <div className={styles.intro}><p className={styles.eyebrow}>INVENTORY OPERATIONS, CONNECTED</p><h2 id="public-features-title">Everything your daily operations need.</h2><p>Keep important work connected without losing sight of what is happening across your business.</p></div>
      <div className={styles.grid}>{ITEMS.map(({ icon: Icon, title, text }, index) => <article className={styles.card} key={title}><span className={styles.icon}><Icon size={22} strokeWidth={1.9} aria-hidden="true" /></span><span className={styles.number}>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
  );
}
