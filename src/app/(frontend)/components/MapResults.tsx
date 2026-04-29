import { MapResult } from "../types/match";

interface MapResultsProps {
  maps: MapResult[];
  team1Name: string;
  team2Name: string;
  team1Short: string;
  team2Short: string;
  hideTitle?: boolean;
}

export const MapResults = ({ 
  maps, 
  team1Name, 
  team2Name, 
  team1Short, 
  team2Short,
  hideTitle = false,
}: MapResultsProps) => {
  if (maps.length === 0) {
    return (
      <div className="rounded-xl border border-base-300/50 bg-rcs-bg-50 p-4">
        {!hideTitle && (
          <h2 className="text-sm font-bold text-rcs-sec tracking-wide mb-2">MAPAS</h2>
        )}
        <div className="text-sm text-rcs-sec-600">Mapas ainda não foram definidos.</div>
      </div>
    );
  }

  return (
    <div className="">
      {!hideTitle && (
        <h2 className="text-sm font-bold text-rcs-sec tracking-wide mb-3">RESULTADOS DOS MAPAS</h2>
      )}

      <ul role="list" className="divide-y divide-base-300/40 bg-rcs-bg-50 rounded-lg px-4">
        {maps.map((map, index) => {
          const team1Won = map.winner === 'team1';
          const team2Won = map.winner === 'team2';
          return (
            <li key={index} role="listitem" aria-label={`${map.mapName}: ${team1Name} ${map.team1Score} - ${map.team2Score} ${team2Name}`} className="py-3">
              <div className="flex items-center justify-between gap-3">
                {/* Mapa + meta */}
                <div className="min-w-0">
                  <div className="font-semibold text-rcs-sec truncate" title={map.mapName}>{map.mapName}</div>
                  <div className="text-xs text-rcs-sec-500 flex items-center gap-2 mt-0.5">
                    <span>{map.duration}</span>
                  </div>
                </div>

                {/* Placar */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-lg font-extrabold">
                    <span className={team1Won ? 'text-success' : 'text-rcs-sec'}>{map.team1Score}</span>
                    <span className="text-rcs-sec-500">-</span>
                    <span className={team2Won ? 'text-success' : 'text-rcs-sec'}>{map.team2Score}</span>
                  </div>
                  <div className="text-xs text-rcs-sec-500 mt-0.5">Vencedor: {map.winner === 'team1' ? team1Short : team2Short}</div>
                </div>


              </div>

              {/* Destaques colapsáveis para reduzir ruído */}
              {map.highlights && map.highlights.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs text-rcs-sec-500 cursor-pointer hover:text-rcs-sec">Destaques</summary>
                  <ul className="mt-2 space-y-1">
                    {map.highlights.map((highlight, hIndex) => (
                      <li key={hIndex} className="text-sm text-rcs-sec-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rcs-cta mt-1" aria-hidden />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MapResults;
