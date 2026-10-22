'use client';

import { Info, CircleCheck, TriangleAlert, CircleX } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import styles from './NoticeDialog.module.css';

const ICONS = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleX };

export default function NoticeDialog({ open, onClose, title = 'Notice', message, variant = 'info', closeLabel = 'Got it' }) {
  const Icon = ICONS[variant] || ICONS.info;
  return <Modal open={open} onClose={onClose} title={title} size="sm" footer={<Button onClick={onClose}>{closeLabel}</Button>}><div className={styles.notice}><span className={`${styles.icon} ${styles[variant] || styles.info}`}><Icon size={22} /></span><p>{message}</p></div></Modal>;
}
