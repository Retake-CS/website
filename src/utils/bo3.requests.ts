// BO3.gg API Client
// Refactored to work with real API structure with tiers and included data

import {
  BO3MatchesResponse,
  BO3MatchesParams,
  BO3EnrichedMatch,
  BO3DailyMatches,
  BO3MatchFilters,
  BO3Match,
  BO3Team,
  BO3Tournament,
  BO3WidgetMatchesParams,
  BO3WidgetMatchesQueryParams,
  BO3ApiResponse,
  BO3ApiV2Response,
  BO3ApiV2EnrichedMatch,
  TeamRankingsResponse,
  TeamRankingEntry,
  TeamInfo,
  Country,
  RosterPlayer,
  RankingsMeta,
  TeamDetail,
} from './bo3.types'

// Configuration
const BO3_API_BASE = process.env.BO3_API_BASE || 'https://api.bo3.gg/api/v1'
const BO3_USER_AGENT =
  process.env.BO3_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0'

// Cache for ETags and response deduplication
const etagCache = new Map<string, string>()
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

type BO3ApiVersion = 'v1' | 'v2'

// Rate limiting and backoff (centralized per API version)
const RATE_LIMIT_DELAY_BY_VERSION: Record<BO3ApiVersion, number> = {
  v1: Number(process.env.BO3_RATE_LIMIT_DELAY_V1_MS || 120),
  v2: Number(process.env.BO3_RATE_LIMIT_DELAY_V2_MS || 220),
}

const requestQueues: Record<BO3ApiVersion, Array<() => Promise<void>>> = {
  v1: [],
  v2: [],
}

const isProcessingQueue: Record<BO3ApiVersion, boolean> = {
  v1: false,
  v2: false,
}

/**
 * Execute requests with rate limiting and backoff
 */
async function executeWithRateLimit<T>(
  apiVersion: BO3ApiVersion,
  request: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueues[apiVersion].push(async () => {
      try {
        const result = await request()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })

    processQueue(apiVersion)
  })
}

async function processQueue(apiVersion: BO3ApiVersion) {
  if (isProcessingQueue[apiVersion] || requestQueues[apiVersion].length === 0) return

  isProcessingQueue[apiVersion] = true

  while (requestQueues[apiVersion].length > 0) {
    const request = requestQueues[apiVersion].shift()
    if (request) {
      try {
        await request()
      } catch (error) {
        console.error('Request failed:', error)
      }

      // Rate limiting delay
      if (requestQueues[apiVersion].length > 0) {
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_BY_VERSION[apiVersion]))
      }
    }
  }

  isProcessingQueue[apiVersion] = false
}

async function fetchWithRateLimitAndRetry<T>(
  apiVersion: BO3ApiVersion,
  url: string,
  init: RequestInit,
): Promise<T> {
  return executeWithRateLimit(apiVersion, async () => {
    return withRetry(async () => {
      const response = await fetch(url, init)

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After')
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN
        const retryDelayMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 1500

        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
        throw new Error(`BO3 API rate limited (429). Retrying after ${retryDelayMs}ms.`)
      }

      if (!response.ok) {
        throw new Error(`BO3 API error: ${response.status} ${response.statusText}`)
      }

      return (await response.json()) as T
    })
  })
}

/**
 * Exponential backoff retry logic
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt === maxRetries) break

      const delay = baseDelay * Math.pow(2, attempt)
      console.warn(
        `Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
        error,
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Make a request to BO3.gg API with caching and error handling
 */
async function makeBO3Request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  const url = new URL(BO3_API_BASE + endpoint)
  // Add query parameters with proper flattening
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Don't JSON encode objects - they should already be flattened
      url.searchParams.set(key, value.toString())
    }
  })

  const cacheKey = url.toString()

  // Check cache first
  const cached = responseCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  return executeWithRateLimit('v1', async () => {
    return withRetry(async () => {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        'User-Agent': BO3_USER_AGENT,
      }

      // Add ETag for conditional requests
      const cachedETag = etagCache.get(cacheKey)
      if (cachedETag) {
        headers['If-None-Match'] = cachedETag
      }
      const response = await fetch(url.toString(), { headers })

      // Handle 304 Not Modified
      if (response.status === 304 && cached) {
        return cached.data
      }

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After')
        const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : Number.NaN
        const retryDelayMs = Number.isFinite(retryAfterSeconds) ? retryAfterSeconds * 1000 : 1500

        await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
        throw new Error(`BO3 API rate limited (429). Retrying after ${retryDelayMs}ms.`)
      }

      if (!response.ok) {
        throw new Error(`BO3 API error: ${response.status} ${response.statusText}`)
      }

      // Store ETag for future requests
      const etag = response.headers.get('ETag')
      if (etag) {
        etagCache.set(cacheKey, etag)
      }

      const data = await response.json()

      // Cache the response
      responseCache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    })
  })
}

/**
 * Fetch matches for a specific date
 */
