import { useEffect, useState } from 'react'
import type { Countdown } from '../lib/countdowns'
import { getPoll, getResults, savedVote, submitVote } from '../lib/poll'
import type { Poll, PollResult } from '../lib/poll'
export function VoteControl({countdown}:{countdown:Countdown}) {
 const [poll,setPoll]=useState<Poll|null>(null),[results,setResults]=useState<PollResult|null>(null)
 const [selected,setSelected]=useState<string|null>(null),[open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[attempt,setAttempt]=useState(0)
 useEffect(()=>{let active=true;getPoll(countdown.id).then(p=>{if(active){setPoll(p);if(p)setSelected(savedVote(p.id))}}).catch(()=>{if(active)setError('Voting is temporarily unavailable.')});return()=>{active=false}},[countdown.id,attempt])
 async function showResults(){if(!poll)return;setBusy(true);setError('');try{setResults(await getResults(poll))}catch{setError('Unable to load votes. Please retry.')}finally{setBusy(false)}}
 if(!poll)return error?<div className="vote-control"><p role="status">{error}</p><button onClick={()=>{setError('');setAttempt(attempt+1)}}>Retry voting</button></div>:null
 const total=results?Object.values(results).reduce((a,b)=>a+b,0):0
 return <div className="vote-control"><button className="vote-toggle" aria-expanded={open} aria-controls="poll-panel" onClick={()=>{setOpen(!open);if(!open)void showResults()}}>Vote</button>{open&&<section id="poll-panel" aria-labelledby="vote-title"><h2 id="vote-title">{poll.question}</h2>{poll.options.map(option=><button className="vote-option" key={option} disabled={busy||Boolean(selected)} aria-pressed={selected===option} onClick={async()=>{setBusy(true);setError('');try{if(await submitVote(poll,option))setSelected(option);setResults(await getResults(poll))}catch{setError('Unable to complete the request. Please retry.')}finally{setBusy(false)}}}><span>{option}</span>{' '}{results&&<span>{results[option]??0} · {total?Math.round((results[option]??0)/total*100):0}%</span>}</button>)}<p role="status">{busy?'Loading…':selected?`Your vote: ${selected}.`:results?`${total} total votes.`:''}</p><p>Vote memory is stored in this browser.</p>{error&&<><p role="alert">{error}</p><button disabled={busy} onClick={()=>void showResults()}>Retry results</button></>}</section>}</div>
}
