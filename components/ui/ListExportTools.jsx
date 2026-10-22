'use client';

import { useState } from 'react';
import { Download, FileDown, Printer } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { exportExcel, exportPdf, printTable } from '@/lib/peopleUtils';
import Button from './Button';
import styles from './ListExportTools.module.css';

export default function ListExportTools({ title, fileName, columns, rows = [] }) {
  const notify = useToast();
  const [busy, setBusy] = useState('');
  const fields = columns.map((column) => ({
    ...column,
    text: (row) => column.exportText ? column.exportText(row) : row[column.key] ?? '',
  }));

  async function run(type) {
    if (!rows.length) {
      notify({ title: 'There are no records to export', variant: 'warning' });
      return;
    }
    const payload = { title, fileName, columns: fields, rows };
    setBusy(type);
    try {
      if (type === 'excel') await exportExcel(payload);
      else if (type === 'pdf') await exportPdf(payload);
      else if (type === 'print') printTable(payload);
      else {
        const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const csv = [fields.map((field) => quote(field.label)).join(','), ...rows.map((row) => fields.map((field) => quote(field.text(row))).join(','))].join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      notify({ title: 'Export failed', message: error.message, variant: 'danger' });
    } finally {
      setBusy('');
    }
  }

  return <div className={styles.tools} aria-label={`${title} export actions`}>
    <Button variant="success" size="sm" leadingIcon={<Download size={16} />} loading={busy === 'excel'} onClick={() => run('excel')}>Export</Button>
    <Button variant="success" size="sm" leadingIcon={<FileDown size={16} />} loading={busy === 'pdf'} onClick={() => run('pdf')}>PDF</Button>
    <Button variant="success" size="sm" leadingIcon={<Printer size={16} />} loading={busy === 'print'} onClick={() => run('print')}>Print</Button>
    <Button variant="success" size="sm" leadingIcon={<FileDown size={16} />} loading={busy === 'csv'} onClick={() => run('csv')}>CSV</Button>
  </div>;
}
