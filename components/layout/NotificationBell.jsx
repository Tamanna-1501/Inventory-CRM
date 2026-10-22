'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/features/email/hooks/useNotifications';
import { useToast } from '@/context/ToastContext';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const { items, unread, markAllRead } = useNotifications();
  const notify = useToast();
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape); };
  }, [open]);
  async function handleRead() {
    try { await markAllRead(); }
    catch (error) { notify({ variant: 'danger', title: 'Could not update notifications', message: error.message }); }
  }
  return <div className={styles.root} ref={rootRef}>
    <button type="button" className={styles.trigger} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <Bell size={20} strokeWidth={1.9} />{unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
    </button>
    {open && <section className={styles.popover} aria-label="Notifications">
      <header className={styles.header}><strong>Notifications</strong><button type="button" onClick={handleRead} disabled={!unread}><CheckCheck size={16} />Mark all read</button></header>
      <div className={styles.list}>
        {!items.length && <p className={styles.empty}>You’re all caught up.</p>}
        {items.map((item) => <Link key={item.id} href={item.link || '#'} onClick={() => setOpen(false)} className={`${styles.item} ${item.isRead ? '' : styles.unread}`}>
          <strong>{item.title}</strong><span>{item.message}</span><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
        </Link>)}
      </div>
    </section>}
  </div>;
}
