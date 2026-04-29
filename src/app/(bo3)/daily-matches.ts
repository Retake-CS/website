// Daily Matches API Module
// Provides structured data for displaying daily CS2 matches

import {
  getTodayMatches,
  getMatchesForDate,
  getLiveMatches,
  getUpcomingMatches,
  getHighTierMatches,
  filterMatches,
} from '@/utils/bo3.requests'
import {
  BO3EnrichedMatch,
  BO3DailyMatches,
  BO3MatchFilters,
  BO3MatchStatus,
  BO3Tier,
} from '@/utils/bo3.types'
import { BO3_UTILS, BO3_FILTERS } from '@/utils/bo3-endpoints'

export interface DailyMatchesView {
  date: string
  displayDate: string
  summary: {
    total: number
    live: number
    upcoming: number
    finished: number
    highTier: number
    lowTier: number
  }
  matches: {
    live: BO3EnrichedMatch[]
    upcoming: BO3EnrichedMatch[]
    finished: BO3EnrichedMatch[]
    highTier: BO3EnrichedMatch[]
    all: BO3EnrichedMatch[]
  }
  navigation: {
    prevDate?: string
    nextDate?: string
    prevDisplayDate?: string
    nextDisplayDate?: string
  }
  teams: Record<string, { name: string; slug: string; logoUrl?: string }>
  tournaments: Record<string, { name: string; slug: string; tier: string; prize?: number }>
}

/**
 * Get formatted daily matches view for frontend consumption
 */
export async function getDailyMatchesView(date?: string): Promise<DailyMatchesView> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()

  // Filter matches by status
  const liveMatches = filterMatches(dailyMatches.matches, BO3_FILTERS.liveOnly())
  const upcomingMatches = filterMatches(dailyMatches.matches, BO3_FILTERS.upcomingOnly())
  const finishedMatches = filterMatches(dailyMatches.matches, BO3_FILTERS.finishedOnly())

  // Calculate summary statistics
  const summary = {
    total: dailyMatches.meta.total_matches,
    live: liveMatches.length,
    upcoming: upcomingMatches.length,
    finished: finishedMatches.length,
    highTier: dailyMatches.high_tier.length,
    lowTier: dailyMatches.low_tier.length,
  }

  // Format teams for frontend
  const teams = Object.fromEntries(
    Object.entries(dailyMatches.teams).map(([id, team]) => [
      id,
      {
        name: team.name,
        slug: team.slug,
        logoUrl: team.image_url,
      },
    ]),
  )

  // Format tournaments for frontend
  const tournaments = Object.fromEntries(
    Object.entries(dailyMatches.tournaments).map(([id, tournament]) => [
      id,
      {
        name: tournament.name,
        slug: tournament.slug,
        tier: tournament.tier,
        prize: tournament.prize,
      },
    ]),
  )

  // Format navigation
  const navigation = {
    prevDate: dailyMatches.meta.prev_date,
    nextDate: dailyMatches.meta.next_date,
    prevDisplayDate: dailyMatches.meta.prev_date
      ? BO3_UTILS.formatDateDisplay(dailyMatches.meta.prev_date)
      : undefined,
    nextDisplayDate: dailyMatches.meta.next_date
      ? BO3_UTILS.formatDateDisplay(dailyMatches.meta.next_date)
      : undefined,
  }

  return {
    date: dailyMatches.date,
    displayDate: BO3_UTILS.formatDateDisplay(dailyMatches.date),
    summary,
    matches: {
      live: liveMatches,
      upcoming: upcomingMatches,
      finished: finishedMatches,
      highTier: dailyMatches.high_tier,
      all: dailyMatches.matches,
    },
    navigation,
    teams,
    tournaments,
  }
}

/**
 * Get live matches with real-time updates
 */
export async function getLiveMatchesView(): Promise<{
  matches: BO3EnrichedMatch[]
  count: number
  lastUpdated: string
}> {
  const liveMatches = await getLiveMatches()

  return {
    matches: liveMatches,
    count: liveMatches.length,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Get matches by tier for specific view
 */
export async function getMatchesByTier(tier: BO3Tier, date?: string): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()
  return filterMatches(dailyMatches.matches, { tier, disciplineId: 1 })
}

/**
 * Get matches by status for specific view
 */
export async function getMatchesByStatus(
  status: BO3MatchStatus,
  date?: string,
): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()
  return filterMatches(dailyMatches.matches, { status, disciplineId: 1 })
}

/**
 * Get matches for specific team
 */
export async function getTeamMatches(teamId: number, date?: string): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()
  return filterMatches(dailyMatches.matches, { teamId, disciplineId: 1 })
}

/**
 * Get matches for specific tournament
 */
export async function getTournamentMatches(
  tournamentId: number,
  date?: string,
): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()
  return filterMatches(dailyMatches.matches, { tournamentId, disciplineId: 1 })
}

/**
 * Get match details for a specific match ID
 */
export async function getMatchDetails(
  matchId: number,
  date?: string,
): Promise<BO3EnrichedMatch | null> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()
  return dailyMatches.matches.find((match) => match.id === matchId) || null
}

/**
 * Search matches by team name
 */
export async function searchMatchesByTeam(
  teamName: string,
  date?: string,
): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()
  const searchTerm = teamName.toLowerCase()

  return dailyMatches.matches.filter((match) => {
    const team1Name = match.team1_data?.name?.toLowerCase() || ''
    const team2Name = match.team2_data?.name?.toLowerCase() || ''
    return team1Name.includes(searchTerm) || team2Name.includes(searchTerm)
  })
}

/**
 * Get featured matches (high tier, live, or upcoming high-stakes matches)
 */
export async function getFeaturedMatches(date?: string): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()

  // Prioritize live matches, then high tier upcoming matches
  const liveMatches = filterMatches(dailyMatches.matches, BO3_FILTERS.liveOnly())
  const highTierUpcoming = filterMatches(dailyMatches.matches, {
    tier: 'a',
    status: 'upcoming',
    disciplineId: 1,
  })

  // Combine and sort by importance
  const featured = [...liveMatches, ...highTierUpcoming]
    .sort((a, b) => {
      // Live matches first
      if (a.status === 'live' && b.status !== 'live') return -1
      if (b.status === 'live' && a.status !== 'live') return 1

      // Then by stars/importance
      return (b.stars || 0) - (a.stars || 0)
    })
    .slice(0, 6) // Top 6 featured matches

  return featured
}
