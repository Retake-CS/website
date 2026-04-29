// BO3.gg API Types
// Updated types based on REAL API response structure

// Real API Team interface (complete object when using 'with=teams')
export interface BO3Team {
  id: number
  slug: string
  name: string
  rank: number
  image_url: string
  tshirt_image_url?: string
  icon_url?: string
  country_id: number
  discipline_id: number
  image_versions?: {
    webp?: string
    '20x20'?: string
    '50x50'?: string
    '150x150'?: string
    '400x400'?: string
    original?: string
  }
  tshirt_image_versions?: {
    webp?: string
    '20x20'?: string
    '50x50'?: string
    '150x150'?: string
    '400x400'?: string
    original?: string
  }
  facebook?: string
  twitter?: string
  email?: string
  twitch_url?: string
  youtube_url?: string
  instagram_url?: string
  website_url?: string
  six_month_earned?: number
  acronym?: string
  gallery_presence?: boolean
  avg_views?: number
  est_date?: string
}

// Real API Tournament interface (complete object when using 'with=tournament')
export interface BO3Tournament {
  id: number
  slug: string
  name: string
  status: string
  prize?: number
  players_prize?: number
  teams_prize?: number
  tier: string
  tier_rank: number
  image_url?: string
  discipline_id: number
  game_version?: number
  pickem_presence: boolean
  pickem_status?: string
  pickem_points?: number
  last_match_date?: string
  pickem_name?: string
  pickem_participants_count?: number
  banner_image_url?: string
  banner_image_versions?: {
    [key: string]: string
  }
  comments_count: number
}

// Real API Game interface (when using 'with=games')
export interface BO3Game {
  id: number
  begin_at: string
  state: string
  partially_state?: string
  status: string
  map_name: string
  number: number
  rounds_count: number
  ov_index: number
  winner_clan_score: number
  loser_clan_score: number
  winner_clan_name: string
  loser_clan_name: string
  match_id: number
  game_version?: number
  winner_team_clan?: {
    clan_name: string
    team_id: number
    id: number
    team: BO3Team
  }
  loser_team_clan?: {
    clan_name: string
    team_id: number
    id: number
    team: BO3Team
  }
}

// AI Predictions interface (when using 'with=ai_predictions')
export interface BO3AIPredictions {
  prediction_team1_score: number
  prediction_team2_score: number
  prediction_winner_team_id: number
  prediction_scores_data?: {
    neighbor_proximity_factor: number | string
  }
}

// Live Updates interface
export interface BO3LiveUpdates {
  team_1: {
    side: string
    game_score: number
    match_score: number
    economy_level?: number
    equipment_value?: number
  }
  team_2: {
    side: string
    game_score: number
    match_score: number
    economy_level?: number
    equipment_value?: number
  }
  map_name: string
  game_ended: boolean
  game_number: number
  round_phase: string
  round_number: number
}

// Bet Updates interface
export interface BO3BetUpdates {
  path: string
  status: string
  team_1: {
    name: string
    coeff: number
    active: boolean
    team_id: number | null
    max_coeff: number
  }
  team_2: {
    name: string
    coeff: number
    active: boolean
    team_id: number | null
    max_coeff: number
  }
  provider: string
  markets_count: number
}

// Real API Match interface (with full objects when using 'with' parameter)
export interface BO3Match {
  id: number
  slug: string
  round_id: number
  team1_id: number
  team2_id: number
  winner_team_id?: number
  loser_team_id?: number
  tournament_id: number
  team1_score: number
  team2_score: number
  status: string
  bo_type: number
  start_date: string
  end_date?: string
  stage_id: number
  maps_score?: boolean[]
  parsed_status: string
  tier: string
  tier_rank: number
  position: number
  points?: number
  rating?: number
  stars?: number
  team1_last_game_score?: number
  team2_last_game_score?: number
  live_updates?: BO3LiveUpdates
  live_coverage: boolean
  live_coverage_advantage: boolean
  live_coverage_source: number
  discipline_id: number
  prev_match1_winner: boolean
  prev_match2_winner: boolean
  prev_match1_id?: number
  prev_match2_id?: number
  game_version: number
  team1_new_participant: boolean
  team2_new_participant: boolean
  comments_count: number
  bet_updates?: BO3BetUpdates
  comments: any[]
  // These are populated when using 'with' parameter
  team1?: BO3Team
  team2?: BO3Team
  winner_team?: BO3Team
  tournament?: BO3Tournament
  ai_predictions?: BO3AIPredictions
  games?: BO3Game[]
}

// Real API Response structure (when using 'with' parameter)
export interface BO3ApiResponse {
  total: {
    count: number
    pages: number
    offset: number
    limit: number
  }
  results: BO3Match[]
}

// API v2 response structure (/matches/finished, /matches/live, /matches/upcoming)
export interface BO3ApiV2Tier {
  codes: string[]
  tournaments: string[]
  matches: BO3Match[]
}

