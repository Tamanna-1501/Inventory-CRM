'use client';

import { Children, isValidElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import { usePreferences } from '@/context/PreferencesContext';
import styles from './ActionMenu.module.css';

function textFromNode(node) {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).filter(Boolean).join(' ');
  if (isValidElement(node) && (typeof node.type === 'string' || node.type?.displayName === 'Button')) return textFromNode(node.props.children);
  return '';
}

export function getActionItems(node) {
  const items = [];
  function collect(value) {
    Children.forEach(value, (child) => {
      if (!isValidElement(child)) return;
      const props = child.props || {};
      if (typeof props.onClick === 'function') {
        items.push({
          key: child.key || props['aria-label'] || `action-${items.length}`,
          label: textFromNode(props.children).trim() || props['aria-label'] || 'Action',
          icon: props.leadingIcon || null,
          danger: props.variant === 'danger',
          disabled: props.disabled || props.loading,
          onSelect: (event) => props.onClick(event),
        });
      } else {
        collect(props.children);
      }
    });
  }
  collect(node);
  return items;
}

export default function ActionMenu({ items = [], actions, label = 'More actions', triggerText = 'Details' }) {
  const { t } = usePreferences();
  const derivedItems = useMemo(() => actions === undefined ? items : getActionItems(actions), [actions, items]);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 8, left: 8 });
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const placeMenu = useCallback(() => {
    const trigger = buttonRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    const rect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const margin = 8;
    const height = Math.min(menuRect.height, window.innerHeight - margin * 2);
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const placeAbove = spaceBelow < height + 6 && spaceAbove > spaceBelow;
    const rawTop = placeAbove ? rect.top - height - 4 : rect.bottom + 4;
    const left = Math.max(margin, Math.min(rect.right - menuRect.width, window.innerWidth - menuRect.width - margin));
    setPosition({ top: Math.max(margin, Math.min(rawTop, window.innerHeight - height - margin)), left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    placeMenu();
    window.addEventListener('resize', placeMenu);
    document.addEventListener('scroll', placeMenu, true);
    return () => { window.removeEventListener('resize', placeMenu); document.removeEventListener('scroll', placeMenu, true); };
  }, [open, derivedItems.length, placeMenu]);

  useEffect(() => {
    if (open) menuRef.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
    function handlePointer(event) { if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) setOpen(false); }
    function handleEscape(event) { if (event.key === 'Escape' && open) { setOpen(false); buttonRef.current?.focus(); } }
    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleEscape);
    return () => { document.removeEventListener('pointerdown', handlePointer); document.removeEventListener('keydown', handleEscape); };
  }, [open]);

  function handleMenuKey(event) {
    const buttons = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]:not(:disabled)') || []);
    const index = buttons.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      buttons[(index + direction + buttons.length) % buttons.length]?.focus();
    } else if (event.key === 'Home') { event.preventDefault(); buttons[0]?.focus(); }
    else if (event.key === 'End') { event.preventDefault(); buttons.at(-1)?.focus(); }
  }

  if (!derivedItems.length) return null;
  return <div className={styles.root} ref={rootRef}><button ref={buttonRef} type="button" className={`${styles.trigger} ${triggerText ? styles.triggerLabeled : ''}`} aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>{triggerText ? t(triggerText) : <MoreHorizontal size={20} />}</button>{open && typeof document !== 'undefined' && createPortal(<div ref={menuRef} className={styles.menu} role="menu" aria-label={label} style={{ '--menu-top': `${position.top}px`, '--menu-left': `${position.left}px` }} onKeyDown={handleMenuKey}>{derivedItems.map((item, index) => <button key={item.key || item.label || index} type="button" role="menuitem" disabled={item.disabled} className={`${styles.item} ${item.danger ? styles.danger : ''}`} onClick={(event) => { setOpen(false); item.onSelect?.(event); buttonRef.current?.focus(); }}>{item.icon}<span>{t(item.label)}</span></button>)}</div>, document.body)}</div>;
}
