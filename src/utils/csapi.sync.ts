import { Payload } from 'payload'
import { getLatestMatches, getRankings, getPlayerStats } from './csapi.requests'

type DocId = string | number

function toArray<T>(data: unknown, arrayKey?: string): T[] {
  if (Array.isArray(data)) return data as T[]
  if (arrayKey && data && typeof data === 'object' && Array.isArray((data as any)[arrayKey]))
    return (data as any)[arrayKey] as T[]
  if (data && typeof data === 'object') {
    for (const key of Object.keys(data as object)) {
      if (Array.isArray((data as any)[key])) return (data as any)[key] as T[]
    }
  }
  return []
}

async function getPlaceholderMediaId(payload: Payload): Promise<DocId | null> {
  const res = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'Placeholder' } },
    limit: 1,
  })
  return res.docs[0]?.id ?? null
}

// externalTeamId é type: 'number' no schema de Teams
async function ensureTeam(
  payload: Payload,
  teamData: { id?: number; name?: string; rank?: number },
  placeholderId: DocId | null,
): Promise<DocId> {
  if (!teamData?.id || !teamData?.name) {
    throw new Error(`ensureTeam: dados inválidos — ${JSON.stringify(teamData)}`)
  }

  const existing = await payload.find({
    collection: 'teams',
    where: { externalTeamId: { equals: teamData.id } }, // number direto
    limit: 1,
  })

  if (existing.docs.length > 0) return existing.docs[0].id

  const created = await payload.create({
    collection: 'teams',
    data: {
      externalTeamId: teamData.id,                           // number
      name: teamData.name,
      shortName: teamData.name.substring(0, 4).toUpperCase(),
      ranking: teamData.rank ?? null,
      country: 'N/A',
      source: 'csapi.de',
      lastSyncedAt: new Date(),
      ...(placeholderId ? { logo: placeholderId } : {}),
    } as any,
  })
  return created.id
}

async function ensureTournament(payload: Payload, eventName: string): Promise<DocId> {
  if (!eventName) throw new Error('ensureTournament: eventName vazio')

  const existing = await payload.find({
    collection: 'tournaments',
    where: { name: { equals: eventName } },
    limit: 1,
  })

  if (existing.docs.length > 0) return existing.docs[0].id

  const created = await payload.create({
    collection: 'tournaments',
    data: { name: eventName, status: 'completed' } as any,
  })
  return created.id
}

// ─── Rankings ────────────────────────────────────────────────────────────────

async function syncRankings(payload: Payload) {
  console.log('[SYNC] Iniciando rankings...')
  const raw = await getRankings()
  console.log('[SYNC] getRankings raw keys:', raw ? Object.keys(raw as object) : 'null')

  const rankingsList = toArray<any>(raw, 'rankings')
  console.log(`[SYNC] ${rankingsList.length} rankings encontrados`)

  if (rankingsList.length === 0) {
    console.warn('[SYNC] Rankings vazios — verifique o shape da resposta da CSAPI')
    return
  }

  const placeholderId = await getPlaceholderMediaId(payload)

  // Desativa todos antes de re-inserir
  const existing = await payload.find({ collection: 'rankings', limit: 200 })
  for (const doc of existing.docs) {
    await payload.update({
      collection: 'rankings',
      id: doc.id,
      data: { isActive: false } as any,
    })
  }

  const syncDate = (raw as any)?.date ? new Date((raw as any).date) : new Date()

  for (const rank of rankingsList) {
    try {
      const teamId = await ensureTeam(
        payload,
        { id: rank.id, name: rank.name, rank: rank.rank },
        placeholderId,
      )

      const rankingData: any = {
        position: rank.rank ?? rank.position ?? 0,
        team: teamId,
        points: rank.points ?? 0,
        change: Math.abs(rank.rank_diff ?? 0),
        trend:
          (rank.rank_diff ?? 0) < 0 ? 'up' : (rank.rank_diff ?? 0) > 0 ? 'down' : 'stable',
        region: 'mundial',
        country: 'N/A',
        lastUpdated: syncDate,
        isActive: true,
      }

      const existingRank = await payload.find({
        collection: 'rankings',
        where: { team: { equals: teamId } },
        limit: 1,
      })

      if (existingRank.docs.length > 0) {
        await payload.update({
          collection: 'rankings',
          id: existingRank.docs[0].id,
          data: rankingData,
        })
      } else {
        await payload.create({ collection: 'rankings', data: rankingData })
      }
    } catch (err: any) {
      console.error(`[SYNC] Falha no ranking de ${rank.name}:`, err.message)
    }
  }

  console.log(`[SYNC] Rankings concluído — ${rankingsList.length} times`)
}

// ─── Matches ─────────────────────────────────────────────────────────────────

