import type { Payload } from 'payload'

import type { BO3Match, BO3Team, BO3Tournament } from '../utils/bo3.types'
import {
  extractMatchesFromV2Response,
  getCurrentMatchesV2,
  getFinishedMatchesV2,
  getUpcomingMatchesV2,
} from '../utils/bo3.requests'

export type SyncAction = 'created' | 'updated'
export type BO3SyncMode = 'live-priority' | 'full' | 'date-only'

type EndpointName = 'live' | 'upcoming' | 'finished_recent' | 'date_only'

type EndpointMetricStatus = 'success' | 'failed' | 'skipped_circuit_open'

export type EndpointSyncMetric = {
  endpoint: EndpointName
  status: EndpointMetricStatus
  fetchedCount: number
  durationMs: number
  retryCount: number
  circuitOpen: boolean
  errorMessage?: string
}

export type BO3SyncHealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export type BO3SyncHealthReport = {
  status: BO3SyncHealthStatus
  generatedAt: string
  live: {
    total: number
    stale: number
    staleThresholdMinutes: number
  }
  latestRun: {
    startedAt?: string
    finishedAt?: string
    failed?: number
    mode?: BO3SyncMode
    isStale: boolean
    staleThresholdMinutes: number
  }
}

export type BO3SyncFetchers = {
  live: () => Promise<BO3Match[]>
  upcoming: () => Promise<BO3Match[]>
  finishedRecent: () => Promise<BO3Match[]>
  byDate: (date: string) => Promise<BO3Match[]>
}

export type BO3SyncSummary = {
  fetched: number
  processed: number
  created: number
  updated: number
  failed: number
  mode: BO3SyncMode
  endpointBreakdown: Record<EndpointName, number>
  endpointMetrics: EndpointSyncMetric[]
}

export type SyncLogger = Pick<Console, 'info' | 'warn' | 'error'>

const CIRCUIT_BREAKER_FAILURE_THRESHOLD = Number(
  process.env.BO3_SYNC_CIRCUIT_BREAKER_FAILURE_THRESHOLD || 3,
)
const CIRCUIT_BREAKER_COOLDOWN_MS = Number(
  process.env.BO3_SYNC_CIRCUIT_BREAKER_COOLDOWN_MS || 120000,
)
const BO3_SYNC_UTC_OFFSET_SECONDS = Number(process.env.BO3_SYNC_UTC_OFFSET_SECONDS || -10800)

const endpointCircuitState = new Map<
  EndpointName,
  {
    consecutiveFailures: number
    openUntil?: number
  }
>()

export function resetBO3EndpointCircuitStateForTests(): void {
  endpointCircuitState.clear()
}

function getBO3CalendarDate(offsetSeconds = BO3_SYNC_UTC_OFFSET_SECONDS): string {
  const shiftedNow = new Date(Date.now() + offsetSeconds * 1000)
  return shiftedNow.toISOString().split('T')[0]
}

function getBO3CalendarDateOffset(
  daysOffset: number,
  offsetSeconds = BO3_SYNC_UTC_OFFSET_SECONDS,
): string {
  const shiftedNow = new Date(Date.now() + offsetSeconds * 1000 + daysOffset * 86400000)
  return shiftedNow.toISOString().split('T')[0]
}