export async function fetchDailyMatches(
  params: BO3MatchesParams = {},
): Promise<BO3MatchesResponse> {
  const flatParams: Record<string, any> = {
    utc_offset: 0,
    'filter[discipline_id][eq]': 1, // CS2
    with: 'teams,tournament,ai_predictions,games',
  }

  // Add date if provided
  if (params.date) {
    flatParams.date = params.date
  }

  // Add any additional filters from params
  if (params.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([op, val]) => {
          flatParams[`filter[${key}][${op}]`] = val
        })
      } else {
        flatParams[`filter[${key}]`] = value
      }
    })
  }

  return makeBO3Request<BO3MatchesResponse>('/matches', flatParams)
}

/**
 * Enrich matches with team and tournament data from included section
 */
export function enrichMatches(
  matches: BO3Match[],
  included: { teams: Record<string, BO3Team>; tournaments: Record<string, BO3Tournament> },
): BO3EnrichedMatch[] {
  return matches.map((match) => {
    const team1Key =
      typeof match.team1 === 'number' || typeof match.team1 === 'string'
        ? String(match.team1)
        : match.team1_id != null
          ? String(match.team1_id)
          : undefined
    const team2Key =
      typeof match.team2 === 'number' || typeof match.team2 === 'string'
        ? String(match.team2)
        : match.team2_id != null
          ? String(match.team2_id)
          : undefined
    const tournamentKey =
      typeof match.tournament === 'number' || typeof match.tournament === 'string'
        ? String(match.tournament)
        : match.tournament_id != null
          ? String(match.tournament_id)
          : undefined

    return {
      ...match,
      team1_data: team1Key ? included.teams[team1Key] : undefined,
      team2_data: team2Key ? included.teams[team2Key] : undefined,
      tournament_data: tournamentKey ? included.tournaments[tournamentKey] : undefined,
    }
  })
}

/**
 * Process daily matches response into a more usable format.
 * Handles BOTH the legacy V1 format (data.tiers + included + meta)
 * and the newer V1 format ({ total, results, links }).
 */
export function processDailyMatches(response: BO3MatchesResponse | any): BO3DailyMatches {
  // New V1 format: { total, results, links } — no tiers, no included
  if (response.results && Array.isArray(response.results)) {
    const allMatches: BO3Match[] = response.results
    // Matches already have team/tournament objects when `with=teams,tournament` is used
    const enrichedMatches: BO3EnrichedMatch[] = allMatches.map((m: BO3Match) => ({
      ...m,
      team1_data: m.team1 as any,
      team2_data: m.team2 as any,
      tournament_data: m.tournament as any,
    }))
    const highTier = enrichedMatches.filter((m) => m.tier === 's' || m.tier === 'a')
    const lowTier = enrichedMatches.filter((m) => m.tier !== 's' && m.tier !== 'a')

    const byTier: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    enrichedMatches.forEach((match) => {
      byTier[match.tier] = (byTier[match.tier] || 0) + 1
      byStatus[match.status] = (byStatus[match.status] || 0) + 1
    })

    const today = new Date().toISOString().split('T')[0]
    return {
      date: today,
      matches: enrichedMatches,
      high_tier: highTier,
      low_tier: lowTier,
      teams: {},
      tournaments: {},
      meta: {
        total_matches: enrichedMatches.length,
        by_tier: byTier,
        by_status: byStatus,
      },
    }
  }

  // Legacy V1 format: { data: { tiers }, included, meta }
  const { data, included, meta } = response
  const { tiers } = data

  // Combine all matches from both tiers
  const allMatches: BO3Match[] = [
    ...(tiers.high_tier?.matches || []),
    ...(tiers.low_tier?.matches || []),
  ]

  // Enrich matches with team and tournament data
  const enrichedMatches = enrichMatches(allMatches, included)
  const enrichedHighTier = enrichMatches(tiers.high_tier?.matches || [], included)
  const enrichedLowTier = enrichMatches(tiers.low_tier?.matches || [], included)

  // Calculate meta statistics
  const byTier: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  enrichedMatches.forEach((match) => {
    // Count by tier
    byTier[match.tier] = (byTier[match.tier] || 0) + 1

    // Count by status
    byStatus[match.status] = (byStatus[match.status] || 0) + 1
  })

  return {
    date: meta.date,
    matches: enrichedMatches,
    high_tier: enrichedHighTier,
    low_tier: enrichedLowTier,
    teams: included.teams,
    tournaments: included.tournaments,
    meta: {
      total_matches: enrichedMatches.length,
      by_tier: byTier,
      by_status: byStatus as Record<string, number>,
      prev_date: meta.prev_date,
      next_date: meta.next_date,
    },
  }
}

/**
 * Filter matches based on criteria
 */
export function filterMatches(
  matches: BO3EnrichedMatch[],
  filters: BO3MatchFilters,
): BO3EnrichedMatch[] {
  return matches.filter((match) => {
    // Filter by status
    if (filters.status && match.status !== filters.status) {
      return false
    }

    // Filter by tier
    if (filters.tier && match.tier !== filters.tier) {
      return false
    }

    // Filter by discipline
    if (filters.disciplineId && match.discipline_id !== filters.disciplineId) {
      return false
    }

    // Filter by team
    if (filters.teamId && match.team1_id !== filters.teamId && match.team2_id !== filters.teamId) {
      return false
    }

    // Filter by tournament
    if (filters.tournamentId && match.tournament_data?.id !== filters.tournamentId) {
      return false
    }

    return true
  })
}

/**
 * Get matches for today
 */
