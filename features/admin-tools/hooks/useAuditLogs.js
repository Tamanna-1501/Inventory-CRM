'use client';
import { useEffect,useState } from 'react';
import { getAuditLogs } from '../services';
export default function useAuditLogs(){const [rows,setRows]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{getAuditLogs().then(data=>setRows(Array.isArray(data)?data:Array.isArray(data.items)?data.items:[])).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);return{rows,loading,error};}
