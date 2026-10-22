'use client';

import ActionMenu from './ActionMenu';
import styles from './DataTable.module.css';

export default function DataTable({ columns, rows, getRowKey = (row) => row.id, renderActions, emptyState, caption, className = '' }) {
  return <div className={`${styles.scroll} ${className}`.trim()} role="region" aria-label={caption || 'Data table'} tabIndex={0}>
    <table className={styles.table}>
      <caption className={styles.caption}>{caption}</caption>
      <thead><tr>{columns.map((column) => <th key={column.key} scope="col" className={column.align === 'right' ? styles.right : column.align === 'center' ? styles.center : ''}>{column.label}</th>)}{renderActions && <th scope="col" className={styles.actionsHeader}>Actions</th>}</tr></thead>
      <tbody>{rows?.length ? rows.map((row) => {
        const actions = renderActions?.(row);
        const label = `Actions for ${row.name || row.reference || row.id || caption || 'record'}`;
        const menu = actions?.type === ActionMenu ? actions : <ActionMenu actions={actions} label={label} />;
        return <tr key={getRowKey(row)}>{columns.map((column) => <td key={column.key} className={`${column.align === 'right' ? styles.right : column.align === 'center' ? styles.center : ''} ${column.cellClassName || ''}`.trim()}>{column.render ? column.render(row[column.key], row) : row[column.key] ?? '\u2014'}</td>)}{renderActions && <td className={styles.actionsCell}>{menu}</td>}</tr>;
      }) : <tr><td colSpan={columns.length + (renderActions ? 1 : 0)} className={styles.empty}>{emptyState || 'No records found.'}</td></tr>}</tbody>
    </table>
  </div>;
}
