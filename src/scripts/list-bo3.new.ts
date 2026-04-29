// BO3.gg API Test Script
// Updated to work with real API structure

import {
  debugAPIResponse,
  getTodayMatches,
  getMatchesForDate,
  getLiveMatches,
  getUpcomingMatches,
  getHighTierMatches,
  filterMatches,
} from '../utils/bo3.requests'
import { BO3_UTILS, BO3_FILTERS } from '../utils/bo3-endpoints'

async function main() {
  console.log('🎮 BO3.gg API Test Script')
  console.log('=========================\n')

  try {
    // Test 1: Debug API response structure
    console.log('📡 Testing API response structure...')
    await debugAPIResponse()
    console.log('✅ API structure test completed\n')

    // Test 2: Get today's matches
    console.log("📅 Fetching today's matches...")
    const todayMatches = await getTodayMatches()

    console.log(`📊 Today's Matches Summary (${todayMatches.date}):`)
    console.log(`   Total matches: ${todayMatches.meta.total_matches}`)
    console.log(`   High tier: ${todayMatches.high_tier.length}`)
    console.log(`   Low tier: ${todayMatches.low_tier.length}`)
    console.log(`   By tier:`, todayMatches.meta.by_tier)
    console.log(`   By status:`, todayMatches.meta.by_status)
    console.log(`   Teams included: ${Object.keys(todayMatches.teams).length}`)
    console.log(`   Tournaments included: ${Object.keys(todayMatches.tournaments).length}`)

    if (todayMatches.meta.prev_date) {
      console.log(`   Previous date: ${todayMatches.meta.prev_date}`)
    }
    if (todayMatches.meta.next_date) {
      console.log(`   Next date: ${todayMatches.meta.next_date}`)
    }
    console.log()

    // Test 3: Show sample matches
    if (todayMatches.matches.length > 0) {
      console.log('🏆 Sample Matches:')

      todayMatches.matches.slice(0, 5).forEach((match, index) => {
        const team1Name = match.team1_data?.name || 'TBD'
        const team2Name = match.team2_data?.name || 'TBD'
        const tournamentName = match.tournament_data?.name || 'Unknown'
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
    }

    // Test 4: Get live matches
    console.log('🔴 Fetching live matches...')
    const liveMatches = await getLiveMatches()
    console.log(`   Found ${liveMatches.length} live matches`)

    if (liveMatches.length > 0) {
      liveMatches.forEach((match) => {
        const team1Name = match.team1_data?.name || 'TBD'
        const team2Name = match.team2_data?.name || 'TBD'
        console.log(
          `   🔴 LIVE: ${team1Name} vs ${team2Name} (${match.team1_score}-${match.team2_score})`,
        )

        if (match.live_updates) {
          const { live_updates } = match
          console.log(`      Map: ${live_updates.map_name}`)
          console.log(`      Round: ${live_updates.round_number} (${live_updates.round_phase})`)
          console.log(
            `      Score: ${live_updates.team_1.game_score} - ${live_updates.team_2.game_score}`,
          )
        }
      })
    }
    console.log()

    // Test 5: Get upcoming matches
    console.log('⏰ Fetching upcoming matches...')
    const upcomingMatches = await getUpcomingMatches()
    console.log(`   Found ${upcomingMatches.length} upcoming matches`)

    if (upcomingMatches.length > 0) {
      upcomingMatches.slice(0, 3).forEach((match) => {
        const team1Name = match.team1_data?.name || 'TBD'
        const team2Name = match.team2_data?.name || 'TBD'
        const timeUntil = BO3_UTILS.getTimeUntilMatch(match.start_date)
        console.log(`   ⏰ ${team1Name} vs ${team2Name} in ${timeUntil}`)
      })
    }
    console.log()

    // Test 6: Get high tier matches
    console.log('🏅 Fetching high tier matches...')
    const highTierMatches = await getHighTierMatches()
    console.log(`   Found ${highTierMatches.length} high tier matches`)

    if (highTierMatches.length > 0) {
      highTierMatches.slice(0, 3).forEach((match) => {
        const team1Name = match.team1_data?.name || 'TBD'
        const team2Name = match.team2_data?.name || 'TBD'
        const tournamentName = match.tournament_data?.name || 'Unknown'
        console.log(`   🏅 ${team1Name} vs ${team2Name} - ${tournamentName}`)
      })
    }
    console.log()

    // Test 7: Filter tests
    console.log('🔍 Testing filters...')

    // Filter by tier A only
    const tierAMatches = filterMatches(todayMatches.matches, BO3_FILTERS.highTierOnly())
    console.log(`   Tier A matches: ${tierAMatches.length}`)

    // Filter finished matches
    const finishedMatches = filterMatches(todayMatches.matches, BO3_FILTERS.finishedOnly())
    console.log(`   Finished matches: ${finishedMatches.length}`)
    console.log()

    // Test 8: Team and tournament data
    console.log('👥 Team and Tournament Data:')
    const sampleTeams = Object.entries(todayMatches.teams).slice(0, 3)
    sampleTeams.forEach(([id, team]) => {
      console.log(`   Team ${id}: ${team.name} (${team.slug})`)
      if (team.image_url) {
        console.log(`     Logo: ${team.image_url}`)
      }
    })

    const sampleTournaments = Object.entries(todayMatches.tournaments).slice(0, 3)
    sampleTournaments.forEach(([id, tournament]) => {
      console.log(`   Tournament ${id}: ${tournament.name} (Tier ${tournament.tier})`)
      if (tournament.prize) {
        console.log(`     Prize: $${tournament.prize.toLocaleString()}`)
      }
    })
    console.log()

    // Test 9: Yesterday's matches (if available)
    const yesterday = BO3_UTILS.getYesterdayDate()
    console.log(`📆 Fetching matches for ${yesterday}...`)
    try {
      const yesterdayMatches = await getMatchesForDate(yesterday)
      console.log(`   Found ${yesterdayMatches.meta.total_matches} matches for ${yesterday}`)
    } catch (error) {
      console.log(`   ❌ Could not fetch matches for ${yesterday}: ${error}`)
    }
    console.log()

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
if (require.main === module) {
  main()
}

export default main
