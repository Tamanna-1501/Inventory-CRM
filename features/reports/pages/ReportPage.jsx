'use client';

import { useMemo } from 'react';
import { Download, FileDown, Printer, RotateCcw, Search } from 'lucide-react';
import { Button, Card, DataTable, FormField, Input, PageHeader, Select, StatCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useReport } from '../hooks';
import styles from './ReportPage.module.css';
import { exportExcel, exportPdf, printTable } from '@/lib/peopleUtils';

const REPORTS = {
  sales: ['Sales Report','Sales Report'], customers: ['Customer Report','Customer Report'], discounts: ['Discount Report','Discount Report'], expenses: ['Expense Report','Expense Report'], payments: ['Payment Report','Payment Report'], products: ['Product Report','Products Report'], purchases: ['Purchase Report','Purchase Report'], stock: ['Stock Report','Stock Report'], suppliers: ['Supplier Report','Supplier Report'], tax: ['Tax Report','Tax Report'], users: ['User Report','User Report'], warehouses: ['Warehouse Report','Warehouse Report'], shipping: ['Shipping Charge Report','Shipping Charge'],
};

export default function ReportPage({ kind }) {
  const [title, permission] = REPORTS[kind] || ['Report', ''];
  const { can } = useAuth();
  const { formatCurrency: money } = usePreferences();
  const { records, loading, error, filters, setFilters, load } = useReport(kind);
  const filtered = useMemo(() => records.filter((row) => {
    const q = filters.search.trim().toLowerCase();
    const date = row.date ? new Date(row.date) : null;
    if (filters.warehouseId !== 'all' && String(row.warehouseId || row.raw?.warehouseId || row.raw?.warehouse?.id || '') !== filters.warehouseId) return false;
    if (filters.startDate && date && date < new Date(`${filters.startDate}T00:00:00`)) return false;
    if (filters.endDate && date && date > new Date(`${filters.endDate}T23:59:59`)) return false;
    return !q || [row.reference,row.type,row.party,row.warehouse,row.status].some((value)=>String(value||'').toLowerCase().includes(q));
  }), [records, filters]);
  const warehouses = useMemo(() => [...new Map(records.filter(row => row.warehouse && row.warehouseId).map(row => [String(row.warehouseId), row.warehouse])).entries()].map(([id,name])=>({id,name})), [records]);
  const total = filtered.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const exportCsv = () => {
    const matrix = [['Date','Reference','Type','Name','Warehouse / detail','Amount / quantity','Status'], ...filtered.map((row)=>[row.date ? new Date(row.date).toLocaleDateString() : '',row.reference,row.type,row.party,row.warehouse,row.amount,row.status])];
    const csv = matrix.map((line)=>line.map((cell)=>`"${String(cell ?? '').replaceAll('"','""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `${kind}-report-${new Date().toISOString().slice(0,10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  if (!can(permission)) return <div className={styles.denied}>You do not have permission to view this report.</div>;
  const columns = [{key:'date',label:'Date',render:v=>v?new Date(v).toLocaleDateString():'—'},{key:'reference',label:'Reference'},{key:'type',label:'Type'},{key:'party',label:'Name / party'},{key:'warehouse',label:'Warehouse / detail'},{key:'amount',label:kind==='stock'||kind==='products'?'Quantity':'Amount',render:v=>kind==='stock'||kind==='products'?Number(v||0).toLocaleString():money(v)},{key:'status',label:'Status'}];
  const exportColumns = columns.map((column) => ({ ...column, text: (row) => column.render ? column.render(row[column.key], row) : row[column.key] ?? '' }));
  const exportData = async (type) => {
    if (!filtered.length) return;
    const payload = { title, columns: exportColumns, rows: filtered, fileName: `${kind}-report` };
    if (type === 'excel') await exportExcel(payload);
    else if (type === 'pdf') await exportPdf(payload);
    else printTable(payload);
  };
  return <div className={styles.page}><PageHeader title={title} description={`Review ${title.toLowerCase()} for your company.`} actions={<div className={styles.exportActions}><Button variant="success" leadingIcon={<Download size={17}/>} onClick={()=>exportData('excel')} disabled={!filtered.length}>Export</Button><Button variant="success" leadingIcon={<FileDown size={17}/>} onClick={()=>exportData('pdf')} disabled={!filtered.length}>PDF</Button><Button variant="success" leadingIcon={<Printer size={17}/>} onClick={()=>exportData('print')} disabled={!filtered.length}>Print</Button><Button variant="success" leadingIcon={<FileDown size={17}/>} onClick={exportCsv} disabled={!filtered.length}>CSV</Button></div>}/>
    <div className={styles.stats}><StatCard label="Records" value={filtered.length.toLocaleString()} /><StatCard label={kind==='stock'||kind==='products'?'Total quantity':'Total value'} value={kind==='stock'||kind==='products'?total.toLocaleString():money(total)} /></div>
    <Card><form className={styles.filters} onSubmit={(event)=>{event.preventDefault();load(filters);}}><FormField label="From"><Input type="date" value={filters.startDate} onChange={e=>setFilters({...filters,startDate:e.target.value})}/></FormField><FormField label="To"><Input type="date" value={filters.endDate} onChange={e=>setFilters({...filters,endDate:e.target.value})}/></FormField>{warehouses.length>0&&<FormField label="Warehouse"><Select value={filters.warehouseId} onChange={e=>setFilters({...filters,warehouseId:e.target.value})}><option value="all">All warehouses</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField>}{kind==='payments'&&<><FormField label="Payment type"><Select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}><option value="all">All</option><option value="sale">Sales</option><option value="purchase">Purchases</option><option value="expense">Expenses</option></Select></FormField><FormField label="Payment method"><Select value={filters.paymentMethod} onChange={e=>setFilters({...filters,paymentMethod:e.target.value})}><option value="all">All methods</option><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="bank_transfer">Bank transfer</option></Select></FormField></>}<Button type="submit" loading={loading}>Apply filters</Button><Button type="button" variant="secondary" leadingIcon={<RotateCcw size={16}/>} onClick={()=>{const clear={...filters,startDate:'',endDate:'',warehouseId:'all',search:'',type:'all',paymentMethod:'all'};setFilters(clear);load(clear);}}>Reset</Button></form>
      <div className={styles.search}><Search size={18}/><Input aria-label={`Search ${title}`} placeholder="Search reference, name, warehouse…" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/></div>{error&&<p className={styles.error} role="alert">{error}<Button size="sm" variant="secondary" onClick={()=>load()}>Retry</Button></p>}{loading?<p className={styles.state}>Loading report…</p>:<DataTable caption={title} columns={columns} rows={filtered} emptyState="No records match the selected filters."/>}</Card>
  </div>;
}
