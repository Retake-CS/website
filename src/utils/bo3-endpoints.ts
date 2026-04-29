// BO3.gg API Endpoints Documentation
// Updated for real API structure with tiers and included data

import { BO3MatchesParams, BO3MatchFilters, BO3Tier, BO3MatchStatus } from './bo3.types'

/**
 * BO3.gg API Configuration
 */
export const BO3_CONFIG = {
  baseUrl: 'https://bo3.gg/api',
  userAgent: 'retakecs/1.0',
  disciplines: {
    CS2: 1,
  },
  tiers: ['a', 'b', 'c'] as BO3Tier[],
  statuses: ['upcoming', 'live', 'finished', 'defwin', 'postponed'] as BO3MatchStatus[],
} as const

/**
 * BO3.gg API Endpoints
 */
export const BO3_ENDPOINTS = {
  /**
   * GET /matches - Daily matches with tiers and included data
   *
   * Response structure:
   * {
   *   "data": {
   *     "tiers": {
   *       "high_tier": {
   *         "codes": ["esl_pro_league_s20"],
   *         "tournaments": ["1"],
   *         "matches": [...]
   *       },
   *       "low_tier": {
   *         "codes": [...],
   *         "tournaments": [...],
   *         "matches": [...]
   *       }
   *     }
   *   },
   *   "included": {
   *     "teams": {
   *       "1": { "slug": "natus-vincere", "name": "NATUS VINCERE", ... },
   *       "2": { "slug": "team-vitality", "name": "Team Vitality", ... }
   *     },
   *     "tournaments": {
   *       "1": { "id": 123, "slug": "esl-pro-league", "name": "ESL Pro League", ... }
   *     }
   *   },
   *   "meta": {
   *     "date": "2024-12-20",
   *     "prev_date": "2024-12-19",
   *     "next_date": "2024-12-21"
   *   }
   * }
   */
  matches: '/matches',
} as const

/**
 * Query parameter builders
 */
export const BO3_QUERY_BUILDERS = {
  /**
   * Build matches query parameters
   */
  buildMatchesParams(params: BO3MatchesParams = {}): Record<string, any> {
    const queryParams: Record<string, any> = {}

    // Date parameter (YYYY-MM-DD)
    if (params.date) {
      queryParams.date = params.date
    }

    // UTC offset in seconds
    if (params.utc_offset !== undefined) {
      queryParams.utc_offset = params.utc_offset
    }

    // Filters
    if (params.filter) {
      queryParams.filter = params.filter
    }

    return queryParams
  },

  /**
   * Build CS2 only filter
   */
  buildCS2Filter(): BO3MatchesParams {
    return {
      filter: {
        discipline_id: { eq: BO3_CONFIG.disciplines.CS2 },
      },
    }
  },

  /**
   * Build tier filter
   */
  buildTierFilter(tier: BO3Tier): BO3MatchesParams {
    return {
      filter: {
        tier: { eq: tier },
      },
    }
  },

  /**
   * Build date-specific params
   */
  buildDateParams(date: string, utcOffset = 0): BO3MatchesParams {
    return {
      date,
      utc_offset: utcOffset,
      ...BO3_QUERY_BUILDERS.buildCS2Filter(),
    }
  },
} as const

/**
 * Response mappers for transforming API data
 */