export async function getTodayMatches(): Promise<BO3DailyMatches> {
  const today = new Date().toISOString().split('T')[0]
  const response = await fetchDailyMatches({ date: today })
  return processDailyMatches(response)
}

/**
 * Get matches for a specific date
 */
export async function getMatchesForDate(date: string): Promise<BO3DailyMatches> {
  const response = await fetchDailyMatches({ date })
  return processDailyMatches(response)
}

/**
 * Get live matches only
 */
export async function getLiveMatches(): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = await getTodayMatches()
  return filterMatches(dailyMatches.matches, { status: 'live' })
}

/**
 * Get upcoming matches only
 */
export async function getUpcomingMatches(): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = await getTodayMatches()
  return filterMatches(dailyMatches.matches, { status: 'upcoming' })
}

/**
 * Get high tier matches only
 */
export async function getHighTierMatches(date?: string): Promise<BO3EnrichedMatch[]> {
  const dailyMatches = date ? await getMatchesForDate(date) : await getTodayMatches()
  return dailyMatches.high_tier
}

/**
 * Debug function to log API response structure (UPDATED for real structure)
 */
export async function debugAPIResponse(date?: string): Promise<void> {
  try {
    // Use the real API structure
    const response = await fetchMatchesWithIncludes({
      with: ['teams', 'tournament', 'ai_predictions', 'games'],
      limit: 1,
    })

    console.log('=== BO3 API Response Structure (Real) ===')
    console.log('Total:', JSON.stringify(response.total, null, 2))
    console.log('Results count:', response.results.length)

    if (response.results.length > 0) {
      const match = response.results[0]
      console.log('Sample match keys:', Object.keys(match))
      console.log('Team1 name:', match.team1?.name)
      console.log('Team2 name:', match.team2?.name)
      console.log('Tournament name:', match.tournament?.name)
      console.log('Has AI predictions?', !!match.ai_predictions)
      console.log('Games count:', match.games?.length || 0)

      // Show sample match structure (first few fields)
      const sampleMatch = {
        id: match.id,
        slug: match.slug,
        status: match.status,
        tier: match.tier,
        team1_id: match.team1_id,
        team2_id: match.team2_id,
        team1_score: match.team1_score,
        team2_score: match.team2_score,
        start_date: match.start_date,
        has_team1_object: !!match.team1,
        has_team2_object: !!match.team2,
        has_tournament_object: !!match.tournament,
      }
      console.log('Sample match:', JSON.stringify(sampleMatch, null, 2))
    }
  } catch (error) {
    console.error('Debug API response failed:', error)
  }
}

/**
 * Debug the actual API response structure
 */
export async function debugActualAPIResponse(): Promise<void> {
  console.log('=== Debugging Actual API Response ===')

  try {
    // Test bare minimum request and log the full response
    console.log('1. Bare minimum request structure:')
    const response1 = await makeBO3Request<any>('/matches', {})
    console.log('Full response:', JSON.stringify(response1, null, 2))

    console.log('\n2. With date parameter:')
    const today = new Date().toISOString().split('T')[0]
    const response2 = await makeBO3Request<any>('/matches', {
      date: today,
      utc_offset: 0,
    })
    console.log('Response keys:', Object.keys(response2))
    if (response2.results && response2.results.length > 0) {
      console.log('Sample result:', JSON.stringify(response2.results[0], null, 2))
    }

    console.log('\n3. Widget-matches scope:')
    const response3 = await makeBO3Request<any>('/matches', {
      scope: 'widget-matches',
      'page[offset]': 0,
      'page[limit]': 5,
    })
    console.log('Widget response keys:', Object.keys(response3))
    if (response3.results && response3.results.length > 0) {
      console.log('Sample widget result:', JSON.stringify(response3.results[0], null, 2))
    }
  } catch (error) {
    console.log('Debug failed:', error instanceof Error ? error.message : String(error))
  }

  console.log('=== Debug Complete ===')
}

/**
 * Convert structured widget matches parameters to URL query parameters
 */
export function buildWidgetMatchesQuery(
  params: BO3WidgetMatchesParams,
): BO3WidgetMatchesQueryParams {
  const query: BO3WidgetMatchesQueryParams = {
    scope: params.scope,
  }

  // Page parameters
  if (params.page?.offset !== undefined) {
    query['page[offset]'] = params.page.offset
  }
  if (params.page?.limit !== undefined) {
    query['page[limit]'] = params.page.limit
  }

  // Sort parameter
  if (params.sort) {
    query.sort = params.sort
  }

  // Filter parameters
  if (params.filter) {
    const { filter } = params

    // Match status filters
    if (filter['matches.status']?.in) {
      query['filter[matches.status][in]'] = filter['matches.status'].in.join(',')
    }
    if (filter['matches.status']?.eq) {
      query['filter[matches.status][eq]'] = filter['matches.status'].eq
    }

    // Discipline ID filter
    if (filter['matches.discipline_id']?.eq !== undefined) {
      query['filter[matches.discipline_id][eq]'] = filter['matches.discipline_id'].eq
    }

    // Tier filters
    if (filter['matches.tier']?.in) {
      query['filter[matches.tier][in]'] = filter['matches.tier'].in.join(',')
    }
    if (filter['matches.tier']?.eq) {
      query['filter[matches.tier][eq]'] = filter['matches.tier'].eq
    }

    // Date filters
    if (filter['matches.start_date']?.gte) {
      query['filter[matches.start_date][gte]'] = filter['matches.start_date'].gte
    }
    if (filter['matches.start_date']?.lte) {
      query['filter[matches.start_date][lte]'] = filter['matches.start_date'].lte
    }
  }

  // With parameter (includes)
  if (params.with && params.with.length > 0) {
    query.with = params.with.join(',')
  }

  return query
}