async function syncMatches(payload: Payload, limit = 50) {
  console.log(`[SYNC] Iniciando últimas ${limit} partidas...`)
  const raw = await getLatestMatches(limit)
  const matches = toArray<any>(raw, 'matches')
  console.log(`[SYNC] ${matches.length} partidas encontradas`)

  if (matches.length === 0) {
    console.warn('[SYNC] Partidas vazias — verifique o shape da resposta da CSAPI')
    return
  }

  const placeholderId = await getPlaceholderMediaId(payload)

  for (const match of matches) {
    try {
      const t1 = match.team1
      const t2 = match.team2

      if (!t1?.id || !t2?.id) {
        console.warn(`[SYNC] Match ${match.id} sem team ids — pulando`)
        continue
      }

      const t1Id = await ensureTeam(payload, t1, placeholderId)
      const t2Id = await ensureTeam(payload, t2, placeholderId)
      const tournamentId = await ensureTournament(payload, match.event ?? 'Desconhecido')

      const maps = Array.isArray(match.maps)
        ? match.maps.map((m: any) => ({
            mapName: m.name ?? m.map ?? 'unknown',
            team1Score: m.team1_score ?? m.team1 ?? 0,
            team2Score: m.team2_score ?? m.team2 ?? 0,
            status: 'finished',
          }))
        : []

      const matchData: any = {
        externalMatchId: String(match.id),   // text no schema
        status: 'completed',
        date: match.date ? new Date(match.date) : new Date(),
        team1: t1Id,
        team2: t2Id,
        team1Name: t1.name ?? '',
        team2Name: t2.name ?? '',
        team1ExternalId: Number(t1.id),      // number no schema
        team2ExternalId: Number(t2.id),      // number no schema
        tournament: tournamentId,
        tournamentName: match.event ?? '',
        finalScore: {
          team1: t1.score ?? 0,
          team2: t2.score ?? 0,
        },
        format: match.best_of ? `BO${match.best_of}` : 'BO1',
        maps,
        lastSyncedAt: new Date(),
      }

      const existingMatch = await payload.find({
        collection: 'matches',
        where: { externalMatchId: { equals: String(match.id) } },
        limit: 1,
      })

      if (existingMatch.docs.length > 0) {
        await payload.update({
          collection: 'matches',
          id: existingMatch.docs[0].id,
          data: matchData,
        })
      } else {
        await payload.create({ collection: 'matches', data: matchData })
      }
    } catch (err: any) {
      console.error(`[SYNC] Falha na partida ${match.id}:`, err.message)
    }
  }

  console.log('[SYNC] Partidas concluído')
}

// ─── Player Stats ─────────────────────────────────────────────────────────────
// A collection Players exige: name (text), nickname (text), country (text)
// Não existe externalPlayerId — usamos nickname como chave de busca

async function syncPlayerStats(payload: Payload) {
  console.log('[SYNC] Iniciando player stats...')
  try {
    const raw = await getPlayerStats()
    const players = toArray<any>(raw, 'players')
    console.log(`[SYNC] ${players.length} jogadores encontrados`)

    for (const player of players) {
      try {
        if (!player?.id) continue

        const nickname = player.nickname ?? player.name ?? `Player${player.id}`
        const name = player.name ?? nickname
        const country = player.country ?? player.nationality ?? 'N/A'

        // Busca pelo nickname (campo único disponível como chave)
        const existing = await payload.find({
          collection: 'players',
          where: { nickname: { equals: nickname } },
          limit: 1,
        })

        const playerData: any = {
          name,
          nickname,
          country,
        }

        // Liga ao team se existir
        if (player.team?.id) {
          const teamRes = await payload.find({
            collection: 'teams',
            where: { externalTeamId: { equals: Number(player.team.id) } },
            limit: 1,
          })
          if (teamRes.docs.length > 0) {
            playerData.team = teamRes.docs[0].id
          }
        }

        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'players',
            id: existing.docs[0].id,
            data: playerData,
          })
        } else {
          await payload.create({ collection: 'players', data: playerData })
        }
      } catch (err: any) {
        console.error(`[SYNC] Falha no player ${player.id}:`, err.message)
      }
    }
    console.log('[SYNC] Player stats concluído')
  } catch (err: any) {
    console.warn('[SYNC] Player stats falhou (não crítico):', err.message)
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export async function performCSAPISync(payload: Payload) {
  console.log('[SYNC] === Iniciando CSAPI sync ===')
  const started = Date.now()

  try { await syncRankings(payload) }
  catch (err: any) { console.error('[SYNC] syncRankings ERROR:', err.message) }

  try { await syncMatches(payload, 50) }
  catch (err: any) { console.error('[SYNC] syncMatches ERROR:', err.message) }

  try { await syncPlayerStats(payload) }
  catch (err: any) { console.warn('[SYNC] syncPlayerStats WARN:', err.message) }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1)
  console.log(`[SYNC] === Concluído em ${elapsed}s ===`)
}
