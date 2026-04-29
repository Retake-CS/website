// Team and Tournament Management Module
// Provides structured data for teams and tournaments from BO3.gg

import { getTodayMatches, getMatchesForDate } from '@/utils/bo3.requests'
import { BO3Team, BO3Tournament, BO3EnrichedMatch } from '@/utils/bo3.types'

export interface TeamProfile extends BO3Team {
  todayMatches: BO3EnrichedMatch[]
  upcomingMatches: BO3EnrichedMatch[]
  recentMatches: BO3EnrichedMatch[]
  stats: {
    matchesToday: number
    wins: number
    losses: number
    winRate?: number
  }
}

export interface TournamentProfile extends BO3Tournament {
  todayMatches: BO3EnrichedMatch[]
  totalMatches: number
  liveMatches: number
  upcomingMatches: number
  finishedMatches: number
  tierDistribution: Record<string, number>
  teams: BO3Team[]
}

export interface TeamsAndTournamentsView {
  teams: Record<string, TeamProfile>
  tournaments: Record<string, TournamentProfile>
  stats: {
    totalTeams: number
    totalTournaments: number
    activeTeams: number // Teams with matches today
    activeTournaments: number // Tournaments with matches today
    tierDistribution: Record<string, number>
  }
}

/**
 * Get comprehensive teams and tournaments view
 */
export async function getTeamsAndTournamentsView(date?: string): Promise<TeamsAndTournamentsView> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()

  // Process teams
  const teams: Record<string, TeamProfile> = {}
  const activeTeamIds = new Set<string>()

  Object.entries(dailyMatches.teams).forEach(([id, team]) => {
    const teamMatches = dailyMatches.matches.filter(
      (match) => String(match.team1_id) === id || String(match.team2_id) === id,
    )

    const upcomingMatches = teamMatches.filter((match) => match.status === 'upcoming')
    const recentMatches = teamMatches.filter((match) => match.status === 'finished')

    // Calculate stats
    const wins = recentMatches.filter(
      (match) =>
        (String(match.team1_id) === id && match.team1_score > match.team2_score) ||
        (String(match.team2_id) === id && match.team2_score > match.team1_score),
    ).length

    const losses = recentMatches.length - wins
    const winRate = recentMatches.length > 0 ? (wins / recentMatches.length) * 100 : undefined

    if (teamMatches.length > 0) {
      activeTeamIds.add(id)
    }

    teams[id] = {
      ...team,
      todayMatches: teamMatches,
      upcomingMatches,
      recentMatches,
      stats: {
        matchesToday: teamMatches.length,
        wins,
        losses,
        winRate,
      },
    }
  })

  // Process tournaments
  const tournaments: Record<string, TournamentProfile> = {}
  const activeTournamentIds = new Set<string>()
  const tierDistribution: Record<string, number> = {}

  Object.entries(dailyMatches.tournaments).forEach(([id, tournament]) => {
    const tournamentMatches = dailyMatches.matches.filter((match) => String(match.tournament_id) === id)

    const liveMatches = tournamentMatches.filter((match) => match.status === 'live').length
    const upcomingMatches = tournamentMatches.filter((match) => match.status === 'upcoming').length
    const finishedMatches = tournamentMatches.filter((match) => match.status === 'finished').length

    // Get unique teams in this tournament
    const tournamentTeamIds = new Set<string>()
    tournamentMatches.forEach((match) => {
      tournamentTeamIds.add(String(match.team1_id))
      tournamentTeamIds.add(String(match.team2_id))
    })

    const tournamentTeams = Array.from(tournamentTeamIds)
      .map((teamId) => dailyMatches.teams[teamId])
      .filter(Boolean)

    // Count tier distribution
    const tournamentTierDist: Record<string, number> = {}
    tournamentMatches.forEach((match) => {
      tournamentTierDist[match.tier] = (tournamentTierDist[match.tier] || 0) + 1
      tierDistribution[match.tier] = (tierDistribution[match.tier] || 0) + 1
    })

    if (tournamentMatches.length > 0) {
      activeTournamentIds.add(id)
    }

    tournaments[id] = {
      ...tournament,
      todayMatches: tournamentMatches,
      totalMatches: tournamentMatches.length,
      liveMatches,
      upcomingMatches,
      finishedMatches,
      tierDistribution: tournamentTierDist,
      teams: tournamentTeams,
    }
  })

  const stats = {
    totalTeams: Object.keys(teams).length,
    totalTournaments: Object.keys(tournaments).length,
    activeTeams: activeTeamIds.size,
    activeTournaments: activeTournamentIds.size,
    tierDistribution,
  }

  return {
    teams,
    tournaments,
    stats,
  }
}

