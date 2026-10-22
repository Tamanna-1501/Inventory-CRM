'use client';

import Modal from './Modal';
import Button from './Button';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm action', description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', loading = false, variant = 'danger' }) {
  return <Modal open={open} onClose={loading ? undefined : onClose} title={title} size="sm" footer={<div className={styles.actions}><Button variant="secondary" disabled={loading} onClick={onClose}>{cancelLabel}</Button><Button variant={variant} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></div>}><p>{description}</p></Modal>;
}
