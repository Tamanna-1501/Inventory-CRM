'use client';
import { useCallback, useEffect, useState } from 'react';
import { getUsers } from '../services';
export default function useUsers() {
  const [users,setUsers]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const refresh=useCallback(async()=>{setLoading(true);try{const data=await getUsers();setUsers(Array.isArray(data)?data:[]);setError('');}catch(e){setError(e.message);}finally{setLoading(false);}},[]);
  useEffect(()=>{refresh();},[refresh]);
  return {users,setUsers,loading,error,refresh};
}
