import PublicNavbar from '../PublicNavbar';
import PublicFooter from '../PublicFooter';
import styles from './PublicLayout.module.css';

export default function PublicLayout({ children }) {
  return <div className={styles.layout}><PublicNavbar /><main>{children}</main><PublicFooter /></div>;
}
