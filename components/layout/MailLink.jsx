'use client';

import Link from 'next/link';
import { Mail } from 'lucide-react';
import { useUnreadMail } from '@/features/email/hooks/useNotifications';
import styles from './MailLink.module.css';

export default function MailLink() {
  const unread = useUnreadMail();
  return <Link href="/email" className={styles.link} aria-label={`Internal mail${unread ? `, ${unread} unread` : ''}`} title="Internal mail">
    <Mail size={20} strokeWidth={1.9} />{unread > 0 && <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>}
  </Link>;
}
