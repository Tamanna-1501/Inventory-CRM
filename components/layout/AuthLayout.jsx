import Link from 'next/link';
import { Boxes, ChartNoAxesCombined, ShieldCheck, Warehouse } from 'lucide-react';
import styles from './AuthLayout.module.css';

const highlights = [
  { icon: Boxes, label: 'Products, stock, and daily operations' },
  { icon: Warehouse, label: 'Warehouses and connected transfers' },
  { icon: ChartNoAxesCombined, label: 'Sales, purchasing, and reports' },
];

export default function AuthLayout({ children, eyebrow = 'INVENTORY, IN FOCUS' }) {
  return <main className={styles.layout}>
    <section className={styles.brandPanel}>
      <Link href="/" className={styles.brand}><span className={styles.brandMark}>I</span><span>inventual</span></Link>
      <div className={styles.pitch}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1>Keep your business moving.</h1>
        <p>Bring inventory, trading, and your team together in one clear workspace.</p>
        <ul>{highlights.map(({ icon: Icon, label }) => <li key={label}><Icon size={20} aria-hidden="true" /><span>{label}</span></li>)}</ul>
      </div>
      <div className={styles.panelFooter}><ShieldCheck size={18} aria-hidden="true" /><span>Private workspaces with role-based access</span></div>
      <div className={styles.orb} aria-hidden="true" />
    </section>
    <section className={styles.formPanel}>
      <div className={styles.mobileBrand}><Link href="/" className={styles.brand}><span className={styles.brandMark}>I</span><span>inventual</span></Link></div>
      <div className={styles.authCard}>{children}</div>
      <p className={styles.legal}>Copyright {new Date().getFullYear()} Inventual - Inventory and trading management</p>
    </section>
  </main>;
}
