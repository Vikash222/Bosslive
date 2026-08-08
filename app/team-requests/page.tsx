'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Shield, Trophy, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type RequestRow = {
  id: string
  team_id: string
  player_id: string
  status: string
  message: string | null
  created_at: string
  team_name: string | null
  full_name: string | null
  avatar_url: string | null
  playing_role: string | null
}

export default function TeamRequests() {
  const router = useRouter()
  const [incoming, setIncoming] = useState<RequestRow[]>([])
  const [outgoing, setOutgoing] = useState<RequestRow[]>([])
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.replace('/login')
      return
    }

    const { data: inc } = await supabase
      .from('team_join_requests')
      .select(`
        id,
        team_id,
        player_id,
        status,
        message,
        created_at,
        teams(name),
        profiles!team_join_requests_player_id_fkey(full_name, avatar_url, playing_role)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    const incomingRows: RequestRow[] = (inc ?? []).map((row: any) => ({
      id: row.id,
      team_id: row.team_id,
      player_id: row.player_id,
      status: row.status,
      message: row.message,
      created_at: row.created_at,
      team_name: row.teams?.name ?? null,
      full_name: row.profiles?.full_name ?? null,
      avatar_url: row.profiles?.avatar_url ?? null,
      playing_role: row.profiles?.playing_role ?? null,
    }))

    setIncoming(incomingRows)

    const { data: out } = await supabase
      .from('team_join_requests')
      .select(`
        id,
        team_id,
        player_id,
        status,
        message,
        created_at,
        teams(name)
      `)
      .eq('player_id', user.id)
      .order('created_at', { ascending: false })

    const outgoingRows: RequestRow[] = (out ?? []).map((row: any) => ({
      id: row.id,
      team_id: row.team_id,
      player_id: row.player_id,
      status: row.status,
      message: row.message,
      created_at: row.created_at,
      team_name: row.teams?.name ?? null,
      full_name: null,
      avatar_url: null,
      playing_role: null,
    }))

    setOutgoing(outgoingRows)
  }

  useEffect(() => { void load() }, [])

  async function action(id: string, kind: 'accept' | 'reject') {
    setBusy(id)
    setError('')
    const { error: e } = await supabase.rpc(
      kind === 'accept' ? 'accept_team_join_request' : 'reject_team_join_request',
      { p_request_id: id },
    )
    if (e) setError(e.message)
    else await load()
    setBusy('')
  }

  return (
    <main className="form-shell">
      <header className="topbar">
        <div className="brand"><Trophy size={22} /><span>Bosslive</span></div>
        <button className="secondary-btn" onClick={() => router.push('/dashboard')}>
          <ArrowLeft size={16} /> Dashboard
        </button>
      </header>

      <section className="form-page">
        <span className="eyebrow">TEAM MANAGEMENT</span>
        <h1>Join requests</h1>
        <p>Managers can approve players; players can track their requests.</p>

        {error && <div className="form-error" style={{ marginTop: 15 }}>{error}</div>}

        <article className="dash-card" style={{ marginTop: 20 }}>
          <span className="card-kicker"><Shield size={13} /> INCOMING REQUESTS</span>
          {incoming.length ? incoming.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #edf1ee' }}>
              <div className="avatar">{(r.full_name || 'P').charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <strong>{r.full_name || 'Player'}</strong>
                <small style={{ display: 'block', color: '#718078' }}>{r.playing_role || 'Player'} · {r.team_name || 'Team'}</small>
              </div>
              <button className="primary-btn compact" disabled={!!busy} onClick={() => action(r.id, 'accept')}><Check size={15} /> Accept</button>
              <button className="secondary-btn" disabled={!!busy} onClick={() => action(r.id, 'reject')}><X size={15} /> Reject</button>
            </div>
          )) : <p style={{ marginTop: 12 }}>No pending requests.</p>}
        </article>

        <article className="dash-card" style={{ marginTop: 18 }}>
          <span className="card-kicker">MY REQUESTS</span>
          {outgoing.length ? outgoing.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: '1px solid #edf1ee' }}>
              <span>
                <strong>{r.team_name || 'Team'}</strong>
                <small style={{ display: 'block', color: '#718078' }}>{r.message || 'Join request'}</small>
              </span>
              <strong>{r.status}</strong>
            </div>
          )) : <p style={{ marginTop: 12 }}>No requests yet.</p>}
        </article>
      </section>
    </main>
  )
}
