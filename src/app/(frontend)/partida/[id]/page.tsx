'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { MatchDetails } from '../../types/match'

const MapGrid = dynamic(() => import('../../components/MapGrid'), {
  loading: () => <div className="h-40 rounded-lg bg-rcs-sec animate-pulse" />,
})

const Scoreboard = dynamic(() => import('../../components/Scoreboard'), {
  loading: () => <div className="h-56 rounded-lg bg-rcs-sec animate-pulse" />,
})

// Interfaces para integração com PayloadCMS
interface PayloadTeam {
  id: string
  name: string
  shortName: string
  logo?: {
    url: string
  }
  country: string
  ranking?: number
}

interface PayloadTournament {
  id: string
  name: string
  stage?: string
  importance: 'high' | 'medium' | 'low'
  prizePool?: string
}

interface PayloadPlayer {
  id: string
  name: string
  nickname: string
  avatar?: {
    url: string
  }
  country?: string
}

interface PayloadMapResult {
  mapName: string
  team1Score: number
  team2Score: number
  team1StartSide?: 'CT' | 'TR'
  team2StartSide?: 'CT' | 'TR'
  duration?: string
  overtime?: boolean
  overtimeRounds?: number
  winner?: 'team1' | 'team2'
  highlights?: Array<{
    description: string
  }>
}

interface PayloadPlayerStats {
  player: PayloadPlayer
  kills?: number
  deaths?: number
  assists?: number
  kd?: number
  adr?: number
  rating?: number
  headshotPercentage?: number
  clutches?: number
  mvpRounds?: number
}

interface PayloadMatch {
  id: string
  team1: PayloadTeam
  team2: PayloadTeam
  finalScore?: {
    team1: number
    team2: number
  }
  prediction?: {
    team1Score?: number
    team2Score?: number
    confidence?: number
  }
  status: 'completed' | 'live' | 'upcoming'
  date: string
  time: string
  tournament: PayloadTournament
  format: string
  maps?: PayloadMapResult[]
  playerStats?: PayloadPlayerStats[]
  matchContext?: {
    importance?: string
    stakes?: string
    rivalry?: string
    previousMeetings?: string
  }
  keyMoments?: Array<{
    round?: number
    map?: string
    description?: string
    impact?: 'high' | 'medium' | 'low'
  }>
  mvp?: {
    player?: PayloadPlayer
    reason?: string
  }
  streamUrl?: string
  vods?: Array<{
    url: string
  }>
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

// Team logo component with fallback - aceita tanto PayloadTeam quanto Team convertido
const TeamLogo = ({
  team,
  className = '',
}: {
  team: PayloadTeam | { name: string; logo?: string }
  className?: string
}) => {
  const [logoError, setLogoError] = useState(false)

  const initials = getTeamInitials(team.name)

  // Verificar se é PayloadTeam (tem logo.url) ou Team convertido (tem logo como string)
  let logoUrl: string | undefined

  if (team.logo) {
    if (typeof team.logo === 'string') {
      logoUrl = team.logo
    } else if ('url' in team.logo) {
      logoUrl = team.logo.url
    }
  }

  if (!logoUrl || logoError) {
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
      src={logoUrl}
      alt={`${team.name} logo`}
      className={`w-8 h-8 rounded object-contain bg-rcs-sec-500/20 flex-shrink-0 ${className}`}
      onError={() => setLogoError(true)}
    />
  )
}

// Converter dados do Payload para o formato da interface MatchDetails
const convertPayloadToMatchDetails = (payloadMatch: PayloadMatch): MatchDetails => {
  try {
    const safeTeam1 = payloadMatch.team1 ?? {
      id: 'unknown-team-1',
      name: 'Time indefinido',
      shortName: 'TBD',
      country: '',
    }
    const safeTeam2 = payloadMatch.team2 ?? {
      id: 'unknown-team-2',
      name: 'Time indefinido',
      shortName: 'TBD',
      country: '',
    }
    const safeTournament = payloadMatch.tournament ?? {
      id: 'unknown-tournament',
      name: 'Torneio indefinido',
      importance: 'medium' as const,
    }

    return {
      id: payloadMatch.id,
      team1: {
        id: safeTeam1.id,
        name: safeTeam1.name,
        shortName: safeTeam1.shortName,
        logo: safeTeam1.logo?.url || '',
        country: safeTeam1.country,
        ranking: safeTeam1.ranking,
        players: [], // Simplificado por enquanto
      },
      team2: {
        id: safeTeam2.id,
        name: safeTeam2.name,
        shortName: safeTeam2.shortName,
        logo: safeTeam2.logo?.url || '',
        country: safeTeam2.country,
        ranking: safeTeam2.ranking,
        players: [], // Simplificado por enquanto
      },
      finalScore: payloadMatch.finalScore || { team1: 0, team2: 0 },
      prediction: payloadMatch.prediction
        ? {
            team1Score: payloadMatch.prediction.team1Score || 0,
            team2Score: payloadMatch.prediction.team2Score || 0,
            confidence: payloadMatch.prediction.confidence || 0,
          }
        : undefined,
      status: payloadMatch.status,
      date: payloadMatch.date,
      time: payloadMatch.time,
      tournament: {
        name: safeTournament.name,
        stage: safeTournament.stage || '',
        importance: safeTournament.importance,
        prizePool: safeTournament.prizePool,
      },
      format: payloadMatch.format,
      maps:
        payloadMatch.maps?.map((map) => ({
          mapName: map.mapName,
          team1Score: map.team1Score,
          team2Score: map.team2Score,
          team1StartSide: map.team1StartSide || 'CT',
          team2StartSide: map.team2StartSide || 'TR',
          duration: map.duration || '00:00',
          overtime: map.overtime || false,
          overtimeRounds: map.overtimeRounds || 0,
          winner: map.winner || 'team1',
          highlights: map.highlights?.map((h) => h.description) || [],
        })) || [],
      playerStats: [], // Simplificado por enquanto
      matchContext: {
        importance: payloadMatch.matchContext?.importance || '',
        stakes: payloadMatch.matchContext?.stakes || '',
        rivalry: payloadMatch.matchContext?.rivalry || '',
        previousMeetings: payloadMatch.matchContext?.previousMeetings || '',
      },
      keyMoments: [], // Simplificado por enquanto
      mvp: payloadMatch.mvp?.player
        ? {
            playerId: payloadMatch.mvp.player.id,
            playerName: payloadMatch.mvp.player.name,
            team: safeTeam1.name,
            reason: payloadMatch.mvp.reason || '',
          }
        : {
            playerId: '',
            playerName: '',
            team: '',
            reason: '',
          },
      streamUrl: payloadMatch.streamUrl,
      vods: payloadMatch.vods?.map((vod) => vod.url) || [],
    }
  } catch (error) {
    console.error('Error converting match data:', error)
    throw error
  }
}

interface MatchDetailV2Props {
  id?: string
}

// Página de partida enxuta inspirada em layouts compactos: foco em times, placar, status, mapas e assistir.
const MatchDetailV2 = ({ id }: MatchDetailV2Props) => {
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMap, setSelectedMap] = useState<string>('__all') // "__all" para geral, nome do mapa para específico

