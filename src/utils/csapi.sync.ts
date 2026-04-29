import { Payload } from 'payload'
import { getLatestMatches, getRankings, getPlayerStats } from './csapi.requests'

// ─── Helpers defensivos ──────────────────────────────────────────────────────

/**
 * A CSAPI pode retornar diretamente um array OU um objeto com propriedade
 * que contém o array (ex: { rankings: [...] } ou { matches: [...] }).
 * Esta função normaliza os dois casos.
 */
function toArray<T>(data: any, arrayKey?: string): T[] {
  if (Array.isArray(data)) return data as T[]
  if (arrayKey && data && Array.isArray(data[arrayKey])) return data[arrayKey] as T[]
  // Tenta encontrar o primeiro campo que seja array
  if (data && typeof data === 'object') {
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) return data[key] as T[]
    }
  }
  return []
}

async function getPlaceholderMediaId(payload: Payload): Promise<string | null> {
  const placeholder = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'Placeholder' } },
    limit: 1,
  })
  return (placeholder.docs[0]?.id as string) ?? null
}

async function ensureTeam(
  payload: Payload,
  teamData: { id?: number; name?: string; rank?: number },
  placeholderId: string | null,
): Promise<string> {
  if (!teamData?.id || !teamData?.name) {
    throw new Error(`ensureTeam: dados inválidos — ${JSON.stringify(teamData)}`)
  }

  const existing = await payload.find({
    collection: 'teams',
    where: { externalTeamId: { equals: String(teamData.id) } },
    limit: 1,
  })

  if (existing.docs.length > 0) return existing.docs[0].id as string

  const created = await payload.create({
    collection: 'teams',
    data: {
      externalTeamId: String(teamData.id),
      name: teamData.name,
      shortName: teamData.name.substring(0, 4).toUpperCase(),
      ranking: teamData.rank ?? null,
      ...(placeholderId ? { logo: placeholderId } : {}),
      country: 'N/A',
    },
  })
  return created.id as string
}

async function ensureTournament(payload: Payload, eventName: string): Promise<string> {
  if (!eventName) throw new Error('ensureTournament: eventName vazio')

  const existing = await payload.find({
    collection: 'tournaments',
    where: { name: { equals: eventName } },
    limit: 1,
  })

  if (existing.docs.length > 0) return existing.docs[0].id as string

  const created = await payload.create({
    collection: 'tournaments',
    data: {
      name: eventName,
      status: 'completed',
    },
  })
  return created.id as string
}

// ─── Sync de Rankings ────────────────────────────────────────────────────────

async function syncRankings(payload: Payload) {
  console.log('[SYNC] Iniciando rankings...')
  const raw = await getRankings()
  console.log('[SYNC] getRankings raw keys:', raw ? Object.keys(raw) : 'null')

  const rankingsList = toArray<any>(raw, 'rankings')
  console.log(`[SYNC] ${rankingsList.length} rankings encontrados`)

  if (rankingsList.length === 0) {
    console.warn('[SYNC] Rankings vazios — verifique o shape da resposta da CSAPI')
    return
  }

  const placeholderId = await getPlaceholderMediaId(payload)
  // Marca todos os anteriores como inativos antes de inserir novos
  const existing = await payload.find({ collection: 'rankings', limit: 200 })
  for (const doc of existing.docs) {
    await payload.update({ collection: 'rankings', id: doc.id as string, data: { isActive: false } })
  }

  const date = (raw as any)?.date ? new Date((raw as any).date) : new Date()

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
          (rank.rank_diff ?? 0) < 0
            ? 'up'
            : (rank.rank_diff ?? 0) > 0
            ? 'down'
            : 'stable',
        region: 'mundial',
        country: 'N/A',
        lastUpdated: date,
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
          id: existingRank.docs[0].id as string,
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

// ─── Sync de Partidas ────────────────────────────────────────────────────────

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
        externalMatchId: String(match.id),
        status: 'completed',
        date: match.date ? new Date(match.date) : new Date(),
        team1: t1Id,
        team2: t2Id,
        team1Name: t1.name,
        team2Name: t2.name,
        tournament: tournamentId,
        tournamentName: match.event ?? '',
        finalScore: {
          team1: t1.score ?? 0,
          team2: t2.score ?? 0,
        },
        format: match.best_of ? `BO${match.best_of}` : 'BO1',
        maps,
      }

      const existingMatch = await payload.find({
        collection: 'matches',
        where: { externalMatchId: { equals: String(match.id) } },
        limit: 1,
      })

      if (existingMatch.docs.length > 0) {
        await payload.update({
          collection: 'matches',
          id: existingMatch.docs[0].id as string,
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

// ─── Sync de Player Stats ────────────────────────────────────────────────────

async function syncPlayerStats(payload: Payload) {
  console.log('[SYNC] Iniciando player stats...')
  try {
    const raw = await getPlayerStats()
    const players = toArray<any>(raw, 'players')
    console.log(`[SYNC] ${players.length} jogadores encontrados`)

    for (const player of players) {
      try {
        if (!player?.id) continue

        const existing = await payload.find({
          collection: 'players',
          where: { externalPlayerId: { equals: String(player.id) } },
          limit: 1,
        })

        const stats = player.stats ?? player
        const playerData: any = {
          externalPlayerId: String(player.id),
          name: player.name ?? `Player ${player.id}`,
          rating: stats.rating ?? stats.rating_2 ?? null,
          kd: stats.k && stats.d ? Number((stats.k / stats.d).toFixed(2)) : null,
          adr: stats.adr ?? null,
          kast: stats.kast ?? null,
        }

        // Associa time se vier no payload
        if (player.team?.id) {
          const teamRes = await payload.find({
            collection: 'teams',
            where: { externalTeamId: { equals: String(player.team.id) } },
            limit: 1,
          })
          if (teamRes.docs.length > 0) {
            playerData.team = teamRes.docs[0].id
          }
        }

        if (existing.docs.length > 0) {
          await payload.update({
            collection: 'players',
            id: existing.docs[0].id as string,
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
    // /players/stats pode não existir — não quebra o resto do sync
    console.warn('[SYNC] Player stats falhou (não crítico):', err.message)
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function performCSAPISync(payload: Payload) {
  console.log('[SYNC] === Iniciando CSAPI sync ===')
  const started = Date.now()

  // Rankings
  try {
    await syncRankings(payload)
  } catch (err: any) {
    console.error('[SYNC] syncRankings ERROR:', err.message)
  }

  // Partidas (últimas 50)
  try {
    await syncMatches(payload, 50)
  } catch (err: any) {
    console.error('[SYNC] syncMatches ERROR:', err.message)
  }

  // Player stats (não crítico)
  try {
    await syncPlayerStats(payload)
  } catch (err: any) {
    console.warn('[SYNC] syncPlayerStats WARN:', err.message)
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1)
  console.log(`[SYNC] === Concluído em ${elapsed}s ===`)
}