export interface BO3ApiV2Response {
  data:
    | BO3Match[]
    | {
        tiers: Record<string, BO3ApiV2Tier | undefined>
      }
  included?: {
    // Access pattern: included.teams[String(teamId)]
    teams?: Record<string, BO3Team>
    tournaments?: Record<string, BO3Tournament>
  }
  meta: {
    date: string
    prev_date?: string
    next_date?: string
    total_matches?: number
  }
}

export interface BO3ApiV2EnrichedMatch extends BO3Match {
  team1_data: BO3Team | null
  team2_data: BO3Team | null
  tournament_data: BO3Tournament | null
  team1_display_name: string | null
  team2_display_name: string | null
}

// Legacy types for backward compatibility (old structure with tiers)
export interface BO3TierData {
  codes: string[]
  tournaments: string[]
  matches: BO3Match[]
}

export interface BO3IncludedData {
  teams: Record<string, BO3Team>
  tournaments: Record<string, BO3Tournament>
}

export interface BO3MatchesResponse {
  data: {
    tiers: {
      high_tier?: BO3TierData
      low_tier?: BO3TierData
    }
  }
  included: BO3IncludedData
  meta: {
    date: string
    prev_date?: string
    next_date?: string
  }
}

// Request parameters
export interface BO3MatchesParams {
  date?: string // YYYY-MM-DD format
  utc_offset?: number // timezone offset in seconds
  filter?: {
    discipline_id?: {
      eq?: number // 1 for CS2
    }
    tier?: {
      eq?: string // 'a', 'b', 'c'
    }
  }
}

// Status types
export type BO3MatchStatus = 'upcoming' | 'live' | 'finished' | 'defwin' | 'postponed'
export type BO3ParsedStatus = 'waiting' | 'live' | 'done'
export type BO3Tier = 'a' | 'b' | 'c'
export type BO3DisciplineId = 1 // CS2

// Helper types for filtering and mapping
export interface BO3MatchFilters {
  date?: Date
  status?: BO3MatchStatus
  tier?: BO3Tier
  disciplineId?: BO3DisciplineId
  teamId?: number
  tournamentId?: number
}

export interface BO3EnrichedMatch extends BO3Match {
  team1_data?: BO3Team
  team2_data?: BO3Team
  tournament_data?: BO3Tournament
}

export interface BO3DailyMatches {
  date: string
  matches: BO3EnrichedMatch[]
  high_tier: BO3EnrichedMatch[]
  low_tier: BO3EnrichedMatch[]
  teams: Record<string, BO3Team>
  tournaments: Record<string, BO3Tournament>
  meta: {
    total_matches: number
    by_tier: Record<string, number>
    by_status: Record<BO3MatchStatus, number>
    prev_date?: string
    next_date?: string
  }
}

// Widget Matches Endpoint Parameters
export interface BO3WidgetMatchesParams {
  scope: 'widget-matches'
  page?: {
    offset?: number
    limit?: number
  }
  sort?: 'start_date' | '-start_date' | 'end_date' | '-end_date'
  filter?: {
    'matches.status'?: {
      in?: string[] // e.g., ['current', 'upcoming', 'finished']
      eq?: string // e.g., 'current'
    }
    'matches.discipline_id'?: {
      eq?: number // e.g., 1 for CS2
    }
    'matches.tier'?: {
      in?: string[] // e.g., ['s', 'a', 'b']
      eq?: string // e.g., 's'
    }
    'matches.start_date'?: {
      gte?: string // ISO date string
      lte?: string // ISO date string
    }
  }
  with?: string[] // e.g., ['teams', 'tournament', 'ai_predictions', 'games']
}

// Flattened query parameters (how they appear in URL)
export interface BO3WidgetMatchesQueryParams {
  scope: 'widget-matches'
  'page[offset]'?: number
  'page[limit]'?: number
  sort?: string
  'filter[matches.status][in]'?: string
  'filter[matches.status][eq]'?: string
  'filter[matches.discipline_id][eq]'?: number
  'filter[matches.tier][in]'?: string
  'filter[matches.tier][eq]'?: string
  'filter[matches.start_date][gte]'?: string
  'filter[matches.start_date][lte]'?: string
  with?: string // comma-separated string
}

/** Root object returned no JSON */
export interface TeamRankingsResponse {
  data: TeamRankingEntry[]
  meta: RankingsMeta
}

/** Cada entrada na lista de rankings */
export interface TeamRankingEntry {
  id: number
  team_id: number
  region: string
  ranking_date: string
  score: string
  team: TeamInfo
  roster_players: RosterPlayer[]
  rank: number
  rank_diff: number
  [extra: string]: unknown
}

/** Informações detalhadas da equipe */
export interface TeamInfo {
  id: number
  slug?: string | null
  name?: string | null
  image_url?: string | null
  country_id?: number | null
  country?: Country | null
  [extra: string]: unknown
}

