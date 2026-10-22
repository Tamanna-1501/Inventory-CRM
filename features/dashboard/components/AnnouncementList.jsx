'use client';

import { Megaphone } from 'lucide-react';
import { useCompanyAnnouncements } from '../hooks/useDashboard';
import styles from './AnnouncementList.module.css';

export default function AnnouncementList() {
  const items = useCompanyAnnouncements();
  if (!items.length) return null;
  return <section className={styles.list} aria-label="Company announcements">
    {items.map((item) => <article className={styles.card} key={item.id}>
      <span className={styles.icon}><Megaphone size={20} aria-hidden="true" /></span>
      <div className={styles.content}><div className={styles.heading}><h2>{item.title}</h2><time dateTime={item.startsAt}>{new Date(item.startsAt).toLocaleDateString()}</time></div><p>{item.body}</p></div>
    </article>)}
  </section>;
}
