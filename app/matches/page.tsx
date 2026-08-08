'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, CalendarDays, MapPin, Plus, Trophy, Users } from 'lucide-react'

type Team = { id: string; name: string; short_name: string | null }

type Match = { id: string; title: string | null; team_a_id: string; team_b_id: string; venue: string | null; match_date: string; overs: number; status: string }

export default function MatchesPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [teamA, setTeamA] = useState('')
  const [teamB, setTeamB] = useState('')
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [overs, setOvers] = useState('20')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }
    setUserId(user.id)
    const { data: memberships } = await supabase.from('team_members').select('team_id').eq('player_id', user.id)
    const ids = (memberships || []).map(x => x.team_id)
    if (ids.length) {
      const { data } = await supabase.from('teams').select('id,name,short_name').in('id', ids).order('name')
      setTeams(data || [])
    }
    const { data: matchData } = await supabase.from('matches').select('id,title,team_a_id,team_b_id,venue,match_date,overs,status').order('match_date', { ascending: true })
    setMatches(matchData || [])
  }

  useEffect(() => { load() }, [router])

  async function createMatch(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (!userId || !teamA || !teamB || teamA === teamB || !date) { setError('Select two different teams and a match date.'); return }
    setSaving(true)
    const { data, error } = await supabase.from('matches').insert({ team_a_id: teamA, team_b_id: teamB, venue: venue || null, match_date: new Date(date).toISOString(), overs: Number(overs), match_type: Number(overs) === 20 ? 'T20' : 'Limited Overs', status: 'scheduled', created_by: userId }).select('id').single()
    setSaving(false)
    if (error) { setError(error.message); return }
    setShowCreate(false); setTeamA(''); setTeamB(''); setVenue(''); setDate('')
    await load()
    if (data?.id) router.push(`/matches/${data.id}`)
  }

  const teamName = (id: string) => teams.find(t => t.id === id)?.name || 'Team'

  return <main className="form-shell"><header className="topbar"><div className="brand"><Trophy size={22} /><span>Bosslive</span></div><button className="secondary-btn" onClick={() => router.push('/dashboard')}><ArrowLeft size={16} /> Dashboard</button></header>
    <section className="form-page">
      <div className="welcome-row"><div><span className="eyebrow">MATCH CENTER</span><h1>Matches</h1><p>Create and manage cricket matches between existing teams.</p></div><button className="primary-btn compact" onClick={() => setShowCreate(v => !v)}><Plus size={18} /> Create match</button></div>
      {showCreate && <form className="profile-form" onSubmit={createMatch}><h2>Create match</h2><div className="form-grid"><label>Team A<select value={teamA} onChange={e => setTeamA(e.target.value)}><option value="">Select team</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Team B<select value={teamB} onChange={e => setTeamB(e.target.value)}><option value="">Select team</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Match date & time<input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /></label><label>Overs<input type="number" min="1" max="100" value={overs} onChange={e => setOvers(e.target.value)} /></label><label>Venue<input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Ground / stadium" /></label></div>{error && <div className="form-error">{error}</div>}<button className="primary-btn" disabled={saving}>{saving ? 'Creating…' : 'Create match'}</button></form>}
      <div className="dashboard-grid" style={{ marginTop: 20 }}>{matches.map(m => <article className="dash-card" key={m.id}><span className="card-kicker">{m.status.toUpperCase()}</span><h3>{m.title || `${teamName(m.team_a_id)} vs ${teamName(m.team_b_id)}`}</h3><p><CalendarDays size={14} /> {new Date(m.match_date).toLocaleString()}</p><p><MapPin size={14} /> {m.venue || 'Venue not set'} · {m.overs} overs</p><button className="text-btn" onClick={() => router.push(`/matches/${m.id}`)}>Open match →</button></article>)}</div>
      {!matches.length && <article className="dash-card" style={{ marginTop: 18 }}><div className="card-icon"><Users size={20} /></div><h3>No matches yet</h3><p>Create a match after you have two teams.</p></article>}
    </section>
  </main>
}
