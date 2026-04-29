import { useState, useEffect } from 'react'
import Header from '../components/Header'
import LiveGames from '../components/LiveGames'
import Footer from '../components/Footer'
import Ranking from '../components/Ranking'
import CSMatchCard from '../components/CSMatchCard'
import CSMatchFilters from '../components/CSMatchFilters'
import Pagination from '../components/Pagination'

// Interface para as partidas de CS
interface Team {
  name: string
  logo: string
  score: number
}

interface CSMatch {
  id: string
  team1: Team
  team2: Team
  currentMap: string
  mapScore: string
  roundScore: string
  format: string
  tournament: string
  tournamentLogo?: string
  status: 'live' | 'upcoming' | 'completed'
  startTime?: string
  streamUrl?: string
}

// Dados de exemplo das partidas
const matchesData: CSMatch[] = [
  {
    id: '1',
    team1: {
      name: 'Red Canids',
      logo: 'https://majoresports.net/wp-content/uploads/2023/08/Red-Canids-OW.png',
      score: 16,
    },
    team2: {
      name: 'Complexity',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Team_Complexity_logo.svg/1200px-Team_Complexity_logo.svg.png',
      score: 9,
    },
    currentMap: 'Inferno',
    mapScore: '1-0',
    roundScore: '16-9',
    format: 'BO3',
    tournament: 'ESL Pro League S20',
    tournamentLogo:
      'https://liquipedia.net/commons/images/thumb/9/9c/ESL_Pro_League.png/600px-ESL_Pro_League.png',
    status: 'live',
    startTime: '19:30',
    streamUrl: 'https://twitch.tv/esl_csgo',
  },
  {
    id: '2',
    team1: {
      name: 'FaZe Clan',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FaZe_Clan_logo.svg/1200px-FaZe_Clan_logo.svg.png',
      score: 13,
    },
    team2: {
      name: 'Astralis',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Astralis_logo.svg/1200px-Astralis_logo.svg.png',
      score: 11,
    },
    currentMap: 'Dust2',
    mapScore: '0-0',
    roundScore: '13-11',
    format: 'BO1',
    tournament: 'BLAST Premier',
    tournamentLogo: 'https://liquipedia.net/commons/images/thumb/8/84/BLAST.png/600px-BLAST.png',
    status: 'live',
    startTime: '21:00',
    streamUrl: 'https://twitch.tv/blast',
  },
  {
    id: '3',
    team1: {
      name: 'NAVI',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Natus_Vincere_logo.svg/1200px-Natus_Vincere_logo.svg.png',
      score: 2,
    },
    team2: {
      name: 'G2 Esports',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/G2_Esports_logo.svg/1200px-G2_Esports_logo.svg.png',
      score: 1,
    },
    currentMap: 'Mirage',
    mapScore: '2-1',
    roundScore: '16-14',
    format: 'BO5',
    tournament: 'IEM Katowice',
    tournamentLogo: 'https://liquipedia.net/commons/images/thumb/b/b2/IEM.png/600px-IEM.png',
    status: 'completed',
    startTime: '16:00',
  },
  {
    id: '4',
    team1: {
      name: 'Vitality',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Team_Vitality_logo.svg/1200px-Team_Vitality_logo.svg.png',
      score: 0,
    },
    team2: { name: 'Liquid', logo: '', score: 0 },
    currentMap: 'Overpass',
    mapScore: '0-0',
    roundScore: '0-0',
    format: 'BO3',
    tournament: 'Regional Minor',
    status: 'upcoming',
    startTime: '22:30',
  },
  {
    id: '5',
    team1: { name: 'NIP', logo: '', score: 16 },
    team2: {
      name: 'Heroic',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Heroic_logo.svg/1200px-Heroic_logo.svg.png',
      score: 12,
    },
    currentMap: 'Ancient',
    mapScore: '1-0',
    roundScore: '16-12',
    format: 'BO3',
    tournament: 'BLAST Premier',
    tournamentLogo: 'https://liquipedia.net/commons/images/thumb/8/84/BLAST.png/600px-BLAST.png',
    status: 'completed',
    startTime: '14:00',
  },
  {
    id: '6',
    team1: {
      name: 'Fnatic',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Fnatic_logo.svg/1200px-Fnatic_logo.svg.png',
      score: 0,
    },
    team2: {
      name: 'MOUZ',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/MOUZ_logo.svg/1200px-MOUZ_logo.svg.png',
      score: 0,
    },
    currentMap: 'Vertigo',
    mapScore: '0-0',
    roundScore: '0-0',
    format: 'BO1',
    tournament: 'IEM Katowice',
    status: 'upcoming',
    startTime: '18:00',
  },
]

export const CSMatches = () => {
  const [filteredMatches, setFilteredMatches] = useState<CSMatch[]>(matchesData)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTournament, setSelectedTournament] = useState<string>('Todos')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const itemsPerPage = 6

  // Torneios disponíveis
  const tournaments = [
    'Todos',
    ...Array.from(new Set(matchesData.map((match) => match.tournament))),
  ]

  // Função para filtrar partidas
  const filterMatches = (tournament: string, status: string) => {
    setIsLoading(true)

    setTimeout(() => {
      let filtered =
        tournament === 'Todos'
          ? matchesData
          : matchesData.filter((match) => match.tournament === tournament)

      if (status !== 'all') {
        filtered = filtered.filter((match) => match.status === status)
      }

      // Ordenar: live primeiro, depois upcoming, depois completed
      filtered = filtered.sort((a, b) => {
        const statusOrder = { live: 0, upcoming: 1, completed: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
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

        {/* Cabeçalho compacto */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-rcs-sec mb-1 flex items-center gap-2">
            <div className="w-1 h-6 bg-rcs-cta rounded-full"></div>
            Counter-Strike 2
          </h1>
          <p className="text-rcs-sec text-sm">
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

            {/* Partidas ao vivo */}
            {liveMatches.length > 0 && (
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
            )}

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
                {otherMatches.length > 0 ||
                  (liveMatches.length > 0 && (
                    <div className="mb-4">
                      <h2 className="text-lg font-bold text-rcs-sec mb-4">
                        {statusFilter === 'upcoming'
                          ? 'Próximas Partidas'
                          : statusFilter === 'completed'
                            ? 'Partidas Finalizadas'
                            : 'Outras Partidas'}
                      </h2>
                    </div>
                  ))}

                {currentMatches.length > 0 || liveMatches.length > 0 ? (
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
                  <div className="flex justify-between items-center p-3 bg-rcs-sec-500/20 rounded-lg border border-rcs-sec-400/30">
                    <div>
                      <div className="text-sm font-medium text-rcs-bg">IEM Cologne</div>
                      <div className="text-xs text-rcs-bg/70">24-28 Jul</div>
                    </div>
                    <div className="text-xs text-rcs-cta font-bold">$1M</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-rcs-sec-500/20 rounded-lg border border-rcs-sec-400/30">
                    <div>
                      <div className="text-sm font-medium text-rcs-bg">BLAST Fall Final</div>
                      <div className="text-xs text-rcs-bg/70">15-17 Nov</div>
                    </div>
                    <div className="text-xs text-rcs-cta font-bold">$425K</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CSMatches
