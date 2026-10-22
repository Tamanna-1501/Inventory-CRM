import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './PublicFooter.module.css';

const LINK_GROUPS = [
  { title: 'Explore', links: [{ href: '/features', label: 'Features' }, { href: '/modules', label: 'Modules' }, { href: '/about', label: 'About' }] },
  { title: 'Workspace', links: [{ href: '/login', label: 'Sign in' }, { href: '/register', label: 'Create company account' }] },
];

const CAPABILITIES = [
  'Product catalog and barcode tools',
  'Warehouse stock and transfers',
  'Sales, purchases, and returns',
  'Reports with PDF and Excel exports',
];

const SAMPLE_CONTACT = [
  { label: 'Email', value: 'support@example.com', href: 'mailto:support@example.com' },
  { label: 'Phone', value: '+1 (202) 555-0142', href: 'tel:+12025550142' },
];

export default function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandBlock}>
          <Link href="/" className={styles.brand}>Inventual</Link>
          <p>Inventory, sales, and warehouse work in one connected workspace.</p>
        </div>
        {LINK_GROUPS.map(({ title, links }) => (
          <nav className={styles.linkGroup} aria-label={`${title} links`} key={title}>
            <h2>{title}</h2>
            {links.map(({ href, label }) => <Link href={href} key={href}>{label}</Link>)}
          </nav>
        ))}
        <div className={styles.capabilities}>
          <h2>Inventory tools</h2>
          <ul>{CAPABILITIES.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className={styles.contact}>
          <h2>Sample contact details</h2>
          <p>Demo values — replace before launch.</p>
          {SAMPLE_CONTACT.map(({ label, value, href }) => <a href={href} key={label}><span>{label}</span>{value}</a>)}
        </div>
        <div className={styles.bottom}>
          <span>© {new Date().getFullYear()} Inventual · Inventory and trading management</span>
          <Link href="/register">Create your workspace <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
    </footer>
  );
}
