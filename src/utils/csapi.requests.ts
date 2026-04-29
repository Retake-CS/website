import { 
  CSAPIMatchResult, 
  CSAPIRanking, 
  CSAPITeamDetail, 
  CSAPIPlayerDetail,
  CSAPIItem
} from './csapi.types'

const BASE_URL = 'https://api.csapi.de'

async function fetchCSAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`CSAPI error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

/**
 * List latest matches
 */
export async function getLatestMatches(limit: number = 10, offset: number = 0): Promise<CSAPIMatchResult[]> {
  return fetchCSAPI<CSAPIMatchResult[]>(`/matches/latest?limit=${limit}&offset=${offset}`)
}

/**
 * Get match details
 */
export async function getMatchDetails(matchId: number): Promise<CSAPIMatchResult> {
  return fetchCSAPI<CSAPIMatchResult>(`/matches/${matchId}`)
}

/**
 * Get regional rankings (Valve Regional Standings)
 */
export async function getRankings(date?: string): Promise<CSAPIRanking> {
  const query = date ? `?date=${date}` : ''
  return fetchCSAPI<CSAPIRanking>(`/rankings/${query}`)
}

/**
 * Get team details
 */
export async function getTeam(teamId: number): Promise<CSAPITeamDetail> {
  return fetchCSAPI<CSAPITeamDetail>(`/teams/${teamId}`)
}

/**
 * Get player details
 */
export async function getPlayer(playerId: number): Promise<CSAPIPlayerDetail> {
  return fetchCSAPI<CSAPIPlayerDetail>(`/players/${playerId}`)
}

/**
 * Search teams
 */
export async function searchTeams(name: string, limit: number = 20): Promise<CSAPIItem[]> {
  return fetchCSAPI<CSAPIItem[]>(`/teams/?name=${encodeURIComponent(name)}&limit=${limit}`)
}
