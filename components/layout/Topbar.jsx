'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import NotificationBell from './NotificationBell';
import MailLink from './MailLink';
import ProfileMenu from './ProfileMenu';
import styles from './Topbar.module.css';

function currentLabel(pathname) {
  const last = pathname.split('/').filter(Boolean).at(-1) || 'Dashboard';
  return last.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function Topbar({ onOpenMenu, menuOpen = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = usePreferences();

  useEffect(() => {
    function openSearch(event) {
      if (!user?.isSuperAdmin && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        router.push('/search');
      }
    }
    window.addEventListener('keydown', openSearch);
    return () => window.removeEventListener('keydown', openSearch);
  }, [router, user?.isSuperAdmin]);

  return <header className={styles.topbar}>
    <div className={styles.leading}>
      <button type="button" className={styles.menuButton} onClick={onOpenMenu} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="main-sidebar"><Menu size={22} /></button>
      <div className={styles.heading}><span>{user?.isSuperAdmin ? 'Super Admin' : user?.company?.name || 'Workspace'}</span><h1>{t(currentLabel(pathname))}</h1></div>
    </div>
    <div className={styles.actions}>
      {!user?.isSuperAdmin && <button type="button" className={styles.search} aria-label="Open global search" onClick={() => router.push('/search')}><Search size={18} aria-hidden="true" /><span>{t('Search')}</span><kbd>Ctrl K</kbd></button>}
      <NotificationBell />
      <MailLink />
      <ProfileMenu />
    </div>
  </header>;
}
