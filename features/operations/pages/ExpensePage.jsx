'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Download, Eye, FileDown, FileUp, Pencil, Printer, Plus, Trash2 } from 'lucide-react';
import { Button, Card, ConfirmDialog, DataTable, FormField, Input, Modal, PageHeader, Select, StatusBadge, Textarea } from '@/components/ui';
import { useOperations } from '../hooks';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import { downloadInvoicePdf, normalizeInvoice, printInvoice } from '@/lib/invoice';
import { exportPdf, exportExcel, parseImportFile, printTable } from '@/lib/peopleUtils';
import styles from './ExpensePage.module.css';

export default function ExpensePage({ mode = 'list' }) {
  const router = useRouter(); const notify = useToast(); const {can}=useAuth(); const operations=useOperations();
  const { formatCurrency: money, preferences } = usePreferences();
  const [expenses, setExpenses] = useState([]); const [categories, setCategories] = useState([]); const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(mode !== 'add'); const [busy, setBusy] = useState(false); const [search, setSearch] = useState(''); const [payTarget,setPayTarget]=useState(null); const [paymentAmount,setPaymentAmount]=useState('');const [editTarget,setEditTarget]=useState(null);const [editValues,setEditValues]=useState({voucherNo:'',description:'',expenseType:'direct'});const [deleteTarget,setDeleteTarget]=useState(null);const [paymentsTarget,setPaymentsTarget]=useState(null); const [fileBusy,setFileBusy]=useState(''); const importRef=useRef(null);
  const [form, setForm] = useState({date:new Date().toISOString().slice(0,10),warehouseId:'',expenseType:'direct',categoryId:'',voucherNo:'',amount:'',description:''});
  useEffect(() => { if(mode!=='add')return;let active=true;Promise.all([operations.list('/api/expense-categories'),operations.list('/api/warehouses')]).then(([c,w]) => {if(active){setCategories(Array.isArray(c)?c:[]);setWarehouses(Array.isArray(w)?w:[]);}}).catch((e)=>{if(active)notify({title:'Could not load expense options',message:e.message,variant:'danger'});});return()=>{active=false;}; }, [mode,notify,operations]);
  useEffect(() => { if(mode==='add') return; operations.list('/api/expenses').then((data)=>setExpenses(Array.isArray(data)?data:[])).catch((e)=>notify({title:'Could not load expenses',message:e.message,variant:'danger'})).finally(()=>setLoading(false)); }, [mode,notify,operations]);
  const submit = async (event) => { event.preventDefault(); setBusy(true); try {
    const fd=new FormData(event.currentTarget); const payload={categoryId:fd.get('categoryId'),warehouseId:fd.get('warehouseId'),expenseType:fd.get('expenseType'),voucherNo:fd.get('voucherNo'),amount:Number(fd.get('amount')),description:fd.get('description'),date:fd.get('date')};
    const data=await operations.create('/api/expenses',payload); notify({title:`Expense added${data.reference?` (${data.reference})`:''}`,variant:'success'}); router.push('/expense/expense-list');
  } catch(e){notify({title:'Could not save expense',message:e.message,variant:'danger'});} finally{setBusy(false);} };
  if(mode==='add') return <div className={styles.page}><PageHeader title="Add Expense" description="Record a direct or indirect business expense."/><Card><form className={styles.form} onSubmit={submit}>
    <FormField label="Date" required><Input name="date" type="date" defaultValue={form.date} required/></FormField><FormField label="Warehouse" required><Select name="warehouseId" required defaultValue=""><option value="">Select warehouse</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</Select></FormField>
    <FormField label="Expense type" required><Select name="expenseType" defaultValue="direct"><option value="direct">Direct expense</option><option value="indirect">Indirect expense</option></Select></FormField><FormField label="Category" required><Select name="categoryId" required defaultValue=""><option value="">Select category</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
    <FormField label="Voucher number"><Input name="voucherNo"/></FormField><FormField label="Amount" required><Input name="amount" type="number" min="0.01" step="0.01" required/></FormField><FormField label="Note"><Textarea name="description" rows={4}/></FormField>
    <div className={styles.actions}><Button variant="secondary" onClick={()=>router.back()}>Cancel</Button><Button type="submit" loading={busy}>Add expense</Button></div>
  </form></Card></div>;
  const q=search.trim().toLowerCase(); const rows=expenses.filter(e=>!q||[e.reference,e.voucherNo,e.category?.name,e.warehouse?.name,e.expenseType].some(v=>String(v||'').toLowerCase().includes(q)));
  const columns=[{key:'date',label:'Date',render:v=>v?new Date(v).toLocaleDateString():'â€”'},{key:'voucherNo',label:'Voucher'},{key:'reference',label:'Reference'},{key:'category',label:'Category',render:(_,r)=>r.category?.name||'â€”'},{key:'amount',label:'Amount',render:v=>money(v)},{key:'expenseType',label:'Type'},{key:'warehouse',label:'Warehouse',render:(_,r)=>r.warehouse?.name||'â€”'},{key:'paymentStatus',label:'Payment',render:v=><StatusBadge status={v||'unpaid'}/>},{key:'due',label:'Due',render:v=>money(v)}];
  const submitPayment=async(e)=>{e.preventDefault();if(!payTarget||Number(paymentAmount)<=0)return;setBusy(true);try{await operations.payExpense(payTarget.id,{status:'completed',amountPaid:Number(paymentAmount),paymentMethod:'cash',cardNumber:'',note:''});notify({title:'Payment recorded',variant:'success'});setPayTarget(null);setPaymentAmount('');const data=await operations.list('/api/expenses');setExpenses(Array.isArray(data)?data:[]);}catch(e){notify({title:'Payment failed',message:e.message,variant:'danger'});}finally{setBusy(false);}};
  const saveEdit=async(e)=>{e.preventDefault();if(!editTarget)return;setBusy(true);try{await operations.update(`/api/expenses/${editTarget.id}`,editValues);notify({title:'Expense updated',variant:'success'});setEditTarget(null);const data=await operations.list('/api/expenses');setExpenses(Array.isArray(data)?data:[]);}catch(err){notify({title:'Could not update expense',message:err.message,variant:'danger'});}finally{setBusy(false);}};
  const deleteExpense=async()=>{if(!deleteTarget)return;setBusy(true);try{await operations.remove(`/api/expenses/${deleteTarget.id}`);notify({title:'Expense deleted',variant:'success'});setDeleteTarget(null);const data=await operations.list('/api/expenses');setExpenses(Array.isArray(data)?data:[]);}catch(err){notify({title:'Could not delete expense',message:err.message,variant:'danger'});setDeleteTarget(null);}finally{setBusy(false);}};
  const exportColumns=columns.map((column)=>({...column,text:(row)=>column.key==='paymentStatus'?row.paymentStatus:column.render?column.render(row[column.key],row):row[column.key]??''}));
  const runExport=async(kind)=>{
    if(!rows.length){notify({title:'There are no expense records to export',variant:'warning'});return;}
    const payload={title:mode==='payments'?'Expense Payments':'Expense List',columns:exportColumns,rows,fileName:mode==='payments'?'expense-payments':'expenses'};
    setFileBusy(kind);
    try{
      if(kind==='pdf')await exportPdf(payload);
      else if(kind==='excel')await exportExcel(payload);
      else if(kind==='print')printTable(payload);
      else{
        const quote=(value)=>`"${String(value??'').replaceAll('"','""')}"`;
        const csv=[exportColumns.map((column)=>quote(column.label)).join(','),...rows.map((row)=>exportColumns.map((column)=>quote(column.text(row))).join(','))].join('\r\n');
        const url=URL.createObjectURL(new Blob([`\uFEFF${csv}`],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`${payload.fileName}-${new Date().toISOString().slice(0,10)}.csv`;link.click();URL.revokeObjectURL(url);
      }
    }catch(error){notify({title:'Export failed',message:error.message,variant:'danger'});}finally{setFileBusy('');}
  };
  const importRows=async(event)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    setFileBusy('import');
    try{
      const paymentMode=mode==='payments';
      const fields=paymentMode?[{field:'reference',label:'Reference',required:true},{field:'amountPaid',label:'Amount paid',type:'number'},{field:'paymentMethod',label:'Payment method'},{field:'note',label:'Note'}]:[{field:'categoryId',label:'Category ID',type:'number'},{field:'warehouseId',label:'Warehouse ID',type:'number'},{field:'expenseType',label:'Expense type'},{field:'voucherNo',label:'Voucher number'},{field:'amount',label:'Amount',type:'number'},{field:'description',label:'Note'},{field:'date',label:'Date'}];
      const parsed=await parseImportFile(file,fields);let imported=0;let firstError='';
      for(const item of parsed){
        try{
          if(paymentMode){const expense=expenses.find((record)=>String(record.reference).toLowerCase()===String(item.reference).toLowerCase());if(!expense)throw new Error(`No expense matches reference ${item.reference||'(blank)'}`);await operations.payExpense(expense.id,{status:'completed',amountPaid:Number(item.amountPaid),paymentMethod:item.paymentMethod||'cash',cardNumber:'',note:item.note||''});}
          else{if(!item.categoryId||!item.warehouseId||!item.amount)throw new Error('Expense rows need Category ID, Warehouse ID, and Amount.');await operations.create('/api/expenses',{...item,categoryId:Number(item.categoryId),warehouseId:Number(item.warehouseId),amount:Number(item.amount),expenseType:item.expenseType||'direct'});}
          imported+=1;
        }catch(error){firstError ||= error.message;}
      }
      if(imported){notify({title:`${imported} ${paymentMode?'expense payments':'expenses'} imported`,variant:'success'});const data=await operations.list('/api/expenses');setExpenses(Array.isArray(data)?data:[]);}
      if(firstError)notify({title:'Some CSV rows were skipped',message:firstError,variant:'warning'});
      if(!parsed.length)notify({title:'CSV contains no records',variant:'warning'});
    }catch(error){notify({title:'Import failed',message:error.message,variant:'danger'});}finally{setFileBusy('');}
  };
  return <div className={styles.page}><PageHeader title={mode==='payments'?'Expense Payments':'Expense List'} description="Review expenses and payment status." actions={can('expense','add')?<Link className={styles.addLink} href="/expense/add-expense"><Plus size={18}/> Add Expense</Link>:null}/><Card><div className={styles.toolbar}><Input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses" aria-label="Search expenses"/><div className={styles.tools}>{can(mode==='payments'?'exp_payment':'expense','add')&&<><Button variant="success" size="sm" leadingIcon={<FileUp size={16}/>} disabled={fileBusy==='import'} onClick={()=>importRef.current?.click()}>Import CSV</Button><input ref={importRef} className={styles.hiddenInput} type="file" accept=".csv,text/csv" onChange={importRows}/></>}{[['excel','Export',Download],['pdf','PDF',FileDown],['print','Print',Printer],['csv','CSV',FileDown]].map(([kind,label,Icon])=><Button key={kind} variant="success" size="sm" loading={fileBusy===kind} leadingIcon={<Icon size={16}/>} onClick={()=>runExport(kind)}>{label}</Button>)}</div></div>{loading?<p className={styles.state}>Loading expensesâ€¦</p>:<DataTable caption="Expenses" columns={columns} rows={rows} renderActions={(row)=><div className={styles.rowActions}><Button size="sm" variant="secondary" onClick={()=>setPaymentsTarget(row)} aria-label="View expense payments"><Eye size={16}/> Payments</Button><Button size="sm" variant="secondary" onClick={()=>printInvoice(normalizeInvoice('expense',row,preferences))} aria-label="Print expense invoice"><Printer size={16}/> Print</Button><Button size="sm" variant="secondary" onClick={()=>downloadInvoicePdf(normalizeInvoice('expense',row,preferences))} aria-label="Download expense invoice"><FileDown size={16}/> Download</Button>{can('exp_payment','add')&&<Button size="sm" variant="secondary" onClick={()=>{setPayTarget(row);setPaymentAmount(String(row.due||''));}}>Pay</Button>}{mode!=='payments'&&can('expense','edit')&&<Button size="sm" variant="secondary" aria-label="Edit expense" onClick={()=>{setEditTarget(row);setEditValues({voucherNo:row.voucherNo||'',description:row.description||'',expenseType:row.expenseType||'direct'});}}><Pencil size={16}/> Edit</Button>}{mode!=='payments'&&can('expense','delete')&&<Button size="sm" variant="danger" aria-label="Delete expense" onClick={()=>setDeleteTarget(row)}><Trash2 size={16}/> Delete</Button>}</div>}/>}</Card><Modal open={Boolean(paymentsTarget)} onClose={()=>setPaymentsTarget(null)} title={`Payments Â· ${paymentsTarget?.reference||'Expense'}`}><DataTable caption="Expense payments" columns={[{key:'createdAt',label:'Date',render:v=>v?new Date(v).toLocaleDateString():'â€”'},{key:'amountPaid',label:'Amount',render:v=>money(v)},{key:'paymentMethod',label:'Method'},{key:'status',label:'Status'},{key:'note',label:'Note'}]} rows={paymentsTarget?.payments||[]} emptyState="No payments recorded."/></Modal><Modal open={Boolean(payTarget)} onClose={()=>setPayTarget(null)} title="Record expense payment"><form className={styles.paymentForm} onSubmit={submitPayment}><FormField label="Amount paid" required><Input type="number" min="0.01" step="0.01" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} required/></FormField><div className={styles.actions}><Button variant="secondary" onClick={()=>setPayTarget(null)}>Cancel</Button><Button type="submit" loading={busy}>Record payment</Button></div></form></Modal><Modal open={Boolean(editTarget)} onClose={()=>setEditTarget(null)} title="Edit expense"><form className={styles.paymentForm} onSubmit={saveEdit}><FormField label="Voucher number"><Input value={editValues.voucherNo} onChange={e=>setEditValues({...editValues,voucherNo:e.target.value})}/></FormField><FormField label="Expense type"><Select value={editValues.expenseType} onChange={e=>setEditValues({...editValues,expenseType:e.target.value})}><option value="direct">Direct</option><option value="indirect">Indirect</option></Select></FormField><FormField label="Description"><Textarea rows={3} value={editValues.description} onChange={e=>setEditValues({...editValues,description:e.target.value})}/></FormField><div className={styles.actions}><Button variant="secondary" onClick={()=>setEditTarget(null)}>Cancel</Button><Button type="submit" loading={busy}>Save changes</Button></div></form></Modal><ConfirmDialog open={Boolean(deleteTarget)} title="Delete expense" description={`Delete expense ${deleteTarget?.reference||''}?`} confirmLabel="Delete" loading={busy} onClose={()=>setDeleteTarget(null)} onConfirm={deleteExpense}/></div>;
}


