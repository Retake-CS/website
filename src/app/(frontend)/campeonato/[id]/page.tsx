'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import CSMatchCard from '../../components/CSMatchCard'

// Interfaces
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
  team1: Team
  team2: Team
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

interface Tournament {
  id: string
  name: string
  stage?: string
  importance?: string
  prizePool?: string
  startDate?: string
  endDate?: string
  location?: string
  organizer?: string
}

export default function CampeonatoPage() {
  const params = useParams()
  const id = params.id as string

  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [matches, setMatches] = useState<CSMatch[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || id.trim() === '') {
      setError('ID do campeonato inválido')
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch tournament
        const tournamentRes = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/tournaments/${id}`,
        )
        if (!tournamentRes.ok) throw new Error('Campeonato não encontrado')
        const tournamentData = await tournamentRes.json()
        setTournament(tournamentData)

        // Fetch matches with depth to get team/tournament data inline
        const matchesRes = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/matches?where[tournament][equals]=${id}&limit=100&depth=1&sort=-date`,
        )
        let matchesData: any = { docs: [] }
        if (matchesRes.ok) {
          matchesData = await matchesRes.json()
          setMatches(matchesData.docs || [])
        }

        // Extract teams from match data (already populated via depth=1)
        if (matchesData.docs && matchesData.docs.length > 0) {
          const teamMap = new Map<string, Team>()
          for (const m of matchesData.docs) {
            if (m.team1?.id && m.team1?.name) {
              teamMap.set(m.team1.id, m.team1)
            }
            if (m.team2?.id && m.team2?.name) {
              teamMap.set(m.team2.id, m.team2)
            }
          }
          setTeams(Array.from(teamMap.values()))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="bg-rcs-bg min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rcs-cta mx-auto"></div>
            <p className="mt-4 text-rcs-sec">Carregando campeonato...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !tournament) {
    return (
      <div className="bg-rcs-bg min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-rcs-sec">
            {error || 'Campeonato não encontrado'}
          </h1>
        </main>
        <Footer />
      </div>
    )
  }

  // Map teams to the interface
  const teamsData: Team[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    logo: team.logo ? { url: team.logo.url } : undefined,
  }))

  // Format dates
  const startDate = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString('pt-BR')
    : ''
  const endDate = tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('pt-BR') : ''
  const dates =
    startDate && endDate
      ? `${startDate} - ${endDate}`
      : startDate || endDate || 'Datas não definidas'

  return (
    <div className="bg-rcs-bg min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
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
          <span className="text-rcs-sec font-medium">Campeonato</span>
        </nav>

        {/* Cabeçalho do Campeonato */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {/* Placeholder logo since collection doesn't have it */}
            <div className="w-16 h-16 bg-rcs-sec rounded-lg flex items-center justify-center">
              <span className="text-rcs-bg font-bold text-xl">{tournament.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-rcs-sec">{tournament.name}</h1>
              <p className="text-rcs-sec">Campeonato de Counter-Strike 2</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-rcs-sec rounded-lg p-4">
              <div className="font-semibold text-rcs-bg">Datas</div>
              <div className="text-rcs-bg/70">{dates}</div>
            </div>
            <div className="bg-rcs-sec rounded-lg p-4">
              <div className="font-semibold text-rcs-bg">Local</div>
              <div className="text-rcs-bg/70">{tournament.location || 'Online'}</div>
            </div>
            <div className="bg-rcs-sec rounded-lg p-4">
              <div className="font-semibold text-rcs-bg">Prêmio</div>
              <div className="text-rcs-bg/70">{tournament.prizePool || 'Não definido'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            {/* Equipes Participantes */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-rcs-sec mb-4">Equipes Participantes</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teamsData.map((team) => (
                  <div key={team.id} className="bg-rcs-sec rounded-lg p-4 text-center">
                    <img
                      src={team.logo?.url || '/placeholder-team.png'}
                      alt={team.name}
                      className="w-12 h-12 mx-auto mb-2 rounded"
                    />
                    <div className="text-sm font-medium text-rcs-bg">{team.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partidas */}
            <div>
              <h2 className="text-xl font-bold text-rcs-sec mb-4">Partidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <CSMatchCard key={match.id} match={match} isLive={match.status === 'live'} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Estatísticas */}
              <div className="bg-rcs-sec rounded-lg p-6 mb-6">
                <h3 className="font-bold text-rcs-bg mb-4">Estatísticas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-rcs-bg/70">Equipes</span>
                    <span className="text-rcs-bg">{teamsData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rcs-bg/70">Partidas</span>
                    <span className="text-rcs-bg">{matches.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rcs-bg/70">Ao Vivo</span>
                    <span className="text-rcs-bg">
                      {matches.filter((m) => m.status === 'live').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Anúncio */}
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
