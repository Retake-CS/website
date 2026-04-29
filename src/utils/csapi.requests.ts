import {
  CSAPIMatchResult,
  CSAPIRanking,
  CSAPITeamDetail,
  CSAPIPlayerDetail,
  CSAPIItem,
} from './csapi.types'

const BASE_URL = 'https://api.csapi.de'

// Timeout helper — evita travar serverless function
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id))
}

async function fetchCSAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Garante barra final onde a CSAPI exige
  const url = `${BASE_URL}${endpoint}`
  console.log(`[CSAPI] GET ${url}`)

  let response: Response
  try {
    response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    })
  } catch (err: any) {
    throw new Error(`CSAPI fetch error (${url}): ${err.message}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`CSAPI ${response.status} ${response.statusText} — ${url} — body: ${body.slice(0, 200)}`)
  }

  return response.json() as Promise<T>
}

/** Partidas recentes (completed) */
export async function getLatestMatches(
  limit = 10,
  offset = 0,
): Promise<CSAPIMatchResult[]> {
  // A CSAPI pode retornar array ou { matches: [...] } — tratamos os dois casos em csapi.sync.ts
  return fetchCSAPI<CSAPIMatchResult[]>(`/matches/latest?limit=${limit}&offset=${offset}`)
}

/** Detalhes de uma partida */
export async function getMatchDetails(matchId: number): Promise<CSAPIMatchResult> {
  return fetchCSAPI<CSAPIMatchResult>(`/matches/${matchId}`)
}

/** Rankings Valve (com barra final — obrigatório) */
export async function getRankings(date?: string): Promise<CSAPIRanking> {
  const query = date ? `?date=${date}` : ''
  return fetchCSAPI<CSAPIRanking>(`/rankings/${query}`)
}

/** Detalhes de um time */
export async function getTeam(teamId: number): Promise<CSAPITeamDetail> {
  return fetchCSAPI<CSAPITeamDetail>(`/teams/${teamId}`)
}

/** Stats de jogadores (top 100) */
export async function getPlayerStats(): Promise<CSAPIPlayerDetail[]> {
  // Endpoint real: /players/stats — pode retornar array ou wrapper
  return fetchCSAPI<CSAPIPlayerDetail[]>(`/players/stats`)
}

/** Detalhes de um jogador */
export async function getPlayer(playerId: number): Promise<CSAPIPlayerDetail> {
  return fetchCSAPI<CSAPIPlayerDetail>(`/players/${playerId}`)
}

/** Buscar times por nome */
export async function searchTeams(name: string, limit = 20): Promise<CSAPIItem[]> {
  return fetchCSAPI<CSAPIItem[]>(`/teams/?name=${encodeURIComponent(name)}&limit=${limit}`)
}
