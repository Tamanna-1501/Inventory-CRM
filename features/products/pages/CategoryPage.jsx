'use client';
import CatalogPage from '@/features/products/pages/CatalogPage';
import styles from './CategoryPage.module.css';
export default function CategoryPage() { return <div className={styles.page}><CatalogPage kind="category" /></div>; }
