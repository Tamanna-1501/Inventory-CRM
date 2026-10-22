'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, Boxes, LogOut, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useToast } from '@/context/ToastContext';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { COMPANY_MENU, SUPER_ADMIN_MENU } from '@/constants/menu';
import Button from '@/components/ui/Button';
import styles from './Sidebar.module.css';

function routeActive(pathname, href) { return pathname === href.split('?')[0] || (href.split('?')[0] !== '/dashboard' && pathname.startsWith(`${href.split('?')[0]}/`)); }

function MenuBranch({ item, pathname, canPath, t, depth = 0, onNavigate, openRoot, onRootToggle }) {
  const activeChild = item.children?.some((child) => child.href ? routeActive(pathname, child.href) : child.children?.some((sub) => routeActive(pathname, sub.href)));
  const [nestedOpen, setNestedOpen] = useState(Boolean(activeChild));
  if (item.children) {
    const children = item.children.filter((child) => child.children ? child.children.some((sub) => canPath(sub.href.split('?')[0])) : canPath(child.href.split('?')[0]));
    if (!children.length) return null;
    const Icon = item.icon;
    const open = depth === 0 ? openRoot === item.label : nestedOpen;
    return <div className={styles.group}>
      <button type="button" className={`${styles.groupButton} ${activeChild ? styles.groupActive : ''}`} aria-expanded={open} onClick={() => depth === 0 ? onRootToggle(item.label) : setNestedOpen((value) => !value)}>
        {Icon && <Icon size={19} aria-hidden="true" />}<span>{t(item.label)}</span><ChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} size={17} aria-hidden="true" />
      </button>
      {open && <div className={styles.children}>{children.map((child) => <MenuBranch key={child.label} item={child} pathname={pathname} canPath={canPath} t={t} depth={depth + 1} onNavigate={onNavigate} openRoot={openRoot} onRootToggle={onRootToggle} />)}</div>}
    </div>;
  }
  if (!canPath(item.href.split('?')[0])) return null;
  const active = routeActive(pathname, item.href);
  const Icon = item.icon;
  return <Link href={item.href} onClick={onNavigate} className={`${styles.link} ${depth ? styles.childLink : ''} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
    {Icon ? <Icon size={19} aria-hidden="true" /> : depth === 0 ? <Boxes size={19} aria-hidden="true" /> : <span className={styles.bullet} aria-hidden="true" />}<span>{t(item.label)}</span>
  </Link>;
}

function SidebarNavigation({ menu, pathname, canPath, t, onNavigate }) {
  const activeRoot = menu.find((item) => item.children?.some((child) => child.href
    ? routeActive(pathname, child.href)
    : child.children?.some((sub) => routeActive(pathname, sub.href))))?.label || null;
  const [openRoot, setOpenRoot] = useState(activeRoot);
  return <nav className={styles.navigation} aria-label="Workspace navigation">
    {menu.map((item) => <MenuBranch key={item.label} item={item} pathname={pathname} canPath={canPath} t={t} onNavigate={onNavigate} openRoot={openRoot} onRootToggle={(label) => setOpenRoot((current) => current === label ? null : label)} />)}
  </nav>;
}

export default function Sidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { user, canPath } = useAuth();
  const { t } = usePreferences();
  const notify = useToast();
  const { logout, busy } = useAuthActions();
  const menu = user?.isSuperAdmin ? SUPER_ADMIN_MENU : COMPANY_MENU;

  async function handleLogout() {
    try { await logout(); window.location.assign('/login'); }
    catch (error) { notify({ variant: 'danger', title: 'Sign out failed', message: error.message }); }
  }

  return <>
    <aside id="main-sidebar" className={`${styles.sidebar} ${open ? styles.open : ''}`} aria-label="Main sidebar">
      <div className={styles.brandRow}><Link className={styles.brand} href={user?.isSuperAdmin ? '/super-admin/dashboard' : '/dashboard'} onClick={onClose}><span className={styles.brandMark}>I</span><span>inventual</span></Link><button type="button" className={styles.closeDrawer} onClick={onClose} aria-label="Close navigation"><X size={21} /></button></div>
      {user?.isSuperAdmin && <div className={styles.adminLabel}>SUPER ADMIN</div>}
      {!user?.isSuperAdmin && user?.company?.name && <div className={styles.companyLabel} title={user.company.name}>{user.company.name}</div>}
      <SidebarNavigation key={pathname} menu={menu} pathname={pathname} canPath={canPath} t={t} onNavigate={onClose} />
      <div className={styles.sidebarFooter}><Button variant="ghost" className={styles.logout} leadingIcon={<LogOut size={18} />} loading={busy} onClick={handleLogout}>Sign out</Button></div>
    </aside>
  </>;
}
