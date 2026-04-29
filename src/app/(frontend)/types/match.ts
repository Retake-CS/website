// Tipos para o sistema de partidas de CS2
export interface Player {
  name: string;
  nickname: string;
  avatar?: string;
  country?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  country: string;
  players: Player[];
  ranking?: number;
}

export interface MapResult {
  mapName: string;
  team1Score: number;
  team2Score: number;
  team1StartSide: 'CT' | 'TR';
  team2StartSide: 'CT' | 'TR';
  duration: string; // formato "45:32"
  overtime: boolean;
  overtimeRounds?: number;
  winner: 'team1' | 'team2';
  highlights: string[];
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  adr: number; // Average Damage per Round
  rating: number;
  headshotPercentage: number;
  clutches: number;
  mvpRounds: number;
}

export interface MatchDetails {
  id: string;
  team1: Team;
  team2: Team;
  finalScore: {
    team1: number;
    team2: number;
  };
  prediction?: {
    team1Score: number;
    team2Score: number;
    confidence: number; // 0-100
  };
  status: 'completed' | 'live' | 'upcoming';
  date: string;
  time: string;
  tournament: {
    name: string;
    stage: string;
    importance: 'high' | 'medium' | 'low';
    prizePool?: string;
  };
  format: string; // "BO1", "BO3", "BO5"
  maps: MapResult[];
  playerStats: PlayerStats[];
  matchContext: {
    importance: string;
    stakes: string;
    rivalry?: string;
    previousMeetings?: string;
  };
  keyMoments: {
    round: number;
    map: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  mvp: {
    playerId: string;
    playerName: string;
    team: string;
    reason: string;
  };
  streamUrl?: string;
  vods?: string[];
}