export const BO3_MAPPERS = {
  /**
   * Extract all matches from tiers
   */
  extractAllMatches(tiersData: { high_tier?: any; low_tier?: any }) {
    return [...(tiersData.high_tier?.matches || []), ...(tiersData.low_tier?.matches || [])]
  },

  /**
   * Map team reference to team data
   */
  mapTeamData(teamRef: string, teamsIncluded: Record<string, any>) {
    return teamsIncluded[teamRef] || null
  },

  /**
   * Map tournament reference to tournament data
   */
  mapTournamentData(tournamentRef: string, tournamentsIncluded: Record<string, any>) {
    return tournamentsIncluded[tournamentRef] || null
  },

  /**
   * Calculate match statistics
   */
  calculateMatchStats(matches: any[]) {
    const stats = {
      total: matches.length,
      byTier: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byDiscipline: {} as Record<string, number>,
    }

    matches.forEach((match) => {
      // Count by tier
      stats.byTier[match.tier] = (stats.byTier[match.tier] || 0) + 1

      // Count by status
      stats.byStatus[match.status] = (stats.byStatus[match.status] || 0) + 1

      // Count by discipline
      stats.byDiscipline[match.discipline_id] = (stats.byDiscipline[match.discipline_id] || 0) + 1
    })

    return stats
  },

  /**
   * Format match for display
   */
  formatMatchDisplay(match: any, teamData: any, tournamentData: any) {
    return {
      id: match.id,
      title: `${teamData.team1?.name || 'TBD'} vs ${teamData.team2?.name || 'TBD'}`,
      score: `${match.team1_score} - ${match.team2_score}`,
      status: match.status,
      tier: match.tier,
      tournament: tournamentData?.name || 'Unknown Tournament',
      startDate: match.start_date,
      isLive: match.status === 'live',
      hasLiveCoverage: !!match.live_coverage,
      stars: match.stars,
    }
  },
} as const

/**
 * Common filter presets
 */
export const BO3_FILTERS = {
  /**
   * Only CS2 matches
   */
  cs2Only: (): BO3MatchFilters => ({
    disciplineId: BO3_CONFIG.disciplines.CS2,
  }),

  /**
   * Only live matches
   */
  liveOnly: (): BO3MatchFilters => ({
    status: 'live',
    disciplineId: BO3_CONFIG.disciplines.CS2,
  }),

  /**
   * Only upcoming matches
   */
  upcomingOnly: (): BO3MatchFilters => ({
    status: 'upcoming',
    disciplineId: BO3_CONFIG.disciplines.CS2,
  }),

  /**
   * Only finished matches
   */
  finishedOnly: (): BO3MatchFilters => ({
    status: 'finished',
    disciplineId: BO3_CONFIG.disciplines.CS2,
  }),

  /**
   * High tier matches only
   */
  highTierOnly: (): BO3MatchFilters => ({
    tier: 'a',
    disciplineId: BO3_CONFIG.disciplines.CS2,
  }),

  /**
   * Matches for specific team
   */
  forTeam: (teamId: number): BO3MatchFilters => ({
    teamId,
    disciplineId: BO3_CONFIG.disciplines.CS2,
  }),

  /**
   * Matches for specific tournament
   */
  forTournament: (tournamentId: number): BO3MatchFilters => ({
    tournamentId,
    disciplineId: BO3_CONFIG.disciplines.CS2,
  }),
} as const

/**
 * Utility functions for working with BO3 data
 */
export const BO3_UTILS = {
  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0]
  },

  /**
   * Get yesterday's date
   */
  getYesterdayDate(): string {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  },

  /**
   * Get tomorrow's date
   */
  getTomorrowDate(): string {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  },

  /**
   * Format date for display
   */
  formatDateDisplay(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  },

  /**
   * Check if match is live
   */
  isMatchLive(match: any): boolean {
    return match.status === 'live'
  },

  /**
   * Check if match is upcoming
   */
  isMatchUpcoming(match: any): boolean {
    return match.status === 'upcoming'
  },

  /**
   * Check if match is finished
   */
  isMatchFinished(match: any): boolean {
    return ['finished', 'defwin'].includes(match.status)
  },

  /**
   * Get match tier display name
   */
  getTierDisplayName(tier: string): string {
    const tierNames: Record<string, string> = {
      a: 'Tier 1',
      b: 'Tier 2',
      c: 'Tier 3',
    }
    return tierNames[tier] || `Tier ${tier.toUpperCase()}`
  },

  /**
   * Calculate time until match starts
   */
  getTimeUntilMatch(startDate: string): string {
    const now = new Date()
    const matchDate = new Date(startDate)
    const diffMs = matchDate.getTime() - now.getTime()

    if (diffMs <= 0) {
      return 'Started'
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    } else {
      return `${diffMinutes}m`
    }
  },
} as const

export default {
  config: BO3_CONFIG,
  endpoints: BO3_ENDPOINTS,
  queryBuilders: BO3_QUERY_BUILDERS,
  mappers: BO3_MAPPERS,
  filters: BO3_FILTERS,
  utils: BO3_UTILS,
}
