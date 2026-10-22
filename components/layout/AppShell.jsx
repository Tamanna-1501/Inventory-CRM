'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './AppShell.module.css';

const PUBLIC_PAGES = ['/', '/login', '/register', '/unauthorized', '/ui-guide', '/features', '/modules', '/about'];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, canPath } = useAuth();
  const { stopImpersonation } = useAuthActions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState('');
  const isPublic = PUBLIC_PAGES.includes(pathname);
  const allowed = isPublic || canPath(pathname);

  useEffect(() => {
    const savedMode = localStorage.getItem('app_theme');
    const savedBackground = localStorage.getItem('app_bg_color');
    const oldNeutralBackgrounds = new Set(['#f0f4ef', '#f9fafb', '#f0f0ef', '#f4f0ec', '#070807']);
    if (savedMode === 'light' || savedMode === 'dark') {
      document.documentElement.classList.toggle('dark', savedMode === 'dark');
    }
    if (savedBackground && /^#[\da-f]{6}$/i.test(savedBackground)) {
      const background = oldNeutralBackgrounds.has(savedBackground.toLowerCase())
        ? getComputedStyle(document.documentElement).getPropertyValue('--color-white').trim()
        : savedBackground;
      document.documentElement.style.setProperty('--app-bg', background);
      if (background !== savedBackground) localStorage.setItem('app_bg_color', background);
    }
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    if (loading) return;
    if (pathname === '/login' && user) { router.replace(user.isSuperAdmin ? '/super-admin/dashboard' : '/dashboard'); return; }
    if (isPublic) return;
    if (!user) router.replace('/login');
    else if (user.isSuperAdmin && !pathname.startsWith('/super-admin')) router.replace('/super-admin/dashboard');
    else if (!user.isSuperAdmin && pathname.startsWith('/super-admin')) router.replace('/unauthorized');
    else if (!allowed) router.replace('/unauthorized');
  }, [isPublic, loading, user, allowed, router, pathname]);

  async function endImpersonation() {
    setEnding(true); setEndError('');
    try {
      const data = await stopImpersonation();
      window.location.assign(data.redirectTo || '/super-admin/dashboard');
    } catch (error) { setEndError(error.message || 'Unable to end impersonation'); setEnding(false); }
  }

  if (isPublic) return <>{children}</>;
  if (loading || !user || !allowed) return <div className={styles.loading} role="status">Loading workspace...</div>;

  return (
    <div className={`${styles.shell} ${user.isImpersonating ? styles.withBanner : ''}`}>
      {user.isImpersonating && <div className={styles.impersonation} role="status">
        <span>Super Admin impersonation: {user.impersonator?.name || user.impersonator?.email || 'Super Admin'} viewing {user.company?.name || 'company'} as {user.name || user.email}.</span>
        {endError && <span role="alert">{endError}</span>}
        <button type="button" disabled={ending} onClick={endImpersonation}>{ending ? 'Ending...' : 'End impersonation'}</button>
      </div>}
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {drawerOpen && <button className={styles.scrim} type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} />}
      <div className={styles.mainColumn}>
        <Topbar menuOpen={drawerOpen} onOpenMenu={() => setDrawerOpen((value) => !value)} />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
