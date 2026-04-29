// BO3.gg API v2 Test Script - Clean Implementation
// Only uses API v2 functions for current data

import {
  // API v2 functions - Primary use
  getFinishedMatchesV2,
  getCurrentMatchesV2,
  getUpcomingMatchesV2,
  getTodayMatchesV2,
  extractMatchesFromV2Response,
  debugAPIV2Response,
} from '../utils/bo3.requests.oldts'

async function main() {
  console.log('🎮 BO3.gg API v2 Test Script')
  console.log('============================\n')

  try {
    // Test 1: Debug API v2 structure
    console.log('🚀 Testing BO3 API v2 Structure...')
    await debugAPIV2Response()

    // Test 2: Get finished matches for recent dates
    console.log('\n📅 Testing Finished Matches (API v2)...')
    const testDates = ['2025-09-07', '2025-09-06', '2025-09-05']

    for (const date of testDates) {
      try {
        console.log(`\n📊 Finished matches for ${date}:`)
        const response = await getFinishedMatchesV2(date, 's')
        const matches = extractMatchesFromV2Response(response)

        console.log(`   Found ${matches.length} S-tier finished matches`)
        console.log(`   Date: ${response.meta.date}`)
        console.log(`   Teams available: ${Object.keys(response.included.teams).length}`)
        console.log(
          `   Tournaments available: ${Object.keys(response.included.tournaments).length}`,
        )

        if (matches.length > 0) {
          matches.slice(0, 3).forEach((match: any, i: number) => {
            console.log(
              `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
            )
            console.log(
              `      Score: ${match.team1_score}-${match.team2_score} | Status: ${match.status}`,
            )
            console.log(`      Tournament: ${match.tournament_data?.name || 'Unknown'}`)
            console.log(`      Tier: ${match.tier} | BO${match.bo_type} | Stars: ${match.stars}`)

            if (match.ai_predictions) {
              console.log(
                `      AI Predicted: ${match.ai_predictions.prediction_team1_score}-${match.ai_predictions.prediction_team2_score}`,
              )
            }

            if (match.live_updates) {
              console.log(
                `      Live: ${match.live_updates.map_name} Round ${match.live_updates.round_number}`,
              )
            }
          })
        }
      } catch (error) {
        console.log(`   ❌ Error for ${date}: ${error}`)
      }
    }

    // Test 3: Get current/live matches
    console.log('\n🔴 Testing Live Matches (API v2)...')
    try {
      const liveResponse = await getCurrentMatchesV2('s')
      const liveMatches = extractMatchesFromV2Response(liveResponse)

      console.log(`   Found ${liveMatches.length} live S-tier matches`)

      if (liveMatches.length > 0) {
        liveMatches.forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
          console.log(
            `      Score: ${match.team1_score}-${match.team2_score} | Status: ${match.status}`,
          )
          console.log(`      Tournament: ${match.tournament_data?.name || 'Unknown'}`)

          if (match.live_updates) {
            console.log(
              `      Live: ${match.live_updates.map_name} Round ${match.live_updates.round_number}`,
            )
            console.log(
              `      Game Score: ${match.live_updates.team_1.game_score}-${match.live_updates.team_2.game_score}`,
            )
          }
        })
      } else {
        console.log('   No live matches at the moment')
      }
    } catch (error) {
      console.log(`   ❌ Error getting live matches: ${error}`)
    }

    // Test 4: Get upcoming matches
    console.log('\n⏰ Testing Upcoming Matches (API v2)...')
    try {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Test upcoming for today
      console.log(`\n📋 Upcoming matches for today (${today}):`)
      const todayUpcoming = await getUpcomingMatchesV2(today, 's')
      const todayUpcomingMatches = extractMatchesFromV2Response(todayUpcoming)

      console.log(`   Found ${todayUpcomingMatches.length} upcoming S-tier matches`)

      if (todayUpcomingMatches.length > 0) {
        todayUpcomingMatches.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
          console.log(`      Tournament: ${match.tournament_data?.name || 'Unknown'}`)
          console.log(`      Tier: ${match.tier} | BO${match.bo_type} | Stars: ${match.stars}`)
        })
      }

      // Test upcoming for tomorrow
      console.log(`\n📋 Upcoming matches for tomorrow (${tomorrowStr}):`)
      const tomorrowUpcoming = await getUpcomingMatchesV2(tomorrowStr, 's')
      const tomorrowUpcomingMatches = extractMatchesFromV2Response(tomorrowUpcoming)

      console.log(`   Found ${tomorrowUpcomingMatches.length} upcoming S-tier matches`)

      if (tomorrowUpcomingMatches.length > 0) {
        tomorrowUpcomingMatches.slice(0, 3).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
          console.log(`      Tournament: ${match.tournament_data?.name || 'Unknown'}`)
          console.log(`      Tier: ${match.tier} | BO${match.bo_type}`)
        })
      }

      // Test upcoming without date (general upcoming)
      console.log(`\n📋 General upcoming matches:`)
      const generalUpcoming = await getUpcomingMatchesV2(undefined, 's')
      const generalUpcomingMatches = extractMatchesFromV2Response(generalUpcoming)

      console.log(`   Found ${generalUpcomingMatches.length} upcoming S-tier matches`)

      if (generalUpcomingMatches.length > 0) {
        generalUpcomingMatches.slice(0, 5).forEach((match: any, i: number) => {
          console.log(
            `   ${i + 1}. ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
          console.log(`      Start: ${new Date(match.start_date).toLocaleString()}`)
          console.log(`      Tournament: ${match.tournament_data?.name || 'Unknown'}`)
        })
      }
    } catch (error) {
      console.log(`   ❌ Error getting upcoming matches: ${error}`)
    }

    // Test 5: Test different tiers
    console.log('\n🏆 Testing Different Tiers (API v2)...')
    const tiers = ['s', 'a', 'b']
    const testDate = '2025-09-07'

    for (const tier of tiers) {
      try {
        const response = await getFinishedMatchesV2(testDate, tier)
        const matches = extractMatchesFromV2Response(response)
        console.log(`   Tier ${tier.toUpperCase()}: ${matches.length} matches`)

        if (matches.length > 0) {
          const match = matches[0]
          console.log(
            `     Sample: ${match.team1_data?.name || 'Team1'} vs ${match.team2_data?.name || 'Team2'}`,
          )
        }
      } catch (error) {
        console.log(`   Tier ${tier.toUpperCase()}: Error (${error})`)
      }
    }

    console.log('\n✅ All API v2 tests completed successfully!')
  } catch (error) {
    console.log(`❌ Test failed: ${(error as Error).message}`)
    console.error('Error details:', (error as Error).message)
    console.error('Stack trace:', (error as Error).stack)
    process.exit(1)
  }
}

// Run the script if executed directly
main()
