'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Trophy } from 'lucide-react'
import ShareLiveScore from '@/components/share-live-score'

export default function ShareMatchPage() { const { id } = useParams<{id:string}>(); const router = useRouter(); return <main className="form-shell"><header className="topbar"><div className="brand"><Trophy size={22}/><span>Bosslive</span></div><button className="secondary-btn" onClick={()=>router.push(`/matches/${id}/live`)}><ArrowLeft size={16}/> Live Match</button></header><section className="form-page"><span className="eyebrow">LIVE SCORE LINK</span><h1>Share this match</h1><p>Send the live score link to anyone. They can open the match page directly.</p><div className="dash-card" style={{marginTop:18}}><strong>Live Match URL</strong><p style={{wordBreak:'break-all',color:'#078b56',marginTop:8}}>{typeof window !== 'undefined' ? `${window.location.origin}/matches/${id}/live` : `/matches/${id}/live`}</p><div style={{marginTop:16}}><ShareLiveScore matchId={id}/></div></div></section></main> }
