import React,{useState,useEffect} from 'react';
import{createRoot}from'react-dom/client';
import{LayoutDashboard,Users,FolderKanban,ListTodo,Wallet,CalendarClock,ShieldAlert,Moon,Sun,Plus,Trash2,Search,Download}from'lucide-react';
import './style.css';
import { supabase, ADMIN_USER_ID, configured } from './supabase';
import { LogOut, LockKeyhole } from 'lucide-react';
const initial={clients:[],projects:[],tasks:[],payments:[],renewals:[],notes:[]};
const items=[['Dashboard',LayoutDashboard],['Clients',Users],['Projects',FolderKanban],['Tasks',ListTodo],['Payments',Wallet],['Renewals',CalendarClock],['Notes',FolderKanban]];
const fields={clients:['name','business','email','phone','domain'],projects:['title','client','status','deadline'],tasks:['title','client','status','due'],payments:['client','description','amount','received'],renewals:['client','service','provider','expiry'],notes:['client','title','content']};
const today=()=>new Date().toISOString().slice(0,10);
function Login({onLogin}) {
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e){e.preventDefault();setBusy(true);setError('');
  try{const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;
   if(data.user?.id!==ADMIN_USER_ID){await supabase.auth.signOut();throw new Error('This account is not authorized as the ClientVault administrator.');}
   onLogin(data.user);
  }catch(err){setError(err.message||'Unable to sign in');}finally{setBusy(false);setPassword('');}
 }
 return <div className="auth-page"><div className="auth-card"><div className="auth-icon"><LockKeyhole size={28}/></div><h1>ClientVault</h1><p>Sign in to your private workspace</p><form onSubmit={submit}><label>Email address<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"/></label>{error&&<div role="alert" className="auth-error">{error}</div>}<button className="primary" disabled={busy} type="submit">{busy?'Signing in...':'Sign in'}</button></form><small>Admin access only · No public registration</small></div></div>;
}
function AuthGate(){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{let alive=true;
  if(!configured){setLoading(false);return}
  async function check(){const {data,error}=await supabase.auth.getUser();if(!alive)return;const valid=!error&&data.user?.id===ADMIN_USER_ID;
   if(!valid&&data.user)await supabase.auth.signOut();
   if(alive){setUser(valid?data.user:null);setLoading(false)}}
  check();
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(!alive)return;if(!session)setUser(null);else if(session.user.id===ADMIN_USER_ID)setUser(session.user);else {setUser(null);supabase.auth.signOut()}});
  return()=>{alive=false;subscription.unsubscribe()};
 },[]);
 if(!configured)return <div className="auth-page"><div className="auth-card"><h1>Setup required</h1><p>Configure VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY and VITE_ADMIN_USER_ID in the deployment environment. No demo bypass is enabled.</p></div></div>;
 if(loading)return <div className="auth-page"><div className="auth-card"><p>Verifying admin session...</p></div></div>;
 return user?<App user={user} onLogout={async()=>{await supabase.auth.signOut({scope:'local'});setUser(null)}}/>:<Login onLogin={setUser}/>;
}
function App({user,onLogout}){
 const [store,setStore]=useState(()=>{try{return {...initial,...JSON.parse(localStorage.getItem('clientvault-demo')||'{}')}}catch{return initial}});
 const [page,setPage]=useState('Dashboard'),[dark,setDark]=useState(false),[query,setQuery]=useState(''),[adding,setAdding]=useState(false),[form,setForm]=useState({});
 useEffect(()=>{localStorage.setItem('clientvault-demo',JSON.stringify(store))},[store]);
 const add=()=>{if(!Object.values(form).some(v=>String(v).trim()))return;setStore(s=>({...s,[page.toLowerCase()]:[{id:crypto.randomUUID(),...form,created:today()},...s[page.toLowerCase()]]}));setAdding(false);setForm({})};
 const remove=id=>{if(!confirm('Delete this demo record?'))return;setStore(s=>({...s,[page.toLowerCase()]:s[page.toLowerCase()].filter(r=>r.id!==id)}))};
 const exportData=()=>{const b=new Blob([JSON.stringify(store,null,2)],{type:'application/json'}),url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='clientvault-demo-export.json';a.click();URL.revokeObjectURL(url)};
 const name=page.toLowerCase(),rows=(store[name]||[]).filter(r=>JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
 const stats=[['Clients',store.clients.length],['Projects',store.projects.length],['Open Tasks',store.tasks.filter(x=>x.status!=='Done').length],['Pending ₹',store.payments.reduce((s,x)=>s+Math.max(0,Number(x.amount||0)-Number(x.received||0)),0).toLocaleString('en-IN')]];
 return <div className={dark?'app dark':'app'}><aside><div className="brand"><div className="brand-logo">CV</div><span>ClientVault<small>PRIVATE WORKSPACE DEMO</small></span></div><nav>{items.map(([label,Icon])=><button key={label} className={page===label?'selected':''} onClick={()=>{setPage(label);setQuery('');setAdding(false)}}><Icon size={18}/>{label}</button>)}</nav><div className="sidefoot"><ShieldAlert size={18}/> Authenticated demo<br/>No production vault</div></aside><div className="content"><header><span>Workspace / <b>{page}</b></span><div className="header-actions"><span className="admin-email">{user.email}</span><button className="iconbutton" aria-label="Toggle theme" onClick={()=>setDark(!dark)}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button><button className="secondary" onClick={onLogout}><LogOut size={16}/> Logout</button></div></header><main><div className="headline"><div><div className="eyebrow">CLIENT MANAGEMENT WORKSPACE</div><h1>{page==='Dashboard'?'Welcome to ClientVault':page}</h1><p>Manage your client records and projects in one organized workspace.</p></div>{page==='Dashboard'?<button className="secondary" onClick={exportData}><Download size={16}/> Export demo data</button>:<button className="primary" onClick={()=>setAdding(true)}><Plus size={16}/> Add {page.slice(0,-1)}</button>}</div><div className="warning"><ShieldAlert size={20}/><div><strong>Frontend prototype — not secure for live client information.</strong><p>Records are saved only in this browser's localStorage. Do not enter real passwords, API keys or private client data. Login uses Supabase Auth, but records remain in localStorage: server-side data access controls, database, encryption KMS and automatic backups are not configured.</p></div></div>{page==='Dashboard'?<><div className="stats">{stats.map(([label,val])=><div className="stat" key={label}><span>{label}</span><strong>{val}</strong></div>)}</div><div className="panel"><h2>Getting started</h2><p>Choose Clients to add a demo client, then organize projects, tasks, payments, renewals and notes. The Credential Vault is intentionally disabled until a reviewed backend and KMS are configured.</p><div className="quick"><button onClick={()=>setPage('Clients')}>Manage clients →</button><button onClick={()=>setPage('Projects')}>View projects →</button></div></div></>:<div className="panel"><div className="panelhead"><h2>{page} <span>{rows.length}</span></h2><div className="search"><Search size={17}/><input placeholder={'Search '+page.toLowerCase()+'...'} value={query} onChange={e=>setQuery(e.target.value)}/></div></div>{rows.length?<div className="tablewrap"><table><thead><tr>{fields[name].map(f=><th key={f}>{f}</th>)}<th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id}>{fields[name].map(f=><td key={f}>{r[f]||'—'}</td>)}<td><button className="iconbutton" title="Delete" onClick={()=>remove(r.id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>:<div className="empty">No records yet. Select Add to create your first demo record.</div>}</div>}</main></div>{adding&&<div className="overlay" onClick={()=>setAdding(false)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>Add {page.slice(0,-1)}</h2><p>Demo information only — no credentials or sensitive client data.</p>{fields[name].map(f=><label key={f}>{f.charAt(0).toUpperCase()+f.slice(1)}<input type={f==='deadline'||f==='due'||f==='expiry'?'date':'text'} value={form[f]||''} onChange={e=>setForm(v=>({...v,[f]:e.target.value}))}/></label>)}<div className="modalbuttons"><button className="secondary" onClick={()=>setAdding(false)}>Cancel</button><button className="primary" onClick={add}>Save demo record</button></div></div></div>}</div>
}
createRoot(document.getElementById('root')).render(<AuthGate/>);
