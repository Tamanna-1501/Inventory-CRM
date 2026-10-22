import Link from 'next/link';
import { Card,PageHeader } from '@/components/ui';
import styles from './AdminToolsHomePage.module.css';
export default function AdminToolsHomePage(){return <div className={styles.page}><PageHeader title="Administrative Tools" description="Manage company configuration, backups, audit activity, and roles."/><div className={styles.grid}><Link href="/administrative-tools/settings"><Card title="Settings" description="Configure company preferences."/></Link><Link href="/administrative-tools/settings/role-permission"><Card title="Role Permissions" description="Edit access for company roles."/></Link><Link href="/administrative-tools/audit-log"><Card title="Audit Log" description="Review company activity and changes."/></Link></div></div>;}