const defaultFetchers: BO3SyncFetchers = {
  live: async () => {
    const response = await getCurrentMatchesV2(undefined, BO3_SYNC_UTC_OFFSET_SECONDS, [
      'teams',
      'tournament',
    ])
    return extractMatchesFromV2Response(response)
  },
  upcoming: async () => {
    // V2 /upcoming REQUIRES a date parameter.
    // Fetch upcoming for today AND tomorrow in parallel (per reference scripts pattern),
    // then filter to only return matches actually scheduled within today+tomorrow window.
    // This prevents matches 3+ days ahead from polluting the sync.
    const today = getBO3CalendarDate()
    const tomorrow = getBO3CalendarDateOffset(1)

    const [todayRes, tomorrowRes] = await Promise.all([
      getUpcomingMatchesV2(today, undefined, BO3_SYNC_UTC_OFFSET_SECONDS, ['teams', 'tournament']),
      getUpcomingMatchesV2(tomorrow, undefined, BO3_SYNC_UTC_OFFSET_SECONDS, [
        'teams',
        'tournament',
      ]),
    ])

    const todayMatches = extractMatchesFromV2Response(todayRes)
    const tomorrowMatches = extractMatchesFromV2Response(tomorrowRes)

    // Dedup and filter to today + tomorrow only
    const dayAfterTomorrow = getBO3CalendarDateOffset(2)
    const dedup = new Map<number, BO3Match>()
    for (const m of [...todayMatches, ...tomorrowMatches]) {
      const matchDate = (m.start_date || '').split('T')[0]
      if (matchDate >= today && matchDate < dayAfterTomorrow) {
        dedup.set(m.id, m)
      }
    }
    return Array.from(dedup.values())
  },
  finishedRecent: async () => {
    const today = getBO3CalendarDate()
    const yesterday = getBO3CalendarDateOffset(-1)

    // Fetch finished for today AND yesterday in parallel for a more complete picture
    const [todayRes, yesterdayRes] = await Promise.all([
      getFinishedMatchesV2(today, undefined, BO3_SYNC_UTC_OFFSET_SECONDS, [
        'teams',
        'tournament',
        'games',
      ]),
      getFinishedMatchesV2(yesterday, undefined, BO3_SYNC_UTC_OFFSET_SECONDS, [
        'teams',
        'tournament',
        'games',
      ]),
    ])

    const todayMatches = extractMatchesFromV2Response(todayRes)
    const yesterdayMatches = extractMatchesFromV2Response(yesterdayRes)

    const dedup = new Map<number, BO3Match>()
    for (const m of [...yesterdayMatches, ...todayMatches]) {
      dedup.set(m.id, m)
    }
    return Array.from(dedup.values())
  },
  byDate: async (date: string) => {
    // Fetch ALL matches for a specific date: finished + upcoming + live
    // Only include matches whose start_date matches the requested date (strict day filter)
    const [finishedRes, upcomingRes, liveRes] = await Promise.all([
      getFinishedMatchesV2(date, undefined, BO3_SYNC_UTC_OFFSET_SECONDS, [
        'teams',
        'tournament',
        'ai_predictions',
        'games',
      ]),
      getUpcomingMatchesV2(date, undefined, BO3_SYNC_UTC_OFFSET_SECONDS, [
        'teams',
        'tournament',
        'ai_predictions',
        'games',
      ]),
      getCurrentMatchesV2(undefined, BO3_SYNC_UTC_OFFSET_SECONDS, [
        'teams',
        'tournament',
        'ai_predictions',
        'games',
      ]),
    ])
    const finished = extractMatchesFromV2Response(finishedRes)
    // Filter upcoming strictly to the requested date (V2 /upcoming may return future days too)
    const upcoming = extractMatchesFromV2Response(upcomingRes).filter(
      (m) => (m.start_date || '').split('T')[0] === date,
    )
    const live = extractMatchesFromV2Response(liveRes)

    // Dedup (live matches might overlap with upcoming/finished for today)
    const dedup = new Map<number, BO3Match>()
    for (const m of [...finished, ...upcoming, ...live]) {
      dedup.set(m.id, m)
    }
    return Array.from(dedup.values())
  },
}

