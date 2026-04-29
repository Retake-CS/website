import { useState, useEffect } from 'react'
import Link from 'next/link'

// Interface para os dados do PayloadCMS
interface PayloadMatch {
  id: string
  team1: {
    id: string
    name: string
    shortName: string
    logo?: {
      url: string
    }
  }
  team2: {
    id: string
    name: string
    shortName: string
    logo?: {
      url: string
    }
  }
  finalScore?: {
    team1: number
    team2: number
  }
  status: 'completed' | 'live' | 'upcoming'
  date: string
  time: string
  tournament: {
    id: string
    name: string
  }
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

interface NextMatchCardProps {
  className?: string
}

export const NextMatchCard = ({ className = '' }: NextMatchCardProps) => {
  const [nextMatch, setNextMatch] = useState<PayloadMatch | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNextMatch = async () => {
      try {
        setIsLoading(true)
        // Single request: fetch live OR upcoming (live first by status order, then by date)
        const response = await fetch(
          '/api/matches?where[status][in]=live,upcoming&limit=1&sort=status,date&depth=1',
        )
        if (!response.ok) throw new Error('Failed to fetch next match')
        const result = await response.json()

        if (result.docs && result.docs.length > 0) {
          const match = result.docs[0]
          // Null-safe normalization
          setNextMatch({
            ...match,
            team1: match.team1 ?? { id: 'tbd', name: 'TBD', shortName: 'TBD' },
            team2: match.team2 ?? { id: 'tbd', name: 'TBD', shortName: 'TBD' },
            tournament: match.tournament ?? { id: 'tbd', name: 'Torneio' },
          })
        } else {
          setNextMatch(null)
        }
      } catch (error) {
        console.error('Error fetching next match:', error)
        setNextMatch(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNextMatch()
  }, [])

  if (isLoading) {
    return (
      <div
        className={`bg-rcs-sec rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative group flex-shrink-0 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-32 bg-rcs-sec-700/50"></div>
          <div className="p-3">
            <div className="h-4 bg-rcs-sec-700/50 rounded mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-8 w-8 bg-rcs-sec-700/50 rounded-full"></div>
              <div className="h-4 w-12 bg-rcs-sec-700/50 rounded"></div>
              <div className="h-8 w-8 bg-rcs-sec-700/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!nextMatch) {
    return (
      <div
        className={`bg-rcs-sec rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative group flex-shrink-0 ${className}`}
      >
        <div className="p-6 text-center">
          <svg
            className="w-12 h-12 text-rcs-sec-400 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-rcs-bg font-medium mb-2">Nenhuma partida próxima</h3>
          <p className="text-rcs-sec-400 text-sm">Aguardando atualização do calendário</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
  }

  const getStatusText = () => {
    switch (nextMatch.status) {
      case 'live':
        return 'AO VIVO'
      case 'upcoming':
        return 'PRÓXIMA'
      default:
        return 'AGENDADA'
    }
  }

  const getStatusColor = () => {
    switch (nextMatch.status) {
      case 'live':
        return 'text-red-400'
      case 'upcoming':
        return 'text-blue-400'
      default:
        return 'text-rcs-sec-400'
    }
  }

  return (
    <div
      className={`bg-rcs-sec rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative group flex-shrink-0 ${className}`}
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-105"></div>

      {/* Header com animação */}
      <div className="relative z-10 p-3 pb-2">
        <div className="flex items-center">
          <div
            className={`w-1.5 h-1.5 rounded-full mr-2 ${nextMatch.status === 'live' ? 'bg-red-400 animate-pulse' : 'bg-rcs-cta'}`}
          ></div>
          <h3 className="font-semibold text-xs sm:text-sm text-rcs-bg">
            {getStatusText()} PARTIDA
          </h3>
        </div>
      </div>

      {/* Informações da partida */}
      <div className="relative z-10 px-3 pb-3">
        {/* Detalhes do evento */}
        <div className="text-center mb-2">
          <Link
            href={`/campeonato/${nextMatch.tournament.id}`}
            className="text-xs inline-block bg-rcs-sec-700/60 text-rcs-bg-200 px-2.5 py-1 rounded-full hover:bg-rcs-sec-600 transition-colors"
          >
            {nextMatch.tournament.name}
          </Link>
        </div>

        {/* Times */}
        <div className="flex items-center justify-between mb-2">
          {/* Time 1 */}
          <div className="flex flex-col items-center space-y-1 w-1/3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rcs-sec-700 to-rcs-sec-800 p-0.5 overflow-hidden transform group-hover:scale-110 transition-all duration-300">
              {nextMatch.team1.logo?.url ? (
                <img
                  src={nextMatch.team1.logo.url}
                  alt={nextMatch.team1.name}
                  className="w-full h-full object-contain rounded-full bg-rcs-bg-900 p-1.5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-rcs-sec-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-rcs-bg">
                    {nextMatch.team1.shortName ||
                      nextMatch.team1.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <span className="font-medium text-rcs-bg-200 text-center text-sm">
              {nextMatch.team1.shortName || nextMatch.team1.name}
            </span>
          </div>

          {/* VS com formato do jogo */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative">
              <span className="text-rcs-cta font-bold text-xl relative z-10">VS</span>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-rcs-cta/10 rounded-full -z-0 group-hover:scale-150 transition-all duration-500 opacity-70"></div>
            </div>
            <span className="text-xs text-rcs-bg-400 mt-2 bg-rcs-sec-700/50 px-2 py-0.5 rounded">
              {nextMatch.format}
            </span>
          </div>

          {/* Time 2 */}
          <div className="flex flex-col items-center space-y-1 w-1/3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rcs-sec-700 to-rcs-sec-800 p-0.5 overflow-hidden transform group-hover:scale-110 transition-all duration-300">
              {nextMatch.team2.logo?.url ? (
                <img
                  src={nextMatch.team2.logo.url}
                  alt={nextMatch.team2.name}
                  className="w-full h-full object-contain rounded-full bg-rcs-bg-900 p-1.5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-rcs-sec-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-rcs-bg">
                    {nextMatch.team2.shortName ||
                      nextMatch.team2.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <span className="font-medium text-rcs-bg-200 text-center text-sm">
              {nextMatch.team2.shortName || nextMatch.team2.name}
            </span>
          </div>
        </div>

        {/* Data e horário */}
        <div className="text-center text-xs">
          <div className="flex items-center justify-center space-x-1 mb-1.5 text-rcs-bg-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-rcs-cta"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {formatDate(nextMatch.date)} - {nextMatch.time}
            </span>
          </div>
        </div>
      </div>

      {/* Botão para ver mais */}
      <Link
        href="/partidas"
        className="w-full mt-3 py-2 text-xs text-center bg-rcs-sec-700/80 hover:bg-rcs-cta text-rcs-bg-300 hover:text-rcs-bg rounded transition-colors flex items-center justify-center group"
      >
        <span className="relative z-10">Ver todas as partidas</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300 relative z-10"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  )
}
