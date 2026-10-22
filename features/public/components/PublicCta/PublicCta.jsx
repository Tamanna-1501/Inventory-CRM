import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './PublicCta.module.css';

export default function PublicCta() {
  return (
    <section className={styles.section} aria-labelledby="public-cta-title">
      <div className={styles.inner}><div><p className={styles.eyebrow}>READY TO GET STARTED?</p><h2 id="public-cta-title">Bring your inventory work into one place.</h2><p>Create a company workspace and organize your day-to-day operations.</p></div><Link href="/register" className={styles.button}>Create your workspace <ArrowRight size={18} aria-hidden="true" /></Link></div>
    </section>
  );
}
