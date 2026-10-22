'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FileDown, FileUp, Pencil, Plus, Printer, Search, Trash2 } from 'lucide-react';
import { Button, Card, ConfirmDialog, DataTable, FormField, Input, Modal, PageHeader, Select } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useOperations } from '../hooks';
import { exportExcel, exportPdf, parseImportFile, printTable } from '@/lib/peopleUtils';
import styles from './EntityManager.module.css';

const IMPORT_FIELDS = {
  '/api/customers': [{field:'name',label:'Name'},{field:'phone',label:'Phone'},{field:'email',label:'Email'},{field:'customerGroup',label:'Group'},{field:'rewardPoints',label:'Reward Points',type:'number'},{field:'address',label:'Address'}],
  '/api/suppliers': [{field:'name',label:'Supplier Name'},{field:'phone',label:'Phone'},{field:'email',label:'Email'},{field:'country',label:'Country'},{field:'city',label:'City'},{field:'address',label:'Address'},{field:'zipCode',label:'Zip Code'},{field:'company',label:'Company'},{field:'supplierCode',label:'Supplier Code'}],
  '/api/billers': [{field:'name',label:'Name'},{field:'dateOfJoin',label:'Date of Join'},{field:'phone',label:'Phone'},{field:'email',label:'Email'},{field:'nidPassport',label:'NID or Passport Number'},{field:'address',label:'Address'},{field:'zipCode',label:'Zip Code'},{field:'billerCode',label:'Biller Code'}],
  '/api/warehouses': [{field:'name',label:'Warehouse Name'},{field:'phone',label:'Phone'},{field:'email',label:'Email'},{field:'address',label:'Address'}],
};

