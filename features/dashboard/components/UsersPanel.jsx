import { Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import styles from './UsersPanel.module.css';

function lastLogin(value) {
  if (!value) return 'No sign-in recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sign-in date unavailable' : `Last sign-in ${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
}

export default function UsersPanel({ users = [] }) {
  return (
    <Card title="Team members" description="Recently added users and their assigned roles." className={styles.dashboardCard}>
      {users.length ? (
        <ul className={styles.list}>
          {users.slice(0, 5).map((member) => {
            const label = member.name || member.email || 'Team member';
            return (
              <li className={styles.user} key={member.id}>
                <span className={styles.avatar} aria-hidden="true">{label.slice(0, 1).toUpperCase()}</span>
                <span className={styles.identity}><strong>{label}</strong><span>{member.email}</span></span>
                <span className={styles.details}><strong>{member.role?.name || 'STAFF'}</strong><span>{lastLogin(member.lastLoginAt)}</span></span>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={Users} title="No team members yet" description="Company users will appear here." />
      )}
    </Card>
  );
}