/**
 * Fetch matches using widget-matches scope with typed parameters
 */
export async function fetchWidgetMatches(
  params: BO3WidgetMatchesParams,
): Promise<BO3MatchesResponse> {
  const queryParams = buildWidgetMatchesQuery(params)

  // Convert query params to Record<string, any> for makeBO3Request
  const requestParams: Record<string, any> = {}
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined) {
      requestParams[key] = value
    }
  })

  return makeBO3Request<BO3MatchesResponse>('/matches', requestParams)
}

/**
 * NEW: Fetch matches using real API structure with 'with' parameter
 */
export async function fetchMatchesWithIncludes(
  params: {
    with?: string[]
    limit?: number
    offset?: number
    status?: string
    discipline_id?: number
    tier?: string
    start_date_gte?: string
    start_date_lte?: string
  } = {},
): Promise<BO3ApiResponse> {
  const queryParams: Record<string, any> = {}

  // Add 'with' parameter for including related data
  if (params.with && params.with.length > 0) {
    queryParams.with = params.with.join(',')
  }

  // Pagination
  if (params.limit !== undefined) {
    queryParams.limit = params.limit
  }
  if (params.offset !== undefined) {
    queryParams.offset = params.offset
  }

  // Filters (flatten to match API format)
  if (params.status) {
    queryParams['filter[status]'] = params.status
  }
  if (params.discipline_id !== undefined) {
    queryParams['filter[discipline_id]'] = params.discipline_id
  }
  if (params.tier) {
    queryParams['filter[tier]'] = params.tier
  }
  if (params.start_date_gte) {
    queryParams['filter[start_date][gte]'] = params.start_date_gte
  }
  if (params.start_date_lte) {
    queryParams['filter[start_date][lte]'] = params.start_date_lte
  }

  return makeBO3Request<BO3ApiResponse>('/matches', queryParams)
}

/**
 * NEW: Get current/live matches (simplified)
 */
export async function getCurrentMatchesSimple(): Promise<BO3Match[]> {
  const response = await fetchMatchesWithIncludes({
    with: ['teams', 'tournament', 'ai_predictions', 'games'],
    status: 'current',
    discipline_id: 1, // CS2
    limit: 50,
  })

  return response.results
}

/**
 * NEW: Get upcoming matches (simplified)
 */
export async function getUpcomingMatchesSimple(): Promise<BO3Match[]> {
  const response = await fetchMatchesWithIncludes({
    with: ['teams', 'tournament', 'ai_predictions'],
    status: 'upcoming',
    discipline_id: 1, // CS2
    limit: 50,
  })

  return response.results
}

/**
 * NEW: Get finished matches (simplified)
 */
export async function getFinishedMatchesSimple(limit: number = 20): Promise<BO3Match[]> {
  const response = await fetchMatchesWithIncludes({
    with: ['teams', 'tournament'],
    status: 'finished',
    discipline_id: 1, // CS2
    limit,
  })

  return response.results
}

/**
 * NEW: Get matches by tier (simplified)
 */
export async function getMatchesByTierSimple(tier: string, status?: string): Promise<BO3Match[]> {
  const response = await fetchMatchesWithIncludes({
    with: ['teams', 'tournament', 'ai_predictions'],
    tier,
    status,
    discipline_id: 1, // CS2
    limit: 100,
  })

  return response.results
}

/**
 * NEW: Get matches for a specific date range
 */
export async function getMatchesByDateRange(
  startDate: string,
  endDate?: string,
  withIncludes: string[] = ['teams', 'tournament'],
): Promise<BO3Match[]> {
  const response = await fetchMatchesWithIncludes({
    with: withIncludes,
    start_date_gte: startDate,
    start_date_lte: endDate || startDate,
    discipline_id: 1, // CS2
    limit: 100,
  })

  return response.results
}

/**
 * NEW: Debug function to test real API structure
 */
export async function debugRealAPIResponse(): Promise<void> {
  try {
    console.log('=== Testing Real BO3 API Structure ===')

    // Test minimal request
    const minimalResponse = await makeBO3Request<BO3ApiResponse>('/matches', { limit: 1 })
    console.log('Minimal response structure:')
    console.log('- Total:', minimalResponse.total)
    console.log('- Results count:', minimalResponse.results.length)
    if (minimalResponse.results.length > 0) {
      const match = minimalResponse.results[0]
      console.log('- Sample match keys:', Object.keys(match))
      console.log('- Has team1 object?', typeof match.team1 === 'object')
      console.log('- Has tournament object?', typeof match.tournament === 'object')
    }

    // Test with includes
    const withResponse = await fetchMatchesWithIncludes({
      with: ['teams', 'tournament', 'ai_predictions', 'games'],
      limit: 1,
    })
    console.log('\nWith includes response:')
    console.log('- Total:', withResponse.total)
    console.log('- Results count:', withResponse.results.length)
    if (withResponse.results.length > 0) {
      const match = withResponse.results[0]
      console.log('- Sample match keys:', Object.keys(match))
      console.log('- Team1 name:', match.team1?.name)
      console.log('- Team2 name:', match.team2?.name)
      console.log('- Tournament name:', match.tournament?.name)
      console.log('- Has AI predictions?', !!match.ai_predictions)
      console.log('- Games count:', match.games?.length || 0)
    }

    console.log('================================')
  } catch (error) {
    console.error('Debug real API response failed:', error)
  }
}

