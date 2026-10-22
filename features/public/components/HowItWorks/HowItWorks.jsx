import { ArrowRight, Boxes, Building2, ShoppingCart } from 'lucide-react';
import styles from './HowItWorks.module.css';

const STEPS = [
  { icon: Building2, title: 'Register your company', text: 'Create a private company workspace and its administrator account.' },
  { icon: Boxes, title: 'Add products and warehouses', text: 'Set up your catalog and the locations where stock is managed.' },
  { icon: ShoppingCart, title: 'Start selling and track stock', text: 'Record sales, purchases, and transfers as your stock changes.' },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="how-it-works-title">
      <div className={styles.intro}><p className={styles.eyebrow}>A STRAIGHTFORWARD START</p><h2 id="how-it-works-title">Set up your workspace in three steps.</h2></div>
      <div className={styles.steps}>{STEPS.map(({ icon: Icon, title, text }, index) => <article className={styles.step} key={title}><div className={styles.stepTop}><span className={styles.icon}><Icon size={22} aria-hidden="true" /></span><span className={styles.number}>STEP 0{index + 1}</span></div><h3>{title}</h3><p>{text}</p>{index < STEPS.length - 1 && <ArrowRight className={styles.connector} size={22} aria-hidden="true" />}</article>)}</div>
    </section>
  );
}
