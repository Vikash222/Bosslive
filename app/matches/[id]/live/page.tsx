'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CircleDot, Trophy, Undo2 } from 'lucide-react'

type Match = { id: string; team_a_id: string; team_b_id: string; overs: number; status: string }
type Team = { id: string; name: string }
type Player = { player_id: string; full_name: string }
type Innings = { id: string; batting_team_id: string; bowling_team_id: string; innings_number: number; status: string; total_runs: number; wickets: number; total_balls: number; extras: number }
type Delivery = { id: string; over_number: number; ball_number: number; striker_id: string; bowler_id: string; runs_batter: number; runs_extras: number; extra_type: string | null; is_wicket: boolean; is_legal_ball: boolean; total_runs: number; commentary: string | null }

export default function LiveMatchPage() {
  const { id } = useParams<{ id: string }>(); const router = useRouter()
  const [match, setMatch] = useState<Match | null>(null); const [teams, setTeams] = useState<Team[]>([]); const [players, setPlayers] = useState<Player[]>([])
  const [innings, setInnings] = useState<Innings | null>(null); const [deliveries, setDeliveries] = useState<Delivery[]>([]); const [striker, setStriker] = useState(''); const [bowler, setBowler] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('')

  async function load() {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/login'); return }
    const { data: m } = await supabase.from('matches').select('id,team_a_id,team_b_id,overs,status').eq('id', id).single(); if (!m) return
    setMatch(m); const { data: ts } = await supabase.from('teams').select('id,name').in('id', [m.team_a_id,m.team_b_id]); setTeams(ts || [])
    let { data: inn } = await supabase.from('innings').select('id,batting_team_id,bowling_team_id,innings_number,status,total_runs,wickets,total_balls,extras').eq('match_id', id).order('innings_number').limit(1).maybeSingle()
    if (!inn) { const { data: created } = await supabase.from('innings').insert({ match_id:id, batting_team_id:m.team_a_id, bowling_team_id:m.team_b_id, innings_number:1, status:'live' }).select().single(); inn = created }
    setInnings(inn)
    if (inn) {
      const { data: mp } = await supabase.from('match_players').select('player_id').eq('match_id', id).eq('team_id', inn.batting_team_id).eq('role','playing_xi');
      const pids = (mp || []).map(x => x.player_id); const { data: ps } = pids.length ? await supabase.from('profiles').select('id,full_name').in('id',pids) : { data: [] as any[] }; setPlayers((ps || []).map((p:any)=>({player_id:p.id,full_name:p.full_name})))
      const { data: ds } = await supabase.from('deliveries').select('id,over_number,ball_number,striker_id,bowler_id,runs_batter,runs_extras,extra_type,is_wicket,is_legal_ball,total_runs,commentary').eq('innings_id',inn.id).order('over_number').order('ball_number'); setDeliveries(ds || [])
    }
  }
  useEffect(() => { load() }, [id])
  const score = useMemo(() => deliveries.reduce((s,d)=>s+d.total_runs,0),[deliveries]); const wickets = useMemo(()=>deliveries.filter(d=>d.is_wicket).length,[deliveries]); const legalBalls = useMemo(()=>deliveries.filter(d=>d.is_legal_ball).length,[deliveries]); const overs = `${Math.floor(legalBalls/6)}.${legalBalls%6}`
  async function addBall(runs:number, extraType:string|null=null, legal=true, wicket=false) {
    if (!innings || !striker || !bowler) { setError('Select striker and bowler first.'); return }; setBusy(true); setError('')
    const nextBall = deliveries.length ? deliveries[deliveries.length-1].ball_number + 1 : 1; const over = legal ? Math.floor(legalBalls/6) : Math.floor(legalBalls/6); const ballNumber = legal ? (legalBalls % 6) + 1 : Math.min(20,nextBall)
    const { error: e } = await supabase.from('deliveries').insert({ innings_id:innings.id, over_number:over, ball_number:ballNumber, striker_id:striker, bowler_id:bowler, runs_batter:extraType ? 0 : runs, runs_extras:extraType ? runs : 0, extra_type:extraType, is_wicket:wicket, is_legal_ball:legal, commentary:wicket?'Wicket':extraType||`${runs} run${runs===1?'':'s'}` })
    if (e) setError(e.message); else await load(); setBusy(false)
  }
  async function undo() { const last=deliveries[deliveries.length-1]; if(!last){return}; setBusy(true); const {error:e}=await supabase.from('deliveries').delete().eq('id',last.id); if(e)setError(e.message); else await load(); setBusy(false) }
  async function finish() { if(!innings)return; setBusy(true); await supabase.from('innings').update({status:'completed',total_runs:score,wickets,total_balls:legalBalls}).eq('id',innings.id); await supabase.from('matches').update({status:'completed'}).eq('id',id); setBusy(false); router.push(`/matches/${id}`) }
  const name=(tid:string)=>teams.find(t=>t.id===tid)?.name||'Team'
  if(!match||!innings)return <div className="loading-screen">Loading live match…</div>
  return <main className="form-shell"><header className="topbar"><div className="brand"><Trophy size={22}/><span>Bosslive</span></div><button className="secondary-btn" onClick={()=>router.push(`/matches/${id}`)}><ArrowLeft size={16}/> Match</button></header><section className="form-page"><span className="eyebrow"><CircleDot size={12}/> LIVE MATCH</span><h1>{name(innings.batting_team_id)} batting</h1><div className="scoreboard"><strong>{score}/{wickets}</strong><span>{overs} overs</span></div><div className="profile-form"><h2>Ball control</h2><div className="form-grid"><label>Striker<select value={striker} onChange={e=>setStriker(e.target.value)}><option value="">Select batsman</option>{players.map(p=><option key={p.player_id} value={p.player_id}>{p.full_name}</option>)}</select></label><label>Bowler<select value={bowler} onChange={e=>setBowler(e.target.value)}><option value="">Select bowler</option>{players.map(p=><option key={p.player_id} value={p.player_id}>{p.full_name}</option>)}</select></label></div><div className="score-buttons">{[0,1,2,3,4,6].map(r=><button className="primary-btn compact" key={r} disabled={busy} onClick={()=>addBall(r)}>{r}</button>)}<button className="secondary-btn" disabled={busy} onClick={()=>addBall(1,'wide',false)}>WD</button><button className="secondary-btn" disabled={busy} onClick={()=>addBall(1,'no_ball',false)}>NB</button><button className="secondary-btn" disabled={busy} onClick={()=>addBall(0,null,true,true)}>W</button><button className="secondary-btn" disabled={busy} onClick={undo}><Undo2 size={16}/> Undo</button></div>{error&&<div className="form-error">{error}</div>}</div><div className="card-actions" style={{marginTop:18}}><button className="primary-btn" disabled={busy} onClick={finish}>Finish innings / match</button></div><article className="dash-card" style={{marginTop:20}}><span className="card-kicker">BALL-BY-BALL</span>{deliveries.slice().reverse().slice(0,12).map(d=><div key={d.id} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #edf1ee'}}><span>Over {d.over_number}.{d.ball_number}</span><strong>{d.is_wicket?'WICKET':d.extra_type?.toUpperCase()||d.runs_batter}</strong></div>)}</article></section></main>
}