/**
 * Test minimal API request to see what the API accepts
 */
export async function testMinimalAPI(): Promise<void> {
  console.log('=== Testing Minimal API Requests ===')

  // Test 1: Bare minimum request
  try {
    console.log('1. Testing bare minimum /matches request...')
    const response1 = await makeBO3Request<any>('/matches', {})
    console.log('✅ Bare minimum request successful')
    console.log('Response keys:', Object.keys(response1))
  } catch (error) {
    console.log(
      '❌ Bare minimum request failed:',
      error instanceof Error ? error.message : String(error),
    )
  }

  // Test 2: With just utc_offset
  try {
    console.log('2. Testing with utc_offset only...')
    const response2 = await makeBO3Request<any>('/matches', {
      utc_offset: 0,
    })
    console.log('✅ UTC offset request successful')
  } catch (error) {
    console.log(
      '❌ UTC offset request failed:',
      error instanceof Error ? error.message : String(error),
    )
  }

  // Test 3: With date parameter
  try {
    console.log('3. Testing with date parameter...')
    const today = new Date().toISOString().split('T')[0]
    const response3 = await makeBO3Request<any>('/matches', {
      date: today,
      utc_offset: 0,
    })
    console.log('✅ Date parameter request successful')
  } catch (error) {
    console.log(
      '❌ Date parameter request failed:',
      error instanceof Error ? error.message : String(error),
    )
  }

  // Test 4: With widget-matches scope
  try {
    console.log('4. Testing widget-matches scope...')
    const response4 = await makeBO3Request<any>('/matches', {
      scope: 'widget-matches',
      'page[offset]': 0,
      'page[limit]': 10,
    })
    console.log('✅ Widget-matches scope request successful')
  } catch (error) {
    console.log(
      '❌ Widget-matches scope request failed:',
      error instanceof Error ? error.message : String(error),
    )
  }

  // Test 5: With simple filter
  try {
    console.log('5. Testing with simple discipline filter...')
    const response5 = await makeBO3Request<any>('/matches', {
      scope: 'widget-matches',
      'filter[matches.discipline_id][eq]': 1,
    })
    console.log('✅ Simple filter request successful')
  } catch (error) {
    console.log(
      '❌ Simple filter request failed:',
      error instanceof Error ? error.message : String(error),
    )
  }

  console.log('=== Minimal API Tests Complete ===')
}

/**
 * NEW: Get today's matches using real API structure
 */
export async function getTodayMatchesSimple(): Promise<BO3Match[]> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  const response = await fetchMatchesWithIncludes({
    with: ['teams', 'tournament', 'ai_predictions'],
    start_date_gte: today,
    start_date_lte: today,
    discipline_id: 1, // CS2
    limit: 100,
  })

  return response.results
}

/**
 * NEW: Get live/current matches using real API structure
 */
export async function getLiveMatchesSimple(): Promise<BO3Match[]> {
  const response = await fetchMatchesWithIncludes({
    with: ['teams', 'tournament', 'ai_predictions', 'games'],
    status: 'current',
    discipline_id: 1, // CS2
    limit: 50,
  })

  return response.results
}

/**
 * NEW: Widget-based functions that use scope and sorting instead of date filters
 */
/**
 * Get current matches using widget-matches scope and status filter
 */
export async function getCurrentMatchesWidget(): Promise<BO3Match[]> {
  const url = new URL(`${BO3_API_BASE}/matches`)
  url.searchParams.set('scope', 'widget-matches')
  url.searchParams.set('page[offset]', '0')
  url.searchParams.set('page[limit]', '50')
  url.searchParams.set('sort', 'start_date')
  url.searchParams.set('filter[matches.status][in]', 'current')
  url.searchParams.set('filter[matches.discipline_id][eq]', '1')
  url.searchParams.set('with', 'teams,tournament,ai_predictions,games')

  const data = await fetchWithRateLimitAndRetry<BO3ApiResponse>('v1', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })

  return data.results
}

/**
 * Get upcoming matches using widget-matches scope
 */
export async function getUpcomingMatchesWidget(): Promise<BO3Match[]> {
  const url = new URL(`${BO3_API_BASE}/matches`)
  url.searchParams.set('scope', 'widget-matches')
  url.searchParams.set('page[offset]', '0')
  url.searchParams.set('page[limit]', '50')
  url.searchParams.set('sort', 'start_date')
  url.searchParams.set('filter[matches.status][in]', 'upcoming')
  url.searchParams.set('filter[matches.discipline_id][eq]', '1')
  url.searchParams.set('with', 'teams,tournament,ai_predictions')

  const data = await fetchWithRateLimitAndRetry<BO3ApiResponse>('v1', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })

  return data.results
}

