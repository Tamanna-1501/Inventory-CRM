async function json(url,options={}){const response=await fetch(url,{credentials:'include',...options});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||data.message||'Request failed');return data;}
export const getMessages=(folder)=>json(`/api/messages?folder=${encodeURIComponent(folder)}`,{cache:'no-store'});
export const getMailUsers=()=>json('/api/mail/users',{cache:'no-store'});
export const updateMessage=(id,action)=>json(`/api/messages/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({action})});
export const sendMessage=(body)=>json('/api/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
