'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, FormField, Input, PageHeader, Select } from '@/components/ui';
import { useOperations } from '../hooks';
import { useToast } from '@/context/ToastContext';
import styles from './PeopleFormPage.module.css';

const schema={customer:{title:'Add Customer',api:'/api/customers',back:'/people/customer-list',fields:[['name','Customer name',true],['phone','Phone'],['email','Email',false,'email'],['customerGroup','Customer group',false,'text','General'],['rewardPoints','Reward points',false,'number','0'],['address','Address']]},supplier:{title:'Add Supplier',api:'/api/suppliers',back:'/people/supplier-list',fields:[['name','Supplier name',true],['phone','Phone'],['email','Email',false,'email'],['country','Country'],['city','City'],['address','Address'],['zipCode','Zip code'],['company','Company'],['supplierCode','Supplier code']]},biller:{title:'Add Biller',api:'/api/billers',back:'/people/biller-list',fields:[['name','Name',true],['dateOfJoin','Date of join',false,'date'],['phone','Phone'],['email','Email',false,'email'],['nidPassport','NID or passport'],['warehouseId','Warehouse',false,'warehouse'],['address','Address'],['zipCode','Zip code'],['billerCode','Biller code']]}};

export default function PeopleFormPage({kind}) { const router=useRouter();const notify=useToast();const operations=useOperations();const config=schema[kind];const [warehouses,setWarehouses]=useState([]);const [busy,setBusy]=useState(false);const fields=useMemo(()=>config.fields,[config]);
  useEffect(()=>{if(kind==='biller')operations.list('/api/warehouses').then(d=>setWarehouses(Array.isArray(d)?d:[])).catch(e=>notify({title:'Could not load warehouses',message:e.message,variant:'danger'}));},[kind,notify,operations]);
  const submit=async(e)=>{e.preventDefault();setBusy(true);const fd=new FormData(e.currentTarget);const body=Object.fromEntries(fields.map(([key])=>[key,fd.get(key)||'']));if(kind==='customer')body.rewardPoints=body.rewardPoints===''?null:Number(body.rewardPoints);if(kind==='biller'&&body.warehouseId)body.warehouseId=Number(body.warehouseId);try{await operations.create(config.api,body);notify({title:`${kind} added successfully`,variant:'success'});router.push(config.back);}catch(err){notify({title:'Could not save',message:err.message,variant:'danger'});}finally{setBusy(false);}}
  return <div className={styles.page}><PageHeader title={config.title} description={`Enter ${kind} details.`}/><Card><form className={styles.form} onSubmit={submit}>{fields.map(([key,label,required,type,def])=><FormField key={key} label={label} required={required}>{type==='warehouse'?<Select name={key} defaultValue=""><option value="">Select warehouse</option>{warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</Select>:<Input name={key} type={type||'text'} defaultValue={def||''} required={required} min={type==='number'?0:undefined}/>}</FormField>)}<div className={styles.actions}><Button variant="secondary" onClick={()=>router.back()}>Cancel</Button><Button type="submit" loading={busy}>Create {kind}</Button></div></form></Card></div>;
}
