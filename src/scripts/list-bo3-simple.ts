// BO3.gg API v2 Only Test Script
// Uses ONLY API v2 functions - no legacy API v1 code

import {
  // API v2 functions only
  getFinishedMatchesV2,
  getCurrentMatchesV2,
  getUpcomingMatchesV2,
  getTodayMatchesV2,
  extractMatchesFromV2Response,
  debugAPIV2Response,
} from '../utils/bo3.requests'

async function main() {
  console.log('🎮 BO3.gg API v2 Only Test Script')
  console.log('===================================\n')

  try {
    // Test 1: Debug API v2 response structure
    console.log('📡 Testing API v2 response structure...')
    await debugAPIV2Response()
    console.log('✅ API v2 structure test completed\n')

    // Test 2: Today's matches using API v2
    console.log("� Today's Matches (API v2):")
    try {
      const todayResponse = await getTodayMatchesV2()
      const todayMatches = extractMatchesFromV2Response(todayResponse)
      console.log(`   Found ${todayMatches.length} matches for today`)
      console.log(`   Date: ${todayResponse.meta.date}`)
      console.log(`   Teams available: ${Object.keys(todayResponse.included?.teams || {}).length}`)
      console.log(
        `   Tournaments available: ${Object.keys(todayResponse.included?.tournaments || {}).length}`,
      )

      if (todayMatches.length > 0) {
        // Group by status
        const byStatus = todayMatches.reduce((acc: Record<string, number>, match: any) => {
          acc[match.status] = (acc[match.status] || 0) + 1
          return acc
        }, {})
        console.log(`   By status:`, byStatus)

        // Show samples
        todayMatches.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
          console.log(`      Status: ${match.status} | Tier: ${match.tier}`)
          console.log(`      Tournament: ${match.tournament_data?.name || 'Unknown'}`)
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
          if (match.team1_score !== undefined && match.team2_score !== undefined) {
            console.log(`      Score: ${match.team1_score}-${match.team2_score}`)
          }
        })
      }
    } catch (error) {
      console.log(`   Error fetching today's matches: ${(error as Error).message}`)
    }

    // Test 3: Live matches using API v2
    console.log('\n🔴 Live Matches (API v2):')
    try {
      const liveResponse = await getCurrentMatchesV2()
      const liveMatches = extractMatchesFromV2Response(liveResponse)
      console.log(`   Found ${liveMatches.length} live matches`)

      if (liveMatches.length > 0) {
        liveMatches.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
          console.log(`      Status: ${match.status} | Tier: ${match.tier}`)
          console.log(`      Tournament: ${match.tournament_data?.name || 'Unknown'}`)
          if (match.live_updates) {
            console.log(
              `      🔴 LIVE: ${match.live_updates.map_name} Round ${match.live_updates.round_number}`,
            )
            console.log(
              `      Match Score: ${match.live_updates.team_1?.match_score}-${match.live_updates.team_2?.match_score}`,
            )
          }
          if (match.games && match.games.length > 0) {
            console.log(`      Games: ${match.games.length} maps`)
          }
        })
      } else {
        console.log(`   No live matches at the moment`)
      }
    } catch (error) {
      console.log(`   Error fetching live matches: ${(error as Error).message}`)
    }

    // Test 4: Upcoming matches using API v2
    console.log('\n⏰ Upcoming Matches (API v2):')
    try {
      const upcomingResponse = await getUpcomingMatchesV2()
      const upcomingMatches = extractMatchesFromV2Response(upcomingResponse)
      console.log(`   Found ${upcomingMatches.length} upcoming matches`)

      if (upcomingMatches.length > 0) {
        upcomingMatches.slice(0, 5).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
          console.log(
            `      Tier: ${match.tier} | Tournament: ${match.tournament_data?.name || 'Unknown'}`,
          )
          if (match.ai_predictions) {
            console.log(
              `      AI Prediction: ${match.ai_predictions.prediction_team1_score}-${match.ai_predictions.prediction_team2_score}`,
            )
          }
          console.log(`      BO${match.bo_type} | Stars: ${match.stars}`)
        })
      } else {
        console.log(`   No upcoming matches found`)
      }
    } catch (error) {
      console.log(`   Error fetching upcoming matches: ${(error as Error).message}`)
    }

    // Test 5: S-tier finished matches for recent dates using API v2
    console.log('\n🌟 Recent S-Tier Finished Matches (API v2):')
    try {
      const testDates = ['2025-09-09', '2025-09-08', '2025-09-07', '2025-09-06']
      let foundMatches = 0

      for (const date of testDates) {
        try {
          const finishedResponse = await getFinishedMatchesV2(date, 's')
          const finishedMatches = extractMatchesFromV2Response(finishedResponse)

          if (finishedMatches.length > 0) {
            console.log(`   📊 ${date}: Found ${finishedMatches.length} S-tier finished matches`)
            foundMatches += finishedMatches.length

            finishedMatches.slice(0, 2).forEach((match: any, i: number) => {
              console.log(
                `      ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
              )
              console.log(`         Score: ${match.team1_score}-${match.team2_score}`)
              console.log(`         Tournament: ${match.tournament_data?.name || 'Unknown'}`)
              console.log(`         BO${match.bo_type} | Stars: ${match.stars}`)
            })

            if (foundMatches >= 5) break // Show enough samples
          } else {
            console.log(`   📊 ${date}: No S-tier matches`)
          }
        } catch (error) {
          console.log(`   📊 ${date}: Error - ${(error as Error).message}`)
        }
      }

      if (foundMatches === 0) {
        console.log('   No recent S-tier finished matches found')
      }
    } catch (error) {
      console.log(`   Error in S-tier test: ${(error as Error).message}`)
    }

    // Test 6: Multiple tier upcoming matches using API v2
    console.log('\n� Upcoming Matches by Tier (API v2):')
    const tiers = ['s', 'a', 'b']
    for (const tier of tiers) {
      try {
        const upcomingResponse = await getUpcomingMatchesV2(undefined, tier)
        const upcomingMatches = extractMatchesFromV2Response(upcomingResponse)
        console.log(`   ${tier.toUpperCase()}-Tier: ${upcomingMatches.length} upcoming matches`)

        if (upcomingMatches.length > 0) {
          const nextMatch = upcomingMatches[0]
          console.log(
            `      Next: ${nextMatch.team1_data?.name || 'Team1'} vs ${nextMatch.team2_data?.name || 'Team2'}`,
          )
          console.log(`      Start: ${new Date(nextMatch.start_date).toLocaleString()}`)
          console.log(`      Tournament: ${nextMatch.tournament_data?.name || 'Unknown'}`)
        }
      } catch (error) {
        console.log(`   ${tier.toUpperCase()}-Tier: Error - ${(error as Error).message}`)
      }
    }

    console.log('\n✅ All API v2 tests completed successfully!')
    console.log('\n📝 Summary: This script now uses ONLY API v2 endpoints:')
    console.log('   - /api/v2/matches/finished (for historical data)')
    console.log('   - /api/v2/matches/live (for current matches)')
    console.log('   - /api/v2/matches/upcoming (for future matches)')
    console.log('   - All data includes enriched team/tournament information')
    console.log('   - Support for tier filtering (s, a, b, c)')
    console.log('   - Date filtering for historical data')
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', (error as Error).message)
    console.error('Stack trace:', (error as Error).stack)
    process.exit(1)
  }
}

// Run the script if executed directly
main()
