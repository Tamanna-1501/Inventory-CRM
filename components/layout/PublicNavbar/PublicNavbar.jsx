'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';
import styles from './PublicNavbar.module.css';

const NAV_LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/modules', label: 'Modules' },
  { href: '/about', label: 'About' },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Inventual home">Inventual</Link>
        <button
          className={styles.menuToggle}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="public-navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return <Link key={href} href={href} className={active ? styles.active : ''} aria-current={active ? 'page' : undefined}>{label}</Link>;
          })}
          <div className={styles.mobileActions}>
            <Link className={styles.mobileSignIn} href="/login">Sign in</Link>
            <Link className={styles.mobileCta} href="/register">Create account <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </nav>
        <div className={styles.actions}>
          <Link href="/login" className={styles.signIn}>Sign in</Link>
          <Link href="/register" className={styles.cta}>Create account <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </header>
  );
}