  useEffect(() => {
    const fetchMatch = async () => {
      // Verificar se o ID é válido
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.warn('Invalid match ID:', id)
        setIsLoading(false)
        setMatch(null)
        return
      }

      try {
        setIsLoading(true)
        console.log('Fetching match with ID:', id)

        // Single fetch with depth for resolved relationships
        const baseUrl = `/api/matches/${encodeURIComponent(id)}?depth=2`
        console.log('Fetching match:', baseUrl)

        const response = await fetch(baseUrl)
        console.log('API Response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error response:', errorText)
          throw new Error(`Failed to fetch match: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()
        console.log('API Response data keys:', Object.keys(result))
        console.log('Full API Response:', result)

        if (result && result.id) {
          // Converter dados do Payload para o formato esperado
          const convertedMatch = convertPayloadToMatchDetails(result)
          console.log('Converted match successfully')
          setMatch(convertedMatch)
        } else {
          console.warn('Match not found in response')
          setMatch(null)
        }
      } catch (error) {
        console.error('Error fetching match:', error)
        setMatch(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Pequeno delay para evitar múltiplas requisições rápidas
    const timeoutId = setTimeout(fetchMatch, 100)

    return () => clearTimeout(timeoutId)
  }, [id]) // Dependência apenas no id

  const statusLabel = (m: MatchDetails) => {
    if (m.status === 'live')
      return {
        text: 'AO VIVO',
        class: 'text-red-400 border border-red-500/30 bg-red-500/10',
        aria: 'Partida ao vivo',
      }
    if (m.status === 'completed')
      return {
        text: 'FINALIZADA',
        class: 'text-green-400 border border-green-500/30 bg-green-500/10',
        aria: 'Partida finalizada',
      }
    return {
      text: 'EM BREVE',
      class: 'text-blue-400 border border-blue-500/30 bg-blue-500/10',
      aria: 'Partida futura',
    }
  }

  if (isLoading) {
    return (
      <div className="bg-rcs-bg min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto max-w-5xl px-4 py-8" aria-busy="true">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-rcs-sec rounded w-40" />
            <div className="h-24 bg-rcs-sec rounded" />
            <div className="h-40 bg-rcs-sec rounded" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="bg-rcs-bg min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto max-w-5xl px-4 py-12">
          <div className="text-center">
            <h1 className="text-lg font-semibold text-white mb-2">Partida não encontrada</h1>
            <p className="text-rcs-sec-400 mb-4">
              A partida solicitada não foi encontrada ou ocorreu um erro ao carregar.
            </p>
            <a
              href="/partidas"
              className="btn btn-outline border-rcs-cta text-rcs-cta hover:bg-rcs-cta hover:text-white"
            >
              Ver todas as partidas
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const status = statusLabel(match)
  const team1Leading = (match.finalScore?.team1 ?? 0) > (match.finalScore?.team2 ?? 0)
  const isTie = (match.finalScore?.team1 ?? 0) === (match.finalScore?.team2 ?? 0)

  return (
    <div className="bg-rcs-bg min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn btn-sm"
      >
        Pular para conteúdo
      </a>
      <Header />

      <main id="conteudo" className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        {' '}
        {/* Breadcrumb compacto */}
        <nav aria-label="Breadcrumb" className="text-xs text-rcs-sec flex items-center gap-2">
          <a href="/" className="hover:text-rcs-cta hover:underline transition-colors">
            Início
          </a>
          <span aria-hidden>›</span>
          <a href="/partidas" className="hover:text-rcs-cta hover:underline transition-colors">
            Partidas
          </a>
          <span aria-hidden>›</span>
          <span className="">
            {match.team1.shortName} vs {match.team2.shortName}
          </span>
        </nav>
        {/* Header compacto da partida */}
        <section
          aria-labelledby="titulo-partida"
          className="rounded-lg border border-rcs-sec-400/50 bg-rcs-sec px-4 py-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${status.class}`}
              role="status"
              aria-label={status.aria}
            >
              <span className="inline-flex items-center gap-1">
                {match.status === 'live' && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"
                    aria-hidden="true"
                  ></span>
                )}
                {status.text}
              </span>
            </span>
            <div className="text-xs text-rcs-bg/80 flex items-center gap-2">
              <span className="truncate max-w-[160px]" title={match.tournament?.name}>
                {match.tournament?.name}
              </span>
              {match.tournament?.stage && (
                <>
                  <span className="opacity-50">•</span>
                  <span>{match.tournament.stage}</span>
                </>
              )}
              <span className="opacity-50">•</span>
              <span>{match.format ?? 'BO3'}</span>
              {(match.date || match.time) && (
                <>
                  <span className="opacity-50">•</span>
                  <time
                    dateTime={(() => {
                      try {
                        const dateStr = `${match.date || ''} ${match.time || ''}`.trim()
                        return dateStr ? new Date(dateStr).toISOString() : undefined
                      } catch {
                        return undefined
                      }
                    })()}
                  >
                    {`${match.date || ''} ${match.time || ''}`.trim() || 'Data não disponível'}
                  </time>
                </>
              )}
            </div>
          </div>
          <h1 id="titulo-partida" className="sr-only">
            {match.team1.name} versus {match.team2.name}
          </h1>{' '}
          <div className="mt-3 grid grid-cols-3 items-center">
            {/* Time A */}
            <div className="flex items-center gap-3 min-w-0">
              <TeamLogo team={match.team1} />
              <div
                className={`truncate font-semibold ${team1Leading && !isTie ? 'text-green-400' : isTie ? 'text-rcs-bg' : 'text-rcs-bg/70'}`}
                title={match.team1.name}
              >
                {match.team1.name}
              </div>
            </div>{' '}
            {/* Placar */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                <span className={`${team1Leading && !isTie ? 'text-green-400' : 'text-rcs-bg'}`}>
                  {match.finalScore?.team1 ?? 0}
                </span>
                <span className="text-rcs-bg/60">-</span>
                <span className={`${!team1Leading && !isTie ? 'text-green-400' : 'text-rcs-bg'}`}>
                  {match.finalScore?.team2 ?? 0}
                </span>
              </div>
              {match.status === 'live' && (
                <div className="mt-1 text-xs text-red-400/80" aria-live="polite">
                  Rodada em andamento
                </div>
              )}
              {/* Predict Section */}
              {match.prediction && (
                <div className="mt-2 text-xs text-rcs-bg/50">
                  <div className="flex items-center justify-center gap-1">
                    <span>Predict:</span>
                    <span className="text-rcs-bg/60 font-medium">
                      {match.prediction.team1Score}
                    </span>
                    <span className="text-rcs-bg/40">-</span>
                    <span className="text-rcs-bg/60 font-medium">
                      {match.prediction.team2Score}
                    </span>
                    <span className="text-rcs-bg/40 ml-1">({match.prediction.confidence}%)</span>
                  </div>
                </div>
              )}
            </div>
            {/* Time B */}
            <div className="flex items-center gap-3 justify-end min-w-0">
              <div
                className={`truncate text-right font-semibold ${!team1Leading && !isTie ? 'text-green-400' : isTie ? 'text-rcs-bg' : 'text-rcs-bg/70'}`}
                title={match.team2.name}
              >
                {match.team2.name}
              </div>
              <TeamLogo team={match.team2} />
            </div>
          </div>
          {/* Ações essenciais */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {match.streamUrl && (
              <a
                href={match.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline border-rcs-cta text-rcs-cta hover:bg-rcs-cta hover:text-white"
              >
                Assistir
              </a>
            )}
            {match.vods && match.vods[0] && (
              <a
                href={match.vods[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-rcs-cta text-white border-rcs-cta hover:bg-rcs-cta-600"
              >
                Primeiro VOD
              </a>
            )}
          </div>
        </section>{' '}
        {/* Conteúdo principal enxuto */}
        <section className="space-y-6">
          {/* Grid de mapas com background */}
          {match.maps && match.maps.length > 0 ? (
            <MapGrid
              maps={match.maps}
              team1Name={match.team1.name}
              team2Name={match.team2.name}
              team1Short={match.team1.shortName}
              team2Short={match.team2.shortName}
              team1Logo={match.team1.logo}
              team2Logo={match.team2.logo}
              onMapSelect={(mapName) => {
                setSelectedMap(mapName)
                // Scroll suave para o scoreboard quando um mapa for selecionado
                setTimeout(() => {
                  const scoreboardElement = document.querySelector('[data-scoreboard]')
                  if (scoreboardElement) {
                    scoreboardElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }, 100)
              }}
              selectedMap={selectedMap === '__all' ? undefined : selectedMap}
            />
          ) : (
            <div className="rounded-lg border border-rcs-sec-400/50 bg-rcs-sec p-4 text-center">
              <p className="text-rcs-bg/80">Informações dos mapas não disponíveis</p>
            </div>
          )}

          {/* Scoreboard com filtro por mapa ou geral */}
          <div data-scoreboard>
            <Scoreboard match={match} />
          </div>
          {/* Contexto enxuto */}
          {(match.matchContext?.importance || match.matchContext?.stakes) && (
            <div className="rounded-lg border border-rcs-sec-400/50 bg-rcs-sec p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm">
              <div className="md:col-span-2">
                <h3 className="text-sm font-bold text-white mb-1">Contexto</h3>
                {match.matchContext?.importance && (
                  <p className="text-sm text-rcs-bg/80">{match.matchContext.importance}</p>
                )}
                {match.matchContext?.stakes && (
                  <p className="text-sm text-rcs-cta font-medium mt-1">
                    {match.matchContext.stakes}
                  </p>
                )}
              </div>
              <div className="flex md:justify-end items-start gap-2">
                <button
                  className="btn btn-sm btn-outline border-rcs-cta text-rcs-cta hover:bg-rcs-cta hover:text-white transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Topo
                </button>
              </div>
            </div>
          )}
        </section>{' '}
        {/* Secção final minimal: mais itens do torneio */}
        <section aria-labelledby="mais" className="pt-2">
          <h2 id="mais" className="text-xs font-bold text-rcs-sec tracking-wider">
            OUTRAS PARTIDAS
          </h2>
          <div className="mt-2 rounded-lg border border-rcs-sec-400/50 bg-rcs-sec p-4 text-sm text-rcs-bg/80 shadow-sm">
            Em breve
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params)
  return <MatchDetailV2 id={resolvedParams.id} />
}
