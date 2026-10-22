import { Inbox } from 'lucide-react';
import styles from './EmptyState.module.css';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action, className = '' }) {
  return <div className={`${styles.empty} ${className}`.trim()}><span className={styles.icon}><Icon size={26} strokeWidth={1.7} /></span><h2>{title}</h2>{description && <p>{description}</p>}{action && <div className={styles.action}>{action}</div>}</div>;
}
