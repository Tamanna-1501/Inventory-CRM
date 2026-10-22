'use client';
import { useCallback,useEffect,useState } from 'react';
import { getMailUsers,getMessages } from '../services';
export default function useMailbox(folder){const [messages,setMessages]=useState([]);const [unread,setUnread]=useState(0);const [users,setUsers]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const refresh=useCallback(async()=>{setLoading(true);try{const data=await getMessages(folder);setMessages(data.messages||[]);setUnread(data.unread||0);setError('');}catch(e){setError(e.message);}finally{setLoading(false);}},[folder]);useEffect(()=>{refresh();},[refresh]);useEffect(()=>{getMailUsers().then(setUsers).catch(()=>setUsers([]));},[]);return{messages,setMessages,unread,users,loading,error,refresh};}
