'use client';

import { createPortal } from 'react-dom';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Toast from '@/components/ui/Toast';
import styles from './ToastContext.module.css';

const ToastContext = createContext(() => {});
let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dismiss = useCallback((id) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const notify = useCallback((notice) => {
    const id = ++nextId;
    setToasts((items) => [...items, { id, ...notice }]);
    window.setTimeout(() => dismiss(id), notice.duration || 4500);
  }, [dismiss]);
  return <ToastContext.Provider value={notify}>{children}{mounted && createPortal(<div className={styles.region} aria-label="Notifications" aria-live="polite">{toasts.map((toast) => <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />)}</div>, document.body)}</ToastContext.Provider>;
}

export function useToast() { return useContext(ToastContext); }
