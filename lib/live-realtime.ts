import { supabase } from '@/lib/supabase'

export function subscribeToMatchLive(matchId: string, onChange: () => void) {
  const channel = supabase
    .channel(`match-live-${matchId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'innings', filter: `match_id=eq.${matchId}` }, onChange)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deliveries' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, onChange)
    .subscribe()

  return () => { void supabase.removeChannel(channel) }
}
