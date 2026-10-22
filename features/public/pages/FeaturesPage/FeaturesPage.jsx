import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Boxes, ClipboardList, CreditCard, Truck, Users, Warehouse } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import PublicCta from '@/features/public/components/PublicCta';
import styles from './FeaturesPage.module.css';

const FEATURE_GROUPS = [
  { icon: Boxes, image: '/images/stock-control.jpg', imageAlt: 'Boxes and inventory tools arranged for stock control', label: '01 - Inventory and stock', caption: 'Inventory and stock', title: 'Know what is in stock and where it is.', description: 'Organize your catalog and keep stock changes connected to the work that caused them.', points: ['Products with categories, brands, and units', 'Barcode generation and stock adjustments', 'Per-warehouse stock tracking'] },
  { icon: CreditCard, image: '/images/pos-software.jpg', imageAlt: 'Point of sale equipment and sales software display', label: '02 - Sales and POS', caption: 'Sales and POS', title: 'Keep sales, payments, and invoices together.', description: 'Record sales through the sales workflow or POS, then follow payment and invoice details.', points: ['New sales and point of sale', 'Sales lists and invoices', 'Payment records and sales returns'] },
  { icon: Truck, image: '/images/purchase-returns.jpg', imageAlt: 'Purchase and returns management', label: '03 - Purchases and returns', caption: 'Purchases and returns', title: 'Track incoming goods and supplier payments.', description: 'Manage purchases and their payments while keeping purchase returns linked to the original records.', points: ['Add and manage purchases', 'Supplier payment records', 'Purchase returns'] },
  { icon: ClipboardList, image: '/images/expense-people.jpg', imageAlt: 'Expense records and business contacts', label: '04 - Expenses and people', caption: 'Expenses and people', title: 'Keep operating costs and business contacts organized.', description: 'Maintain expense records alongside the customers, suppliers, and billers used in day-to-day operations.', points: ['Expenses and expense categories', 'Customer and supplier records', 'Biller records'] },
  { icon: Warehouse, image: '/images/transfer-report.jpg', imageAlt: 'Warehouse transfer and business reporting', label: '05 - Transfers and reporting', caption: 'Transfers and reporting', title: 'Move stock between locations and review activity.', description: 'Record warehouse transfers and use reports to review business activity and export results.', points: ['Warehouse-to-warehouse transfers', 'Excel transfer import and export', 'Reports with PDF and Excel export'] },
  { icon: Users, image: '/images/team-access.jpg', imageAlt: 'Team members and role-based access', label: '06 - Teams and access', caption: 'Teams and access', title: 'Give team members access that matches their role.', description: 'Manage users and role permissions within company workspaces, with separate company data boundaries.', points: ['Role permission management', 'Company-scoped user management', 'Multi-company workspaces and Super Admin panel'] },
];

export default function FeaturesPage() {
  return (
    <PublicLayout>
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="features-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>INVENTUAL FEATURES</p>
            <h1 id="features-title">Everyday inventory work, connected.</h1>
            <p className={styles.lead}>Explore the tools available in Inventual for products, stock, trading, teams, and reporting.</p>
            <Link href="/register" className={styles.heroLink}>Create your workspace <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <div className={styles.heroArt}>
            <Image src="/images/inventory-features-hero.jpg" alt="Inventory stock control overview showing tracking, barcoding, stock levels, and reporting" fill priority sizes="(max-width: 760px) 100vw, 42vw" className={styles.heroImage} />
            <span className={styles.heroArtLabel}><Boxes size={17} aria-hidden="true" /> Inventory, connected</span>
          </div>
        </section>
        <section className={styles.features} aria-label="Product features">
          {FEATURE_GROUPS.map(({ icon: Icon, image, imageAlt, label, caption, title, description, points }, index) => (
            <article className={`${styles.featureRow} ${index % 2 ? styles.reverse : ''}`} key={label}>
              <div className={`${styles.visual} ${image ? styles.visualWithImage : ''}`}>
                {image ? <Image src={image} alt={imageAlt} fill sizes="(max-width: 760px) 100vw, 42vw" className={styles.featureImage} /> : <span className={styles.visualIcon} aria-hidden="true"><Icon size={34} strokeWidth={1.7} /></span>}
                <span className={styles.visualNumber}>0{index + 1}</span><span className={styles.visualCaption}>{caption}</span>
              </div>
              <div className={styles.featureCopy}><p className={styles.featureLabel}>{label}</p><h2>{title}</h2><p className={styles.description}>{description}</p><ul>{points.map((point) => <li key={point}>{point}</li>)}</ul></div>
            </article>
          ))}
        </section>
        <PublicCta />
      </div>
    </PublicLayout>
  );
}