/**
 * Get live matches using widget-matches scope
 */
export async function getLiveMatchesWidget(): Promise<BO3Match[]> {
  const url = new URL(`${BO3_API_BASE}/matches`)
  url.searchParams.set('scope', 'widget-matches')
  url.searchParams.set('page[offset]', '0')
  url.searchParams.set('page[limit]', '50')
  url.searchParams.set('sort', 'start_date')
  url.searchParams.set('filter[matches.status][in]', 'current,live')
  url.searchParams.set('filter[matches.discipline_id][eq]', '1')
  url.searchParams.set('with', 'teams,tournament,ai_predictions,games')

  const data = await fetchWithRateLimitAndRetry<BO3ApiResponse>('v1', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })

  return data.results
}

/**
 * Get recent matches using widget-matches scope (sorted by start_date desc)
 */
export async function getRecentMatchesWidget(): Promise<BO3Match[]> {
  const url = new URL(`${BO3_API_BASE}/matches`)
  url.searchParams.set('scope', 'widget-matches')
  url.searchParams.set('page[offset]', '0')
  url.searchParams.set('page[limit]', '50')
  url.searchParams.set('sort', '-start_date') // Descending order for recent
  url.searchParams.set('filter[matches.discipline_id][eq]', '1')
  url.searchParams.set('with', 'teams,tournament')

  const data = await fetchWithRateLimitAndRetry<BO3ApiResponse>('v1', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })

  return data.results
}

/**
 * Get matches by tier using widget-matches scope
 */
export async function getMatchesByTierWidget(
  tier: string,
  limit: number = 50,
): Promise<BO3Match[]> {
  const url = new URL(`${BO3_API_BASE}/matches`)
  url.searchParams.set('scope', 'widget-matches')
  url.searchParams.set('page[offset]', '0')
  url.searchParams.set('page[limit]', limit.toString())
  url.searchParams.set('sort', '-start_date')
  url.searchParams.set('filter[matches.tier][eq]', tier)
  url.searchParams.set('filter[matches.discipline_id][eq]', '1')
  url.searchParams.set('with', 'teams,tournament,ai_predictions')

  const data = await fetchWithRateLimitAndRetry<BO3ApiResponse>('v1', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })

  return data.results
}

/**
 * Get matches with flexible filtering using widget-matches scope
 */
export async function getMatchesWidget(options: {
  status?: string[]
  tier?: string
  limit?: number
  offset?: number
  sort?: string
}): Promise<BO3Match[]> {
  const { status = [], tier, limit = 50, offset = 0, sort = 'start_date' } = options

  const url = new URL(`${BO3_API_BASE}/matches`)
  url.searchParams.set('scope', 'widget-matches')
  url.searchParams.set('page[offset]', offset.toString())
  url.searchParams.set('page[limit]', limit.toString())
  url.searchParams.set('sort', sort)
  url.searchParams.set('filter[matches.discipline_id][eq]', '1')
  url.searchParams.set('with', 'teams,tournament,ai_predictions,games')

  if (status.length > 0) {
    url.searchParams.set('filter[matches.status][in]', status.join(','))
  }

  if (tier) {
    url.searchParams.set('filter[matches.tier][eq]', tier)
  }

  const data = await fetchWithRateLimitAndRetry<BO3ApiResponse>('v1', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })

  return data.results
}

/**
 * Debug widget-matches scope functionality
 */
export async function debugWidgetMatches(): Promise<void> {
  console.log('🎯 Testing Widget-Matches Scope...')

  try {
    // Test 1: Current matches
    console.log('\n1. Current matches:')
    const currentUrl = `${BO3_API_BASE}/matches?scope=widget-matches&page[offset]=0&page[limit]=1&sort=start_date&filter[matches.status][in]=current&filter[matches.discipline_id][eq]=1&with=teams,tournament,ai_predictions,games`
    console.log(`   URL: ${currentUrl}`)

    const current = await getCurrentMatchesWidget()
    console.log(`   Found: ${current.length} current matches`)

    if (current.length > 0) {
      const match = current[0]
      console.log(`   Sample: ${match.team1?.name || 'Team1'} vs ${match.team2?.name || 'Team2'}`)
      console.log(`   Status: ${match.status} | Start: ${match.start_date}`)
    }

    // Test 2: Upcoming matches
    console.log('\n2. Upcoming matches:')
    const upcoming = await getUpcomingMatchesWidget()
    console.log(`   Found: ${upcoming.length} upcoming matches`)

    if (upcoming.length > 0) {
      const match = upcoming[0]
      console.log(`   Sample: ${match.team1?.name || 'Team1'} vs ${match.team2?.name || 'Team2'}`)
      console.log(`   Status: ${match.status} | Start: ${match.start_date}`)
    }

    // Test 3: Recent matches
    console.log('\n3. Recent matches:')
    const recent = await getRecentMatchesWidget()
    console.log(`   Found: ${recent.length} recent matches`)

    if (recent.length > 0) {
      const match = recent[0]
      console.log(`   Sample: ${match.team1?.name || 'Team1'} vs ${match.team2?.name || 'Team2'}`)
      console.log(`   Status: ${match.status} | Start: ${match.start_date}`)
    }

    // Test 4: S-tier matches
    console.log('\n4. S-tier matches:')
    const sTier = await getMatchesByTierWidget('s', 10)
    console.log(`   Found: ${sTier.length} S-tier matches`)

    if (sTier.length > 0) {
      const match = sTier[0]
      console.log(`   Sample: ${match.team1?.name || 'Team1'} vs ${match.team2?.name || 'Team2'}`)
      console.log(`   Status: ${match.status} | Tier: ${match.tier} | Start: ${match.start_date}`)
    }
  } catch (error) {
    console.error('❌ Widget matches test failed:', error)
  }
}

