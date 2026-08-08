'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { refreshMatchCareerStats } from '@/lib/career-stats'

type Match={id:string;status:string;result_text:string|null}
export default function FinishMatch(){const {id}=useParams<{id:string}>();const router=useRouter();const [match,setMatch]=useState<Match|null>(null);const [result,setResult]=useState('');const [busy,setBusy]=useState(false);const [msg,setMsg]=useState('')
 useEffect(()=>{supabase.from('matches').select('id,status,result_text').eq('id',id).single().then(({data})=>{setMatch(data);setResult(data?.result_text||'')})},[id])
 async function finish(){setBusy(true);setMsg('');const {error}=await supabase.from('matches').update({status:'completed',result_text:result.trim()||'Match completed'}).eq('id',id);if(error){setMsg(error.message);setBusy(false);return}try{await refreshMatchCareerStats(id);setMsg('Match completed and player career stats updated.')}catch(e:any){setMsg(`Match completed, but stats refresh failed: ${e.message||'unknown error'}`)}setBusy(false)}
 if(!match)return <div className="loading-screen">Loading match…</div>;return <main className="form-shell"><header className="topbar"><div className="brand"><Trophy size={22}/><span>Bosslive</span></div></header><section className="form-page"><span className="eyebrow"><CheckCircle2 size={13}/> COMPLETE MATCH</span><h1>Finish match</h1><p>Complete the match and rebuild career statistics for every participating player.</p><label style={{display:'grid',gap:7,marginTop:20}}>Result / winner message<textarea value={result} onChange={e=>setResult(e.target.value)} placeholder="Team A won by 5 wickets" rows={3}/></label>{msg&&<div className={msg.includes('failed')?'form-error':'form-success'} style={{marginTop:14}}>{msg}</div>}<button className="primary-btn" style={{marginTop:18}} disabled={busy||match.status==='completed'} onClick={finish}>{match.status==='completed'?'Match Completed':busy?'Finishing…':'Finish Match & Update Stats →'}</button>{match.status==='completed'&&<button className="secondary-btn" style={{marginTop:10}} onClick={()=>router.push(`/matches/${id}/scorecard`)}>Open Scorecard</button>}</section></main>}
