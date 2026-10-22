'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, FileDown, FileUp, Pencil, Plus, Printer, Trash2 } from 'lucide-react';
import { ActionMenu, Button, Card, ConfirmDialog, DataTable, FormField, Input, Modal, NoticeDialog, Select } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useProductData } from '@/features/products/hooks/useProductData';
import { createCatalogItem, deleteCatalogItem, getBrands, getCategories, getUnits, updateCatalogItem } from '@/features/products/services/productService';
import { exportExcel, exportPdf, parseImportFile, printTable } from '@/lib/peopleUtils';
import styles from './CatalogManager.module.css';

const META = {
  category: { title: 'Categories', description: 'Organize products into main and subcategories.', key: 'category' },
  brand: { title: 'Brands', description: 'Manage the brands assigned to your products.', key: 'brand' },
  unit: { title: 'Units', description: 'Set product units and their short labels.', key: 'unit' },
};
const loaders = { category: getCategories, brand: getBrands, unit: getUnits };

export default function CatalogManager({ kind }) {
  const meta = META[kind];
  const toast = useToast();
  const { can } = useAuth();
  const { data: records, loading, error, refresh } = useProductData(loaders[kind]);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [parentId, setParentId] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyDelete, setBusyDelete] = useState(false);
  const [notice, setNotice] = useState('');
  const [createFeedback, setCreateFeedback] = useState(null);
  const [form, setForm] = useState({});
  const feedbackTimer = useRef(null);
  const importRef = useRef(null);
  const [fileBusy, setFileBusy] = useState('');

  useEffect(() => () => clearTimeout(feedbackTimer.current), []);

  function showCreateFeedback(feedback) {
    clearTimeout(feedbackTimer.current);
    setCreateFeedback(feedback);
    feedbackTimer.current = setTimeout(() => setCreateFeedback(null), 2000);
  }

  async function submit(event) {
    event.preventDefault(); setSaving(true); clearTimeout(feedbackTimer.current); setCreateFeedback(null);
    try {
      const body = kind === 'category' ? { name: name.trim(), parentId: parentId || null } : kind === 'brand' ? { name: name.trim(), image } : { name: name.trim(), shortName: shortName.trim() };
      await createCatalogItem(kind, body); setName(''); setShortName(''); setParentId(''); setImage(null); await refresh(); showCreateFeedback({ tone: 'success', message: `${meta.title.slice(0, -1)} added successfully.` });
    } catch (e) { showCreateFeedback({ tone: 'error', message: `Could not add ${meta.title.slice(0, -1).toLowerCase()}: ${e.message}` }); }
    finally { setSaving(false); }
  }
  function edit(record) { setEditing(record); setForm({ name: record.name || '', shortName: record.shortName || '', image: record.image || null }); }
  async function saveEdit(event) {
    event.preventDefault(); setSaving(true);
    try { await updateCatalogItem(kind, editing.id, kind === 'brand' ? { name: form.name.trim(), image: form.image } : { name: form.name.trim(), shortName: form.shortName.trim() }); setEditing(null); await refresh(); toast({ title: `${meta.title.slice(0, -1)} updated`, variant: 'success' }); }
    catch (e) { toast({ title: 'Update failed', message: e.message, variant: 'danger' }); }
    finally { setSaving(false); }
  }
  async function remove() {
    setBusyDelete(true);
    try { await deleteCatalogItem(kind, pendingDelete.id); setPendingDelete(null); await refresh(); toast({ title: `${meta.title.slice(0, -1)} deleted`, variant: 'success' }); }
    catch (e) { setPendingDelete(null); setNotice(e.message); }
    finally { setBusyDelete(false); }
  }
  const exportColumns = kind === 'category'
    ? [{ key: 'name', label: 'Category', text: (row) => row.name }, { key: 'parent', label: 'Parent category', text: (row) => row.parent?.name || (row.parentId ? records.find((item) => item.id === row.parentId)?.name : 'Main category') || 'Main category' }]
    : kind === 'brand' ? [{ key: 'name', label: 'Brand', text: (row) => row.name }] : [{ key: 'name', label: 'Unit', text: (row) => row.name }, { key: 'shortName', label: 'Short name', text: (row) => row.shortName }];
  async function exportList(type) {
    if (!records.length) { toast({ title: 'There are no records to export', variant: 'warning' }); return; }
    const payload = { title: meta.title, columns: exportColumns, rows: records, fileName: kind === 'unit' ? 'units' : kind === 'brand' ? 'brands' : 'categories' };
    setFileBusy(type);
    try {
      if (type === 'pdf') await exportPdf(payload);
      else if (type === 'excel') await exportExcel(payload);
      else if (type === 'print') printTable(payload);
      else {
        const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const csv = [exportColumns.map((column) => quote(column.label)).join(','), ...records.map((row) => exportColumns.map((column) => quote(column.text(row))).join(','))].join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a'); link.href = url; link.download = `${payload.fileName}-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
      }
    } catch (e) { toast({ title: 'Export failed', message: e.message, variant: 'danger' }); }
    finally { setFileBusy(''); }
  }
  async function importList(event) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setFileBusy('import');
    try {
      const fields = kind === 'category' ? [{ field: 'name', label: 'Category' }, { field: 'parentId', label: 'Parent category ID', type: 'number' }] : kind === 'unit' ? [{ field: 'name', label: 'Unit' }, { field: 'shortName', label: 'Short name' }] : [{ field: 'name', label: 'Brand' }];
      const parsed = await parseImportFile(file, fields); let imported = 0; let firstError = '';
      for (const row of parsed) {
        if (!row.name?.trim()) { firstError ||= 'Some rows are missing a name.'; continue; }
        try {
          const body = kind === 'category' ? { name: row.name.trim(), parentId: row.parentId ? Number(row.parentId) : null } : kind === 'unit' ? { name: row.name.trim(), shortName: row.shortName.trim() } : { name: row.name.trim() };
          await createCatalogItem(kind, body); imported += 1;
        } catch (e) { firstError ||= e.message; }
      }
      if (imported) { await refresh(); toast({ title: `${imported} ${meta.title.toLowerCase()} imported`, variant: 'success' }); }
      if (firstError) toast({ title: 'Some CSV rows were skipped', message: firstError, variant: 'warning' });
      if (!parsed.length) toast({ title: 'CSV contains no records', variant: 'warning' });
    } catch (e) { toast({ title: 'Import failed', message: e.message, variant: 'danger' }); }
    finally { setFileBusy(''); }
  }
  const columns = kind === 'category' ? [{ key: 'name', label: 'Category', render: (value, row) => <span className={row.parentId ? styles.child : styles.category}>{row.parentId ? '↳ ' : ''}{value}</span> }, { key: 'parent', label: 'Parent category', render: (_, row) => row.parent?.name || (row.parentId ? records.find((item) => item.id === row.parentId)?.name : 'Main category') || 'Main category' }] : kind === 'brand' ? [{ key: 'name', label: 'Brand' }] : [{ key: 'name', label: 'Unit' }, { key: 'shortName', label: 'Short name' }];
  const canManage = can(meta.key, 'add');
  return <div className={styles.layout}>
    <Card title={`Add ${meta.title.slice(0, -1)}`} description={kind === 'category' ? 'Leave parent empty to create a main category.' : kind === 'brand' ? 'Add a name and optional brand image.' : 'Add the full unit name and short label.'}>
      <form className={styles.form} onSubmit={submit}>
        <FormField label="Name" required><Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} /></FormField>
        {kind === 'category' && <FormField label="Parent category"><Select value={parentId} onChange={(e) => setParentId(e.target.value)}><option value="">Main category</option>{records.filter((item) => !item.parentId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></FormField>}
        {kind === 'unit' && <FormField label="Short name" required><Input value={shortName} onChange={(e) => setShortName(e.target.value)} required maxLength={20} /></FormField>}
        {kind === 'brand' && <FormField className={styles.fileField} label="Brand image"><Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setImage(reader.result); reader.readAsDataURL(file); }} /></FormField>}
        {canManage && <div className={styles.submitRow}><Button type="submit" loading={saving} leadingIcon={<Plus size={18} />}>Add {meta.title.slice(0, -1).toLowerCase()}</Button>{createFeedback && <p className={`${styles.createFeedback} ${createFeedback.tone === 'error' ? styles.createFeedbackError : styles.createFeedbackSuccess}`} role={createFeedback.tone === 'error' ? 'alert' : 'status'}>{createFeedback.message}</p>}</div>}
      </form>
    </Card>
    <Card title={meta.title} description={meta.description}>
      <div className={styles.toolbar}>{canManage && <><Button variant="success" size="sm" leadingIcon={<FileUp size={16}/>} disabled={fileBusy === 'import'} onClick={() => importRef.current?.click()}>Import CSV</Button><input ref={importRef} className={styles.hiddenInput} type="file" accept=".csv,text/csv" onChange={importList}/></>}{[['excel','Export',Download],['pdf','PDF',FileDown],['print','Print',Printer],['csv','CSV',FileDown]].map(([type,label,Icon])=><Button key={type} variant="success" size="sm" leadingIcon={<Icon size={16}/>} loading={fileBusy === type} onClick={() => exportList(type)}>{label}</Button>)}</div>
      {error ? <div className={styles.message} role="alert">{error} <Button variant="secondary" onClick={refresh}>Retry</Button></div> : loading ? <p className={styles.message}>Loading {meta.title.toLowerCase()}…</p> : <div className={styles.tableWrap}><DataTable caption={meta.title} columns={columns} rows={records} emptyState={`No ${meta.title.toLowerCase()} have been added yet.`} renderActions={kind !== 'category' && can(meta.key, 'edit') ? (record) => <ActionMenu label={`Details for ${record.name}`} triggerText="Details" items={[{ key: 'edit', label: 'Edit', icon: <Pencil size={16} />, onSelect: () => edit(record) }, ...(can(meta.key, 'delete') ? [{ key: 'delete', label: 'Delete', icon: <Trash2 size={16} />, danger: true, onSelect: () => setPendingDelete(record) }] : [])]} /> : undefined} /></div>}
    </Card>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={`Edit ${meta.title.slice(0, -1).toLowerCase()}`} footer={<div className={styles.actions}><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" form="catalog-edit" loading={saving}>Save changes</Button></div>}>
      <form id="catalog-edit" className={styles.form} onSubmit={saveEdit}><FormField label="Name" required><Input value={form.name || ''} onChange={(e) => setForm((old) => ({ ...old, name: e.target.value }))} required /></FormField>{kind === 'unit' && <FormField label="Short name" required><Input value={form.shortName || ''} onChange={(e) => setForm((old) => ({ ...old, shortName: e.target.value }))} required /></FormField>}{kind === 'brand' && <FormField className={styles.fileField} label="Brand image"><Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setForm((old) => ({ ...old, image: reader.result })); reader.readAsDataURL(file); }} /></FormField>}</form>
    </Modal>
    <ConfirmDialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={remove} loading={busyDelete} title={`Delete ${meta.title.slice(0, -1).toLowerCase()}?`} description={`Delete “${pendingDelete?.name || ''}”?`} confirmLabel="Delete" />
    <NoticeDialog open={Boolean(notice)} onClose={() => setNotice('')} title="Delete could not be completed" message={notice} variant="warning" />
  </div>;
}
