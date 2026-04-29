// BO3.gg Frontend Integration Index
// Main entry point for BO3 integration modules

export * from './daily-matches'
export * from './teams-tournaments'

// Re-export commonly used utilities and types
export {
  type BO3EnrichedMatch,
  type BO3DailyMatches,
  type BO3Team,
  type BO3Tournament,
  type BO3MatchStatus,
  type BO3Tier,
} from '@/utils/bo3.types'

export {
  getTodayMatches,
  getMatchesForDate,
  getLiveMatches,
  getUpcomingMatches,
  getHighTierMatches,
} from '@/utils/bo3.requests'

export { BO3_UTILS, BO3_FILTERS, BO3_CONFIG } from '@/utils/bo3-endpoints'

// Convenience functions for common use cases
export async function getQuickMatchSummary() {
  const { getDailyMatchesView } = await import('./daily-matches')
  const view = await getDailyMatchesView()

  return {
    date: view.date,
    total: view.summary.total,
    live: view.summary.live,
    upcoming: view.summary.upcoming,
    hasMatches: view.summary.total > 0,
  }
}

export async function getQuickLiveMatches() {
  const { getLiveMatchesView } = await import('./daily-matches')
  return getLiveMatchesView()
}

export async function getQuickTeamStats() {
  const { getTeamsAndTournamentsView } = await import('./teams-tournaments')
  const view = await getTeamsAndTournamentsView()

  return {
    totalTeams: view.stats.totalTeams,
    activeTeams: view.stats.activeTeams,
    totalTournaments: view.stats.totalTournaments,
    activeTournaments: view.stats.activeTournaments,
  }
}
