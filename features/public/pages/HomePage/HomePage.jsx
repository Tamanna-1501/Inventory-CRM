import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import FeatureHighlights from '../../components/FeatureHighlights';
import ModulesOverview from '../../components/ModulesOverview';
import HowItWorks from '../../components/HowItWorks';
import PublicCta from '../../components/PublicCta';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <PublicLayout>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.copy}>
          <p className={styles.badge}><span aria-hidden="true" /> Inventory, sales &amp; warehouse management</p>
          <h1 id="home-title">Run your inventory with <em>more clarity.</em></h1>
          <p className={styles.description}>Bring products, stock, sales, purchases, and your team into one calm, connected workspace.</p>
          <div className={styles.actions}><Link href="/register" className={styles.primary}>Get started <ArrowRight size={18} aria-hidden="true" /></Link><Link href="/login" className={styles.secondary}>Sign in to your workspace</Link></div>
          <p className={styles.privacy}><ShieldCheck size={18} aria-hidden="true" /> Separate company workspaces with role-based access</p>
        </div>
        <div className={styles.visual}>
          <div className={styles.glow} aria-hidden="true" />
          <Image
            className={styles.image}
            src="/images/inventory-management.jpg"
            alt="A warehouse team member reviewing inventory on a computer"
            width={1000}
            height={750}
            priority
            sizes="(max-width: 760px) 100vw, (max-width: 1100px) 48vw, 600px"
          />
          <div className={styles.imageCaption}><span className={styles.captionIcon}><ShieldCheck size={18} aria-hidden="true" /></span><span><strong>One connected workspace</strong><small>Inventory · sales · team</small></span></div>
        </div>
      </section>
      <FeatureHighlights />
      <ModulesOverview />
      <HowItWorks />
      <PublicCta />
    </PublicLayout>
  );
}
