'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, FormField, Input, PageHeader, Select } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { createUser, getRoles } from '../services';
import styles from './AddUserPage.module.css';

export default function AddUserPage(){const router=useRouter();const notify=useToast();const [roles,setRoles]=useState([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 useEffect(()=>{getRoles().then(data=>setRoles(Array.isArray(data)?data.filter(r=>!['ADMIN','OWNER','SUPERADMIN'].includes(String(r.name).toUpperCase())):[])).catch(e=>setError(e.message));},[]);
 const submit=async(e)=>{e.preventDefault();setError('');setBusy(true);const fd=new FormData(e.currentTarget);try{await createUser({name:fd.get('name'),email:fd.get('email'),password:fd.get('password'),phone:fd.get('phone'),address:fd.get('address'),roleId:fd.get('roleId')});notify({title:'User created successfully',variant:'success'});router.push('/user-management/user-list');}catch(e){setError(e.message);}finally{setBusy(false);}};
 return <div className={styles.page}><PageHeader title="Add User" description="Create a staff member in your company."/><Card><form className={styles.form} onSubmit={submit}><FormField label="Full name" required><Input name="name" autoComplete="name" required/></FormField><FormField label="Phone"><Input name="phone" type="tel" autoComplete="tel"/></FormField><FormField label="Email" required><Input name="email" type="email" autoComplete="email" required/></FormField><FormField label="Role" required><Select name="roleId" required defaultValue=""><option value="">Select role</option>{roles.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</Select></FormField><FormField label="Password" required hint="At least 8 characters."><Input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={72} required/></FormField><FormField label="Address"><Input name="address" autoComplete="street-address"/></FormField>{error&&<p className={styles.error} role="alert">{error}</p>}<div className={styles.actions}><Button variant="secondary" onClick={()=>router.back()}>Cancel</Button><Button type="submit" loading={busy}>Create user</Button></div></form></Card></div>;
}
