'use client';
import CatalogPage from '@/features/products/pages/CatalogPage';
import styles from './BrandPage.module.css';
export default function BrandPage() { return <div className={styles.page}><CatalogPage kind="brand" /></div>; }