export async function withExponentialRetry<T>(
  operation: () => Promise<T>,
  options: {
    attempts?: number
    baseDelayMs?: number
    logger?: SyncLogger
    operationName?: string
    onRetry?: (args: { attempt: number; delay: number; error: unknown }) => void
  } = {},
): Promise<T> {
  const attempts = options.attempts ?? 5
  const baseDelayMs = options.baseDelayMs ?? 1_000
  const logger = options.logger ?? console
  const operationName = options.operationName ?? 'operation'

  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === attempts) break

      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      options.onRetry?.({
        attempt,
        delay,
        error,
      })
      logger.warn(
        `[bo3-sync] ${operationName} failed on attempt ${attempt}/${attempts}. Retrying in ${delay}ms.`,
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

function normalizeMatchStatus(status: string): string {
  if (status === 'finished' || status === 'defwin') return 'completed'
  if (status === 'live' || status === 'current') return 'live'
  if (status === 'postponed') return 'postponed'
  return 'upcoming'
}

function buildMapsData(match: BO3Match): Array<Record<string, unknown>> {
  if (!Array.isArray(match.games)) return []

  return match.games.map((game) => ({
    mapName: game.map_name || 'unknown',
    status: game.status,
    team1Score: game.winner_clan_score ?? 0,
    team2Score: game.loser_clan_score ?? 0,
  }))
}

function calculateMissingCriticalFields(match: BO3Match): string[] {
  const missing: string[] = []

  if (!match.team1_id) missing.push('team1_id')
  if (!match.team2_id) missing.push('team2_id')
  if (!match.tournament_id) missing.push('tournament_id')
  if (!match.team1?.name) missing.push('team1.name')
  if (!match.team2?.name) missing.push('team2.name')
  if (!match.tournament?.name) missing.push('tournament.name')

  return missing
}

function mapTeamData(team: BO3Team): Record<string, unknown> {
  const teamName = (team.name || '').trim() || `Unknown Team ${team.id}`

  return {
    externalTeamId: team.id,
    slug: team.slug,
    name: teamName,
    shortName: team.acronym || teamName,
    imageUrl: team.image_url,
    country: team.country_id ? String(team.country_id) : undefined,
    countryId: team.country_id,
    ranking: team.rank,
    source: 'bo3.gg',
    lastSyncedAt: new Date().toISOString(),
  }
}

function mapTournamentData(tournament: BO3Tournament): Record<string, unknown> {
  const tournamentName = (tournament.name || '').trim() || `Unknown Tournament ${tournament.id}`

  return {
    externalTournamentId: tournament.id,
    slug: tournament.slug,
    name: tournamentName,
    status: tournament.status,
    tier: tournament.tier,
    tierRank: tournament.tier_rank,
    prizePool: tournament.prize ? String(tournament.prize) : undefined,
    source: 'bo3.gg',
    lastSyncedAt: new Date().toISOString(),
  }
}

/**
 * In-memory lookup cache populated by prefetchRelatedEntities().
 * Key = externalTeamId / externalTournamentId, Value = Payload doc id.
 * Scoped to a single sync run – cleared at the start of each batch.
 */
const teamIdCache = new Map<number, string | number>()
const tournamentIdCache = new Map<number, string | number>()

/**
 * Bulk-fetch all teams and tournaments referenced by a batch of matches
 * so individual upserts can resolve IDs from cache instead of querying
 * one-by-one (eliminates N+1).
 */
export async function prefetchRelatedEntities({
  payload,
  matches,
  logger = console,
}: {
  payload: Payload
  matches: BO3Match[]
  logger?: SyncLogger
}): Promise<void> {
  teamIdCache.clear()
  tournamentIdCache.clear()

  const uniqueTeamIds = Array.from(
    new Set(
      matches.flatMap((m) => [m.team1_id, m.team2_id].filter((id): id is number => id != null)),
    ),
  )
  const uniqueTournamentIds = Array.from(
    new Set(matches.map((m) => m.tournament_id).filter((id): id is number => id != null)),
  )

  const payloadFind = (payload as any)?.find
  if (typeof payloadFind !== 'function') return

  try {
    const [teamsResult, tournamentsResult] = await Promise.all([
      uniqueTeamIds.length > 0
        ? payloadFind({
            collection: 'teams',
            where: { externalTeamId: { in: uniqueTeamIds } },
            limit: uniqueTeamIds.length + 10,
            depth: 0,
          })
        : { docs: [] },
      uniqueTournamentIds.length > 0
        ? payloadFind({
            collection: 'tournaments',
            where: { externalTournamentId: { in: uniqueTournamentIds } },
            limit: uniqueTournamentIds.length + 10,
            depth: 0,
          })
        : { docs: [] },
    ])

    for (const doc of teamsResult.docs ?? []) {
      const extId = (doc as any).externalTeamId
      if (extId != null) teamIdCache.set(Number(extId), (doc as any).id)
    }
    for (const doc of tournamentsResult.docs ?? []) {
      const extId = (doc as any).externalTournamentId
      if (extId != null) tournamentIdCache.set(Number(extId), (doc as any).id)
    }

    logger.info(
      `[bo3-sync] prefetch cache loaded: ${teamIdCache.size} teams, ${tournamentIdCache.size} tournaments`,
    )
  } catch (error) {
    logger.warn('[bo3-sync] prefetch failed, falling back to individual lookups')
  }
}

export async function upsertTeamByExternalId({
  payload,
  team,
}: {
  payload: Payload
  team?: BO3Team
}): Promise<number | string | undefined> {
  if (!team?.id) return undefined

  // Fast path: resolve from prefetch cache
  const cached = teamIdCache.get(team.id)
  if (cached !== undefined) {
    const data = mapTeamData(team)
    await payload.update({
      collection: 'teams',
      id: cached,
      data: data as any,
      depth: 0,
    })
    return cached
  }

  const existing = await payload.find({
    collection: 'teams',
    where: {
      externalTeamId: {
        equals: team.id,
      },
    },
    limit: 1,
    depth: 0,
  })

  const data = mapTeamData(team)
  const existingDoc = existing.docs?.[0]

  if (existingDoc?.id) {
    await payload.update({
      collection: 'teams',
      id: existingDoc.id,
      data: data as any,
      depth: 0,
    })
    teamIdCache.set(team.id, existingDoc.id as string | number)
    return existingDoc.id
  }

  const created = await payload.create({
    collection: 'teams',
    data: data as any,
    depth: 0,
  })
  teamIdCache.set(team.id, created.id as string | number)
  return created.id
}

export async function upsertTournamentByExternalId({
  payload,
  tournament,
}: {
  payload: Payload
  tournament?: BO3Tournament
}): Promise<number | string | undefined> {
  if (!tournament?.id) return undefined

  // Fast path: resolve from prefetch cache
  const cached = tournamentIdCache.get(tournament.id)
  if (cached !== undefined) {
    const data = mapTournamentData(tournament)
    await payload.update({
      collection: 'tournaments',
      id: cached,
      data: data as any,
      depth: 0,
    })
    return cached
  }

  const existing = await payload.find({
    collection: 'tournaments',
    where: {
      externalTournamentId: {
        equals: tournament.id,
      },
    },
    limit: 1,
    depth: 0,
  })

  const data = mapTournamentData(tournament)
  const existingDoc = existing.docs?.[0]

  if (existingDoc?.id) {
    await payload.update({
      collection: 'tournaments',
      id: existingDoc.id,
      data: data as any,
      depth: 0,
    })
    tournamentIdCache.set(tournament.id, existingDoc.id as string | number)
    return existingDoc.id
  }

  const created = await payload.create({
    collection: 'tournaments',
    data: data as any,
    depth: 0,
  })
  tournamentIdCache.set(tournament.id, created.id as string | number)
  return created.id
}

export async function upsertMatchByExternalId({
  payload,
  match,
  logger = console,
}: {
  payload: Payload
  match: BO3Match
  logger?: SyncLogger
}): Promise<SyncAction> {
  const nowIso = new Date().toISOString()
  const externalMatchId = String(match.id)

  const existing = await payload.find({
    collection: 'matches',
    where: {
      externalMatchId: {
        equals: externalMatchId,
      },
    },
    limit: 1,
    depth: 0,
  })

  const existingDoc = existing.docs?.[0] as any

  const statusForLazyScan = normalizeMatchStatus(match.status)
  const lastSyncedAt = existingDoc?.lastSyncedAt
    ? new Date(existingDoc.lastSyncedAt).getTime()
    : NaN

  const lazyRefreshWindowsMs: Record<'live' | 'upcoming' | 'completed' | 'postponed', number> = {
    live: Number(process.env.BO3_SYNC_LAZY_LIVE_REFRESH_MS || 30_000),
    upcoming: Number(process.env.BO3_SYNC_LAZY_UPCOMING_REFRESH_MS || 10 * 60_000),
    completed: Number(process.env.BO3_SYNC_LAZY_COMPLETED_REFRESH_MS || 2 * 60 * 60_000),
    postponed: Number(process.env.BO3_SYNC_LAZY_POSTPONED_REFRESH_MS || 30 * 60_000),
  }

  const lastCompletenessScore = Number(existingDoc?.syncMeta?.dataCompletenessScore ?? 0)
  const hasSameStatus = existingDoc?.bo3Status === match.status
  const canUseLazySkip =
    existingDoc?.id &&
    hasSameStatus &&
    Number.isFinite(lastSyncedAt) &&
    Date.now() - lastSyncedAt <
      lazyRefreshWindowsMs[statusForLazyScan as keyof typeof lazyRefreshWindowsMs] &&
    lastCompletenessScore >= 60

  if (canUseLazySkip) {
    logger.info(`[bo3-sync] lazy-skip match ${externalMatchId} (${statusForLazyScan})`)
    return 'updated'
  }

  const team1Id = await upsertTeamByExternalId({ payload, team: match.team1 })
  const team2Id = await upsertTeamByExternalId({ payload, team: match.team2 })
  const tournamentId = await upsertTournamentByExternalId({ payload, tournament: match.tournament })

  const previousBO3Status = existingDoc?.bo3Status as string | undefined
  const previousTransitions = Array.isArray(existingDoc?.statusTransitions)
    ? (existingDoc.statusTransitions as Array<Record<string, unknown>>)
    : []

  const statusChanged = !!previousBO3Status && previousBO3Status !== match.status

  const statusTransitions = existingDoc?.id
    ? statusChanged
      ? [
          ...previousTransitions,
          {
            fromStatus: previousBO3Status,
            toStatus: match.status,
            changedAt: nowIso,
            source: 'bo3-sync',
          },
        ]
      : previousTransitions
    : [
        {
          fromStatus: null,
          toStatus: match.status,
          changedAt: nowIso,
          source: 'bo3-sync',
        },
      ]

  const missingCriticalFields = calculateMissingCriticalFields(match)
  const dataCompletenessScore = Math.max(0, 100 - missingCriticalFields.length * 15)

  const inferredTeam1Name =
    match.team1?.name ||
    (match as any)?.team1_display_name ||
    (match.team1_id ? `Team ${match.team1_id}` : undefined)
  const inferredTeam2Name =
    match.team2?.name ||
    (match as any)?.team2_display_name ||
    (match.team2_id ? `Team ${match.team2_id}` : undefined)
  const inferredTournamentName =
    match.tournament?.name ||
    (match.tournament_id ? `Tournament ${match.tournament_id}` : undefined)

  const inferredDate = match.start_date || existingDoc?.startDate || nowIso

  const data: Record<string, unknown> = {
    externalMatchId,
    id: externalMatchId,
    status: normalizeMatchStatus(match.status),
    bo3Status: match.status,
    tier: match.tier,
    date: inferredDate,
    startDate: inferredDate,
    endDate: match.end_date,
    time: new Date(inferredDate).toISOString(),
    format: `bo${match.bo_type || 3}`,
    disciplineId: match.discipline_id,
    finalScore: {
      team1: match.team1_score ?? 0,
      team2: match.team2_score ?? 0,
    },
    team1ExternalId: match.team1_id,
    team2ExternalId: match.team2_id,
    tournamentExternalId: match.tournament_id,
    team1Name: inferredTeam1Name,
    team2Name: inferredTeam2Name,
    tournamentName: inferredTournamentName,
    team1: team1Id,
    team2: team2Id,
    tournament: tournamentId,
    maps: buildMapsData(match),
    statusTransitions,
    syncMeta: {
      firstSeenAt: existingDoc?.syncMeta?.firstSeenAt || nowIso,
      lastStatusChangeAt: statusChanged
        ? nowIso
        : existingDoc?.syncMeta?.lastStatusChangeAt || nowIso,
      lastLiveSeenAt:
        normalizeMatchStatus(match.status) === 'live'
          ? nowIso
          : existingDoc?.syncMeta?.lastLiveSeenAt,
      dataCompletenessScore,
      missingCriticalFields: missingCriticalFields.map((field) => ({ field })),
    },
    lastSyncedAt: nowIso,
    raw: match,
  }

  if (existingDoc?.id) {
    await payload.update({
      collection: 'matches',
      id: existingDoc.id,
      data: data as any,
      depth: 0,
    })

    logger.info(`[bo3-sync] updated match ${externalMatchId}`)
    return 'updated'
  }

  await payload.create({
    collection: 'matches',
    data: data as any,
    depth: 0,
  })

  logger.info(`[bo3-sync] created match ${externalMatchId}`)
  return 'created'
}

function rankStatus(status: string): number {
  if (status === 'live' || status === 'current') return 0
  if (status === 'upcoming') return 1
  if (status === 'finished' || status === 'defwin') return 2
  return 3
}

function getEndpointCircuit(endpoint: EndpointName) {
  if (!endpointCircuitState.has(endpoint)) {
    endpointCircuitState.set(endpoint, {
      consecutiveFailures: 0,
      openUntil: undefined,
    })
  }

  return endpointCircuitState.get(endpoint)!
}

function isCircuitOpen(endpoint: EndpointName): boolean {
  const state = getEndpointCircuit(endpoint)
  return typeof state.openUntil === 'number' && state.openUntil > Date.now()
}

function recordEndpointSuccess(endpoint: EndpointName): void {
  endpointCircuitState.set(endpoint, {
    consecutiveFailures: 0,
    openUntil: undefined,
  })
}

function recordEndpointFailure(endpoint: EndpointName): void {
  const state = getEndpointCircuit(endpoint)
  const nextFailures = state.consecutiveFailures + 1
  const shouldOpen = nextFailures >= CIRCUIT_BREAKER_FAILURE_THRESHOLD

  endpointCircuitState.set(endpoint, {
    consecutiveFailures: nextFailures,
    openUntil: shouldOpen ? Date.now() + CIRCUIT_BREAKER_COOLDOWN_MS : state.openUntil,
  })
}

function orderMatchesForMode(mode: BO3SyncMode, matches: BO3Match[]): BO3Match[] {
  if (mode !== 'live-priority') {
    return matches
  }

  return [...matches].sort((a, b) => rankStatus(a.status) - rankStatus(b.status))
}

async function fetchEndpointSafely({
  endpoint,
  operation,
  logger,
  retryAttempts,
  retryBaseDelayMs,
}: {
  endpoint: EndpointName
  operation: () => Promise<BO3Match[]>
  logger: SyncLogger
  retryAttempts?: number
  retryBaseDelayMs?: number
}): Promise<{ matches: BO3Match[]; metric: EndpointSyncMetric }> {
  if (isCircuitOpen(endpoint)) {
    return {
      matches: [],
      metric: {
        endpoint,
        status: 'skipped_circuit_open',
        fetchedCount: 0,
        durationMs: 0,
        retryCount: 0,
        circuitOpen: true,
        errorMessage: 'Circuit breaker open',
      },
    }
  }

  const startedAt = Date.now()
  let retryCount = 0

  try {
    const response = await withExponentialRetry(operation, {
      attempts: retryAttempts ?? 4,
      baseDelayMs: retryBaseDelayMs ?? (endpoint === 'live' ? 500 : 1_000),
      logger,
      operationName: `fetch:${endpoint}`,
      onRetry: () => {
        retryCount += 1
      },
    })

    recordEndpointSuccess(endpoint)

    return {
      matches: response,
      metric: {
        endpoint,
        status: 'success',
        fetchedCount: response.length,
        durationMs: Date.now() - startedAt,
        retryCount,
        circuitOpen: false,
      },
    }
  } catch (error) {
    recordEndpointFailure(endpoint)
    logger.error(`[bo3-sync] endpoint ${endpoint} failed and will be skipped`, error)

    return {
      matches: [],
      metric: {
        endpoint,
        status: 'failed',
        fetchedCount: 0,
        durationMs: Date.now() - startedAt,
        retryCount,
        circuitOpen: isCircuitOpen(endpoint),
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    }
  }
}

export async function fetchBO3MatchesByMode({
  mode,
  date,
  logger = console,
  fetchers = defaultFetchers,
  endpointRetryAttempts,
  endpointRetryBaseDelayMs,
}: {
  mode: BO3SyncMode
  date?: string
  logger?: SyncLogger
  fetchers?: BO3SyncFetchers
  endpointRetryAttempts?: number
  endpointRetryBaseDelayMs?: number
}): Promise<{
  matches: BO3Match[]
  endpointBreakdown: Record<EndpointName, number>
  endpointMetrics: EndpointSyncMetric[]
}> {
  const endpointBreakdown: Record<EndpointName, number> = {
    live: 0,
    upcoming: 0,
    finished_recent: 0,
    date_only: 0,
  }
  const endpointMetrics: EndpointSyncMetric[] = []

  if (date) {
    const byDate = await fetchEndpointSafely({
      endpoint: 'date_only',
      operation: () => fetchers.byDate(date),
      logger,
      retryAttempts: endpointRetryAttempts,
      retryBaseDelayMs: endpointRetryBaseDelayMs,
    })

    endpointBreakdown.date_only = byDate.matches.length
    endpointMetrics.push(byDate.metric)

    return {
      matches: orderMatchesForMode('date-only', byDate.matches),
      endpointBreakdown,
      endpointMetrics,
    }
  }

  const [live, upcoming, finishedRecent] = await Promise.all([
    fetchEndpointSafely({
      endpoint: 'live',
      operation: fetchers.live,
      logger,
      retryAttempts: endpointRetryAttempts,
      retryBaseDelayMs: endpointRetryBaseDelayMs,
    }),
    fetchEndpointSafely({
      endpoint: 'upcoming',
      operation: fetchers.upcoming,
      logger,
      retryAttempts: endpointRetryAttempts,
      retryBaseDelayMs: endpointRetryBaseDelayMs,
    }),
    fetchEndpointSafely({
      endpoint: 'finished_recent',
      operation: fetchers.finishedRecent,
      logger,
      retryAttempts: endpointRetryAttempts,
      retryBaseDelayMs: endpointRetryBaseDelayMs,
    }),
  ])

  endpointBreakdown.live = live.matches.length
  endpointBreakdown.upcoming = upcoming.matches.length
  endpointBreakdown.finished_recent = finishedRecent.matches.length
  endpointMetrics.push(live.metric, upcoming.metric, finishedRecent.metric)

  const dedup = new Map<number, BO3Match>()

  const mergeOrder =
    mode === 'live-priority'
      ? [...finishedRecent.matches, ...upcoming.matches, ...live.matches]
      : [...finishedRecent.matches, ...live.matches, ...upcoming.matches]

  for (const match of mergeOrder) {
    dedup.set(match.id, match)
  }

  return {
    matches: orderMatchesForMode(mode, Array.from(dedup.values())),
    endpointBreakdown,
    endpointMetrics,
  }
}

export async function fetchBO3MatchesForSync(date?: string): Promise<BO3Match[]> {
  const response = await fetchBO3MatchesByMode({
    mode: date ? 'date-only' : 'full',
    date,
  })

  return response.matches
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const safeConcurrency = Math.max(1, concurrency)
  const results: PromiseSettledResult<R>[] = []
  let cursor = 0

  const runners = Array.from({ length: Math.min(safeConcurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const currentIndex = cursor
      cursor += 1

      const settled = await Promise.allSettled([worker(items[currentIndex])])
      results.push(settled[0])
    }
  })

  await Promise.all(runners)
  return results
}

async function persistSyncMetrics({
  payload,
  mode,
  date,
  startedAt,
  finishedAt,
  summary,
  endpointMetrics,
  errorMessage,
  logger,
}: {
  payload: Payload
  mode: BO3SyncMode
  date?: string
  startedAt: Date
  finishedAt: Date
  summary: Omit<BO3SyncSummary, 'mode' | 'endpointMetrics'>
  endpointMetrics: EndpointSyncMetric[]
  errorMessage?: string
  logger: SyncLogger
}) {
  const create = (payload as any)?.create

  if (typeof create !== 'function') {
    return
  }

  try {
    await create({
      collection: 'bo3-sync-runs',
      data: {
        mode,
        date,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        fetched: summary.fetched,
        processed: summary.processed,
        created: summary.created,
        updated: summary.updated,
        failed: summary.failed,
        endpointBreakdown: summary.endpointBreakdown,
        endpointMetrics,
        errorMessage,
      },
      depth: 0,
    })
  } catch (error) {
    logger.error('[bo3-sync] failed to persist bo3 sync metrics', error)
  }
}

export async function syncBO3MatchesToPayload({
  payload,
  date,
  mode,
  batchSize,
  concurrency,
  upsertRetryAttempts,
  upsertRetryBaseDelayMs,
  fetchMatches = fetchBO3MatchesForSync,
  upsertMatch = upsertMatchByExternalId,
  logger = console,
}: {
  payload: Payload
  date?: string
  mode?: BO3SyncMode
  batchSize?: number
  concurrency?: number
  upsertRetryAttempts?: number
  upsertRetryBaseDelayMs?: number
  fetchMatches?: (date?: string) => Promise<BO3Match[]>
  upsertMatch?: (args: {
    payload: Payload
    match: BO3Match
    logger?: SyncLogger
  }) => Promise<SyncAction>
  logger?: SyncLogger
}): Promise<BO3SyncSummary> {
  const startedAt = new Date()
  const effectiveMode: BO3SyncMode = date ? 'date-only' : mode || 'full'

  const minIntervalByModeMs: Record<BO3SyncMode, number> = {
    'live-priority': Number(process.env.BO3_SYNC_MIN_INTERVAL_LIVE_MS || 45_000),
    full: Number(process.env.BO3_SYNC_MIN_INTERVAL_FULL_MS || 10 * 60_000),
    'date-only': Number(process.env.BO3_SYNC_MIN_INTERVAL_DATE_MS || 30 * 60_000),
  }

  const createPayloadFind = (payload as any)?.find
  if (typeof createPayloadFind === 'function' && fetchMatches === fetchBO3MatchesForSync) {
    try {
      const latestRunResult = await createPayloadFind({
        collection: 'bo3-sync-runs',
        sort: '-startedAt',
        limit: 1,
        depth: 0,
        where: {
          mode: {
            equals: effectiveMode,
          },
        },
      })

      const latestRun = latestRunResult?.docs?.[0] as any
      const latestFinishedAt = latestRun?.finishedAt
        ? new Date(latestRun.finishedAt).getTime()
        : NaN
      const minIntervalMs = minIntervalByModeMs[effectiveMode]

      if (Number.isFinite(latestFinishedAt) && Date.now() - latestFinishedAt < minIntervalMs) {
        logger.info(
          `[bo3-sync] cooldown-skip mode=${effectiveMode} remainingMs=${Math.max(0, minIntervalMs - (Date.now() - latestFinishedAt))}`,
        )

        return {
          fetched: 0,
          processed: 0,
          created: 0,
          updated: 0,
          failed: 0,
          mode: effectiveMode,
          endpointBreakdown: {
            live: 0,
            upcoming: 0,
            finished_recent: 0,
            date_only: 0,
          },
          endpointMetrics: [],
        }
      }
    } catch (error) {
      logger.warn('[bo3-sync] cooldown check failed, continuing sync run')
      logger.warn(error as any)
    }
  }

  const effectiveBatchSize =
    batchSize ??
    (effectiveMode === 'live-priority' ? 120 : effectiveMode === 'date-only' ? 200 : 300)

  const effectiveConcurrency =
    concurrency ?? (effectiveMode === 'live-priority' ? 8 : effectiveMode === 'date-only' ? 3 : 4)

  const effectiveRetryAttempts =
    upsertRetryAttempts ??
    (effectiveMode === 'live-priority' ? 5 : effectiveMode === 'date-only' ? 3 : 4)

  const effectiveRetryBaseDelayMs =
    upsertRetryBaseDelayMs ??
    (effectiveMode === 'live-priority' ? 400 : effectiveMode === 'date-only' ? 1_000 : 750)

  const fetchedByMode =
    fetchMatches === fetchBO3MatchesForSync
      ? await fetchBO3MatchesByMode({
          mode: effectiveMode,
          date,
          logger,
        })
      : {
          matches: await withExponentialRetry(() => fetchMatches(date), {
            attempts: 5,
            baseDelayMs: 1_000,
            logger,
            operationName: 'fetchBO3MatchesForSync',
          }),
          endpointBreakdown: {
            live: 0,
            upcoming: 0,
            finished_recent: 0,
            date_only: 0,
          } as Record<EndpointName, number>,
          endpointMetrics: [],
        }

  const matches = fetchedByMode.matches
  const chunk = matches.slice(0, effectiveBatchSize)

  // Pre-fetch all related teams/tournaments in 2 bulk queries
  // to populate the in-memory cache and avoid N+1 queries per match.
  if (chunk.length > 0 && upsertMatch === upsertMatchByExternalId) {
    await prefetchRelatedEntities({ payload, matches: chunk, logger })
  }

  if (chunk.length === 0) {
    logger.info('[bo3-sync] no matches available for sync')
    const result: BO3SyncSummary = {
      fetched: 0,
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      mode: effectiveMode,
      endpointBreakdown: fetchedByMode.endpointBreakdown,
      endpointMetrics: fetchedByMode.endpointMetrics,
    }

    await persistSyncMetrics({
      payload,
      mode: effectiveMode,
      date,
      startedAt,
      finishedAt: new Date(),
      summary: result,
      endpointMetrics: fetchedByMode.endpointMetrics,
      logger,
    })

    return result
  }

  const settled = await runWithConcurrency(chunk, effectiveConcurrency, (match) =>
    withExponentialRetry(
      () =>
        upsertMatch({
          payload,
          match,
          logger,
        }),
      {
        attempts: effectiveRetryAttempts,
        baseDelayMs: effectiveRetryBaseDelayMs,
        logger,
        operationName: `upsertMatch(${match.id})`,
      },
    ),
  )

  let created = 0
  let updated = 0
  let failed = 0

  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      if (result.value === 'created') created += 1
      if (result.value === 'updated') updated += 1
      return
    }

    failed += 1
    logger.error('[bo3-sync] failed match processing', result.reason)
  })

  const processed = created + updated

  logger.info(
    `[bo3-sync] summary mode=${effectiveMode} fetched=${chunk.length} processed=${processed} created=${created} updated=${updated} failed=${failed}`,
  )

  const result: BO3SyncSummary = {
    fetched: chunk.length,
    processed,
    created,
    updated,
    failed,
    mode: effectiveMode,
    endpointBreakdown: fetchedByMode.endpointBreakdown,
    endpointMetrics: fetchedByMode.endpointMetrics,
  }

  await persistSyncMetrics({
    payload,
    mode: effectiveMode,
    date,
    startedAt,
    finishedAt: new Date(),
    summary: result,
    endpointMetrics: fetchedByMode.endpointMetrics,
    logger,
  })

  return result
}