export default function EntityManager({ config }) {
  const notify = useToast();
  const { can } = useAuth();
  const operations = useOperations();
  const permission = config.permission || ({ '/api/customers':'customer', '/api/suppliers':'supplier', '/api/billers':'biller', '/api/warehouses':'wh', '/api/expense-categories':'exp_cat' })[config.api];
  const importFields = config.importFields || IMPORT_FIELDS[config.api];
  const canAdd = !permission || can(permission, 'add');
  const canEdit = config.canEdit !== false && (!permission || can(permission, 'edit'));
  const canDelete = config.canDelete !== false && (!permission || can(permission, 'delete'));
  const [rows, setRows] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const importRef = useRef(null);
  const [exportBusy, setExportBusy] = useState('');
  const fields = config.api === '/api/billers' ? [...config.fields, {key:'dateOfJoin',label:'Date of join',type:'date'}, {key:'nidPassport',label:'NID or passport'}, { key:'warehouseId', label:'Warehouse', type:'select', options:warehouses.map((item)=>({value:String(item.id),label:item.name})) }] : config.fields;

  const refresh = useCallback(async () => {
    setLoading(true);
    try { const data = await operations.list(config.api); setRows(Array.isArray(data) ? data : []); setError(''); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [config.api, operations]);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (config.api !== '/api/billers') return;
    operations.list('/api/warehouses').then((data) => setWarehouses(Array.isArray(data) ? data : [])).catch(() => setWarehouses([]));
  }, [config.api, operations]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => !q || config.columns.some((col) => String(col.value ? col.value(row) : row[col.key] ?? '').toLowerCase().includes(q)));
  }, [rows, search, config]);

  const save = async (event) => {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(fields.map((field) => [field.key, form.get(field.key) || '']));
    try {
      if (modal?.id) await operations.update(`${config.api}/${modal.id}`, config.toPayload ? config.toPayload(body) : body);
      else await operations.create(config.api, config.toPayload ? config.toPayload(body) : body);
      notify({ title: `${config.label} ${modal?.id ? 'updated' : 'created'}`, variant: 'success' });
      setModal(null); await refresh();
    } catch (err) { notify({ title: 'Could not save', message: err.message, variant: 'danger' }); }
    finally { setBusy(false); }
  };

  const confirmRemove = async () => {
    setBusy(true);
    try { await operations.remove(`${config.api}/${deleting.id}`); notify({ title: `${config.label} deleted`, variant: 'success' }); setDeleting(null); await refresh(); }
    catch (err) { notify({ title: 'Could not delete', message: err.message, variant: 'danger' }); setDeleting(null); }
    finally { setBusy(false); }
  };

  const exportFields = config.columns.map((column) => ({ ...column, text: (row) => column.value ? column.value(row) : row[column.key] ?? '' }));
  const runExport = async (kind) => {
    if (!shown.length) { notify({ title: 'There are no rows to export', variant: 'warning' }); return; }
    const payload = { title: config.title, columns: exportFields, rows: shown, fileName: config.fileName || config.api.split('/').pop() };
    setExportBusy(kind);
    try {
      if (kind === 'pdf') await exportPdf(payload);
      else if (kind === 'excel') await exportExcel(payload);
      else if (kind === 'csv') {
        const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
        const csv = [exportFields.map((field) => quote(field.label)).join(','), ...shown.map((row) => exportFields.map((field) => quote(field.text(row))).join(','))].join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a'); link.href = url; link.download = `${payload.fileName}-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
      } else printTable(payload);
    }
    catch (err) { notify({ title: 'Export failed', message: err.message, variant: 'danger' }); }
    finally { setExportBusy(''); }
  };
  const importRows = async (event) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || !importFields?.length) return;
    setExportBusy('import');
    try {
      const parsed = await parseImportFile(file, importFields);
      let imported = 0; let firstError = '';
      for (const row of parsed) {
        if (!row.name) { firstError ||= 'Some rows do not have a name.'; continue; }
        try { await operations.create(config.api, config.toPayload ? config.toPayload(row) : row); imported += 1; }
        catch (err) { firstError ||= err.message; }
      }
      if (imported) { notify({ title: `${imported} ${config.label.toLowerCase()} records imported`, variant: 'success' }); await refresh(); }
      if (firstError) notify({ title: 'Some rows were skipped', message: firstError, variant: 'warning' });
    } catch (err) { notify({ title: 'Import failed', message: err.message, variant: 'danger' }); }
    finally { setExportBusy(''); }
  };

  const columns = config.columns.map((col) => ({ key: col.key, label: col.label, render: (_, row) => col.value ? col.value(row) || '—' : row[col.key] || '—' }));
  return <section className={styles.page}>
    <PageHeader title={config.title} description={config.description} actions={<div className={styles.headerActions}>{canAdd && config.addHref && <Link className={styles.addLink} href={config.addHref}><Plus size={18}/> Add {config.label}</Link>}{canAdd && config.modalCreate && <Button leadingIcon={<Plus size={18}/>} onClick={() => setModal({})}>Add {config.label}</Button>}</div>} />
    <Card><div className={styles.toolbar}><label className={styles.search}><Search size={18}/><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}`} aria-label={`Search ${config.title}`} /></label><div className={styles.tools}>{canAdd && importFields?.length>0 && <><Button variant="success" size="sm" leadingIcon={<FileUp size={16}/>} disabled={exportBusy==='import'} onClick={()=>importRef.current?.click()}>{config.importAccept ? 'Import CSV' : 'Import'}</Button><input ref={importRef} className={styles.hiddenInput} type="file" accept={config.importAccept || '.xlsx,.xls,.csv'} onChange={importRows}/></>}{['excel','pdf','print','csv'].map((kind)=><Button key={kind} variant="success" size="sm" loading={exportBusy===kind} leadingIcon={kind==='print'?<Printer size={16}/>:<FileDown size={16}/>} onClick={()=>runExport(kind)}>{kind==='pdf'?'PDF':kind==='excel'?'Export':kind==='csv'?'CSV':'Print'}</Button>)}</div>{error && <p className={styles.error} role="alert">{error} <button onClick={refresh}>Retry</button></p>}</div>
      {loading ? <p className={styles.state}>Loading {config.title.toLowerCase()}…</p> : <DataTable caption={config.title} columns={columns} rows={shown} emptyState={`No ${config.title.toLowerCase()} found.`} renderActions={canEdit || canDelete ? (row) => <div className={styles.rowActions}>{canEdit && <Button size="sm" variant="secondary" aria-label={`Edit ${row.name}`} onClick={() => setModal(row)}><Pencil size={16}/></Button>}{canDelete && <Button size="sm" variant="danger" aria-label={`Delete ${row.name}`} onClick={() => setDeleting(row)}><Trash2 size={16}/></Button>}</div> : undefined} />}
    </Card>
    <Modal open={Boolean(modal)} onClose={() => setModal(null)} title={`${modal?.id ? 'Edit' : 'Add'} ${config.label}`} size="lg">
      <form className={styles.form} onSubmit={save}>{fields.map((field) => <FormField key={field.key} label={field.label} required={field.required}><Control field={field} initial={modal?.[field.key]} options={field.options} /></FormField>)}<div className={styles.formActions}><Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button><Button type="submit" loading={busy}>{modal?.id ? 'Save changes' : `Create ${config.label}`}</Button></div></form>
    </Modal>
    <ConfirmDialog open={Boolean(deleting)} title={`Delete ${config.label}`} description={`Delete “${deleting?.name || config.label}”? This cannot be undone.`} confirmLabel="Delete" loading={busy} onClose={() => setDeleting(null)} onConfirm={confirmRemove}/>
  </section>;
}

function Control({ field, initial, options }) {
  const value = field.type === 'date' && initial ? String(initial).slice(0, 10) : initial;
  if (field.type === 'select') return <Select name={field.key} defaultValue={String(initial ?? field.default ?? '')} required={field.required}><option value="">Select…</option>{(options || []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select>;
  if (field.type === 'textarea') return <textarea className={styles.textarea} name={field.key} defaultValue={initial ?? ''} required={field.required} rows={3}/>;
  return <Input name={field.key} type={field.type || 'text'} defaultValue={initial ?? field.default ?? ''} required={field.required} min={field.type === 'number' ? 0 : undefined} />;
}