// BO3.gg API v2 Client Functions
// API v2 has better structure with data.tiers, included, and meta

// Configuration for API v2
const BO3_API_V2_BASE = 'https://api.bo3.gg/api/v2'

/**
 * Get finished matches for a specific date using API v2
 */
export async function getFinishedMatchesV2(
  date: string,
  tier?: string,
  utcOffset: number = -10800,
  withIncludes: string[] = ['teams', 'tournament', 'ai_predictions', 'games'],
): Promise<BO3ApiV2Response> {
  const url = new URL(`${BO3_API_V2_BASE}/matches/finished`)
  url.searchParams.set('date', date)
  url.searchParams.set('utc_offset', utcOffset.toString())
  url.searchParams.set('filter[discipline_id][eq]', '1')
  url.searchParams.set('with', withIncludes.join(','))

  if (tier) {
    url.searchParams.set('filter[matches.tier][in]', tier)
  }

  return fetchWithRateLimitAndRetry<BO3ApiV2Response>('v2', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })
}

/**
 * Get current/live matches using API v2
 */
export async function getCurrentMatchesV2(
  tier?: string,
  utcOffset: number = -10800,
  withIncludes: string[] = ['teams', 'tournament', 'ai_predictions', 'games'],
): Promise<BO3ApiV2Response> {
  const url = new URL(`${BO3_API_V2_BASE}/matches/live`)
  url.searchParams.set('utc_offset', utcOffset.toString())
  url.searchParams.set('filter[discipline_id][eq]', '1')
  url.searchParams.set('with', withIncludes.join(','))

  if (tier) {
    url.searchParams.set('filter[matches.tier][in]', tier)
  }

  return fetchWithRateLimitAndRetry<BO3ApiV2Response>('v2', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })
}

/**
 * Get upcoming matches using API v2
 */
export async function getUpcomingMatchesV2(
  date?: string,
  tier?: string,
  utcOffset: number = -10800,
  withIncludes: string[] = ['teams', 'tournament', 'ai_predictions', 'games'],
): Promise<BO3ApiV2Response> {
  const url = new URL(`${BO3_API_V2_BASE}/matches/upcoming`)

  if (date) {
    url.searchParams.set('date', date)
  }

  url.searchParams.set('utc_offset', utcOffset.toString())
  url.searchParams.set('filter[discipline_id][eq]', '1')
  url.searchParams.set('with', withIncludes.join(','))

  if (tier) {
    url.searchParams.set('filter[matches.tier][in]', tier)
  }

  return fetchWithRateLimitAndRetry<BO3ApiV2Response>('v2', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })
}

/**
 * Get today's matches using API v2
 */
export async function getTodayMatchesV2(
  tier?: string,
  utcOffset: number = -10800,
): Promise<BO3ApiV2Response> {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  return await getFinishedMatchesV2(today, tier, utcOffset)
}

/**
 * Extract and enrich matches from API v2 response
 */
export function extractMatchesFromV2Response(response: BO3ApiV2Response): BO3ApiV2EnrichedMatch[] {
  // Guard: detect API error responses (e.g. missing required params)
  if (!response || (!response.data && !response.included)) {
    const msg = (response as any)?.message || 'unknown'
    console.warn(`[bo3] API v2 returned error/empty response: ${msg}`)
    return []
  }

  // Handle response structures from API v2:
  // 1. /finished and /upcoming → data.tiers
  // 2. /live                   → data as plain array

  let rawMatches: any[] = []

  if (!Array.isArray(response.data) && response.data?.tiers) {
    // Structures 1 & 3 – tiers object
    Object.values(response.data.tiers).forEach((tier) => {
      if (tier && 'matches' in tier && tier.matches) {
        const matches = Array.isArray(tier.matches) ? tier.matches : [tier.matches]
        rawMatches.push(...matches)
      }
    })
  } else if (Array.isArray(response.data)) {
    // Structure 2 – live: flat array
    rawMatches = response.data
  } else {
    console.warn('[bo3] Invalid API v2 response structure, data type:', typeof response.data)
    return []
  }

  const teams = response.included?.teams ?? {}
  const tournaments = response.included?.tournaments ?? {}

  return rawMatches.map((match): BO3ApiV2EnrichedMatch => {
    // /upcoming may contain team1/team2 and team1_id/team2_id, but some records can be partially hidden
    const team1Key =
      match.team1 != null
        ? String(match.team1)
        : match.team1_id != null
          ? String(match.team1_id)
          : undefined
    const team2Key =
      match.team2 != null
        ? String(match.team2)
        : match.team2_id != null
          ? String(match.team2_id)
          : undefined
    const tournamentKey = match.tournament != null ? String(match.tournament) : undefined

    const team1Data = team1Key ? teams[team1Key] : undefined
    const team2Data = team2Key ? teams[team2Key] : undefined
    const tournamentData = tournamentKey ? tournaments[tournamentKey] : undefined

    const team1DisplayName =
      team1Data?.name ?? match.bet_updates?.team_1?.name ?? (team1Key ? `Team ${team1Key}` : null)
    const team2DisplayName =
      team2Data?.name ?? match.bet_updates?.team_2?.name ?? (team2Key ? `Team ${team2Key}` : null)

    return {
      ...match,
      team1_data: team1Data ?? null,
      team2_data: team2Data ?? null,
      tournament_data: tournamentData ?? null,
      team1_display_name: team1DisplayName,
      team2_display_name: team2DisplayName,
    }
  })
}

