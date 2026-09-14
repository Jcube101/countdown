import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import { listPublic, themes } from './lib/countdowns'
import type { Countdown } from './lib/countdowns'
import { CountdownTimer } from './components/CountdownTimer'
import { VoteControl } from './components/VoteControl'
import { Manage } from './components/Manage'
import { deadlineInTimezone } from './lib/time'
import './index.css'
function Shell({children}:{children:React.ReactNode}) {return <main><header><Link to="/">COUNTDOWN</Link><nav aria-label="Main navigation"><Link to="/settings">Settings</Link><Link to="/manage">Manage</Link></nav></header>{children}</main>}
function PublicPage({slug}:{slug?:string}) {
 const [items,setItems]=useState<Countdown[]>([]),[state,setState]=useState('loading'),[attempt,setAttempt]=useState(0)
 useEffect(()=>{let active=true;listPublic().then(data=>{if(active){setItems(data);setState('ready')}}).catch(()=>{if(active)setState('error')});return()=>{active=false}},[attempt])
 if(state==='loading')return <section className="library" role="status">Loading countdowns…</section>
 if(state==='error')return <section className="library"><h1>Unable to load countdowns</h1><p role="alert">Please check your connection and try again.</p><button onClick={()=>{setState('loading');setAttempt(attempt+1)}}>Try again</button></section>
 if(slug){const item=items.find(x=>x.slug===slug);if(!item)return <section className="library"><h1>Countdown unavailable</h1><p>This link may be archived or unavailable.</p><Link to="/">Back to library</Link></section>
 let valid=true;try{deadlineInTimezone(item.deadline_date,item.deadline_time,item.timezone)}catch{valid=false}
 const theme=themes.find(t=>t.id===item.theme_id)||themes[0]
 return <section className={`timer ${theme.id}`}><p className="eyebrow">{theme.name}</p>{valid?<CountdownTimer countdown={item}/>:<p role="alert">Deadline unavailable. The owner needs to check its date and timezone.</p>}<div className="deadline-context"><h1>{item.title}</h1><time>{item.deadline_date} · {item.deadline_time} · {item.timezone}</time><p>{item.note}</p></div><VoteControl key={item.id} countdown={item}/></section>}
 return <section className="library"><p className="eyebrow">PUBLIC LIBRARY</p><h1>Every deadline, in its right form.</h1>{items.length?<div className="grid">{items.map(x=><Link className="card" key={x.id} to={`/c/${x.slug}`}><small>{themes.find(t=>t.id===x.theme_id)?.name}</small><h2>{x.title}</h2><p>{x.deadline_date} · {x.deadline_time} · {x.timezone}</p></Link>)}</div>:<p className="empty">No public countdowns yet.</p>}</section>
}
function Detail(){const {slug}=useParams();return <PublicPage key={slug} slug={slug}/>}
function Settings(){const [zone,setZone]=useState(localStorage.getItem('countdown:timezone')||'Asia/Kolkata'); return <section className="panel"><h1>Settings</h1><p>These preferences affect only how this browser presents deadline context.</p><label>Preferred timezone<input value={zone} onChange={e=>setZone(e.target.value)} /></label><button onClick={()=>localStorage.setItem('countdown:timezone',zone)}>Save preference</button></section>}

export default function App(){return <BrowserRouter><Shell><Routes><Route path="/" element={<PublicPage/>}/><Route path="/c/:slug" element={<Detail/>}/><Route path="/settings" element={<Settings/>}/><Route path="/manage" element={<Manage/>}/><Route path="*" element={<section className="library"><h1>Page not found</h1><Link to="/">Back to library</Link></section>}/></Routes></Shell></BrowserRouter>}
