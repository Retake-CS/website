import { Payload } from 'payload'
import { getLatestMatches, getRankings } from './csapi.requests'

export async function performCSAPISync(payload: Payload) {
  console.log('Starting intelligent CSAPI sync...')
  
  // Rate limiting logic: Check last sync time
  // We can use a Global or a specific collection to store the last sync timestamp
  // For now, let's just check the most recent ranking update
  const latestRanking = await payload.find({
    collection: 'rankings',
    sort: '-lastUpdated',
    limit: 1,
  })
  
  const lastSync = latestRanking.docs[0]?.lastUpdated
  const now = new Date()
  
  if (lastSync) {
    const lastSyncDate = new Date(lastSync)
    const diffMinutes = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60)
    
    // Intelligent Skip: If synced less than 15 minutes ago, skip rankings sync
    if (diffMinutes < 15) {
      console.log(`Skipping rankings sync. Last sync was ${Math.round(diffMinutes)} minutes ago.`)
    } else {
      await syncRankings(payload)
    }
  } else {
    await syncRankings(payload)
  }

  // Always sync matches as they change more frequently, but maybe only the last 20
  await syncMatches(payload, 20)
  
  console.log('Intelligent CSAPI sync complete.')
}

async function syncRankings(payload: Payload) {
  console.log('Syncing rankings...')
  try {
    const rankingsData = await getRankings()
    const placeholderId = await getPlaceholderMediaId(payload)
    
    for (const rank of rankingsData.rankings) {
      try {
        const teamId = await ensureTeam(payload, {
          id: rank.id,
          name: rank.name,
          rank: rank.rank,
        }, placeholderId)
        
        const rankingData: any = {
          position: rank.rank,
          team: teamId,
          points: rank.points,
          change: Math.abs(rank.rank_diff),
          trend: rank.rank_diff > 0 ? 'up' : rank.rank_diff < 0 ? 'down' : 'stable',
          region: 'mundial',
          country: 'N/A',
          lastUpdated: new Date(rankingsData.date),
        }
        
        const existingRank = await payload.find({
          collection: 'rankings',
          where: { team: { equals: teamId } },
        })
        
        if (existingRank.docs.length > 0) {
          await payload.update({
            collection: 'rankings',
            id: existingRank.docs[0].id,
            data: rankingData,
          })
        } else {
          await payload.create({
            collection: 'rankings',
            data: rankingData,
          })
        }
      } catch (err: any) {
        console.error(`Failed to sync rank for ${rank.name}:`, err.message)
      }
    }
  } catch (error: any) {
    console.error('Rankings sync failed:', error.message)
  }
}

async function syncMatches(payload: Payload, limit: number = 50) {
  console.log(`Syncing last ${limit} matches...`)
  try {
    const matches = await getLatestMatches(limit)
    const placeholderId = await getPlaceholderMediaId(payload)
    
    for (const match of matches) {
      try {
        const t1Id = await ensureTeam(payload, match.team1, placeholderId)
        const t2Id = await ensureTeam(payload, match.team2, placeholderId)
        const tournamentId = await ensureTournament(payload, match)
        
        const matchData: any = {
          externalMatchId: String(match.id),
          id: String(match.id),
          status: 'completed',
          date: new Date(match.date),
          team1: t1Id,
          team2: t2Id,
          team1Name: match.team1.name,
          team2Name: match.team2.name,
          tournament: tournamentId,
          tournamentName: match.event,
          finalScore: {
            team1: match.team1.score,
            team2: match.team2.score,
          },
          format: `BO${match.best_of}`,
          maps: match.maps.map((m: any) => ({
            mapName: m.name,
            team1Score: m.team1_score,
            team2Score: m.team2_score,
            status: 'finished'
          }))
        }
        
        const existingMatch = await payload.find({
          collection: 'matches',
          where: { externalMatchId: { equals: String(match.id) } },
        })
        
        if (existingMatch.docs.length > 0) {
          await payload.update({
            collection: 'matches',
            id: existingMatch.docs[0].id,
            data: matchData,
          })
        } else {
          await payload.create({
            collection: 'matches',
            data: matchData,
          })
        }
      } catch (err: any) {
        console.error(`Failed to sync match ${match.id}:`, err.message)
      }
    }
  } catch (error: any) {
    console.error('Matches sync failed:', error.message)
  }
}

async function ensureTeam(payload: Payload, teamData: any, placeholderId: any) {
  const existing = await payload.find({
    collection: 'teams',
    where: { externalTeamId: { equals: teamData.id } },
  })
  
  if (existing.docs.length > 0) {
    return existing.docs[0].id
  }
  
  const created = await payload.create({
    collection: 'teams',
    data: {
      externalTeamId: teamData.id,
      name: teamData.name,
      shortName: teamData.name.substring(0, 3).toUpperCase(),
      ranking: teamData.rank,
      logo: placeholderId,
      country: 'N/A',
    },
  })
  return created.id
}

async function ensureTournament(payload: Payload, match: any) {
  const existing = await payload.find({
    collection: 'tournaments',
    where: { name: { equals: match.event } },
  })
  
  if (existing.docs.length > 0) {
    return existing.docs[0].id
  }
  
  const created = await payload.create({
    collection: 'tournaments',
    data: {
      externalTournamentId: Math.floor(Math.random() * 1000000),
      name: match.event,
      status: 'completed',
    },
  })
  return created.id
}

async function getPlaceholderMediaId(payload: Payload) {
  const placeholder = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'Placeholder' } },
  })
  return placeholder.docs[0]?.id || null
}
