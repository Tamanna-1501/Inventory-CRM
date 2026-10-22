'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import styles from './ProfileMenu.module.css';

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();
  const notify = useToast();
  const { logout, busy } = useAuthActions();
  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const handleKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', handlePointer); document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('pointerdown', handlePointer); document.removeEventListener('keydown', handleKey); };
  }, [open]);
  async function handleLogout() {
    try { await logout(); router.replace('/login'); }
    catch (error) { notify({ variant: 'danger', title: 'Sign out failed', message: error.message }); }
  }
  const name = user?.name || user?.email || 'Account';
  const initials = name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  return <div className={styles.root} ref={rootRef}>
    <button type="button" className={styles.trigger} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
      <span className={styles.avatar} aria-hidden="true">{initials || 'U'}</span><span className={styles.identity}><strong>{name}</strong><small>{user?.role || (user?.isSuperAdmin ? 'SUPER ADMIN' : 'User')}</small></span><ChevronDown size={17} aria-hidden="true" />
    </button>
    {open && <div className={styles.menu} role="menu"><div className={styles.menuIdentity}><UserRound size={18} /><span>{user?.email || name}</span></div><button type="button" role="menuitem" onClick={handleLogout} disabled={busy}><LogOut size={18} />{busy ? 'Signing out…' : 'Sign out'}</button></div>}
  </div>;
}
