import { supabase } from '@/lib/supabase'

/** Rebuilds one player's career totals from completed match data. */
export async function refreshCareerStats(playerId: string) {
  const { error } = await supabase.rpc('rebuild_player_career_stats', { p_player_id: playerId })
  if (error) throw error
}

/** Refreshes all players who participated in a match. */
export async function refreshMatchCareerStats(matchId: string) {
  const { data, error } = await supabase
    .from('match_players')
    .select('player_id')
    .eq('match_id', matchId)

  if (error) throw error
  const ids = [...new Set((data ?? []).map(row => row.player_id))]
  await Promise.all(ids.map(refreshCareerStats))
}
