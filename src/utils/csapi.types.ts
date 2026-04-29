// CSAPI.de API Types

export interface CSAPIItem {
  id: number
  name: string
}

export interface CSAPIMapScore {
  id: number
  name: string
  team1_score: number
  team2_score: number
}

export interface CSAPITeamScore {
  id: number
  name: string
  score: number
  rank: number
}

export interface CSAPIMatchResult {
  id: number
  team1: CSAPITeamScore
  team2: CSAPITeamScore
  maps: CSAPIMapScore[]
  best_of: number
  date: string // ISO date
  event: string
  winner: CSAPIItem
}

export interface CSAPITeamRank {
  id: number
  name: string
  rank: number
  rank_diff: number
  points: number
  points_diff: number
}

export interface CSAPIRanking {
  date: string // ISO date
  rankings: CSAPITeamRank[]
}

export interface CSAPITeamDetail {
  id: number
  name: string
  streak: number
  roster: CSAPIItem[]
}

export interface CSAPIPlayerStats {
  k: number
  d: number
  swing: number
  adr: number
  kast: number
  rating: number
  N: number
}

export interface CSAPIPlayerDetail {
  id: number
  name: string
  team: CSAPIItem
  stats: CSAPIPlayerStats
}