export async function getBO3SyncHealth({
  payload,
  liveStaleThresholdMinutes = Number(process.env.BO3_SYNC_HEALTH_LIVE_STALE_MINUTES || 3),
  runStaleThresholdMinutes = Number(process.env.BO3_SYNC_HEALTH_RUN_STALE_MINUTES || 15),
}: {
  payload: Payload
  liveStaleThresholdMinutes?: number
  runStaleThresholdMinutes?: number
}): Promise<BO3SyncHealthReport> {
  const now = Date.now()

  const [liveMatches, latestRunResult] = await Promise.all([
    payload.find({
      collection: 'matches',
      where: {
        status: {
          equals: 'live',
        },
      },
      limit: 500,
      depth: 0,
    }),
    payload.find({
      collection: 'bo3-sync-runs',
      sort: '-startedAt',
      limit: 1,
      depth: 0,
    }),
  ])

  const liveDocs = liveMatches.docs || []
  const staleCutoff = liveStaleThresholdMinutes * 60 * 1000

  const staleLive = liveDocs.filter((doc: any) => {
    if (!doc.lastSyncedAt) return true
    const parsed = new Date(doc.lastSyncedAt).getTime()
    if (Number.isNaN(parsed)) return true
    return now - parsed > staleCutoff
  }).length

  const latestRun = latestRunResult.docs?.[0] as any
  const runCutoff = runStaleThresholdMinutes * 60 * 1000

  const latestRunFinishedAt = latestRun?.finishedAt
    ? new Date(latestRun.finishedAt).getTime()
    : undefined
  const latestRunIsStale =
    !latestRunFinishedAt ||
    Number.isNaN(latestRunFinishedAt) ||
    now - latestRunFinishedAt > runCutoff

  let status: BO3SyncHealthStatus = 'healthy'

  if (latestRunIsStale || staleLive > 0) {
    status = 'degraded'
  }

  if (!latestRun || staleLive > 5 || (latestRun?.failed ?? 0) > 20) {
    status = 'unhealthy'
  }

  return {
    status,
    generatedAt: new Date(now).toISOString(),
    live: {
      total: liveDocs.length,
      stale: staleLive,
      staleThresholdMinutes: liveStaleThresholdMinutes,
    },
    latestRun: {
      startedAt: latestRun?.startedAt,
      finishedAt: latestRun?.finishedAt,
      failed: latestRun?.failed,
      mode: latestRun?.mode,
      isStale: latestRunIsStale,
      staleThresholdMinutes: runStaleThresholdMinutes,
    },
  }
}
