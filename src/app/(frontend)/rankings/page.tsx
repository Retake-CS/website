'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Ranking, RegionType, RegionInfo } from '../types/ranking'

// Utility function to generate team initials
const getTeamInitials = (teamName: string): string => {
  const words = teamName.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase()
  }
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

// Team logo component with fallback
const TeamLogo = ({ team, className = '' }: { team: Ranking['team']; className?: string }) => {
  const [logoError, setLogoError] = useState(false)

  if (!team.logo?.url || logoError) {
    const initials = getTeamInitials(team.name)
    return (
      <div
        className={`w-8 h-8 rounded bg-gradient-to-br from-rcs-cta/30 to-rcs-sec-500/60 flex items-center justify-center flex-shrink-0 border border-rcs-sec-400/30 ${className}`}
      >
        <span className="text-xs font-bold text-rcs-bg/90" title={team.name}>
          {initials}
        </span>
      </div>
    )
  }

  return (
    <img
      src={team.logo.url}
      alt={`${team.name} logo`}
      className={`w-8 h-8 rounded object-contain bg-rcs-sec-500/20 flex-shrink-0 ${className}`}
      onError={() => setLogoError(true)}
    />
  )
}

// Trend indicator component
const TrendIndicator = ({ change, trend }: { change: number; trend: Ranking['trend'] }) => {
  if (change === 0) {
    return <span className="text-rcs-bg/50 text-xs">—</span>
  }

  const isPositive = change > 0
  const color = isPositive ? 'text-green-400' : 'text-red-400'
  const arrow = isPositive ? '↑' : '↓'

  return (
    <span className={`${color} text-xs font-medium flex items-center gap-1`}>
      <span>{arrow}</span>
      <span>{Math.abs(change)}</span>
    </span>
  )
}

const TeamRankingsPage = () => {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<RegionType>('mundial')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const regions: RegionInfo[] = [
    { id: 'mundial', label: 'Mundial' },
    { id: 'europe', label: 'Europe' },
    { id: 'americas', label: 'Americas' },
    { id: 'asia', label: 'Asia' },
    { id: 'oceania', label: 'Oceania' },
  ]

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          limit: '50',
        })
        if (selectedRegion !== 'mundial') {
          params.set('where[region][equals]', selectedRegion)
        }
        const response = await fetch(`/api/rankings?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch rankings')
        }
        const result = await response.json()
        setRankings(result.docs)
      } catch (error) {
        console.error('Error fetching rankings:', error)
        setRankings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRankings()
  }, [selectedRegion])

  const filteredRankings = rankings.filter(
    (ranking) =>
      ranking.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ranking.team.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ranking.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const lastUpdated =
    rankings.length > 0
      ? (() => {
          try {
            return new Date(rankings[0].lastUpdated).toLocaleDateString('pt-BR')
          } catch {
            return 'Data inválida'
          }
        })()
      : new Date().toLocaleDateString('pt-BR')

  return (
    <div className="bg-rcs-bg min-h-screen">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Header da página */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-rcs-sec mb-2">Ranking Valve</h1>
            <p className="text-rcs-sec text-sm">
              Classificação oficial dos melhores times de Counter-Strike 2
            </p>
          </div>

          {/* Filtros e busca */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xs text-rcs-sec">Última atualização: {lastUpdated}</div>
            </div>
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar time..."
                value={searchTerm}
                onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                className="input input-sm w-full sm:w-64 bg-rcs-sec border-rcs-sec-400/50 text-white placeholder-rcs-bg/50 focus:border-rcs-cta"
              />
            </div>
          </div>
        </div>

        {/* Navegação entre regiões */}
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedRegion === region.id
                  ? 'bg-rcs-cta text-white'
                  : 'bg-base-200 text-base-content hover:bg-base-300'
              }`}
            >
              {region.icon && <span>{region.icon}</span>}
              <span>{region.label}</span>
            </button>
          ))}
        </div>

        {/* Tabela de ranking */}
        <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">
          <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
            <h3 className="text-sm font-semibold text-base-content truncate">
              Ranking {regions.find((r) => r.id === selectedRegion)?.label}
            </h3>
            <span className="text-[11px] text-base-content/60">Atualizado</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-rcs-cta/20 rounded-full mb-4 animate-spin"></div>
                <div className="h-4 bg-rcs-sec/20 rounded w-48 mb-2"></div>
                <div className="h-3 bg-rcs-sec/20 rounded w-32"></div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] !bg-base-200  text-base-content/60">
                    <th className="text-center px-3 py-2 font-medium">#</th>
                    <th className="text-left px-3 py-2 font-medium">Time</th>
                    <th className="text-center px-2 py-2 font-medium hidden sm:table-cell">País</th>
                    <th className="text-center px-2 py-2 font-medium">Pontos</th>
                    <th className="text-center px-2 py-2 font-medium">Mudança</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRankings.map((ranking) => (
                    <tr
                      key={ranking.id}
                      className="border-t border-base-300/50 hover:bg-base-300/30 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/team/${ranking.team.id}`)}
                    >
                      {/* Posição */}
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`font-mono text-base-content font-bold group-hover:!text-[var(--rcs-cta)]`}
                        >
                          {ranking.position}
                        </span>
                      </td>

                      {/* Time */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <TeamLogo
                            team={ranking.team}
                            className="group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-base-content/80 group-hover:!text-[var(--rcs-cta)] transition-colors truncate">
                              {ranking.team.name}
                            </div>
                            <div className="text-xs text-base-content/60 truncate">
                              {ranking.team.shortName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* País */}
                      <td className="px-2 py-2 text-center hidden sm:table-cell">
                        <span className="text-base-content/70 font-mono text-xs">
                          {ranking.country}
                        </span>
                      </td>

                      {/* Pontos */}
                      <td className="px-2 py-2 text-center">
                        <div className="font-mono text-base-content">
                          {ranking.points.toLocaleString()}
                        </div>
                      </td>

                      {/* Mudança */}
                      <td className="px-2 py-2 text-center">
                        <TrendIndicator change={ranking.change} trend={ranking.trend} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="rounded-xl border border-base-300/50 bg-base-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-base-content mb-2">Como funciona o ranking?</h3>
          <div className="text-xs text-base-content/70 space-y-1">
            <p>• Rankings são organizados por região: Mundial, Europe, Americas, Asia e Oceania</p>
            <p>
              • Pontos são atribuídos com base na importância do torneio e qualidade dos oponentes
            </p>
            <p>• Mudanças são calculadas semanalmente após eventos importantes</p>
            <p>• Apenas rankings ativos são exibidos na tabela</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default TeamRankingsPage
