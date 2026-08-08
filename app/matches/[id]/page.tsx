'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CheckCircle2, Play, Trophy, UserPlus, Users } from 'lucide-react'

type Match = { id: string; team_a_id: string; team_b_id: string; venue: string | null; match_date: string; overs: number; status: string }
type Team = { id: string; name: string }
type Member = { player_id: string; full_name: string; avatar_url: string | null; role: string }

export default function MatchPage() {
  const params = useParams<{ id: string }>(); const router = useRouter(); const id = params.id
  const [match, setMatch] = useState<Match | null>(null); const [teams, setTeams] = useState<Team[]>([]); const [members, setMembers] = useState<Record<string, Member[]>>({})
  const [selected, setSelected] = useState<Record<string, Set<string>>>({}); const [saving, setSaving] = useState(false); const [error, setError] = useState('')

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) { router.replace('/login'); return }
    const { data: m } = await supabase.from('matches').select('id,team_a_id,team_b_id,venue,match_date,overs,status').eq('id', id).single(); if (!m) return
    setMatch(m); const teamIds = [m.team_a_id, m.team_b_id]
    const { data: ts } = await supabase.from('teams').select('id,name').in('id', teamIds); setTeams(ts || [])
    const { data: roster } = await supabase.from('team_rosters').select('team_id,player_id,full_name,avatar_url,role').in('team_id', teamIds)
    const grouped: Record<string, Member[]> = {}; (roster || []).forEach((r: any) => { (grouped[r.team_id] ||= []).push(r) }); setMembers(grouped)
    const { data: existing } = await supabase.from('match_players').select('team_id,player_id').eq('match_id', id).eq('role','playing_xi')
    const initial: Record<string, Set<string>> = {}; (existing || []).forEach((x: any) => { (initial[x.team_id] ||= new Set()).add(x.player_id) }); setSelected(initial)
  })() }, [id, router])

  function toggle(teamId: string, playerId: string) { setSelected(prev => { const next = { ...prev, [teamId]: new Set(prev[teamId] || []) }; if (next[teamId].has(playerId)) next[teamId].delete(playerId); else if (next[teamId].size < 11) next[teamId].add(playerId); return next }) }

  async function saveXI() { if (!match) return; setSaving(true); setError(''); const rows = Object.entries(selected).flatMap(([team_id, ids]) => [...ids].map((player_id, i) => ({ match_id: match.id, team_id, player_id, role: 'playing_xi', batting_position: i + 1 }))); const { error } = await supabase.from('match_players').delete().eq('match_id', match.id); if (!error && rows.length) { const res = await supabase.from('match_players').insert(rows); if (res.error) setError(res.error.message) } else if (error) setError(error.message); setSaving(false) }

  async function startMatch() { if (!match) return; if ((selected[match.team_a_id]?.size || 0) !== 11 || (selected[match.team_b_id]?.size || 0) !== 11) { setError('Select exactly 11 players for both teams before starting.'); return } const { error } = await supabase.from('matches').update({ status: 'live' }).eq('id', match.id); if (error) setError(error.message); else router.push(`/matches/${match.id}/live`) }

  const teamName = (tid: string) => teams.find(t => t.id === tid)?.name || 'Team'
  if (!match) return <div className="loading-screen">Loading match…</div>
  return <main className="form-shell"><header className="topbar"><div className="brand"><Trophy size={22} /><span>Bosslive</span></div><button className="secondary-btn" onClick={() => router.push('/matches')}><ArrowLeft size={16} /> Matches</button></header><section className="form-page"><span className="eyebrow">MATCH SETUP</span><h1>{teamName(match.team_a_id)} <span style={{ color: '#07945b' }}>VS</span> {teamName(match.team_b_id)}</h1><p>{new Date(match.match_date).toLocaleString()} · {match.overs} overs · {match.venue || 'Venue TBC'}</p>
    <div className="dashboard-grid" style={{ marginTop: 25 }}>{[match.team_a_id, match.team_b_id].map(teamId => <article className="dash-card" key={teamId}><span className="card-kicker">PLAYING XI · {selected[teamId]?.size || 0}/11</span><h3>{teamName(teamId)}</h3><div style={{ display: 'grid', gap: 8, marginTop: 15 }}>{(members[teamId] || []).map(p => <button key={p.player_id} onClick={() => toggle(teamId, p.player_id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, border: selected[teamId]?.has(p.player_id) ? '1px solid #20c878' : '1px solid #e2eae5', background: selected[teamId]?.has(p.player_id) ? '#eafbf2' : '#fff', textAlign: 'left' }}><span className="avatar">{p.full_name.charAt(0)}</span><span style={{ flex: 1 }}><strong>{p.full_name}</strong><small style={{ display: 'block', color: '#73827a' }}>{p.role}</small></span>{selected[teamId]?.has(p.player_id) ? <CheckCircle2 size={18} color="#07945b" /> : <UserPlus size={18} color="#8a9891" />}</button>)}</div></article>)}</div>
    {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}<div className="card-actions" style={{ marginTop: 18 }}><button className="secondary-btn" onClick={saveXI} disabled={saving}>{saving ? 'Saving…' : 'Save Playing XI'}</button><button className="primary-btn" onClick={startMatch}><Play size={17} /> Start match</button></div>
  </section></main>
}
