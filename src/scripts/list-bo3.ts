// BO3.gg API Test Script
// Updated to work with real API structure

import {
  debugAPIResponse,
  testMinimalAPI,
  debugActualAPIResponse,
  // NEW: Real API structure functions
  debugRealAPIResponse,
  getCurrentMatchesSimple,
  getUpcomingMatchesSimple,
  getFinishedMatchesSimple,
  getMatchesByTierSimple,
  getMatchesByDateRange,
  getTodayMatchesSimple,
  getLiveMatchesSimple,
} from '../utils/bo3.requests'
import { BO3_UTILS } from '../utils/bo3-endpoints'

async function main() {
  console.log('🎮 BO3.gg API Test Script')
  console.log('=========================\n')

  try {
    // Test MINIMAL: Check what API actually accepts
    console.log('🧪 Testing minimal API requests...')
    await testMinimalAPI()
    console.log('✅ Minimal API tests completed\n')

    // Test 1: Debug API response structure
    console.log('📡 Testing API response structure...')
    await debugAPIResponse()
    console.log('✅ API structure test completed\n') // Test 2: Get today's matches (using new real API structure)
    console.log("📅 Fetching today's matches...")
    const todayMatchesReal = await getTodayMatchesSimple()

    console.log(`📊 Today's Matches Summary:`)
    console.log(`   Total matches: ${todayMatchesReal.length}`)

    // Group by status and tier
    const byStatus = todayMatchesReal.reduce((acc: Record<string, number>, match: any) => {
      acc[match.status] = (acc[match.status] || 0) + 1
      return acc
    }, {})
    const byTier = todayMatchesReal.reduce((acc: Record<string, number>, match: any) => {
      acc[match.tier] = (acc[match.tier] || 0) + 1
      return acc
    }, {})

    console.log(`   By status:`, byStatus)
    console.log(`   By tier:`, byTier)
    console.log() // Test 3: Show sample matches
    if (todayMatchesReal.length > 0) {
      console.log('🏆 Sample Matches:')

      todayMatchesReal.slice(0, 5).forEach((match, index) => {
        const team1Name = match.team1?.name || 'TBD'
        const team2Name = match.team2?.name || 'TBD'
        const tournamentName = match.tournament?.name || 'Unknown'
        const timeUntil = BO3_UTILS.getTimeUntilMatch(match.start_date)

        console.log(`   ${index + 1}. ${team1Name} vs ${team2Name}`)
        console.log(`      Tournament: ${tournamentName}`)
        console.log(
          `      Status: ${match.status} | Tier: ${BO3_UTILS.getTierDisplayName(match.tier)}`,
        )
        console.log(`      Score: ${match.team1_score} - ${match.team2_score}`)
        console.log(`      Time: ${timeUntil} | Stars: ${match.stars}`)
        if (match.live_coverage) {
          console.log(`      🔴 Live coverage available`)
        }
        console.log()
      })
    } // Test 4: Get live matches (using new API)
    console.log('🔴 Fetching live matches...')
    const liveMatches = await getLiveMatchesSimple()
    console.log(`   Found ${liveMatches.length} live matches`)

    if (liveMatches.length > 0) {
      liveMatches.forEach((match) => {
        const team1Name = match.team1?.name || 'TBD'
        const team2Name = match.team2?.name || 'TBD'
        console.log(
          `   🔴 LIVE: ${team1Name} vs ${team2Name} (${match.team1_score}-${match.team2_score})`,
        )

        // Show games info if available
        if (match.games && match.games.length > 0) {
          const currentGame = match.games[match.games.length - 1]
          console.log(`      Map: ${currentGame.map_name}`)
          console.log(`      Status: ${currentGame.status}`)
        }
      })
    }
    console.log()

    // Test 5: Get upcoming matches (using new API)
    console.log('⏰ Fetching upcoming matches...')
    const upcomingMatches = await getUpcomingMatchesSimple()
    console.log(`   Found ${upcomingMatches.length} upcoming matches`)

    if (upcomingMatches.length > 0) {
      upcomingMatches.slice(0, 3).forEach((match) => {
        const team1Name = match.team1?.name || 'TBD'
        const team2Name = match.team2?.name || 'TBD'
        const timeUntil = BO3_UTILS.getTimeUntilMatch(match.start_date)
        console.log(`   ⏰ ${team1Name} vs ${team2Name} in ${timeUntil}`)
      })
    }
    console.log()

    // Test 6: Get high tier matches (using new API)
    console.log('🏅 Fetching high tier matches...')
    const highTierMatches = await getMatchesByTierSimple('s')
    console.log(`   Found ${highTierMatches.length} tier S matches`)

    if (highTierMatches.length > 0) {
      highTierMatches.slice(0, 3).forEach((match) => {
        const team1Name = match.team1?.name || 'TBD'
        const team2Name = match.team2?.name || 'TBD'
        const tournamentName = match.tournament?.name || 'Unknown'
        console.log(`   🏅 ${team1Name} vs ${team2Name} - ${tournamentName}`)
      })
    }
    console.log()

    // Test 7: Filter tests (using real API structure)
    console.log('🔍 Testing filters...')

    // Filter by tier S only
    const tierSMatches = todayMatchesReal.filter((match) => match.tier === 's')
    console.log(`   Tier S matches: ${tierSMatches.length}`)

    // Filter finished matches
    const finishedMatches = todayMatchesReal.filter((match) => match.status === 'finished')
    console.log(`   Finished matches: ${finishedMatches.length}`)
    console.log()

    // Test 8: Team and tournament data (from real API structure)
    console.log('👥 Team and Tournament Data:')

    // Extract unique teams from matches
    const uniqueTeams = new Map<number, any>()
    todayMatchesReal.forEach((match) => {
      if (match.team1) uniqueTeams.set(match.team1_id, match.team1)
      if (match.team2) uniqueTeams.set(match.team2_id, match.team2)
    })

    Array.from(uniqueTeams.values())
      .slice(0, 3)
      .forEach((team) => {
        console.log(`   Team: ${team.name} (${team.slug})`)
        if (team.image_url) {
          console.log(`     Logo: ${team.image_url}`)
        }
      })

    // Extract unique tournaments from matches
    const uniqueTournaments = new Map<number, any>()
    todayMatchesReal.forEach((match) => {
      if (match.tournament) uniqueTournaments.set(match.tournament_id, match.tournament)
    })

    Array.from(uniqueTournaments.values())
      .slice(0, 3)
      .forEach((tournament) => {
        console.log(`   Tournament: ${tournament.name} (Tier ${tournament.tier})`)
        if (tournament.prize) {
          console.log(`     Prize: $${tournament.prize.toLocaleString()}`)
        }
      })
    console.log() // Test 9: Yesterday's matches using date range
    const yesterday = BO3_UTILS.getYesterdayDate()
    console.log(`📆 Fetching matches for ${yesterday}...`)
    try {
      const yesterdayMatches = await getMatchesByDateRange(yesterday, yesterday)
      console.log(`   Found ${yesterdayMatches.length} matches for ${yesterday}`)

      if (yesterdayMatches.length > 0) {
        yesterdayMatches.slice(0, 3).forEach((match, i) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(
            `      Status: ${match.status} | Score: ${match.team1_score}-${match.team2_score}`,
          )
        })
      }
    } catch (error) {
      console.log(`   ❌ Could not fetch matches for ${yesterday}: ${error}`)
    }
    console.log()

    // Test 10: Current matches with new API
    console.log('🔴 Testing Current Matches...')
    try {
      const currentMatches = await getCurrentMatchesSimple()
      console.log(`   Found ${currentMatches.length} current matches`)
      if (currentMatches.length > 0) {
        currentMatches.slice(0, 3).forEach((match, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(`      Status: ${match.status} | Tier: ${match.tier}`)
          console.log(`      Tournament: ${match.tournament?.name || 'Unknown'}`)
          console.log(`      Score: ${match.team1_score}-${match.team2_score}`)
        })
      }
    } catch (error) {
      console.log(`   Error fetching current matches: ${(error as Error).message}`)
    }

    // Test upcoming matches with widget scope
    console.log('\n⏰ Upcoming Matches (Widget Scope):')
    try {
      const upcomingMatches = await getUpcomingMatchesSimple()
      console.log(`   Found ${upcomingMatches.length} upcoming matches`)
      if (upcomingMatches.length > 0) {
        upcomingMatches.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
          console.log(
            `      Tier: ${match.tier} | Tournament: ${match.tournament?.name || 'Unknown'}`,
          )
        })
      }
    } catch (error) {
      console.log(`   Error fetching upcoming matches: ${(error as Error).message}`)
    }

    // Test S-tier matches
    console.log('\n🌟 S-Tier Matches:')
    try {
      const sTierMatches = await getMatchesByTierSimple('s', 'current')
      console.log(`   Found ${sTierMatches.length} S-tier matches`)
      if (sTierMatches.length > 0) {
        sTierMatches.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(
            `      Status: ${match.status} | Tournament: ${match.tournament?.name || 'Unknown'}`,
          )
        })
      }
    } catch (error) {
      console.log(`   Error fetching S-tier matches: ${(error as Error).message}`)
    }

    // Test finished matches
    console.log('\n✅ Recent Finished Matches:')
    try {
      const finishedMatches = await getFinishedMatchesSimple(5)
      console.log(`   Found ${finishedMatches.length} recent finished matches`)
      if (finishedMatches.length > 0) {
        finishedMatches.forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(`      Final Score: ${match.team1_score}-${match.team2_score}`)
          console.log(`      Tournament: ${match.tournament?.name || 'Unknown'}`)
        })
      }
    } catch (error) {
      console.log(`   Error fetching finished matches: ${(error as Error).message}`)
    }

    console.log('\n✅ Widget Matches tests completed')

    // Test NEW: Real API Structure Testing
    console.log('🚀 Testing Real API Structure (with includes)...')
    await debugRealAPIResponse()

    // Test current matches with real structure
    console.log('\n🔴 Current Matches (Real API):')
    try {
      const currentMatchesReal = await getCurrentMatchesSimple()
      console.log(`   Found ${currentMatchesReal.length} current matches`)

      if (currentMatchesReal.length > 0) {
        currentMatchesReal.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(`      Status: ${match.status} | Tier: ${match.tier}`)
          console.log(`      Tournament: ${match.tournament?.name || 'Unknown'}`)
          if (match.live_updates) {
            console.log(
              `      Score: ${match.live_updates.team_1.match_score}-${match.live_updates.team_2.match_score}`,
            )
          }
          if (match.ai_predictions) {
            console.log(
              `      AI Prediction: ${match.ai_predictions.prediction_team1_score}-${match.ai_predictions.prediction_team2_score}`,
            )
          }
        })
      }
    } catch (error) {
      console.log(`   Error fetching current matches: ${(error as Error).message}`)
    }

    // Test upcoming matches with real structure
    console.log('\n⏰ Upcoming Matches (Real API):')
    try {
      const upcomingMatchesReal = await getUpcomingMatchesSimple()
      console.log(`   Found ${upcomingMatchesReal.length} upcoming matches`)

      if (upcomingMatchesReal.length > 0) {
        upcomingMatchesReal.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
          console.log(
            `      Tier: ${match.tier} | Tournament: ${match.tournament?.name || 'Unknown'}`,
          )
          if (match.ai_predictions) {
            console.log(
              `      AI Prediction: ${match.ai_predictions.prediction_team1_score}-${match.ai_predictions.prediction_team2_score}`,
            )
          }
        })
      }
    } catch (error) {
      console.log(`   Error fetching upcoming matches: ${(error as Error).message}`)
    }

    // Test S-tier matches with real structure
    console.log('\n🌟 S-Tier Matches (Real API):')
    try {
      const sTierMatchesReal = await getMatchesByTierSimple('s')
      console.log(`   Found ${sTierMatchesReal.length} S-tier matches`)

      if (sTierMatchesReal.length > 0) {
        sTierMatchesReal.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(
            `      Status: ${match.status} | Tournament: ${match.tournament?.name || 'Unknown'}`,
          )
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
        })
      }
    } catch (error) {
      console.log(`   Error fetching S-tier matches: ${(error as Error).message}`)
    }

    // Test finished matches with real structure
    console.log('\n✅ Recent Finished Matches (Real API):')
    try {
      const finishedMatchesReal = await getFinishedMatchesSimple(5)
      console.log(`   Found ${finishedMatchesReal.length} recent finished matches`)

      if (finishedMatchesReal.length > 0) {
        finishedMatchesReal.forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(`      Final Score: ${match.team1_score}-${match.team2_score}`)
          console.log(`      Tournament: ${match.tournament?.name || 'Unknown'}`)
          console.log(
            `      Ended: ${new Date(match.end_date || match.start_date).toLocaleString()}`,
          )
        })
      }
    } catch (error) {
      console.log(`   Error fetching finished matches: ${(error as Error).message}`)
    }

    // Test date range matches
    console.log("\n📆 Today's Matches by Date Range (Real API):")
    try {
      const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      const todayMatchesReal = await getMatchesByDateRange(today, today, [
        'teams',
        'tournament',
        'ai_predictions',
      ])
      console.log(`   Found ${todayMatchesReal.length} matches for ${today}`)

      if (todayMatchesReal.length > 0) {
        const statuses = todayMatchesReal.reduce((acc: Record<string, number>, match: any) => {
          acc[match.status] = (acc[match.status] || 0) + 1
          return acc
        }, {})
        console.log(`   By status:`, statuses)

        // Show a few samples
        todayMatchesReal.slice(0, 2).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1?.name || 'Team 1'} vs ${match.team2?.name || 'Team 2'}`,
          )
          console.log(
            `      Status: ${match.status} | Start: ${new Date(match.start_date).toLocaleString()}`,
          )
        })
      }
    } catch (error) {
      console.log(`   Error fetching today's matches: ${(error as Error).message}`)
    }

    console.log('\n✅ Real API structure tests completed')

    console.log('✅ All tests completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error)

    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack trace:', error.stack)
    }

    process.exit(1)
  }
}

// Run the test if this file is executed directly
main()

export default main
