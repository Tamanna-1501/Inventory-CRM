'use client';

import { cloneElement, isValidElement, useId } from 'react';
import styles from './FormField.module.css';

export default function FormField({ label, htmlFor, hint, error, required = false, className = '', children }) {
  const generatedId = useId();
  const controlId = htmlFor || (isValidElement(children) ? children.props.id : null) || generatedId;
  const messageId = `${controlId}-message`;
  const control = isValidElement(children) ? cloneElement(children, {
    id: children.props.id || controlId,
    'aria-describedby': children.props['aria-describedby'] || (error || hint ? messageId : undefined),
    'aria-invalid': error ? true : children.props['aria-invalid'],
  }) : children;
  return <div className={`${styles.field} ${className}`.trim()}><label className={styles.label} htmlFor={controlId}>{label}{required && <span className={styles.required} aria-hidden="true"> *</span>}</label>{control}{error ? <p className={styles.error} id={messageId} role="alert">{error}</p> : hint ? <p className={styles.hint} id={messageId}>{hint}</p> : null}</div>;
}
