'use client';

import { useRef } from 'react';
import styles from './Tabs.module.css';

export default function Tabs({ items = [], value, onChange, label = 'Page sections', className = '' }) {
  const refs = useRef([]);
  function onKeyDown(event, index) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else return;
    event.preventDefault();
    onChange(items[next].value);
    refs.current[next]?.focus();
  }
  return <div className={`${styles.tabs} ${className}`.trim()} role="tablist" aria-label={label}>{items.map((item, index) => <button key={item.value} ref={(node) => { refs.current[index] = node; }} type="button" role="tab" aria-selected={value === item.value} tabIndex={value === item.value ? 0 : -1} className={value === item.value ? styles.active : ''} onClick={() => onChange(item.value)} onKeyDown={(event) => onKeyDown(event, index)}>{item.icon}{item.label}</button>)}</div>;
}
