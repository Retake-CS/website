import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

import { getPayload } from 'payload'
import { getLatestMatches, getRankings } from '../utils/csapi.requests'

async function sync() {
  console.log('Starting CSAPI sync...')
  
  const config = (await import('../payload.config')).default
  const payload = await getPayload({ config })

  // Ensure placeholder media exists
  let placeholderId: any = null
  const existingMedia = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'Placeholder' } },
  })
  
  if (existingMedia.docs.length > 0) {
    placeholderId = existingMedia.docs[0].id
  } else {
    try {
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: 'Placeholder',
        },
        file: {
          data: await Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            'base64'
          ),
          name: 'placeholder.png',
          mimetype: 'image/png',
          size: 70,
        } as any,
      })
      placeholderId = media.id
      console.log('Created placeholder media:', placeholderId)
    } catch (err: any) {
      console.error('Failed to create placeholder media:', err.message)
    }
  }

  
  try {
    // 1. Sync Rankings
    console.log('Syncing rankings...')
    const rankingsData = await getRankings()
    for (const rank of rankingsData.rankings) {
      try {
        // Upsert team first
        const teamQuery = await payload.find({
          collection: 'teams',
          where: { externalTeamId: { equals: rank.id } },
        })
        
        let teamId
        if (teamQuery.docs.length > 0) {
          teamId = teamQuery.docs[0].id
          await payload.update({
            collection: 'teams',
            id: teamId,
            data: {
              name: rank.name,
              shortName: rank.name.substring(0, 3).toUpperCase(),
              ranking: rank.rank,
              logo: placeholderId,
              country: 'N/A',
            },
          })
        } else {
          const newTeam = await payload.create({
            collection: 'teams',
            data: {
              externalTeamId: rank.id,
              name: rank.name,
              shortName: rank.name.substring(0, 3).toUpperCase(),
              ranking: rank.rank,
              logo: placeholderId,
              country: 'N/A',
            },
          })
          teamId = newTeam.id
        }
        
        // Upsert ranking
        const existingRank = await payload.find({
          collection: 'rankings',
          where: { team: { equals: teamId } },
        })
        
        const rankingData: any = {
          position: rank.rank,
          team: teamId,
          points: rank.points,
          change: Math.abs(rank.rank_diff),
          trend: rank.rank_diff < 0 ? 'up' : rank.rank_diff > 0 ? 'down' : 'stable',
          region: 'mundial',
          country: 'N/A',
          lastUpdated: new Date(rankingsData.date),
        }
        
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
    
    // 2. Sync Matches
    console.log('Syncing matches...')
    const matches = await getLatestMatches(50)
    for (const match of matches) {
      try {
        // Sync Teams
        const t1Id = await ensureTeam(payload, match.team1)
        const t2Id = await ensureTeam(payload, match.team2)
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
    
    console.log('Sync complete!')
  } catch (error) {
    console.error('Sync failed:', error)
  } finally {
    process.exit(0)
  }
}

async function ensureTeam(payload: any, teamData: any) {
  const existing = await payload.find({
    collection: 'teams',
    where: { externalTeamId: { equals: teamData.id } },
  })
  
  if (existing.docs.length > 0) {
    return existing.docs[0].id
  }
  
  // Find placeholder
  const placeholder = await payload.find({
    collection: 'media',
    where: { alt: { equals: 'Placeholder' } },
  })
  const placeholderId = placeholder.docs[0]?.id || null
  
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

async function ensureTournament(payload: any, match: any) {
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

sync()
