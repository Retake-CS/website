'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

// Interface para os dados do PayloadCMS
interface PayloadTeam {
  id: string
  name: string
  shortName: string
  logo?: {
    url: string
  }
  country: string
  ranking?: number
  founded?: string
  region?: string
  coach?: string
  players?: Array<{
    id: string
    name: string
    nickname: string
    role?: string
    country?: string
    age?: number
    joinDate?: string
  }>
  stats?: {
    matchesPlayed?: number
    wins?: number
    losses?: number
    winRate?: number
    averageRating?: number
    mapsPlayed?: number
    roundsWon?: number
    roundsLost?: number
  }
  achievements?: Array<{
    title: string
    date: string
    importance: 'major' | 'premier' | 'regional'
  }>
  socialMedia?: {
    twitter?: string
    instagram?: string
    website?: string
  }
  recentMatches?: Array<{
    result: 'W' | 'L'
    opponent: {
      name: string
      logo?: {
        url: string
      }
    }
    score: string
    date: string
    tournament: string
    maps?: string[]
  }>
}

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
const TeamLogo = ({
  team,
  size = 'md',
  className = '',
}: {
  team: PayloadTeam
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => {
  const [logoError, setLogoError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  if (!team.logo?.url || logoError) {
    const initials = getTeamInitials(team.name)
    return (
      <div
        className={`${sizeClasses[size]} rounded bg-gradient-to-br from-rcs-cta/30 to-rcs-sec-500/60 flex items-center justify-center flex-shrink-0 border border-rcs-sec-400/30 ${className}`}
      >
        <span
          className={`${size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs'} font-bold text-rcs-bg/90`}
          title={team.name}
        >
          {initials}
        </span>
      </div>
    )
  }

  return (
    <img
      src={team.logo.url}
      alt={`${team.name} logo`}
      className={`${sizeClasses[size]} rounded object-contain bg-rcs-sec-500/20 flex-shrink-0 ${className}`}
      onError={() => setLogoError(true)}
    />
  )
}

// Player role badge
const RoleBadge = ({ role }: { role: string }) => {
  const roleColors: Record<string, string> = {
    IGL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    AWPer: 'bg-red-500/20 text-red-400 border-red-500/30',
    'Entry Fragger': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Support: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Lurker: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${roleColors[role] || 'bg-rcs-sec-500/20 text-rcs-bg/60 border-rcs-sec-400/30'}`}
    >
      {role}
    </span>
  )
}

const TeamDetailPage = () => {
  const params = useParams()
  const teamId = params.teamId as string

  const [team, setTeam] = useState<PayloadTeam | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'matches'>('overview')

  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/teams/${encodeURIComponent(teamId)}?depth=1`)
        if (!response.ok) {
          throw new Error('Failed to fetch team')
        }
        const result = await response.json()

        if (result && result.id) {
          setTeam(result)
        }
      } catch (error) {
        console.error('Error fetching team:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeam()
  }, [teamId])

  if (isLoading) {
    return (
      <div className="bg-rcs-bg min-h-screen">
        <Header />
        <main className="container mx-auto max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-rcs-sec rounded-lg" />
            <div className="h-40 bg-rcs-sec rounded-lg" />
            <div className="h-60 bg-rcs-sec rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="bg-rcs-bg min-h-screen">
        <Header />
        <main className="container mx-auto max-w-6xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white mb-4">Time não encontrado</h1>
            <a
              href="/rankings"
              className="btn btn-outline border-rcs-cta text-rcs-cta hover:bg-rcs-cta hover:text-white"
            >
              Ver Rankings
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-rcs-bg min-h-screen">
      <Header />

      <main className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-rcs-bg/70 flex items-center gap-2">
          <a href="/" className="hover:text-rcs-cta transition-colors">
            Início
          </a>
          <span>›</span>
          <a href="/rankings" className="hover:text-rcs-cta transition-colors">
            Rankings
          </a>
          <span>›</span>
          <span className="">{team.name}</span>
        </nav>
        {/* Header do time */}
        <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">
          <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
            <h3 className="text-sm font-semibold text-base-content truncate">
              Informações do Time
            </h3>
            <span className="text-[11px] text-base-content/60">#{team.ranking || 'N/A'}</span>
          </div>
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <TeamLogo team={team} size="lg" />

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-base-content mb-1">{team.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-base-content/70">
                      <span>#{team.ranking || 'N/A'} no ranking mundial</span>
                      <span>•</span>
                      <span>{team.country}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {team.socialMedia?.twitter && (
                      <a
                        href={`https://twitter.com/${team.socialMedia.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline border-rcs-cta text-rcs-cta hover:bg-rcs-cta hover:text-white"
                      >
                        Twitter
                      </a>
                    )}
                    {team.socialMedia?.website && (
                      <a
                        href={team.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm bg-rcs-cta text-white hover:bg-rcs-cta/80"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-base-content/60 text-xs">Fundado</div>
                    <div className="text-base-content font-medium">
                      {team.founded ? new Date(team.founded).getFullYear() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-base-content/60 text-xs">Região</div>
                    <div className="text-base-content font-medium">{team.region || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-base-content/60 text-xs">Coach</div>
                    <div className="text-base-content font-medium">{team.coach || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-base-content/60 text-xs">Win Rate</div>
                    <div className="text-green-400 font-medium">
                      {team.stats?.winRate ? `${team.stats.winRate}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-rcs-sec-400/30">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'players', label: 'Jogadores' },
              { id: 'matches', label: 'Partidas' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-rcs-cta text-rcs-cta'
                    : 'border-transparent text-rcs-sec hover:text-rcs-cta hover:border-rcs-bg/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Conteúdo das tabs */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estatísticas */}
            <div className="lg:col-span-2 space-y-6">
              {' '}
              <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">
                <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
                  <h3 className="text-sm font-semibold text-base-content truncate">
                    Estatísticas da Temporada
                  </h3>
                  <span className="text-[11px] text-base-content/60">2024</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-base-content">
                        {team.stats?.matchesPlayed || 0}
                      </div>
                      <div className="text-xs text-base-content/60">Partidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">
                        {team.stats?.wins || 0}
                      </div>
                      <div className="text-xs text-base-content/60">Vitórias</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-400">
                        {team.stats?.losses || 0}
                      </div>
                      <div className="text-xs text-base-content/60">Derrotas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-rcs-cta">
                        {team.stats?.averageRating || 0}
                      </div>
                      <div className="text-xs text-base-content/60">Rating Médio</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Conquistas */}
              <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">
                <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
                  <h3 className="text-sm font-semibold text-base-content truncate">
                    Principais Conquistas
                  </h3>
                  <span className="text-[11px] text-base-content/60">
                    {(team.achievements || []).length}
                  </span>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {(team.achievements || []).map((achievement, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded bg-base-300/30"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            achievement.importance === 'major'
                              ? 'bg-yellow-400'
                              : achievement.importance === 'premier'
                                ? 'bg-rcs-cta'
                                : 'bg-blue-400'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-base-content">
                            {achievement.title}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {new Date(achievement.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>{' '}
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Partidas recentes resumo */}
              <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">
                <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
                  <h3 className="text-sm font-semibold text-base-content truncate">
                    Últimas 5 Partidas
                  </h3>
                  <span className="text-[11px] text-base-content/60">Recente</span>
                </div>
                <div className="p-4">
                  <div className="flex gap-1 mb-3">
                    {(team.recentMatches || []).slice(0, 5).map((match, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                          match.result === 'W'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                        title={`${match.result === 'W' ? 'Vitória' : 'Derrota'} vs ${match.opponent.name} (${match.score})`}
                      >
                        {match.result}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {team.stats?.wins || 0}V - {team.stats?.losses || 0}D nos últimos 30 dias
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}{' '}
        {activeTab === 'players' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(team.players || []).map((player, index) => (
              <div
                key={index}
                className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm"
              >
                <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
                  <h3 className="text-sm font-semibold text-base-content truncate">
                    {player.nickname}
                  </h3>
                  <span className="text-[11px] text-base-content/60">{player.role}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rcs-cta/30 to-rcs-sec-500/60 flex items-center justify-center border border-rcs-sec-400/30">
                      <span className="text-sm font-bold text-rcs-bg/90">
                        {player.nickname.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base-content truncate">
                        {player.nickname}
                      </div>
                      <div className="text-xs text-base-content/60 truncate">{player.name}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <RoleBadge role={player.role || 'Unknown'} />
                    <div className="text-xs text-base-content/70 space-y-1">
                      <div>Idade: {player.age || 'N/A'} anos</div>
                      <div>País: {player.country || 'N/A'}</div>
                      <div>
                        No time desde:{' '}
                        {player.joinDate
                          ? new Date(player.joinDate).toLocaleDateString('pt-BR')
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}{' '}
        {activeTab === 'matches' && (
          <div className="space-y-4">
            {(team.recentMatches || []).map((match, index) => (
              <div
                key={index}
                className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm"
              >
                <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
                  <h3 className="text-sm font-semibold text-base-content truncate">
                    vs {match.opponent.name}
                  </h3>
                  <span className="text-[11px] text-base-content/60">
                    {match.date
                      ? (() => {
                          try {
                            return new Date(match.date).toLocaleDateString('pt-BR')
                          } catch {
                            return 'Data inválida'
                          }
                        })()
                      : 'Data não disponível'}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold ${
                          match.result === 'W'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {match.result}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-rcs-cta/30 to-rcs-sec-500/60 flex items-center justify-center border border-rcs-sec-400/30">
                          <span className="text-xs font-bold text-rcs-bg/90">
                            {match.opponent.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-base-content">
                            vs {match.opponent.name}
                          </div>
                          <div className="text-xs text-base-content/60">{match.tournament}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-base-content">{match.score}</div>
                        <div className="text-xs text-base-content/60">
                          {new Date(match.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {match.maps && match.maps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-base-300/30">
                      <div className="text-xs text-base-content/60 mb-1">Mapas:</div>
                      <div className="flex flex-wrap gap-1">
                        {match.maps.map((map, mapIndex) => (
                          <span
                            key={mapIndex}
                            className="px-2 py-1 bg-base-300/30 rounded text-xs text-base-content/80"
                          >
                            {map}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default TeamDetailPage
