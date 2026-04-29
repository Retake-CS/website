// Script de sincronização BO3 API -> PayloadCMS
// Execute manualmente ou agende via cron

import { getTeamRankingsV2, getTeamDetailBySlug } from '../utils/bo3.requests'
import { upsertTeam, upsertRanking, findTeam } from '../utils/payloadCms'

// Função utilitária para delay entre requests
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hasTeamChanged(existing: any, apiTeam: any): boolean {
  // Simples comparação de campos principais
  if (!existing) return true
  return (
    existing.name !== apiTeam.name ||
    existing.image_url !== apiTeam.image_url ||
    existing.country_id !== apiTeam.country_id
    // Adicione outros campos relevantes
  )
}

async function syncRankingsAndTeams() {
  console.log('🔄 Iniciando sync de rankings e times...')
  const rankings = await getTeamRankingsV2(1, 100, 1)
  for (const entry of rankings.data) {
    // 1. Upsert team
    let teamData = await findTeam(entry.team_id)
    if (!teamData || hasTeamChanged(teamData, entry.team)) {
      const teamSlug = entry.team?.slug
      if (!teamSlug) {
        console.warn(
          `⚠️ Team slug ausente para team_id=${entry.team_id}, pulando atualização detalhada.`,
        )
      } else {
        teamData = await getTeamDetailBySlug(teamSlug)
        await upsertTeam(teamData)
      }
      await sleep(350) // leve espaçamento adicional para evitar burst local
    }
    // 2. Upsert ranking
    await upsertRanking({
      ...entry,
      team: teamData.id,
      lastSynced: new Date().toISOString(),
    })
    // Exemplo de log:
    console.log(`Equipe: ${entry.team?.name} | Rank: ${entry.rank} | Score: ${entry.score}`)
  }
  console.log('✅ Sync concluído!')
}

// Execução direta
syncRankingsAndTeams().catch((err) => {
  console.error('❌ Erro na sync:', err)
  process.exit(1)
})
