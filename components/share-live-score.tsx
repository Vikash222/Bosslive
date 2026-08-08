'use client'

import { useState } from 'react'
import { Copy, Share2, Check } from 'lucide-react'

export default function ShareLiveScore({ matchId }: { matchId: string }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/matches/${matchId}/live` : ''
  async function copy() { if (!url) return; await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1600) }
  async function share() { if (!url) return; if (navigator.share) await navigator.share({ title: 'Bosslive Live Score', text: 'Watch this live cricket match on Bosslive', url }); else await copy() }
  return <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button className="secondary-btn" onClick={copy}>{copied?<><Check size={15}/> Copied</>:<><Copy size={15}/> Copy Live Link</>}</button><button className="primary-btn" onClick={share}><Share2 size={15}/> Share Live Score</button></div>
}
