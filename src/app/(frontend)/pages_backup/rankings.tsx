'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { teamRankings } from "../data/teams";
import { TeamRanking } from "../types/team";

// Utility function to generate team initials
const getTeamInitials = (teamName: string): string => {
  const words = teamName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
};

// Team logo component with fallback
const TeamLogo = ({ team, className = "" }: { team: { name: string; logo?: string }; className?: string }) => {
  const [logoError, setLogoError] = useState(false);
  
  if (!team.logo || logoError) {
    const initials = getTeamInitials(team.name);
    return (
      <div className={`w-8 h-8 rounded bg-gradient-to-br from-rcs-cta/30 to-rcs-sec-500/60 flex items-center justify-center flex-shrink-0 border border-rcs-sec-400/30 ${className}`}>
        <span className="text-xs font-bold text-rcs-bg/90" title={team.name}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={team.logo} 
      alt={`${team.name} logo`}
      className={`w-8 h-8 rounded object-contain bg-rcs-sec-500/20 flex-shrink-0 ${className}`}
      onError={() => setLogoError(true)}
    />
  );
};

// Trend indicator component
const TrendIndicator = ({ change }: { change: number; trend: TeamRanking['trend'] }) => {
  if (change === 0) {
    return <span className="text-rcs-bg/50 text-xs">—</span>;
  }

  const isPositive = change > 0;
  const color = isPositive ? 'text-green-400' : 'text-red-400';
  const arrow = isPositive ? '↑' : '↓';
  
  return (
    <span className={`${color} text-xs font-medium flex items-center gap-1`}>
      <span>{arrow}</span>
      <span>{Math.abs(change)}</span>
    </span>
  );
};

export const TeamRankingsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<'mundial' | 'europe' | 'americas' | 'asia'>('mundial');
  const router = useRouter();
  
  const regions = [
    { id: 'mundial' as const, label: 'Mundial', icon: '' },
    { id: 'europe' as const, label: 'Europe', icon: '' },
    { id: 'americas' as const, label: 'Americas', icon: '' },
    { id: 'asia' as const, label: 'Asia', icon: '' }
  ];
  
  const filteredRankings = teamRankings.filter(ranking =>
    ranking.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ranking.team.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-rcs-bg min-h-screen">
      <Header />
      
      <main className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Header da página */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-rcs-sec mb-2">Ranking Valve</h1>
            <p className="text-rcs-sec text-sm">Classificação oficial dos melhores times de Counter-Strike 2</p>
          </div>
          
          {/* Filtros e busca */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xs text-rcs-sec">
                Última atualização: {new Date(teamRankings[0].lastUpdated).toLocaleDateString('pt-BR')}
              </div>
            </div>
              <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar time..."
                value={searchTerm}
                onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                className="input input-sm w-full sm:w-64 bg-rcs-sec border-rcs-sec-400/50 text-white placeholder-rcs-bg/50 focus:border-rcs-cta"
              />
            </div>
          </div>
        </div>

        {/* Navegação entre regiões */}
        <div className="flex flex-wrap gap-2">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedRegion === region.id
                  ? 'bg-rcs-cta text-white'
                  : 'bg-base-200 text-base-content hover:bg-base-300'
              }`}
            >
              {region.icon && <span>{region.icon}</span>}
              <span>{region.label}</span>
            </button>
          ))}
        </div>{/* Tabela de ranking */}
        <div className="rounded-xl border border-base-300/50 bg-base-200 shadow-sm">          <div className="px-3 py-2 border-b border-base-300/50 flex items-center justify-between bg-base-300/30">
            <h3 className="text-sm font-semibold text-base-content truncate">
              Ranking {regions.find(r => r.id === selectedRegion)?.label}
            </h3>
            <span className="text-[11px] text-base-content/60">Atualizado</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] !bg-base-200  text-base-content/60">
                  <th className="text-center px-3 py-2 font-medium">#</th>
                  <th className="text-left px-3 py-2 font-medium">Time</th>
                  <th className="text-center px-2 py-2 font-medium hidden sm:table-cell">País</th>
                  <th className="text-center px-2 py-2 font-medium">Pontos</th>
                  <th className="text-center px-2 py-2 font-medium">Mudança</th>
                </tr>
              </thead>
              <tbody>
                {filteredRankings.map((ranking) => (
                  <tr 
                    key={ranking.team.id}
                    className="border-t border-base-300/50 hover:bg-base-300/30 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/team/${ranking.team.id}`)}
                  >
                    {/* Posição */}
                    <td className="px-3 py-2 text-center">
                      <span className={`font-mono text-base-content font-bold group-hover:!text-[var(--rcs-cta)]`}>
                        {ranking.position}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <TeamLogo team={ranking.team} className="group-hover:scale-105 transition-transform" />
                        <div className="min-w-0">
                          <div className="font-semibold text-base-content/80 group-hover:!text-[var(--rcs-cta)] transition-colors truncate">
                            {ranking.team.name}
                          </div>
                          <div className="text-xs text-base-content/60 truncate">
                            {ranking.team.shortName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* País */}
                    <td className="px-2 py-2 text-center hidden sm:table-cell">
                      <span className="text-base-content/70 font-mono text-xs">
                        {ranking.team.country}
                      </span>
                    </td>

                    {/* Pontos */}
                    <td className="px-2 py-2 text-center">
                      <div className="font-mono text-base-content">
                        {ranking.points.toLocaleString()}
                      </div>
                    </td>

                    {/* Mudança */}
                    <td className="px-2 py-2 text-center">
                      <TrendIndicator change={ranking.change} trend={ranking.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>{/* Informações adicionais */}
        <div className="rounded-xl border border-base-300/50 bg-base-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-base-content mb-2">Como funciona o ranking?</h3>
          <div className="text-xs text-base-content/70 space-y-1">
            <p>• O ranking é baseado em resultados dos últimos 3 meses</p>
            <p>• Pontos são atribuídos com base na importância do torneio e qualidade dos oponentes</p>
            <p>• Atualizado semanalmente após eventos importantes</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeamRankingsPage;
