'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Check, Plus, Search, Users, X } from 'lucide-react'

type Team = { id: string; name: string; short_name: string | null; college: string | null; city: string | null; description: string | null; created_by: string }
type Membership = { team_id: string; role: string; teams: Team | Team[] }
type Request = { id: string; team_id: string; player_id: string; status: string; message: string | null; profiles: { full_name: string; avatar_url: string | null } | null }

export default function TeamsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [myTeams, setMyTeams] = useState<Membership[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ name: '', short_name: '', college: '', city: '', description: '' })

  async function loadData(uid: string) {
    setLoading(true)
    const [{ data: allTeams }, { data: memberships }, { data: managerTeams }] = await Promise.all([
      supabase.from('teams').select('id,name,short_name,college,city,description,created_by').order('created_at', { ascending: false }),
      supabase.from('team_members').select('team_id,role,teams(id,name,short_name,college,city,description,created_by)').eq('player_id', uid),
      supabase.from('team_members').select('team_id,role').eq('player_id', uid).in('role', ['manager', 'captain', 'vice_captain'])
    ])
    setTeams(allTeams || [])
    setMyTeams((memberships || []) as unknown as Membership[])

    const managerIds = (managerTeams || []).map((m) => m.team_id)
    if (managerIds.length) {
      const { data: incoming } = await supabase.from('team_join_requests').select('id,team_id,player_id,status,message,profiles(full_name,avatar_url)').in('team_id', managerIds).eq('status', 'pending').order('created_at', { ascending: true })
      setRequests((incoming || []) as unknown as Request[])
    } else setRequests([])
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUserId(user.id)
      await loadData(user.id)
    }
    init()
  }, [router])

  async function createTeam(e: FormEvent) {
    e.preventDefault()
    if (!userId || !form.name.trim()) return
    setError(''); setNotice(''); setCreating(true)
    const { data: team, error: createError } = await supabase.from('teams').insert({ ...form, name: form.name.trim(), created_by: userId }).select().single()
    if (createError) { setError(createError.message); setCreating(false); return }
    const { error: memberError } = await supabase.from('team_members').insert({ team_id: team.id, player_id: userId, role: 'manager' })
    if (memberError) { setError(memberError.message); setCreating(false); return }
    setForm({ name: '', short_name: '', college: '', city: '', description: '' })
    setNotice(`Team “${team.name}” created. You are now the manager.`)
    setCreating(false)
    await loadData(userId)
  }

  async function requestJoin(teamId: string) {
    if (!userId) return
    setError(''); setNotice('')
    const { error: requestError } = await supabase.from('team_join_requests').insert({ team_id: teamId, player_id: userId })
    if (requestError) {
      setError(requestError.code === '23505' ? 'You already have a request for this team.' : requestError.message)
      return
    }
    setNotice('Join request sent to the team manager.')
  }

  async function reviewRequest(request: Request, status: 'accepted' | 'rejected') {
    if (!userId) return
    setError(''); setNotice('')
    const { error: reviewError } = await supabase.from('team_join_requests').update({ status, reviewed_by: userId, reviewed_at: new Date().toISOString() }).eq('id', request.id)
    if (reviewError) { setError(reviewError.message); return }
    if (status === 'accepted') {
      const { error: memberError } = await supabase.from('team_members').insert({ team_id: request.team_id, player_id: request.player_id, role: 'player' })
      if (memberError && memberError.code !== '23505') { setError(memberError.message); return }
    }
    setNotice(status === 'accepted' ? 'Player accepted into the team.' : 'Request rejected.')
    await loadData(userId)
  }

  const filteredTeams = teams.filter((team) => [team.name, team.short_name, team.college, team.city].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase()))

  if (loading) return <div className="loading-screen">Loading teams…</div>

  return (
    <main className="team-page">
      <header className="team-header">
        <button className="back-btn" onClick={() => router.push('/dashboard')}><ArrowLeft size={18} /> Dashboard</button>
        <div className="brand"><span>Boss</span>live 🏏</div>
      </header>

      <section className="team-content">
        <div className="team-title"><div><span className="eyebrow">MY TEAM</span><h1>Build your cricket squad.</h1><p>Create a team, join an existing squad, and manage player requests.</p></div></div>
        {notice && <div className="notice success">{notice}</div>}
        {error && <div className="notice error">{error}</div>}

        <div className="team-layout">
          <section className="team-panel create-panel">
            <div className="panel-heading"><div className="panel-icon"><Plus size={20} /></div><div><h2>Create a team</h2><p>You become the team manager.</p></div></div>
            <form onSubmit={createTeam} className="team-form">
              <input required placeholder="Team name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="two-cols"><input placeholder="Short name" maxLength={8} value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} /><input placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} /></div>
              <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <textarea placeholder="Team description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <button className="primary-btn" disabled={creating}>{creating ? 'Creating…' : 'Create team'}</button>
            </form>
          </section>

          <section className="team-panel search-panel">
            <div className="panel-heading"><div className="panel-icon"><Search size={20} /></div><div><h2>Find an existing team</h2><p>Send a request to join.</p></div></div>
            <div className="search-box"><Search size={17} /><input placeholder="Search team, college or city…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <div className="team-list">
              {filteredTeams.length === 0 && <div className="empty">No teams found.</div>}
              {filteredTeams.map((team) => {
                const isMine = myTeams.some((m) => m.team_id === team.id)
                return <article className="team-row" key={team.id}><div className="team-avatar">{(team.short_name || team.name).slice(0, 2).toUpperCase()}</div><div className="team-info"><strong>{team.name}</strong><span>{[team.college, team.city].filter(Boolean).join(' • ') || 'Cricket team'}</span></div>{isMine ? <span className="member-pill">Member</span> : <button className="join-btn" onClick={() => requestJoin(team.id)}>Request to join</button>}</article>
              })}
            </div>
          </section>
        </div>

        <section className="team-panel my-teams-panel"><div className="panel-heading"><div className="panel-icon"><Users size={20} /></div><div><h2>My teams</h2><p>Teams where you are a member or manager.</p></div></div><div className="my-team-grid">{myTeams.length === 0 ? <div className="empty">You have not joined a team yet.</div> : myTeams.map((membership) => { const team = Array.isArray(membership.teams) ? membership.teams[0] : membership.teams; return <div className="my-team-card" key={membership.team_id}><strong>{team?.name || 'Team'}</strong><span>{membership.role.replace('_', ' ')}</span></div> })}</div></section>

        {requests.length > 0 && <section className="team-panel requests-panel"><div className="panel-heading"><div className="panel-icon"><Users size={20} /></div><div><h2>Join requests</h2><p>Review requests for teams you manage.</p></div></div><div className="request-list">{requests.map((request) => <div className="request-row" key={request.id}><div><strong>{request.profiles?.full_name || 'Player'}</strong><span>{request.message || 'Wants to join your team.'}</span></div><div className="request-actions"><button className="accept-btn" onClick={() => reviewRequest(request, 'accepted')}><Check size={16} /> Accept</button><button className="reject-btn" onClick={() => reviewRequest(request, 'rejected')}><X size={16} /> Reject</button></div></div>)}</div></section>}
      </section>
    </main>
  )
}
