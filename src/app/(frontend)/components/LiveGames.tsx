'use client'
import { useEffect, useState } from 'react'
import GameCardContainer from './GameCardContainer'

export const LiveGames = () => {
  const [games, setGames] = useState<any[]>([])

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch live matches first, fallback to upcoming if none live
        const liveRes = await fetch(
          '/api/matches?where[status][equals]=live&limit=5&sort=-date&depth=1',
        )
        if (!liveRes.ok) throw new Error('Failed to fetch live matches')
        const liveResult = await liveRes.json()

        let docs = liveResult.docs || []

        // If no live matches, fetch upcoming ones
        if (docs.length === 0) {
          const upcomingRes = await fetch(
            '/api/matches?where[status][equals]=upcoming&limit=5&sort=date&depth=1',
          )
          if (upcomingRes.ok) {
            const upcomingResult = await upcomingRes.json()
            docs = upcomingResult.docs || []
          }
        }

        const formattedGames = docs.map((match: any) => ({
          id: match.id,
          team1: match.team1?.name || match.team1Name || 'TBD',
          team2: match.team2?.name || match.team2Name || 'TBD',
          score1: String(match.finalScore?.team1 ?? 0),
          score2: String(match.finalScore?.team2 ?? 0),
          live: match.status === 'live',
          championship: match.tournament?.name || match.tournamentName || 'Torneio',
          time: match.time,
        }))
        setGames(formattedGames)
      } catch (error) {
        console.error('Error fetching games:', error)
        setGames([])
      }
    }

    fetchGames()
  }, [])

  return (
    <section className="container mx-auto px-4 mt-2">
      <h2 className="text-lg font-bold text-rcs-sec mb-2 flex items-center group cursor-pointer">
        <span className="w-2.5 h-2.5 bg-rcs-cta rounded-full mr-2 group-hover:animate-pulse transition-all group-hover:bg-[red]"></span>
        JOGOS DE HOJE
        <span className="ml-2 text-xs font-normal text-rcs-sec-500 group-hover:text-rcs-cta transition-colors">
          Deslize para ver mais
        </span>
      </h2>
      {/* Mostrar todos os jogos em uma única lista scrollável */}
      <GameCardContainer
        games={games}
        title=""
        maxTeamNameLength={14}
        autoScroll={true}
        scrollSpeed={10}
        pauseOnHover={true}
      />
    </section>
  )
}

export default LiveGames
