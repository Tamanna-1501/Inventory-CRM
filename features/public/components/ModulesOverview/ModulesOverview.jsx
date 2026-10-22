import Link from 'next/link';
import { ArrowRight, Boxes, ChartNoAxesCombined, ContactRound, CreditCard, Warehouse } from 'lucide-react';
import styles from './ModulesOverview.module.css';

const MODULES = [
  { icon: Boxes, label: 'Products' },
  { icon: CreditCard, label: 'Sales & POS' },
  { icon: CreditCard, label: 'Purchases' },
  { icon: Warehouse, label: 'Warehouses & transfers' },
  { icon: ContactRound, label: 'People & expenses' },
  { icon: ChartNoAxesCombined, label: 'Reports' },
];

export default function ModulesOverview() {
  return (
    <section className={styles.section} aria-labelledby="modules-overview-title">
      <div className={styles.content}><div><p className={styles.eyebrow}>ONE PLACE FOR THE WHOLE FLOW</p><h2 id="modules-overview-title">From receiving stock to completing a sale.</h2><p>Move through your daily inventory and trading work with records that stay connected.</p></div>
        <div className={styles.list}>{MODULES.map(({ icon: Icon, label }, index) => <div className={styles.row} key={label}><span className={styles.number}>0{index + 1}</span><span className={styles.icon}><Icon size={18} aria-hidden="true" /></span><strong>{label}</strong><ArrowRight size={17} className={styles.arrow} aria-hidden="true" /></div>)}</div>
      </div>
      <Link className={styles.link} href="/modules">Explore all modules <ArrowRight size={17} aria-hidden="true" /></Link>
    </section>
  );
}
