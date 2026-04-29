'use client'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { CSMatchFilters } from '../components/CSMatchFilters'
import { CSMatchCard } from '../components/CSMatchCard'
import { Pagination } from '../components/Pagination'
import { LiveGames } from '../components/LiveGames'
import { Ranking } from '../components/Ranking'
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
  } | null
  team2: {
    id: string
    name: string
    shortName: string
    logo?: {
      url: string
    }
  } | null
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

interface PayloadTournament {
  id: string
  name: string
  stage?: string
  importance: 'high' | 'medium' | 'low'
  prizePool?: string
  startDate: string
  endDate?: string
  location?: string
  organizer?: string
}

const CSMatches = () => {
  const [matches, setMatches] = useState<PayloadMatch[]>([])
  const [filteredMatches, setFilteredMatches] = useState<PayloadMatch[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTournament, setSelectedTournament] = useState<string>('Todos')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [tournaments, setTournaments] = useState<string[]>(['Todos'])
  const [upcomingTournaments, setUpcomingTournaments] = useState<PayloadTournament[]>([])

  const itemsPerPage = 6

  const getLocalCalendarDate = () => {
    const now = new Date()
    const timezoneOffsetMs = now.getTimezoneOffset() * 60 * 1000
    return new Date(now.getTime() - timezoneOffsetMs).toISOString().split('T')[0]
  }

  const getDateOffsetISO = (baseDate: string, daysOffset: number): string => {
    const d = new Date(baseDate + 'T00:00:00.000Z')
    d.setUTCDate(d.getUTCDate() + daysOffset)
    return d.toISOString()
  }

  const getTournamentName = (match: PayloadMatch) =>
    match.tournament?.name?.trim() || 'Torneio indefinido'

  const normalizeMatch = (match: PayloadMatch): PayloadMatch => ({
    ...match,
    team1: match.team1 ?? {
      id: 'unknown-team-1',
      name: 'Time indefinido',
      shortName: 'TBD',
    },
    team2: match.team2 ?? {
      id: 'unknown-team-2',
      name: 'Time indefinido',
      shortName: 'TBD',
    },
    tournament: match.tournament ?? {
      id: 'unknown-tournament',
      name: 'Torneio indefinido',
    },
  })

  // Buscar dados da API
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setIsLoading(true)
        // Fetch matches for today + next 2 days (upcoming window) and all live matches.
        // Bounded upper date prevents matches 3+ days ahead from flooding the list.
        // Sort: date ascending so today's matches come first, then tomorrow, etc.
        const today = getLocalCalendarDate()
        const upperBound = getDateOffsetISO(today, 2) // today + 2 days
        const response = await fetch(
          `/api/matches?limit=150&sort=date,status&depth=1` +
            `&where[date][greater_than_equal]=${today}T00:00:00.000Z` +
            `&where[date][less_than_equal]=${upperBound}`,
        )
        if (!response.ok) {
          throw new Error('Failed to fetch matches')
        }
        const result = await response.json()

        // Also fetch recent completed matches from before today
        let recentDocs: PayloadMatch[] = []
        try {
          const recentRes = await fetch(
            `/api/matches?limit=50&sort=-date&depth=1&where[date][less_than]=${today}T00:00:00.000Z&where[status][equals]=completed`,
          )
          if (recentRes.ok) {
            const recentResult = await recentRes.json()
            recentDocs = recentResult.docs || []
          }
        } catch {
          /* ignore - today's matches are the priority */
        }

        if (result.docs || recentDocs.length > 0) {
          // Merge today+ matches with recent completed, dedup by id
          const allDocs = [...(result.docs || []), ...recentDocs]
          const seen = new Set<string>()
          const dedupedDocs = allDocs.filter((d: PayloadMatch) => {
            if (seen.has(d.id)) return false
            seen.add(d.id)
            return true
          })
          const normalizedMatches = dedupedDocs.map(normalizeMatch)

          setMatches(normalizedMatches)
          setFilteredMatches(normalizedMatches)

          // Extrair torneios únicos
          const uniqueTournaments = Array.from(
            new Set(
              normalizedMatches
                .map((match: PayloadMatch) => getTournamentName(match))
                .filter((name: any) => typeof name === 'string'),
            ),
          ) as string[]
          setTournaments(['Todos', ...uniqueTournaments])
        }
      } catch (error) {
        console.error('Error fetching matches:', error)
        setMatches([])
        setFilteredMatches([])
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUpcomingTournaments = async () => {
      try {
        const today = getLocalCalendarDate()
        const response = await fetch(
          `/api/tournaments?where[startDate][greater_than_equal]=${today}&limit=10&sort=startDate`,
        )
        if (!response.ok) {
          throw new Error('Failed to fetch tournaments')
        }
        const result = await response.json()

        if (result.docs && result.docs.length > 0) {
          setUpcomingTournaments(result.docs)
        }
      } catch (error) {
        console.error('Error fetching tournaments:', error)
        setUpcomingTournaments([])
      }
    }

    fetchMatches()
    fetchUpcomingTournaments()
  }, [])

  // Função para filtrar partidas
  const filterMatches = (tournament: string, status: string) => {
    setIsLoading(true)

    setTimeout(() => {
      let filtered =
        tournament === 'Todos'
          ? matches
          : matches.filter((match) => getTournamentName(match) === tournament)

      if (status !== 'all') {
        filtered = filtered.filter((match) => match.status === status)
      }

      // Ordenar: live primeiro, depois por data (hoje antes de amanhã), depois upcoming, depois completed
      filtered = filtered.sort((a, b) => {
        const statusOrder = { live: 0, upcoming: 1, completed: 2 }
        const statusDiff = statusOrder[a.status] - statusOrder[b.status]
        if (statusDiff !== 0) return statusDiff
        // Within same status: sort by date ascending (today before tomorrow)
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

      setFilteredMatches(filtered)
      setCurrentPage(1)
      setIsLoading(false)
    }, 300)
  }

  // Efeito para filtrar quando torneio ou status mudam
  useEffect(() => {
    filterMatches(selectedTournament, statusFilter)
  }, [selectedTournament, statusFilter])

  // Separar partidas ao vivo das outras
  const liveMatches = filteredMatches.filter((match) => match.status === 'live')
  const otherMatches = filteredMatches.filter((match) => match.status !== 'live')

  // Calcular partidas da página atual (apenas para não-live)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentMatches = otherMatches.slice(startIndex, startIndex + itemsPerPage)
  const otherTotalPages = Math.ceil(otherMatches.length / itemsPerPage)

  return (
    <div className="bg-rcs-bg min-h-screen">
      <Header />
      <LiveGames />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb limpo */}
        <nav className="flex items-center text-sm text-rcs-sec mb-6" aria-label="Breadcrumb">
          <a href="/" className="hover:text-rcs-cta transition-colors">
            Início
          </a>
          <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-rcs-sec font-medium">Partidas CS2</span>
        </nav>

        {/* Cabeçalho da página */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-rcs-sec mb-4 flex items-center group">
            <span className="w-3 h-3 bg-rcs-cta rounded-full mr-2 group-hover:scale-125 transition-transform duration-300"></span>
            Counter-Strike 2
          </h1>
          <p className="text-rcs-sec-600 text-sm md:text-base max-w-2xl">
            Acompanhe todas as partidas ao vivo, próximas e finalizadas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Área principal de conteúdo */}
          <div className="lg:col-span-3">
            {/* Filtros limpos */}
            <CSMatchFilters
              tournaments={tournaments}
              selectedTournament={selectedTournament}
              onTournamentChange={setSelectedTournament}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              totalMatches={filteredMatches.length}
            />

            {/* TODO: Implementar integração com CSAPI para exibir partidas ao vivo */}
            {/* {liveMatches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-rcs-sec mb-4 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  Partidas ao Vivo
                  <span className="ml-2 text-sm font-normal text-red-400 border border-red-500/30 bg-red-500/10 px-2 py-1 rounded-md">
                    {liveMatches.length}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveMatches.map((match) => (
                    <CSMatchCard key={match.id} match={match} isLive={true} />
                  ))}
                </div>
              </div>
            )} */}

            {/* Outras partidas */}
            {isLoading ? (
              // Loading skeleton limpo (dark)
              <div className="space-y-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-rcs-sec rounded-lg p-6 border border-rcs-sec-400/50 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-4 bg-rcs-sec-700/40 rounded w-20"></div>
                      <div className="h-4 bg-rcs-sec-700/40 rounded w-32"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rcs-sec-700/40 rounded-lg"></div>
                        <div className="h-4 bg-rcs-sec-700/40 rounded w-24"></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-6 bg-rcs-sec-700/40 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-rcs-sec-700/40 rounded w-12"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-4 bg-rcs-sec-700/40 rounded w-24"></div>
                        <div className="w-10 h-10 bg-rcs-sec-700/40 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {otherMatches.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-rcs-sec mb-4">
                      {statusFilter === 'upcoming'
                        ? 'Próximas Partidas'
                        : statusFilter === 'completed'
                          ? 'Partidas Finalizadas'
                          : 'Outras Partidas'}
                    </h2>
                  </div>
                )}

                {currentMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                    {currentMatches.map((match, index) => (
                      <div
                        key={match.id}
                        style={{
                          opacity: 0,
                          transform: 'translateY(16px)',
                          animation: `fadeInUp 0.4s cubic-bezier(.4,0,.2,1) ${index * 100}ms forwards`,
                        }}
                      >
                        <CSMatchCard match={match} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-rcs-sec-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-rcs-sec"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-rcs-sec font-semibold mb-2">Nenhuma partida encontrada</h3>
                    <p className="text-rcs-sec">
                      Tente ajustar os filtros para encontrar mais partidas.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Paginação */}
            {otherTotalPages > 1 && !isLoading && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={otherTotalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* Sidebar limpa */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Ranking */}
              <div className="bg-rcs-sec rounded-lg shadow-sm border border-rcs-sec-400/50 overflow-hidden hover:shadow-md transition-shadow">
                <Ranking />
              </div>

              {/* Anúncio limpo */}
              <div className="bg-rcs-cta rounded-lg p-6 text-center">
                <h3 className="font-bold text-white text-base mb-2">Anuncie Aqui</h3>
                <p className="text-white/90 text-sm mb-4 leading-relaxed">
                  Alcance milhares de fãs de Counter-Strike com sua marca.
                </p>
                <a
                  href="/contato"
                  className="btn btn-outline text-white border-white hover:bg-rcs-cta hover:border-rcs-cta"
                >
                  <span>Fale Conosco</span>
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>

              {/* Próximos Torneios */}
              <div className="bg-rcs-sec rounded-lg border border-rcs-sec-400/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-rcs-bg text-base mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-rcs-bg/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Próximos Torneios
                </h3>
                <div className="space-y-3">
                  {upcomingTournaments.length > 0 ? (
                    upcomingTournaments.slice(0, 3).map((tournament) => (
                      <div
                        key={tournament.id}
                        className="flex justify-between items-center p-3 bg-rcs-sec-500/20 rounded-lg border border-rcs-sec-400/30"
                      >
                        <div>
                          <Link
                            href={`/campeonato/${tournament.id}`}
                            className="text-sm font-medium text-rcs-bg hover:text-rcs-cta transition-colors"
                          >
                            {tournament.name}
                          </Link>
                          <div className="text-xs text-rcs-bg/70">
                            {tournament.startDate
                              ? new Date(tournament.startDate).toLocaleDateString('pt-BR')
                              : 'Data não definida'}
                            {tournament.endDate &&
                              ` - ${new Date(tournament.endDate).toLocaleDateString('pt-BR')}`}
                          </div>
                          {tournament.location && (
                            <div className="text-xs text-rcs-bg/60">{tournament.location}</div>
                          )}
                        </div>
                        <div className="text-xs text-rcs-cta font-bold">
                          {tournament.prizePool || 'TBA'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-rcs-bg/60 text-sm py-4">
                      Nenhum torneio próximo encontrado
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CSMatches
