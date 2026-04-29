// Utils para integração com PayloadCMS via REST API
const PAYLOAD_API = process.env.PAYLOAD_API || 'http://localhost:3000/api'
const PAYLOAD_TOKEN = process.env.PAYLOAD_TOKEN || 'seu-token-aqui'

async function payloadRequest(path: string, method: string = 'GET', body?: any) {
  const res = await fetch(`${PAYLOAD_API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PAYLOAD_TOKEN}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`PayloadCMS ${method} ${path}: ${res.statusText}`)
  return await res.json()
}

export async function findTeam(team_id: number) {
  const data = await payloadRequest(`/teams?where[team_id][equals]=${team_id}`)
  return data.docs?.[0] || null
}

export async function upsertTeam(team: any) {
  const existing = await findTeam(team.id)
  if (existing) {
    return await payloadRequest(`/teams/${existing.id}`, 'PATCH', team)
  } else {
    return await payloadRequest('/teams', 'POST', team)
  }
}

export async function findRanking(team_id: number) {
  const data = await payloadRequest(`/rankings?where[team_id][equals]=${team_id}`)
  return data.docs?.[0] || null
}

export async function upsertRanking(ranking: any) {
  const existing = await findRanking(ranking.team_id)
  if (existing) {
    return await payloadRequest(`/rankings/${existing.id}`, 'PATCH', ranking)
  } else {
    return await payloadRequest('/rankings', 'POST', ranking)
  }
}
