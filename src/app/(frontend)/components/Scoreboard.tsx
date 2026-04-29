import { useMemo, useState } from "react";
import { MatchDetails, Player, PlayerStats } from "../types/match";

interface ScoreboardProps {
  match: MatchDetails;
}

// Scoreboard minimalista com filtro por mapa e visão geral.
// Quando ao vivo: mantém ordem do elencos, mostra badge "parcial" e aria-live.
export const Scoreboard = ({ match }: ScoreboardProps) => {
  const isLive = match.status === "live";
  const [selectedKey, setSelectedKey] = useState<string>("__all"); // __all => Geral

  const mapOptions = useMemo(() => {
    const opts = [{ key: "__all", label: "Geral" }];
    if (match.maps?.length) {
      for (const m of match.maps) opts.push({ key: m.mapName, label: m.mapName });
    }
    return opts;
  }, [match.maps]);

  // No modelo atual, temos apenas estatísticas gerais (match.playerStats)
  // Implementação preparada para aceitar per-map no futuro.
  const perMapStats: Record<string, PlayerStats[]> = {};

  const getRosterWithStats = (
    roster: Player[],
    allStats: PlayerStats[],
    mapKey: string
  ) => {
    const source = mapKey === "__all" ? allStats : perMapStats[mapKey] ?? [];

    const rows = roster.map((p) => {
      const stat = source.find(
        (s) => s.playerId.toLowerCase() === (p.nickname || p.name).toLowerCase()
      );
      return { player: p, stat } as { player: Player; stat?: PlayerStats };
    });

    // Ordenação: ao vivo manter ordem; finalizada ordenar por rating desc
    if (!isLive && mapKey === "__all") {
      rows.sort((a, b) => (b.stat?.rating ?? -1) - (a.stat?.rating ?? -1));
    }
    return rows;
  };

  const team1Rows = useMemo(
    () => getRosterWithStats(match.team1.players, match.playerStats, selectedKey),
    [match.team1.players, match.playerStats, selectedKey]
  );
  const team2Rows = useMemo(
    () => getRosterWithStats(match.team2.players, match.playerStats, selectedKey),
    [match.team2.players, match.playerStats, selectedKey]
  );

  const hasPerMapData = selectedKey === "__all" || !!perMapStats[selectedKey];

  return (
    <section aria-labelledby="sb-title" className="">      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h2 id="sb-title" className="text-sm font-bold text-rcs-sec tracking-wide">SCOREBOARD</h2>
        </div>

        <label className="text-xs text-rcs-sec inline-flex items-center gap-2">
          <span>Mapa</span>
          <select
            className="select select-sm text-rcs-bg border-base-300/50 bg-base-100"
            value={selectedKey}
            onChange={(e) => setSelectedKey((e.target as HTMLSelectElement).value)}
            aria-label="Selecionar mapa"
          >
            {mapOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>      {!hasPerMapData && (
        <div className="mt-3 rounded-lg border border-base-300/50 bg-base-100 p-3 text-xs text-base-content/60 shadow-sm">
          Estatísticas por mapa ainda não disponíveis. Exibindo apenas visão geral.
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team 1 */}
        <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">
          <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
            <h3 className="text-sm font-semibold text-base-content truncate" title={match.team1.name}>{match.team1.name}</h3>
            <span className="text-[11px] text-base-content/60">{selectedKey === "__all" ? "Geral" : selectedKey}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-base-content/60">
                  <th className="text-left px-3 py-2 font-medium">Jogador</th>
                  <th className="px-2 py-2 text-center font-medium">K</th>
                  <th className="px-2 py-2 text-center font-medium">D</th>
                  <th className="px-2 py-2 text-center font-medium">A</th>
                  <th className="px-2 py-2 text-center font-medium">K/D</th>
                  <th className="px-2 py-2 text-center font-medium">ADR</th>
                  <th className="px-2 py-2 text-center font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {team1Rows.map(({ player, stat }) => (
                  <tr key={`${player.nickname}-${player.name}`} className={`border-t border-base-300/50 ${isLive && !stat ? "animate-pulse" : ""}`}>
                    <td className="px-3 py-2 text-base-content/80 truncate" title={player.nickname}>
                      {player.nickname || player.name}
                    </td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.kills ?? "-"}</td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.deaths ?? "-"}</td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.assists ?? "-"}</td>
                    <td className={`px-2 py-2 text-center font-mono ${stat && stat.kd >= 1 ? 'text-success' : 'text-base-content/60'}`}>{stat?.kd?.toFixed(2) ?? "-"}</td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.adr !== undefined ? stat.adr.toFixed(1) : "-"}</td>
                    <td className={`px-2 py-2 text-center font-mono ${stat && stat.rating >= 1 ? 'text-success' : 'text-base-content/60'}`}>{stat?.rating?.toFixed(2) ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team 2 */}
        <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">
          <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
            <h3 className="text-sm font-semibold text-base-content truncate" title={match.team2.name}>{match.team2.name}</h3>
            <span className="text-[11px] text-base-content/60">{selectedKey === "__all" ? "Geral" : selectedKey}</span>
          </div>          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-base-content/60">
                  <th className="text-left px-3 py-2 font-medium">Jogador</th>
                  <th className="px-2 py-2 text-center font-medium">K</th>
                  <th className="px-2 py-2 text-center font-medium">D</th>
                  <th className="px-2 py-2 text-center font-medium">A</th>
                  <th className="px-2 py-2 text-center font-medium">K/D</th>
                  <th className="px-2 py-2 text-center font-medium">ADR</th>
                  <th className="px-2 py-2 text-center font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {team2Rows.map(({ player, stat }) => (
                  <tr key={`${player.nickname}-${player.name}`} className={`border-t border-base-300/50 ${isLive && !stat ? "animate-pulse" : ""}`}>
                    <td className="px-3 py-2 text-base-content/80 truncate" title={player.nickname}>
                      {player.nickname || player.name}
                    </td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.kills ?? "-"}</td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.deaths ?? "-"}</td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.assists ?? "-"}</td>
                    <td className={`px-2 py-2 text-center font-mono ${stat && stat.kd >= 1 ? 'text-success' : 'text-base-content/60'}`}>{stat?.kd?.toFixed(2) ?? "-"}</td>
                    <td className="px-2 py-2 text-center font-mono text-base-content">{stat?.adr !== undefined ? stat.adr.toFixed(1) : "-"}</td>
                    <td className={`px-2 py-2 text-center font-mono ${stat && stat.rating >= 1 ? 'text-success' : 'text-base-content/60'}`}>{stat?.rating?.toFixed(2) ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isLive && (
        <div className="mt-2 text-[11px] text-error/80" aria-live="polite">Atualizando em tempo real…</div>
      )}
    </section>
  );
};

export default Scoreboard;
