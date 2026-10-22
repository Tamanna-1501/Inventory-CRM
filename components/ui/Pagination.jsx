'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export default function Pagination({ page, pageCount, onPageChange, itemCount, pageSize, label = 'Table pagination' }) {
  const safePages = Math.max(1, pageCount || 1);
  const start = itemCount ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, itemCount || 0);
  return <nav className={styles.pagination} aria-label={label}><span className={styles.summary}>Showing {start}–{end} of {itemCount || 0}</span><div className={styles.controls}><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}><ChevronLeft size={18} /></button><span aria-current="page">Page {page} of {safePages}</span><button type="button" aria-label="Next page" disabled={page >= safePages} onClick={() => onPageChange(Math.min(safePages, page + 1))}><ChevronRight size={18} /></button></div></nav>;
}
