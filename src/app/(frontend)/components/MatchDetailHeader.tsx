import { MatchDetails } from '../types/match'

interface MatchDetailHeaderProps {
  match: MatchDetails
}

export const MatchDetailHeader = ({ match }: MatchDetailHeaderProps) => {
  const status = (() => {
    switch (match.status) {
      case 'live':
        return { text: 'AO VIVO', tone: 'error', aria: 'Partida ao vivo' } as const
      case 'completed':
        return { text: 'FINALIZADA', tone: 'success', aria: 'Partida finalizada' } as const
      default:
        return { text: 'AGENDADA', tone: 'info', aria: 'Partida futura' } as const
    }
  })()

  const team1Leading = (match.finalScore?.team1 ?? 0) > (match.finalScore?.team2 ?? 0)
  const isTie = (match.finalScore?.team1 ?? 0) === (match.finalScore?.team2 ?? 0)

  const dateTimeISO = (() => {
    try {
      return new Date(`${match.date}T${match.time}:00`).toISOString()
    } catch {
      return undefined
    }
  })()

  return (
    <section
      aria-labelledby="titulo-partida-compacta"
      className="rounded-xl border border-base-300/50 bg-base-200 px-4 py-4 shadow-sm"
    >
      {/* Top meta: status + torneio/etapa/BO/data */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={`badge badge-${status.tone} badge-soft w-max`}
          role="status"
          aria-label={status.aria}
        >
          {status.text}
        </span>
        <div className="text-xs text-base-content/60 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate max-w-[200px] sm:max-w-[320px]" title={match.tournament?.name}>
            {match.tournament?.name}
          </span>
          {match.tournament?.stage && (
            <>
              <span aria-hidden>•</span>
              <span>{match.tournament.stage}</span>
            </>
          )}
          {match.format && (
            <>
              <span aria-hidden>•</span>
              <span>{match.format}</span>
            </>
          )}
          {(match.date || match.time) && (
            <>
              <span aria-hidden>•</span>
              <time dateTime={dateTimeISO}>
                {[match.date, match.time].filter(Boolean).join(' ')}
              </time>
            </>
          )}
        </div>
      </div>

      <h1 id="titulo-partida-compacta" className="sr-only">
        {match.team1?.name} versus {match.team2?.name}
      </h1>

      {/* Teams and score */}
      <div className="mt-3 grid grid-cols-3 items-center">
        {/* Team 1 */}
        <div className="flex items-center gap-3 min-w-0">
          {match.team1?.logo && (
            <img
              src={match.team1.logo}
              alt=""
              className="w-8 h-8 rounded bg-base-300/20 object-cover"
            />
          )}
          <div
            className={`truncate font-semibold ${team1Leading && !isTie ? 'text-success' : isTie ? 'text-base-content' : 'text-base-content/60'}`}
            title={match.team1?.name}
          >
            {match.team1?.name}
          </div>
        </div>

        {/* Score */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            <span className={`${team1Leading && !isTie ? 'text-success' : 'text-base-content'}`}>
              {match.finalScore?.team1 ?? 0}
            </span>
            <span className="text-base-content/60">-</span>
            <span className={`${!team1Leading && !isTie ? 'text-success' : 'text-base-content'}`}>
              {match.finalScore?.team2 ?? 0}
            </span>
          </div>
          {match.status === 'live' && (
            <div className="mt-1 text-xs text-error/80" aria-live="polite">
              Rodada em andamento
            </div>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex items-center gap-3 justify-end min-w-0">
          <div
            className={`truncate text-right font-semibold ${!team1Leading && !isTie ? 'text-success' : isTie ? 'text-base-content' : 'text-base-content/60'}`}
            title={match.team2?.name}
          >
            {match.team2?.name}
          </div>
          {match.team2?.logo && (
            <img
              src={match.team2.logo}
              alt=""
              className="w-8 h-8 rounded bg-base-300/20 object-cover"
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default MatchDetailHeader
