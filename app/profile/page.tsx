'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [form, setForm] = useState({ full_name: '', college: '', course: '', academic_year: '', jersey_number: '', playing_role: '', batting_style: '', bowling_style: '', bio: '' })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (data) setForm({ full_name: data.full_name || '', college: data.college || '', course: data.course || '', academic_year: data.academic_year || '', jersey_number: data.jersey_number?.toString() || '', playing_role: data.playing_role || '', batting_style: data.batting_style || '', bowling_style: data.bowling_style || '', bio: data.bio || '' })
    }
    load()
  }, [router])

  async function save(e: FormEvent) {
    e.preventDefault(); setSaving(true); setMessage('')
    const { error } = await supabase.from('profiles').update({ ...form, jersey_number: form.jersey_number ? Number(form.jersey_number) : null }).eq('id', userId)
    setSaving(false)
    setMessage(error ? error.message : 'Profile saved successfully.')
  }

  const set = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  return <main className="form-shell"><div className="form-page"><button className="back-btn" onClick={() => router.push('/dashboard')}>← Dashboard</button><span className="eyebrow">PLAYER PROFILE</span><h1>Build your cricket profile</h1><p className="muted">This information powers your player card and career identity.</p><form className="profile-form" onSubmit={save}><div className="form-grid">
    <label>Full name<input required value={form.full_name} onChange={e => set('full_name', e.target.value)} /></label>
    <label>College<input value={form.college} onChange={e => set('college', e.target.value)} placeholder="IKGPTU" /></label>
    <label>Course<input value={form.course} onChange={e => set('course', e.target.value)} placeholder="B.Tech CSE" /></label>
    <label>Academic year<input value={form.academic_year} onChange={e => set('academic_year', e.target.value)} placeholder="2nd Year" /></label>
    <label>Jersey number<input type="number" min="0" max="999" value={form.jersey_number} onChange={e => set('jersey_number', e.target.value)} /></label>
    <label>Playing role<select value={form.playing_role} onChange={e => set('playing_role', e.target.value)}><option value="">Select role</option><option>All-rounder</option><option>Batter</option><option>Bowler</option><option>Wicketkeeper Batter</option></select></label>
    <label>Batting style<select value={form.batting_style} onChange={e => set('batting_style', e.target.value)}><option value="">Select style</option><option>Right-hand</option><option>Left-hand</option></select></label>
    <label>Bowling style<input value={form.bowling_style} onChange={e => set('bowling_style', e.target.value)} placeholder="Right-arm medium" /></label>
  </div><label>Bio<textarea rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell your cricket story…" /></label>{message && <div className={message.includes('successfully') ? 'form-success' : 'form-error'}>{message}</div>}<button className="primary-btn" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button></form></div></main>
}
