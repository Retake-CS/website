import { useState } from 'react'
import Link from 'next/link'

interface Team {
  id: string
  name: string
  shortName: string
  logo?: {
    url: string
  }
  score?: number
}

interface CSMatch {
  id: string
  team1: Team | null
  team2: Team | null
  finalScore?: {
    team1: number
    team2: number
  }
  status: 'live' | 'upcoming' | 'completed'
  date: string
  time: string
  tournament: {
    id: string
    name: string
  } | null
  format: string
  maps?: Array<{
    mapName: string
    score?: {
      team1: number
      team2: number
    }
  }>
  streamUrl?: string
}

interface CSMatchCardProps {
  match: CSMatch
  isLive?: boolean
}

// Utility function to generate team initials
const getTeamInitials = (teamName: string): string => {
  if (!teamName.trim()) return 'TBD'
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
const TeamLogo = ({ team, className = '' }: { team: Team; className?: string }) => {
  const [logoError, setLogoError] = useState(false)

  if (!team.logo?.url || logoError) {
    const initials = getTeamInitials(team.name)
    return (
      <div
        className={`w-6 h-6 rounded bg-gradient-to-br from-rcs-cta/30 to-rcs-sec-500/60 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 border border-rcs-sec-400/30 ${className}`}
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
      className={`w-6 h-6 rounded object-contain bg-rcs-sec-500/20 flex-shrink-0 group-hover:scale-110 transition-transform duration-200 ${className}`}
      onError={() => setLogoError(true)}
    />
  )
}

// Tournament logo component with fallback
const TournamentLogo = ({
  tournament,
  tournamentLogo,
  className = '',
}: {
  tournament: string
  tournamentLogo?: string
  className?: string
}) => {
  const [logoError, setLogoError] = useState(false)

  if (!tournamentLogo || logoError) {
    return null // No fallback for tournament logo, just hide it
  }

  return (
    <img
      src={tournamentLogo}
      alt={`${tournament} logo`}
      className={`w-4 h-4 object-contain flex-shrink-0 ${className}`}
      onError={() => setLogoError(true)}
    />
  )
}

export const CSMatchCard = ({ match }: CSMatchCardProps) => {
  const safeTeam1 =
    match.team1 ??
    ({
      id: 'unknown-team-1',
      name: 'Time indefinido',
      shortName: 'TBD',
    } satisfies Team)

  const safeTeam2 =
    match.team2 ??
    ({
      id: 'unknown-team-2',
      name: 'Time indefinido',
      shortName: 'TBD',
    } satisfies Team)

  const safeTournament =
    match.tournament ??
    ({
      id: 'unknown-tournament',
      name: 'Torneio indefinido',
    } satisfies NonNullable<CSMatch['tournament']>)

  const isKnownTournament = safeTournament.id !== 'unknown-tournament'

  const getStatusText = () => {
    switch (match.status) {
      case 'live':
        return 'AO VIVO'
      case 'upcoming':
        return 'PRÓXIMA'
      case 'completed':
        return 'FINALIZADA'
      default:
        return 'AGENDADA'
    }
  }

  // Cores e estilos por status (sinalização clara)
  const getStatusStyles = () => {
    switch (match.status) {
      case 'live':
        return { badge: 'text-red-400 border border-red-500/30 bg-red-500/10' }
      case 'upcoming':
        return { badge: 'text-blue-400 border border-blue-500/30 bg-blue-500/10' }
      case 'completed':
        return { badge: 'text-rcs-sec-400 border border-base-300/40 bg-base-300/20' }
      default:
        return { badge: 'text-rcs-sec-500 border border-base-300/40 bg-base-300/20' }
    }
  }

  const statusStyles = getStatusStyles()

  // Destaque do ganhador/líder
  const isCompleted = match.status === 'completed'
  const isLiveStatus = match.status === 'live'
  const team1Score = match.finalScore?.team1 || 0
  const team2Score = match.finalScore?.team2 || 0
  const isTie = team1Score === team2Score
  const team1Winner = isCompleted && team1Score > team2Score
  const team2Winner = isCompleted && team2Score > team1Score
  const team1Leading = isLiveStatus && team1Score > team2Score
  const team2Leading = isLiveStatus && team2Score > team1Score

  const getTeamNameClass = (side: 'team1' | 'team2') => {
    const base = 'font-semibold text-sm transition-colors duration-300 truncate'
    const isSideWinner = side === 'team1' ? team1Winner : team2Winner
    const isSideLeading = side === 'team1' ? team1Leading : team2Leading

    if (isCompleted) {
      if (isSideWinner) return `${base} text-green-400`
      if (isTie) return `${base} text-rcs-bg`
      return `${base} text-rcs-bg/70`
    }
    if (isLiveStatus) {
      if (isSideLeading) return `${base} text-green-400`
      if (isTie) return `${base} text-rcs-bg`
      return `${base} text-rcs-bg/70`
    }
    // upcoming
    return `${base} text-rcs-bg`
  }

  const cardAriaLabel = `Partida ${safeTeam1.name} versus ${safeTeam2.name}, status ${getStatusText()}, formato ${match.format}${
    match.date
      ? (() => {
          try {
            return (
              ', em ' +
              new Date(match.date).toLocaleDateString('pt-BR') +
              (match.time ? ' às ' + match.time : '')
            )
          } catch {
            return ''
          }
        })()
      : ''
  }`

  return (
    <div
      className={`bg-rcs-sec rounded-lg hover:shadow-md transition-all duration-300 group cursor-pointer border ${
        match.status === 'live' ? 'border-rcs-cta' : 'border-rcs-sec-400/50'
      } shadow-sm hover:opacity-90 overflow-hidden h-full`}
      role="article"
    >
      <Link
        href={`/partida/${match.id}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rcs-cta h-full"
        aria-label={cardAriaLabel}
      >
        {/* Header compacto como no GameCard */}
        <div className="border-b border-base-300/50 text-xs px-3 py-2 flex justify-between bg-base-300/30 transition-colors">
          <div className="flex items-center gap-2">
            <div
              className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles.badge}`}
              aria-live={match.status === 'live' ? 'polite' : 'off'}
            >
              <span className="inline-flex items-center gap-1">
                {match.status === 'live' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
                    aria-hidden="true"
                  ></span>
                )}
                {getStatusText()}
              </span>
            </div>
            <span className="text-xs text-rcs-bg/70 font-medium">{match.format}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <TournamentLogo tournament={safeTournament.name} />
              <span
                className={`text-xs transition-colors truncate max-w-[120px] ${
                  isKnownTournament
                    ? 'text-rcs-bg/80 group-hover:text-rcs-bg group-hover:underline'
                    : 'text-rcs-bg/60'
                }`}
                title={safeTournament.name}
              >
                {safeTournament.name}
              </span>
            </div>
            {match.status === 'live' && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse group-hover:scale-125 transition-transform"></span>
            )}
          </div>
        </div>

        {/* Conteúdo principal compacto */}
        <div className="px-3 py-2.5 text-sm group-hover:px-4 transition-all duration-300">
          {/* Times layout simplificado */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo team={safeTeam1} />
              <div
                className={`${getTeamNameClass('team1')} group-hover:text-rcs-cta group-hover:translate-x-0.5 transform transition-all duration-200 truncate`}
                title={safeTeam1.name}
              >
                {safeTeam1.name}
              </div>
            </div>
            <div className="font-bold ml-2 min-w-[1.5rem] text-center group-hover:scale-110 transition-transform group-hover:text-rcs-cta text-lg">
              {match.finalScore?.team1 || 0}
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo team={safeTeam2} />
              <div
                className={`${getTeamNameClass('team2')} group-hover:text-rcs-cta group-hover:translate-x-0.5 transform transition-all duration-200 truncate`}
                title={safeTeam2.name}
              >
                {safeTeam2.name}
              </div>
            </div>
            <div className="font-bold ml-2 min-w-[1.5rem] text-center group-hover:scale-110 transition-transform group-hover:text-rcs-cta text-lg">
              {match.finalScore?.team2 || 0}
            </div>
          </div>

          {/* Info do mapa minimalista */}
          <div className="text-center mt-2 pt-2 border-t border-rcs-sec-400/30">
            <div className="text-xs text-rcs-bg/80 font-medium">{match.maps?.[0]?.mapName}</div>
            <div className="text-xs text-rcs-bg/60">
              {match.maps?.[0]?.score?.team1} - {match.maps?.[0]?.score?.team2}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default CSMatchCard
