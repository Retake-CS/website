import { PlayerStats } from "../types/match";

interface PlayerStatisticsProps {
  playerStats: PlayerStats[];
  team1Name: string;
  team2Name: string;
  team1Players: string[];
  team2Players: string[];
}

export const PlayerStatistics = ({ 
  playerStats, 
  team1Name, 
  team2Name,
  team1Players,
  team2Players
}: PlayerStatisticsProps) => {
  if (playerStats.length === 0) {
    return (
      <div className="rounded-xl border border-base-300/50 bg-rcs-bg-50 p-4">
        <h2 className="text-sm font-bold text-rcs-sec tracking-wide mb-2">ESTATÍSTICAS DETALHADAS</h2>
        <div className="text-sm text-rcs-sec-600">Estatísticas serão disponibilizadas após a partida.</div>
      </div>
    );
  }

  const team1Stats = playerStats.filter(stat => 
    team1Players.some(player => player.toLowerCase().includes(stat.playerId.toLowerCase()))
  );
  
  const team2Stats = playerStats.filter(stat => 
    team2Players.some(player => player.toLowerCase().includes(stat.playerId.toLowerCase()))
  );

  // Encontrar destaques
  const topRating = Math.max(...playerStats.map(s => s.rating));
  const topKD = Math.max(...playerStats.map(s => s.kd));
  const topADR = Math.max(...playerStats.map(s => s.adr));

  const StatRow = ({ stat, isTopPerformer }: { stat: PlayerStats; isTopPerformer: boolean }) => (
    <tr className={`border-t border-base-300/50 hover:bg-rcs-bg-100/40 ${isTopPerformer ? 'bg-rcs-cta/5' : ''}`}>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${isTopPerformer ? 'text-rcs-cta' : 'text-rcs-sec'}`}>{stat.playerName}</span>
        </div>
      </td>
      <td className="px-2 py-2 text-center font-mono text-rcs-sec">{stat.kills}</td>
      <td className="px-2 py-2 text-center font-mono text-rcs-sec">{stat.deaths}</td>
      <td className="px-2 py-2 text-center font-mono text-rcs-sec">{stat.assists}</td>
      <td className={`px-2 py-2 text-center font-mono ${stat.kd >= 1.0 ? 'text-success' : 'text-error'}`}>{stat.kd.toFixed(2)}</td>
      <td className="px-2 py-2 text-center font-mono text-rcs-sec">{stat.adr.toFixed(1)}</td>
      <td className={`px-2 py-2 text-center font-mono ${stat.rating >= 1.0 ? 'text-success' : 'text-error'}`}>{stat.rating.toFixed(2)}</td>
      <td className="px-2 py-2 text-center font-mono text-rcs-sec">{stat.headshotPercentage.toFixed(1)}%</td>
      <td className="px-2 py-2 text-center font-mono text-rcs-cta font-semibold">{stat.clutches}</td>
    </tr>
  );

  return (
    <section aria-labelledby="ps-title" className="rounded-xl border border-base-300/50 bg-rcs-bg-50">
      <div className="px-4 py-3 border-b border-base-300/50">
        <h2 id="ps-title" className="text-sm font-bold text-rcs-sec tracking-wide">ESTATÍSTICAS DETALHADAS</h2>
        <p className="text-xs text-rcs-sec-600 mt-1">Performance individual dos jogadores</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-rcs-sec-500">
              <th className="text-left px-3 py-2 font-medium">Jogador</th>
              <th className="px-2 py-2 text-center font-medium">K</th>
              <th className="px-2 py-2 text-center font-medium">D</th>
              <th className="px-2 py-2 text-center font-medium">A</th>
              <th className="px-2 py-2 text-center font-medium">K/D</th>
              <th className="px-2 py-2 text-center font-medium">ADR</th>
              <th className="px-2 py-2 text-center font-medium">Rating</th>
              <th className="px-2 py-2 text-center font-medium">HS%</th>
              <th className="px-2 py-2 text-center font-medium">Clutches</th>
            </tr>
          </thead>
          <tbody>
            {/* Time 1 */}
            <tr className="bg-rcs-bg-100/60">
              <td colSpan={9} className="px-3 py-2">
                <h3 className="font-semibold text-rcs-sec text-sm">{team1Name}</h3>
              </td>
            </tr>
            {team1Stats.map((stat) => (
              <StatRow 
                key={stat.playerId} 
                stat={stat} 
                isTopPerformer={stat.rating === topRating || stat.kd === topKD || stat.adr === topADR}
              />
            ))}

            {/* Time 2 */}
            <tr className="bg-rcs-bg-100/60">
              <td colSpan={9} className="px-3 py-2">
                <h3 className="font-semibold text-rcs-sec text-sm">{team2Name}</h3>
              </td>
            </tr>
            {team2Stats.map((stat) => (
              <StatRow 
                key={stat.playerId} 
                stat={stat} 
                isTopPerformer={stat.rating === topRating || stat.kd === topKD || stat.adr === topADR}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="px-4 py-3 border-t border-base-300/50 bg-rcs-bg-50">
        <h4 className="text-[11px] font-bold text-rcs-sec-500 tracking-wider mb-2 uppercase">Legenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-rcs-sec-600">
          <div><strong className="text-rcs-sec">K:</strong> Kills</div>
          <div><strong className="text-rcs-sec">D:</strong> Deaths</div>
          <div><strong className="text-rcs-sec">A:</strong> Assists</div>
          <div><strong className="text-rcs-sec">K/D:</strong> Kill/Death Ratio</div>
          <div><strong className="text-rcs-sec">ADR:</strong> Avg Damage/Round</div>
          <div><strong className="text-rcs-sec">Rating:</strong> HLTV Rating</div>
          <div><strong className="text-rcs-sec">HS%:</strong> Headshot %</div>
          <div><strong className="text-rcs-sec">Clutches:</strong> 1vX vencidos</div>
        </div>
      </div>
    </section>
  );
};

export default PlayerStatistics;
