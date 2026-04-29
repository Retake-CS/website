import { useState } from "react";
import { MapResult } from "../types/match";

interface MapGridProps {
  maps: MapResult[];
  team1Name: string;
  team2Name: string;
  team1Short: string;
  team2Short: string;
  team1Logo?: string;
  team2Logo?: string;
  onMapSelect: (mapName: string) => void;
  selectedMap?: string;
}

// Map backgrounds - você pode expandir isso com URLs reais das imagens dos mapas
const getMapBackground = (mapName: string): string => {
  const mapImages: Record<string, string> = {
    'Inferno': 'https://img-cdn.hltv.org/gallerypicture/TomiSbVRGYf4_3mdBhnQPN.jpg?ixlib=java-2.1.0&w=1200&s=b5e4064b6f5c9e8f7b3ea7012cd3b5f9',
    'Mirage': 'https://img-cdn.hltv.org/gallerypicture/Q6vlWKhgdI1xJz3zSAcMBa.jpg?ixlib=java-2.1.0&w=1200&s=6c1f73bb6a08c8b2c4b4f12e8a1c6a4d',
    'Ancient': 'https://img-cdn.hltv.org/gallerypicture/n5g0-xOYIb_pzGQGAWqSJU.jpg?ixlib=java-2.1.0&w=1200&s=d3f4b8c9a6e2f1b0a7c5d4e9f3b8c6a1',
    'Dust2': 'https://img-cdn.hltv.org/gallerypicture/W42Prz1kQ9U3p7dfT-iYxq.jpg?ixlib=java-2.1.0&w=1200&s=a3c8b7f2e1d4a9c6b3f7e2a8d4c9b6f1',
    'Overpass': 'https://img-cdn.hltv.org/gallerypicture/8qqlEXpRWIDZvNOMkQ8EeP.jpg?ixlib=java-2.1.0&w=1200&s=f7e2b4c9a1d8f3e6b2a7c4f9e1b8d5c2',
    'Vertigo': 'https://img-cdn.hltv.org/gallerypicture/z4hJBYTxUrRdHWYHKrEAZC.jpg?ixlib=java-2.1.0&w=1200&s=c6a4f1e9b3d7a2f8c5e1b9d4a7c3e6f2',
    'Nuke': 'https://img-cdn.hltv.org/gallerypicture/DgzAzM4Ey8bWFH4RHM9XFn.jpg?ixlib=java-2.1.0&w=1200&s=e4b8c7f1a9d2e6c3f9b5a8d1c7e4f2b6'
  };
  
  return mapImages[mapName] || 'https://img-cdn.hltv.org/gallerypicture/TomiSbVRGYf4_3mdBhnQPN.jpg?ixlib=java-2.1.0&w=1200&s=b5e4064b6f5c9e8f7b3ea7012cd3b5f9';
};

// Utility function to generate team initials
const getTeamInitials = (teamName: string): string => {
  const words = teamName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
};

// Team logo component with fallback for winner display
const TeamLogoSmall = ({ team, className = "" }: { team: { name: string; logo?: string }; className?: string }) => {
  const [logoError, setLogoError] = useState(false);
  
  if (!team.logo || logoError) {
    const initials = getTeamInitials(team.name);
    return (
      <div className={`w-6 h-6 rounded bg-gradient-to-br from-rcs-cta/40 to-rcs-sec-500/70 flex items-center justify-center flex-shrink-0 border border-white/30 ${className}`}>
        <span className="text-xs font-bold text-white" title={team.name}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={team.logo} 
      alt={`${team.name} logo`}
      className={`w-6 h-6 rounded object-contain bg-white/10 flex-shrink-0 border border-white/30 ${className}`}
      onError={() => setLogoError(true)}
    />
  );
};

export const MapGrid = ({
  maps,
  team1Name,
  team2Name,
  team1Short,
  team2Short,
  team1Logo,
  team2Logo,
  onMapSelect,
  selectedMap
}: MapGridProps) => {
  if (maps.length === 0) {
    return (
      <div className="rounded-lg border border-rcs-sec-400/50 bg-rcs-sec p-4 shadow-sm">
        <h2 className="text-sm font-bold text-white tracking-wide mb-2">MAPAS</h2>
        <div className="text-sm text-rcs-bg/70">Mapas ainda não foram definidos.</div>
      </div>
    );
  }
  return (
    <div className="">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-rcs-sec tracking-wide">RESULTADOS DOS MAPAS</h2>
        <button
          onClick={() => onMapSelect("__all")}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            selectedMap === undefined 
              ? 'bg-rcs-cta text-white' 
              : 'bg-rcs-sec-500/50 text-rcs-bg/80 hover:bg-rcs-sec-500/70 hover:text-rcs-bg'
          }`}
        >
          Ver Geral
        </button>
      </div>
      
      {/* Grid de 3 colunas responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {maps.map((map, index) => {
          const team1Won = map.winner === 'team1';
          const team2Won = map.winner === 'team2';
          const isSelected = selectedMap === map.mapName;
          const mapBg = getMapBackground(map.mapName);
          
          return (
            <div 
              key={index}
              onClick={() => onMapSelect(map.mapName)}
              className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 aspect-[16/10] ${
                isSelected 
                  ? 'ring-2 ring-rcs-cta shadow-lg scale-105' 
                  : 'hover:scale-102 hover:shadow-md'
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Selecionar mapa ${map.mapName}: ${team1Name} ${map.team1Score} - ${map.team2Score} ${team2Name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onMapSelect(map.mapName);
                }
              }}
            >
              {/* Background da imagem do mapa */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${mapBg})` }}
              />
              
              {/* Overlay escuro para melhor legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              
              {/* Conteúdo sobre a imagem */}
              <div className="relative h-full flex flex-col justify-between p-3">
                {/* Header com nome do mapa */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm drop-shadow-sm">{map.mapName}</h3>
                    <div className="text-xs text-white/80 drop-shadow-sm">{map.duration}</div>
                    {map.overtime && (
                      <div className="text-xs text-yellow-400 font-medium drop-shadow-sm">OT</div>
                    )}
                  </div>
                  
                  {/* Indicador de seleção */}
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-rcs-cta shadow-lg" />
                  )}
                </div>
                
                {/* Placar e vencedor */}
                <div className="space-y-2">
                  {/* Placar principal */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 text-xl font-bold drop-shadow-md">
                      <span className={team1Won ? 'text-green-400' : 'text-white'}>{map.team1Score}</span>
                      <span className="text-white/70">-</span>
                      <span className={team2Won ? 'text-green-400' : 'text-white'}>{map.team2Score}</span>
                    </div>
                  </div>
                  
                  {/* Vencedor com logo */}
                  <div className="flex items-center justify-center gap-2">
                    {team1Won && (
                      <>
                        <TeamLogoSmall team={{ name: team1Name, logo: team1Logo }} />
                        <span className="text-xs text-green-400 font-medium drop-shadow-sm">{team1Short} Venceu</span>
                      </>
                    )}
                    {team2Won && (
                      <>
                        <TeamLogoSmall team={{ name: team2Name, logo: team2Logo }} />
                        <span className="text-xs text-green-400 font-medium drop-shadow-sm">{team2Short} Venceu</span>
                      </>
                    )}
                    {!team1Won && !team2Won && (
                      <span className="text-xs text-white/70 font-medium drop-shadow-sm">Empate</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Efeito hover */}
              <div className="absolute inset-0 bg-rcs-cta/0 hover:bg-rcs-cta/10 transition-colors duration-300" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapGrid;