/** País associado à equipe (quando presente) */
export interface Country {
  id: number
  code?: string | null
  name?: string | null
}

/** Jogador listado no roster_players */
export interface RosterPlayer {
  id: number
  nickname?: string | null
  score?: number | null
  slug?: string | null
  image_url?: string | null
  country_code?: string | null
  [extra: string]: unknown
}

/** Informação de paginação / metadados retornados */
export interface RankingsMeta {
  current_page: number
  per_page: number
  total_count: number
  total_pages: number
  ranking_date?: string | null
  region?: string | null
  discipline_id?: number | null
  source?: string | null
  is_official?: boolean | null
  updated_at?: string | null
  [extra: string]: unknown
}

// Tipagem completa para o objeto "team detail" fornecido pela API
export interface TeamDetail {
  id: number
  slug?: string | null
  name?: string | null
  image_url?: string | null
  facebook?: string | null
  twitter?: string | null
  rank?: number | null
  created_at?: string | null
  updated_at?: string | null
  country_id?: number | null
  ps_id?: number | null
  image_data?: string | null
  image_versions?: ImageVersions | null
  avg_views?: number | null
  est_date?: string | null
  tshirt_image_url?: string | null
  tshirt_image_data?: string | null
  tshirt_image_versions?: ImageVersions | null
  icon_url?: string | null
  icon_data?: string | null
  icon_versions?: ImageVersions | null
  email?: string | null
  twitch_url?: string | null
  youtube_url?: string | null
  instagram_url?: string | null
  website_url?: string | null
  discipline_id?: number | null
  six_month_earned?: number | null
  acronym?: string | null
  gallery_presence?: boolean | null
  from_transfers?: TransferEntry[]
  team_clans?: TeamClan[]
  alternative_names?: AlternativeName[]
  achievements?: Achievement[]
  players?: Player[]
  country?: Country | null
  tags?: Tag[]
  localized_teams_records?: unknown[]
  [extra: string]: unknown
}

export interface ImageVersions {
  webp?: string | null
  '20x20'?: string | null
  '50x50'?: string | null
  '150x150'?: string | null
  '400x400'?: string | null
  original?: string | null
  [size: string]: string | null | undefined
}

export interface ImageData {
  id?: string | null
  storage?: string | null
  metadata?: {
    filename?: string | null
    size?: number | null
    mime_type?: string | null
    width?: number | null
    height?: number | null
    [extra: string]: unknown
  } | null
  derivatives?: {
    [key: string]: {
      id?: string | null
      storage?: string | null
      metadata?: {
        filename?: string | null
        size?: number | null
        mime_type?: string | null
        width?: number | null
        height?: number | null
        [extra: string]: unknown
      } | null
      [extra: string]: unknown
    } | null
  } | null
  [extra: string]: unknown
}

export interface TeamClan {
  clan_name?: string | null
  team_id?: number | null
  created_at?: string | null
  updated_at?: string | null
  id?: number | null
  [extra: string]: unknown
}

export interface AlternativeName {
  id?: number | null
  name?: string | null
  team_id?: number | null
  player_id?: number | null
  [extra: string]: unknown
}

export interface Achievement {
  id: number
  date?: string | null
  title?: string | null
  image_url?: string | null
  tournament_id?: number | null
  image_versions?: ImageVersions | null
  image_data?: string | null
  team_id?: number | null
  tournament?: Tournament | null
  [extra: string]: unknown
}

export interface Tournament {
  id: number
  slug?: string | null
  name?: string | null
  tier?: string | null
  tier_rank?: number | null
  prize?: number | null
  [extra: string]: unknown
}

export interface Player {
  id: number
  slug?: string | null
  nickname?: string | null
  first_name?: string | null
  last_name?: string | null
  status?: number | null
  birthday?: string | null
  role?: string | null
  twitter?: string | null
  twitch?: string | null
  facebook?: string | null
  image_url?: string | null
  country_id?: number | null
  team_id?: number | null
  discipline_id?: number | null
  six_month_avg_rating?: number | null
  is_coach?: boolean | null
  coach_status?: number | null
  total_prize?: number | null
  gallery_presence?: boolean | null
  settings_presence?: boolean | null
  gears_presence?: boolean | null
  comments_count?: number | null
  country?: Country | null
  player_transfers?: TransferEntry[] | null
  [extra: string]: unknown
}

export interface Tag {
  id: number
  name?: string | null
  slug?: string | null
  team_id?: number | null
  [extra: string]: unknown
}

export interface TransferEntry {
  id: number
  created_at?: string | null
  updated_at?: string | null
  team_to_id?: number | null
  player_id?: number | null
  team_from_id?: number | null
  source_type?: number | null
  source_url?: string | null
  action_date?: string | null
  action_type?: number | null
  compensation?: number | null
  team_to_name?: string | null
  team_from_name?: string | null
  player_name?: string | null
  discipline_id?: number | null
  player_country?: string | null
  is_coach?: boolean | null
  [extra: string]: unknown
}