/**
 * Get detailed team profile
 */
export async function getTeamProfile(teamId: string, date?: string): Promise<TeamProfile | null> {
  const view = await getTeamsAndTournamentsView(date)
  return view.teams[teamId] || null
}

/**
 * Get detailed tournament profile
 */
export async function getTournamentProfile(
  tournamentId: string,
  date?: string,
): Promise<TournamentProfile | null> {
  const view = await getTeamsAndTournamentsView(date)
  return view.tournaments[tournamentId] || null
}

/**
 * Search teams by name
 */
export async function searchTeams(query: string, date?: string): Promise<TeamProfile[]> {
  const view = await getTeamsAndTournamentsView(date)
  const searchTerm = query.toLowerCase()

  return Object.values(view.teams).filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm) || team.slug.toLowerCase().includes(searchTerm),
  )
}

/**
 * Search tournaments by name
 */
export async function searchTournaments(
  query: string,
  date?: string,
): Promise<TournamentProfile[]> {
  const view = await getTeamsAndTournamentsView(date)
  const searchTerm = query.toLowerCase()

  return Object.values(view.tournaments).filter(
    (tournament) =>
      tournament.name.toLowerCase().includes(searchTerm) ||
      tournament.slug.toLowerCase().includes(searchTerm),
  )
}

/**
 * Get top teams by match count today
 */
export async function getTopActiveTeams(limit = 50, date?: string): Promise<TeamProfile[]> {
  const view = await getTeamsAndTournamentsView(date)

  return Object.values(view.teams)
    .filter((team) => team.stats.matchesToday > 0)
    .sort((a, b) => b.stats.matchesToday - a.stats.matchesToday)
    .slice(0, limit)
}

/**
 * Get top tournaments by match count today
 */
export async function getTopActiveTournaments(
  limit = 10,
  date?: string,
): Promise<TournamentProfile[]> {
  const view = await getTeamsAndTournamentsView(date)

  return Object.values(view.tournaments)
    .filter((tournament) => tournament.totalMatches > 0)
    .sort((a, b) => b.totalMatches - a.totalMatches)
    .slice(0, limit)
}

/**
 * Get teams with best win rates (minimum 3 matches)
 */
export async function getTopTeamsByWinRate(limit = 50, date?: string): Promise<TeamProfile[]> {
  const view = await getTeamsAndTournamentsView(date)

  return Object.values(view.teams)
    .filter((team) => team.recentMatches.length >= 3 && team.stats.winRate !== undefined)
    .sort((a, b) => (b.stats.winRate || 0) - (a.stats.winRate || 0))
    .slice(0, limit)
}

/**
 * Get tournament statistics summary
 */
export async function getTournamentStats(date?: string): Promise<{
  totalTournaments: number
  byTier: Record<string, number>
  averageMatchesPerTournament: number
  topPrizes: Array<{ tournament: TournamentProfile; prize: number }>
}> {
  const view = await getTeamsAndTournamentsView(date)
  const tournaments = Object.values(view.tournaments)

  const byTier: Record<string, number> = {}
  let totalMatches = 0

  tournaments.forEach((tournament) => {
    byTier[tournament.tier] = (byTier[tournament.tier] || 0) + 1
    totalMatches += tournament.totalMatches
  })

  const topPrizes = tournaments
    .filter((tournament) => tournament.prize && tournament.prize > 0)
    .map((tournament) => ({ tournament, prize: tournament.prize! }))
    .sort((a, b) => b.prize - a.prize)
    .slice(0, 5)

  return {
    totalTournaments: tournaments.length,
    byTier,
    averageMatchesPerTournament: tournaments.length > 0 ? totalMatches / tournaments.length : 0,
    topPrizes,
  }
}
