import { extractMatchesFromV2Response, getUpcomingMatchesV2 } from '../utils/bo3.requests'

function toDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getTestDate(): string {
  // Allow override: BO3_TEST_DATE=2026-04-06
  if (process.env.BO3_TEST_DATE) return process.env.BO3_TEST_DATE

  // Default: tomorrow
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toDateISO(d)
}

async function main() {
  const testDate = getTestDate()

  console.log('🧪 BO3 /upcoming parser test')
  console.log(`Date: ${testDate}`)

  const response = await getUpcomingMatchesV2(testDate)
  const matches = extractMatchesFromV2Response(response)

  const teams = response.included?.teams ?? {}
  const tournaments = response.included?.tournaments ?? {}

  const total = matches.length
  const withTeamRefs = matches.filter(
    (m: any) => m.team1 != null || m.team2 != null || m.team1_id != null || m.team2_id != null,
  ).length
  const resolvedTeamNames = matches.filter(
    (m: any) => m.team1_display_name || m.team2_display_name,
  ).length
  const resolvedTournaments = matches.filter((m: any) => !!m.tournament_data?.name).length

  console.log(`included.teams keys: ${Object.keys(teams).length}`)
  console.log(`included.tournaments keys: ${Object.keys(tournaments).length}`)
  console.log(`matches: ${total}`)
  console.log(`matches with team refs: ${withTeamRefs}`)
  console.log(`matches with resolved team names: ${resolvedTeamNames}`)
  console.log(`matches with resolved tournament: ${resolvedTournaments}`)

  const samples = matches.slice(0, 8)
  if (samples.length > 0) {
    console.log('\nSample:')
    samples.forEach((m: any) => {
      const t1 = m.team1_display_name ?? '(TBD)'
      const t2 = m.team2_display_name ?? '(TBD)'
      const tr = m.tournament_data?.name ?? 'Unknown'
      console.log(`- ${m.id}: ${t1} vs ${t2} | tier=${m.tier} | tournament=${tr}`)
    })
  }

  // Hard checks (stable)
  if (!response.meta?.date) {
    throw new Error('Invalid response: missing meta.date')
  }

  if (!Array.isArray(matches)) {
    throw new Error('Parser regression: matches is not an array')
  }

  // Soft warning for anonymized matches
  if (total > 0 && resolvedTeamNames < total) {
    console.warn(
      `⚠️ Partial anonymization detected: ${total - resolvedTeamNames}/${total} matches without team names (expected for some upcoming matches).`,
    )
  }

  console.log('\n✅ /upcoming parser test passed')
}

main().catch((error) => {
  console.error('❌ /upcoming parser test failed')
  console.error(error)
  process.exit(1)
})
