// Tipos para o sistema de rankings e times
export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: {
    url: string;
  };
  country: string;
  region?: string;
  ranking?: number;
  founded?: string;
  coach?: string;
  stats?: {
    matchesPlayed?: number;
    wins?: number;
    losses?: number;
    winRate?: number;
    averageRating?: number;
    mapsPlayed?: number;
    roundsWon?: number;
    roundsLost?: number;
  };
  achievements?: Array<{
    title: string;
    date: string;
    importance: 'major' | 'premier' | 'regional';
  }>;
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface Ranking {
  id: string;
  position: number;
  team: Team;
  points: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  region: 'mundial' | 'europe' | 'americas' | 'asia' | 'oceania';
  country: string;
  lastUpdated: string;
  // Nota: isActive será adicionado após migração do banco
  // isActive: boolean;
}

export interface RankingFilters {
  region?: 'mundial' | 'europe' | 'americas' | 'asia' | 'oceania';
  country?: string;
  activeOnly?: boolean;
  limit?: number;
}

export type RegionType = 'mundial' | 'europe' | 'americas' | 'asia' | 'oceania';

export interface RegionInfo {
  id: RegionType;
  label: string;
  icon?: string;
}