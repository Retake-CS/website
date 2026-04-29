// Tipos para o sistema de rankings e times
export interface TeamRanking {
  position: number;
  team: {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    country: string;
  };
  points: number;
  change: number; // +2, -1, 0 (mudança de posição)
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface TeamDetails {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  ranking: number;
  points: number;
  founded: string;
  region: string;
  coach?: string;
  players: {
    name: string;
    nickname: string;
    role: 'IGL' | 'Entry Fragger' | 'AWPer' | 'Support' | 'Lurker';
    country: string;
    age: number;
    joinDate: string;
    avatar?: string;
  }[];
  stats: {
    matchesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    averageRating: number;
    mapsPlayed: number;
    roundsWon: number;
    roundsLost: number;
  };
  achievements: {
    title: string;
    date: string;
    importance: 'major' | 'premier' | 'regional';
  }[];
  recentMatches: {
    id: string;
    opponent: {
      name: string;
      logo: string;
    };
    result: 'W' | 'L';
    score: string;
    date: string;
    tournament: string;
    maps: string[];
  }[];
  socialMedia?: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}
