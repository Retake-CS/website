'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// v2 — sem mock data, interface correta com trend
interface Team {
  position: number
  name: string
  shortName?: string
  teamId?: string
  points: number
  trend: 'up' | 'down' | 'stable'
  logoUrl?: string
}

export const Ranking = () => {
  const [topTeams, setTopTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          '/api/rankings?limit=8&sort=position&where[isActive][equals]=true',
          { cache: 'no-store' },
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const result = await response.json()

        if (!result.docs || result.docs.length === 0) {
          setError('sem_dados')
          return
        }

        const teams: Team[] = result.docs.map((ranking: any) => ({
          position: ranking.position,
          name: ranking.team?.name || 'Unknown',
          shortName: ranking.team?.shortName,
          teamId: ranking.team?.id,
          points: ranking.points,
          trend: (ranking.trend ?? 'stable') as 'up' | 'down' | 'stable',
          logoUrl: ranking.team?.logo?.url,
        }))

        setTopTeams(teams)
      } catch (err: any) {
        console.error('Error fetching rankings:', err)
        setError('erro_fetch')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRankings()
  }, [])

  return (
    <div className="card !rounded-lg w-full bg-rcs-sec shadow-sm !h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="card-body p-3 lg:p-4">
        <div className="card-title border-b border-rcs-sec-400 pb-2 flex items-center justify-between text-rcs-bg">
          <h3 className="font-semibold text-lg">RANKING VALVE</h3>
          <Link href="/rankings" className="btn btn-sm btn-outline hover:bg-rcs-cta">
            Ver tudo
          </Link>
        </div>

        <div className="mt-2 overflow-y-auto max-h-[264px] md:max-h-[300px] lg:max-h-[324px] xl:max-h-[344px]">
          {isLoading && (
            <div className="space-y-2 py-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-2 px-2 py-1">
                  <div className="w-4 h-3 bg-rcs-sec-500/40 rounded" />
                  <div className="flex-1 h-3 bg-rcs-sec-500/40 rounded" />
                  <div className="w-8 h-3 bg-rcs-sec-500/40 rounded" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error === 'sem_dados' && (
            <div className="text-center py-6 text-rcs-bg/60 text-sm">
              <p>Ranking ainda não disponível.</p>
              <p className="text-xs mt-1 opacity-70">Os dados serão sincronizados em breve.</p>
            </div>
          )}

          {!isLoading && error === 'erro_fetch' && (
            <div className="text-center py-6 text-rcs-bg/60 text-sm">
              <p>Não foi possível carregar o ranking.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-xs mt-2 underline opacity-70 hover:opacity-100"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {!isLoading && !error && topTeams.length > 0 && (
            <table className="table table-zebra text-sm text-rcs-bg w-full">
              <thead>
                <tr className="bg-rcs-sec-500">
                  <th className="py-2 px-2 w-8">#</th>
                  <th className="py-2">Time</th>
                  <th className="py-2 px-2 text-right w-14">Pts</th>
                </tr>
              </thead>
              <tbody>
                {topTeams.map((team) => (
                  <tr key={team.position}>
                    <td className="py-1.5 px-2">{team.position}</td>
                    <td className="py-1.5">
                      {team.teamId ? (
                        <Link
                          href={`/team/${team.teamId}`}
                          className="hover:text-rcs-cta transition-colors"
                        >
                          {team.name}
                        </Link>
                      ) : (
                        <span>{team.name}</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-right font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <span>{team.points}</span>
                        {team.trend === 'up' && (
                          <span className="text-green-500 text-[10px]">▲</span>
                        )}
                        {team.trend === 'down' && (
                          <span className="text-red-500 text-[10px]">▼</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Ranking
