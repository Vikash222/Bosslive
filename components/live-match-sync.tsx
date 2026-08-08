'use client'

import { useEffect } from 'react'
import { subscribeToMatchLive } from '@/lib/live-realtime'

export default function LiveMatchSync({ matchId, onChange }: { matchId: string; onChange: () => void }) {
  useEffect(() => subscribeToMatchLive(matchId, onChange), [matchId, onChange])
  return null
}
