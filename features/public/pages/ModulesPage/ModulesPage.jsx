import Image from 'next/image';
import { Boxes, ChartNoAxesCombined, ClipboardList, CreditCard, Mail, Settings2, Truck, Users, Warehouse } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import PublicCta from '@/features/public/components/PublicCta';
import styles from './ModulesPage.module.css';

const MODULES = [
  { icon: Boxes, title: 'Products', description: 'Maintain the product catalog and organize products for stock management.', pages: ['Add Product', 'Product List', 'Category', 'Brand', 'Unit/Value', 'Generate Barcode', 'Adjustments'] },
  { icon: CreditCard, title: 'Trading', description: 'Manage sales and purchases with their invoices, payments, and returns.', pages: ['New Sales', 'POS Sales', 'Sales List', 'Sales Returns', 'Add Purchase', 'Manage Purchase', 'Purchase Returns', 'Invoice Billing'] },
  { icon: ClipboardList, title: 'Expense', description: 'Record company expenses and organize them by category.', pages: ['Add Expense', 'Expense List', 'Expense Category', 'Payment Expense'] },
  { icon: Users, title: 'People', description: 'Keep customer, supplier, and biller records together.', pages: ['Add Customer', 'Customer List', 'Add Supplier', 'Supplier List', 'Add Biller', 'Biller List'] },
  { icon: Truck, title: 'Transfer', description: 'Move stock between warehouses and manage transfer records.', pages: ['Add Transfer', 'Transfer List', 'Excel Import/Export'] },
  { icon: Warehouse, title: 'Warehouse', description: 'Manage warehouse locations and their inventory.', pages: ['Warehouse List', 'Per-warehouse Stock'] },
  { icon: ChartNoAxesCombined, title: 'Reports', description: 'Review business records and export report data.', pages: ['Sales', 'Purchase', 'Payment', 'Product', 'Stock', 'Expense', 'User', 'Customer', 'Supplier', 'Warehouse', 'Tax', 'Shipping Charge', 'Discount'] },
  { icon: Users, title: 'User Management', description: 'Manage company users and the roles that define their access.', pages: ['Add User', 'User List', 'Create Role'] },
  { icon: Settings2, title: 'Administrative Tools', description: 'Review administrative activity and manage role permissions.', pages: ['Role Permission', 'Audit Log', 'Company Settings'] },
  { icon: Mail, title: 'Internal Mail', description: 'Send and receive messages inside your company workspace.', pages: ['Internal Mail'] },
];

export default function ModulesPage() {
  return (
    <PublicLayout>
      <div className={styles.page}>
        <section className={styles.hero} aria-labelledby="modules-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>A PLACE FOR EVERY WORKFLOW</p>
            <h1 id="modules-title">Explore the Inventual modules.</h1>
            <p className={styles.lead}>Use connected tools for inventory, trading, people, and reporting from one company workspace.</p>
          </div>
          <div className={styles.heroImageFrame}>
            <Image
              src="/images/modules-hero.jpg"
              alt="Warehouse team member reviewing inventory stock on a display"
              width={900}
              height={1350}
              priority
              sizes="(max-width: 760px) 100vw, 42vw"
              className={styles.heroImage}
            />
            <span className={styles.imageCaption}>Inventory workflows</span>
          </div>
        </section>
        <section className={styles.moduleSection} aria-label="Inventual modules">
          <div className={styles.grid}>
            {MODULES.map(({ icon: Icon, title, description, pages }, index) => (
              <article className={styles.card} key={title}>
                <div className={styles.cardTop}><span className={styles.icon}><Icon size={23} strokeWidth={1.8} aria-hidden="true" /></span><span className={styles.number}>MODULE 0{index + 1}</span></div>
                <h2>{title}</h2>
                <p className={styles.description}>{description}</p>
                <div className={styles.pageList} aria-label={`${title} pages`}>
                  {pages.map((page) => <span className={styles.pageTag} key={page}>{page}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>
        <PublicCta />
      </div>
    </PublicLayout>
  );
}
