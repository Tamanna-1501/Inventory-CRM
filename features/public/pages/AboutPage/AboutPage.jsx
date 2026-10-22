import { ArrowRight, Boxes, LockKeyhole, PackageCheck, ShieldCheck, UsersRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';
import PublicCta from '@/features/public/components/PublicCta';
import styles from './AboutPage.module.css';

const VALUES = [
  { icon: Boxes, title: 'Connected operations', text: 'Products, stock, sales, purchases, expenses, and reports share one company workspace.' },
  { icon: ShieldCheck, title: 'Role-based access', text: 'Company roles and permissions help teams use the parts of the workspace they need.' },
  { icon: PackageCheck, title: 'Clear stock records', text: 'Warehouse stock, transfers, and adjustments help make inventory changes traceable.' },
  { icon: UsersRound, title: 'Built for teams', text: 'Customer, supplier, biller, and staff records support routine business workflows.' },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>ABOUT INVENTUAL</p>
            <h1 id="about-title">A clearer way to manage inventory work.</h1>
            <p className={styles.lead}>Inventual brings inventory, trading, warehouse, and team workflows into one connected company workspace.</p>
          </div>
          <div className={styles.heroImageFrame}>
            <Image
              src="/images/about-hero.jpg"
              alt="A person using a laptop to review a business dashboard"
              width={900}
              height={1200}
              priority
              sizes="(max-width: 760px) 100vw, 38vw"
              className={styles.heroImage}
            />
          </div>
        </section>

        <section className={styles.story} aria-labelledby="story-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>WHAT INVENTUAL DOES</p>
            <h2 id="story-title">Keep the day-to-day flow in one place.</h2>
          </div>
          <div className={styles.storyCopy}>
            <p>Inventory work often touches several records: products, warehouses, purchases, sales, payments, returns, and reports. Inventual provides those workflows in one application so a company can manage them from its workspace.</p>
            <p>Teams can manage products and stock, record transactions, track contacts, review reports, and control access through role permissions. The product is designed around the features available in the application today.</p>
          </div>
        </section>

        <section className={styles.valuesSection} aria-labelledby="values-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>HOW THE WORKSPACE IS ORGANIZED</p>
            <h2 id="values-title">Tools designed around practical work.</h2>
          </div>
          <div className={styles.valuesGrid}>
            {VALUES.map(({ icon: Icon, title, text }, index) => (
              <article className={styles.valueCard} key={title}>
                <div className={styles.valueTop}><span className={styles.valueIcon}><Icon size={23} aria-hidden="true" /></span><span className={styles.valueNumber}>0{index + 1}</span></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.privacy} aria-labelledby="privacy-title">
          <div className={styles.privacyIcon}><LockKeyhole size={27} aria-hidden="true" /></div>
          <div>
            <p className={styles.eyebrow}>COMPANY WORKSPACES</p>
            <h2 id="privacy-title">Company data stays in its own workspace.</h2>
            <p>Inventual supports multiple companies in one application. Business records are scoped to their company, while the Super Admin area is separate from company workspaces.</p>
          </div>
        </section>

        <section className={styles.technology} aria-labelledby="technology-title">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>APPLICATION OVERVIEW</p>
            <h2 id="technology-title">A web application for inventory and trading.</h2>
            <p>Inventual is built with Next.js and React, uses Prisma with MySQL for data storage, and provides a browser-based interface for company teams.</p>
          </div>
          <Link className={styles.textLink} href="/features">Explore Inventual features <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
        <PublicCta />
      </div>
    </PublicLayout>
  );
}
