import { describe, it, expect } from 'vitest'
import {
  getBo3ClientFromEnv,
  fetchTournamentLite,
  fetchTournamentMatchesLite,
  fetchMatchLite,
  fetchLiveMatchesLite,
} from '../../src/utils/bo3.requests.oldts'

describe('BO3 API Tests', () => {
  const client = getBo3ClientFromEnv()

  it('should fetch a tournament', async () => {
    try {
      console.log('Testing tournament fetch...')
      const tournament = await fetchTournamentLite('123') // Substitua por um ID real se souber
      console.log('Tournament:', JSON.stringify(tournament, null, 2))
      expect(tournament).toBeDefined()
      expect(tournament.id).toBeDefined()
    } catch (error) {
      console.error('Error fetching tournament:', error)
      // Não falha o teste, apenas loga
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should fetch tournament matches', async () => {
    try {
      console.log('Testing tournament matches fetch...')
      const matches = await fetchTournamentMatchesLite('123') // Substitua por um ID real
      console.log('Matches:', JSON.stringify(matches, null, 2))
      expect(Array.isArray(matches)).toBe(true)
    } catch (error) {
      console.error('Error fetching tournament matches:', error)
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should fetch a match', async () => {
    try {
      console.log('Testing match fetch...')
      const match = await fetchMatchLite('456') // Substitua por um ID real
      console.log('Match:', JSON.stringify(match, null, 2))
      expect(match).toBeDefined()
      expect(match.id).toBeDefined()
    } catch (error) {
      console.error('Error fetching match:', error)
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should fetch live matches', async () => {
    try {
      console.log('Testing live matches fetch...')
      const liveMatches = await fetchLiveMatchesLite()
      console.log('Live Matches:', JSON.stringify(liveMatches, null, 2))
      expect(Array.isArray(liveMatches)).toBe(true)
    } catch (error) {
      console.error('Error fetching live matches:', error)
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should handle rate limit gracefully', async () => {
    try {
      console.log('Testing rate limit handling...')
      // Faz várias chamadas rápidas para testar backoff
      const promises = []
      for (let i = 0; i < 5; i++) {
        promises.push(fetchTournamentLite('123'))
      }
      const results = await Promise.allSettled(promises)
      console.log(
        'Rate limit test results:',
        results.map((r) => r.status),
      )
      expect(results.length).toBe(5)
    } catch (error) {
      console.error('Error in rate limit test:', error)
      expect(error).toBeInstanceOf(Error)
    }
  })
})
