'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowRight, CheckCircle2, Eye, EyeOff, Trophy } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) setError(error.message)
      else if (data.session) router.push('/dashboard')
      else setMessage('Account created. Check your email to verify your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <div className="brand"><Trophy size={24} /> <span>Bosslive</span></div>
        <div className="visual-copy">
          <span className="eyebrow">YOUR CRICKET. YOUR STORY.</span>
          <h1>Play. Score.<br /><span>Be remembered.</span></h1>
          <p>One home for your teams, matches, live scores and cricket career.</p>
          <div className="feature-list">
            {['Build your player profile', 'Create or join your team', 'Track every run and wicket'].map(item => (
              <div key={item}><CheckCircle2 size={18} /> {item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="auth-card-wrap">
        <div className="auth-card">
          <div className="mobile-brand"><Trophy size={22} /> Bosslive</div>
          <div className="auth-heading">
            <span className="eyebrow">WELCOME TO BOSSLIVE</span>
            <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p>{mode === 'login' ? 'Sign in to continue your cricket journey.' : 'Start building your cricket profile today.'}</p>
          </div>

          <form onSubmit={submit}>
            {mode === 'signup' && (
              <label>Full name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Vikash Kumar" /></label>
            )}
            <label>Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
            <label>Password
              <div className="password-input">
                <input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </label>
            {error && <div className="form-error">{error}</div>}
            {message && <div className="form-success">{message}</div>}
            <button className="primary-btn" disabled={loading} type="submit">{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={18} /></button>
          </form>

          <div className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already have an account?'} <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }}>{mode === 'login' ? 'Create one' : 'Sign in'}</button></div>
        </div>
      </section>
    </main>
  )
}
