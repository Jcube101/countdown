import { useEffect, useRef, useState } from 'react'
import { archiveCountdown, listManaged, newCountdown, saveCountdown, slugify, themes } from '../lib/countdowns'
import type { Countdown, CountdownDraft } from '../lib/countdowns'
import { completeOwnerMagicLink, pb, refreshOwnerSession, requestOwnerMagicLink } from '../lib/pocketbase'
import { getPoll, savePoll, validatePoll } from '../lib/poll'
import type { Poll, PollDraft } from '../lib/poll'
const emptyPoll = (): PollDraft => ({enabled:false,question:'',options:['','']})
export function Manage() {
 const [auth,setAuth]=useState<'loading'|'owner'|'guest'>('loading')
 const [email,setEmail]=useState(''), [status,setStatus]=useState(''), [error,setError]=useState('')
 const [busy,setBusy]=useState(false), [items,setItems]=useState<Countdown[]>([])
 const [draft,setDraft]=useState<CountdownDraft>(newCountdown()), [editing,setEditing]=useState<string>()
 const [poll,setPoll]=useState<PollDraft>(emptyPoll()), [existingPoll,setExistingPoll]=useState<Poll|null>(null)
 const [archive,setArchive]=useState<Countdown|null>(null)
 const titleRef=useRef<HTMLInputElement>(null)
 const reset=()=>{setDraft(newCountdown());setEditing(undefined);setPoll(emptyPoll());setExistingPoll(null)}
 useEffect(()=>{
  let active=true
  const q=new URLSearchParams(location.search), otp=q.get('otp'), id=q.get('otpId')
  if(otp || id) history.replaceState(null,'','/manage')
  ;(async()=>{try {
   if(otp&&id) await completeOwnerMagicLink(id,otp)
   const ok=await refreshOwnerSession()
   if(!active)return
   setAuth(ok?'owner':'guest')
   if(ok)setItems(await listManaged())
  }catch{if(active){setAuth('guest');setError('Unable to sign in. Request a new link.')}}})()
  const unsubscribe=pb.authStore.onChange(()=>{if(!pb.authStore.isValid){setAuth('guest');setItems([]);reset()}})
  return()=>{active=false;unsubscribe()}
 },[])
 async function run(action:()=>Promise<void>) {setBusy(true);setError('');setStatus('');try{await action()}catch(e){setError(e instanceof Error && !( 'status' in e) ? e.message : 'The request failed. Your changes remain here; please retry.')}finally{setBusy(false)}}
 if(auth==='loading')return <section className="panel" role="status">Checking owner session…</section>
 if(auth==='guest')return <section className="panel"><h1>Manage countdowns</h1><p>Sign in with your approved owner email.</p><form onSubmit={e=>{e.preventDefault();void run(async()=>{await requestOwnerMagicLink(email);setStatus('Check your email for a sign-in link.')})}}><label>Email<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><button disabled={busy}>Send magic link</button></form>{error&&<p role="alert">{error}</p>}<p role="status">{status}</p></section>
 return <section className="manage"><div><p className="eyebrow">OWNER WORKSPACE</p><div className="manage-heading"><h1>Manage countdowns</h1><button disabled={busy} onClick={()=>{pb.authStore.clear();setStatus('You have logged out.');setError('')}}>Log out</button></div>
 <p role="status">{status}</p>{error&&<p role="alert">{error}</p>}
 <button disabled={busy} onClick={()=>void run(async()=>setItems(await listManaged()))}>Refresh library</button>
 <div className="list">{items.map(item=><article key={item.id}><div><b>{item.title}</b><p>{item.archived?'Archived · slug reserved':'Public'} · /c/{item.slug}</p></div>{!item.archived&&<><button disabled={busy} onClick={()=>void run(async()=>{const found=await getPoll(item.id,true);setDraft({...item});setEditing(item.id);setExistingPoll(found);setPoll(found||emptyPoll());setTimeout(()=>titleRef.current?.focus(),0)})}>Edit {item.title}</button><button disabled={busy} onClick={()=>setArchive(item)}>Archive {item.title}</button></>}</article>)}</div>
 {archive&&<section className="archive-confirm" aria-label="Confirm archive"><h2>Archive {archive.title}?</h2><p>This hides the countdown from the public library. Its record, votes, and slug are preserved.</p><button disabled={busy} onClick={()=>void run(async()=>{await archiveCountdown(archive);if(editing===archive.id)reset();setArchive(null);setStatus('Countdown archived. Its slug remains reserved.');setItems(await listManaged())})}>Confirm archive</button><button disabled={busy} onClick={()=>setArchive(null)}>Cancel archive</button></section>}</div>
 <form className="panel" onSubmit={e=>{e.preventDefault();void run(async()=>{
 if(poll.enabled||existingPoll)validatePoll(poll)
 const saved=await saveCountdown(draft,editing)
 setEditing(saved.id);setDraft(saved)
 try{const savedPoll=await savePoll(saved.id,poll,existingPoll);if(savedPoll)setExistingPoll(savedPoll)}catch{throw new Error('Countdown saved, but poll configuration failed. Retry Save changes to finish the poll.')}
 setStatus('Countdown and poll configuration saved.');setItems(await listManaged())
 })}}><h2>{editing?'Edit countdown':'New countdown'}</h2><fieldset disabled={busy}>
 <label>Title<input ref={titleRef} required value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
 <label>Slug<input required readOnly={Boolean(editing)} value={draft.slug} onChange={e=>setDraft({...draft,slug:slugify(e.target.value)})}/></label>{editing?<p>Published links are fixed.</p>:<button type="button" onClick={()=>setDraft({...draft,slug:slugify(draft.title)})}>Suggest slug from title</button>}
 <label>Date<input type="date" required value={draft.deadline_date} onChange={e=>setDraft({...draft,deadline_date:e.target.value})}/></label>
 <label>Time<input type="time" required value={draft.deadline_time} onChange={e=>setDraft({...draft,deadline_time:e.target.value})}/></label>
 <label>IANA timezone<input required value={draft.timezone} onChange={e=>setDraft({...draft,timezone:e.target.value})}/></label>
 <label>Design<select value={draft.theme_id} onChange={e=>setDraft({...draft,theme_id:e.target.value as CountdownDraft['theme_id']})}>{themes.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
 <label>Note<textarea value={draft.note||''} onChange={e=>setDraft({...draft,note:e.target.value})}/></label>
 <fieldset><legend>Optional poll</legend><label className="check"><input type="checkbox" checked={poll.enabled} onChange={e=>setPoll({...poll,enabled:e.target.checked})}/>Enable Vote control</label>
 {(poll.enabled||existingPoll)&&<><label>Question<input required maxLength={240} readOnly={Boolean(existingPoll)} value={poll.question} onChange={e=>setPoll({...poll,question:e.target.value})}/></label>{poll.options.map((option,index)=><label key={index}>Option {index+1}<input required maxLength={120} readOnly={Boolean(existingPoll)} value={option} onChange={e=>setPoll({...poll,options:poll.options.map((x,i)=>i===index?e.target.value:x)})}/></label>)}{existingPoll?<p>Published questions and options are fixed to preserve vote meaning. You can disable this poll.</p>:<div className="actions"><button type="button" disabled={poll.options.length>=6} onClick={()=>setPoll({...poll,options:[...poll.options,'']})}>Add option</button><button type="button" disabled={poll.options.length<=2} onClick={()=>setPoll({...poll,options:poll.options.slice(0,-1)})}>Remove last option</button></div>}</>}
 </fieldset><div className="actions"><button>{busy?'Saving…':editing?'Save changes':'Create public countdown'}</button>{editing&&<button type="button" onClick={reset}>Finish editing</button>}</div></fieldset></form></section>
}
