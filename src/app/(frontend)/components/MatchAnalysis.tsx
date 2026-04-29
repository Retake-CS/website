import { MatchDetails } from "../types/match";

interface MatchAnalysisProps {
  match: MatchDetails;
}

export const MatchAnalysis = ({ match }: MatchAnalysisProps) => {
  return (
    <div className="space-y-6">
      {/* Contexto da Partida */}
      <section aria-labelledby="ctx-title" className="rounded-xl border border-base-300/50 bg-rcs-bg-50 p-4">
        <h2 id="ctx-title" className="text-sm font-bold text-rcs-sec tracking-wide mb-2">CONTEXTO DO CONFRONTO</h2>
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-base-300/50 bg-rcs-bg-50">
            <h3 className="text-xs font-semibold text-rcs-sec mb-1">Importância da Partida</h3>
            <p className="text-sm text-rcs-sec-700 leading-relaxed">{match.matchContext.importance}</p>
          </div>
          <div className="p-3 rounded-lg border border-base-300/50 bg-rcs-bg-50">
            <h3 className="text-xs font-semibold text-rcs-sec mb-1">Em Jogo</h3>
            <p className="text-sm text-rcs-sec-700 leading-relaxed">{match.matchContext.stakes}</p>
          </div>
          {match.matchContext.rivalry && (
            <div className="p-3 rounded-lg border border-base-300/50 bg-rcs-bg-50">
              <h3 className="text-xs font-semibold text-rcs-sec mb-1">Rivalidade</h3>
              <p className="text-sm text-rcs-sec-700 leading-relaxed">{match.matchContext.rivalry}</p>
            </div>
          )}
          {match.matchContext.previousMeetings && (
            <div className="p-3 rounded-lg border border-base-300/50 bg-rcs-bg-50">
              <h3 className="text-xs font-semibold text-rcs-sec mb-1">Histórico de Confrontos</h3>
              <p className="text-sm text-rcs-sec-700 leading-relaxed">{match.matchContext.previousMeetings}</p>
            </div>
          )}
        </div>
      </section>

      {/* Momentos Decisivos */}
      {match.keyMoments.length > 0 && (
        <section aria-labelledby="moments-title" className="rounded-xl border border-base-300/50 bg-rcs-bg-50 p-4">
          <h2 id="moments-title" className="text-sm font-bold text-rcs-sec tracking-wide mb-2">MOMENTOS DECISIVOS</h2>
          <div className="space-y-3">
            {match.keyMoments.map((moment, index) => (
              <div key={index} className="p-3 rounded-lg border border-base-300/50 bg-rcs-bg-50">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`badge badge-soft ${
                      moment.impact === 'high' ? 'badge-error' :
                      moment.impact === 'medium' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {moment.impact === 'high' ? 'CRÍTICO' : 
                       moment.impact === 'medium' ? 'IMPORTANTE' : 'RELEVANTE'}
                    </span>
                    <span className="text-rcs-sec-600">Round {moment.round} • {moment.map}</span>
                  </div>
                </div>
                <p className="text-sm text-rcs-sec-700 leading-relaxed">{moment.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MVP da Partida */}
      {match.mvp.playerId && (
        <section aria-labelledby="mvp-title" className="rounded-xl border border-base-300/50 bg-rcs-bg-50 p-4">
          <h2 id="mvp-title" className="text-sm font-bold text-rcs-sec tracking-wide mb-2">MVP DA PARTIDA</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-rcs-cta/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-rcs-cta" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-rcs-cta truncate">{match.mvp.playerName}</h3>
              <p className="text-xs text-rcs-sec-600">{match.mvp.team}</p>
              <p className="text-sm text-rcs-sec-700 mt-1">{match.mvp.reason}</p>
            </div>
          </div>
        </section>
      )}

      {/* Links para VODs e Stream */}
      {(match.streamUrl || (match.vods && match.vods.length > 0)) && (
        <section aria-labelledby="watch-title" className="rounded-xl border border-base-300/50 bg-rcs-bg-50 p-4">
          <h2 id="watch-title" className="text-sm font-bold text-rcs-sec tracking-wide mb-2">ASSISTIR PARTIDA</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {match.streamUrl && (
              <a 
                href={match.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline border-rcs-cta text-rcs-cta hover:bg-rcs-cta hover:text-white"
              >
                Stream ao vivo
              </a>
            )}
            {match.vods && match.vods.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-rcs-sec">VODs</h3>
                <div className="flex flex-wrap gap-2">
                  {match.vods.map((vod, index) => (
                    <a 
                      key={index}
                      href={vod}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-rcs-cta text-white hover:bg-rcs-cta-600"
                    >
                      VOD #{index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default MatchAnalysis;
