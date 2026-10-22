import styles from './Card.module.css';

export default function Card({ as: Element = 'section', title, description, actions, children, className = '', bodyClassName = '' }) {
  return <Element className={`${styles.card} ${className}`.trim()}>{(title || description || actions) && <header className={styles.header}><div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>{actions && <div className={styles.actions}>{actions}</div>}</header>}<div className={`${styles.body} ${bodyClassName}`.trim()}>{children}</div></Element>;
}