/**
 * Debug API v2 response structure
 */
export async function debugAPIV2Response(): Promise<void> {
  try {
    console.log('🚀 Testing BO3 API v2 Structure...')

    // Test 1: Finished matches for a working date (2025-09-07)
    console.log(`\n1. Testing finished matches for 2025-09-07:`)

    try {
      const finishedResponse = await getFinishedMatchesV2('2025-09-07', 's')
      console.log(`   ✅ Finished matches response received`)
      console.log(`   - Date: ${finishedResponse.meta.date}`)
      console.log(
        `   - Tiers available: ${
          !Array.isArray(finishedResponse.data) ? Object.keys(finishedResponse.data.tiers) : []
        }`,
      )
      console.log(`   - Teams count: ${Object.keys(finishedResponse.included?.teams ?? {}).length}`)
      console.log(
        `   - Tournaments count: ${Object.keys(finishedResponse.included?.tournaments ?? {}).length}`,
      )

      const matches = extractMatchesFromV2Response(finishedResponse)
      console.log(`   - Total matches: ${matches.length}`)

      if (matches.length > 0) {
        const match = matches[0]
        console.log(
          `   - Sample match: ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
        )
        console.log(
          `   - Status: ${match.status} | Score: ${match.team1_score}-${match.team2_score}`,
        )
        console.log(`   - Tournament: ${match.tournament_data?.name || 'Unknown'}`)
        console.log(`   - Tier: ${match.tier} | Stars: ${match.stars}`)

        if (match.ai_predictions) {
          console.log(
            `   - AI Prediction: ${match.ai_predictions.prediction_team1_score}-${match.ai_predictions.prediction_team2_score}`,
          )
        }

        if (match.live_updates) {
          console.log(
            `   - Live Updates: ${match.live_updates.map_name} (Round ${match.live_updates.round_number})`,
          )
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed to get finished matches: ${error}`)
    }

    // Test 2: Current/Live matches
    console.log(`\n2. Testing current/live matches:`)
    try {
      const currentResponse = await getCurrentMatchesV2('s')
      const currentMatches = extractMatchesFromV2Response(currentResponse)
      console.log(`   ✅ Found ${currentMatches.length} current/live matches`)

      if (currentMatches.length > 0) {
        const match = currentMatches[0]
        console.log(
          `   - Sample: ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
        )
        console.log(`   - Status: ${match.status} | Live coverage: ${match.live_coverage}`)
        if (match.live_updates) {
          console.log(
            `   - Live: ${match.live_updates.map_name} Round ${match.live_updates.round_number}`,
          )
        }
      } else {
        console.log(`   - No live matches at the moment`)
      }
    } catch (error) {
      console.log(`   ❌ Failed to get current matches: ${error}`)
    }

    // Test 3: Test multiple dates for finished matches
    console.log(`\n3. Testing recent dates for finished matches:`)
    const testDates = ['2025-09-07', '2025-09-06', '2025-09-05']

    for (const date of testDates) {
      try {
        const response = await getFinishedMatchesV2(date, 's')
        const matches = extractMatchesFromV2Response(response)
        console.log(`   - ${date}: ${matches.length} S-tier matches`)
      } catch (error) {
        console.log(`   - ${date}: Failed (${error})`)
      }
    }

    console.log('\n✅ API v2 testing completed!')
  } catch (error) {
    console.error('❌ API v2 debug failed:', error)
  }
}

/**
 * Busca rankings de times via API v2
 */
export async function getTeamRankingsV2(
  page: number = 1,
  perPage: number = 100,
  disciplineId: number = 1,
): Promise<TeamRankingsResponse> {
  const url = new URL('https://api.bo3.gg/api/v2/team_rankings')
  url.searchParams.set('page', page.toString())
  url.searchParams.set('per_page', perPage.toString())
  url.searchParams.set('filter[discipline_id][eq]', disciplineId.toString())

  return fetchWithRateLimitAndRetry<TeamRankingsResponse>('v2', url.toString(), {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })
}

/**
 * Busca detalhes de um time pelo slug (API v1)
 */
export async function getTeamDetailBySlug(slug: string): Promise<TeamDetail> {
  if (!slug) throw new Error('O parâmetro slug é obrigatório!')
  const url = `https://api.bo3.gg/api/v1/teams/${encodeURIComponent(slug)}`
  return fetchWithRateLimitAndRetry<TeamDetail>('v1', url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': BO3_USER_AGENT,
    },
  })
}
