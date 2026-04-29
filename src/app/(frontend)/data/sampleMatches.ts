import { MatchDetails } from '../types/match';

export const sampleMatch: MatchDetails = {
  id: "esl-pro-league-s20-rc-vs-complexity",
  team1: {
    id: "red-canids",
    name: "Red Canids",
    shortName: "RED",
    logo: "https://images.seeklogo.com/logo-png/29/2/astralis-logo-png_seeklogo-299986.png",
    country: "BR",
    ranking: 12,
    players: [
      { name: "Marcelo David", nickname: "coldzera", country: "BR" },
      { name: "Henrique Teles", nickname: "HEN1", country: "BR" },
      { name: "Lucas Teles", nickname: "LUCAS1", country: "BR" },
      { name: "Ricardo Sinigaglia", nickname: "boltz", country: "BR" },
      { name: "Vinicius Figueiredo", nickname: "VINI", country: "BR" }
    ]
  },
  team2: {
    id: "complexity",
    name: "Complexity Gaming",
    shortName: "COL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Team_Complexity_logo.svg/1200px-Team_Complexity_logo.svg.png",
    country: "US",
    ranking: 8,
    players: [
      { name: "Michael Slowinski", nickname: "Grim", country: "US" },
      { name: "Johnny Theodosiou", nickname: "JT", country: "CA" },
      { name: "Ricky Mulholland", nickname: "floppy", country: "US" },
      { name: "Håkon Fjærli", nickname: "hallzerk", country: "NO" },
      { name: "Jamie Hall", nickname: "EliGE", country: "US" }
    ]
  },
  finalScore: {
    team1: 2,
    team2: 1
  },
  prediction: {
    team1Score: 2,
    team2Score: 1,
    confidence: 68
  },
  status: "completed",
  date: "2024-09-15",
  time: "16:00",
  tournament: {
    name: "ESL Pro League Season 20",
    stage: "Playoffs - Quartas de Final",
    importance: "high",
    prizePool: "$750,000"
  },
  format: "BO3",
  maps: [
    {
      mapName: "Inferno",
      team1Score: 16,
      team2Score: 9,
      team1StartSide: "CT",
      team2StartSide: "TR",
      duration: "42:18",
      overtime: false,
      winner: "team1",
      highlights: [
        "coldzera clutch 1v3 no round 23",
        "HEN1 ace com AWP no round 18",
        "Execução perfeita no site A - round 27"
      ]
    },
    {
      mapName: "Mirage",
      team1Score: 12,
      team2Score: 16,
      team1StartSide: "TR",
      team2StartSide: "CT",
      duration: "48:35",
      overtime: false,
      winner: "team2",
      highlights: [
        "EliGE 4k spray transfer no round 29",
        "Complexity domina meio de mapa",
        "Force buy decisivo da COL no round 25"
      ]
    },
    {
      mapName: "Ancient",
      team1Score: 19,
      team2Score: 17,
      team1StartSide: "CT",
      team2StartSide: "TR",
      duration: "67:42",
      overtime: true,
      overtimeRounds: 6,
      winner: "team1",
      highlights: [
        "Overtime épico com 6 rounds extras",
        "boltz clutch 1v2 decisivo na OT",
        "VINI entry frags cruciais no site B"
      ]
    }
  ],
  playerStats: [
    {
      playerId: "coldzera",
      playerName: "coldzera",
      kills: 67,
      deaths: 52,
      assists: 18,
      kd: 1.29,
      adr: 84.2,
      rating: 1.24,
      headshotPercentage: 52.3,
      clutches: 4,
      mvpRounds: 12
    },
    {
      playerId: "EliGE",
      playerName: "EliGE",
      kills: 61,
      deaths: 58,
      assists: 22,
      kd: 1.05,
      adr: 78.9,
      rating: 1.08,
      headshotPercentage: 48.7,
      clutches: 2,
      mvpRounds: 8
    }
  ],
  matchContext: {
    importance: "Confronto decisivo pelas quartas de final da ESL Pro League Season 20",
    stakes: "Vaga nas semifinais e prize pool de $37,500 por equipe",
    rivalry: "Primeiro confronto oficial entre as equipes na temporada 2024",
    previousMeetings: "Histórico favorável à Complexity (3-1 nos últimos encontros)"
  },
  keyMoments: [
    {
      round: 23,
      map: "Inferno",
      description: "coldzera realiza clutch 1v3 impossível no site B, virando a economia da Red Canids",
      impact: "high"
    },
    {
      round: 29,
      map: "Mirage",
      description: "EliGE consegue 4k com spray transfer perfeito, forçando eco da RED",
      impact: "high"
    },
    {
      round: 33,
      map: "Ancient",
      description: "boltz fecha a partida com clutch 1v2 na overtime, garantindo a classificação",
      impact: "high"
    }
  ],
  mvp: {
    playerId: "coldzera",
    playerName: "coldzera",
    team: "Red Canids",
    reason: "Liderou em rating (1.24), clutches decisivos e consistência ao longo dos 3 mapas"
  },
  streamUrl: "https://twitch.tv/esl_csgo",
  vods: ["https://youtube.com/watch?v=example1", "https://youtube.com/watch?v=example2"]
};

export const upcomingMatch: MatchDetails = {
  id: "blast-premier-navi-vs-g2",
  team1: {
    id: "navi",
    name: "Natus Vincere",
    shortName: "NAVI",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Natus_Vincere_logo.svg/1200px-Natus_Vincere_logo.svg.png",
    country: "UA",
    ranking: 1,
    players: [
      { name: "Aleksandr Kostyliev", nickname: "s1mple", country: "UA" },
      { name: "Oleksandr Kostyliev", nickname: "w0nderful", country: "UA" },
      { name: "Ihor Zhdanov", nickname: "w0nderful", country: "UA" },
      { name: "Andrii Nadezhdin", nickname: "npl", country: "UA" },
      { name: "Mihai Popa", nickname: "iM", country: "RO" }
    ]
  },
  team2: {
    id: "g2",
    name: "G2 Esports",
    shortName: "G2",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/G2_Esports_logo.svg/1200px-G2_Esports_logo.svg.png",
    country: "FR",
    ranking: 3,
    players: [
      { name: "Nikola Kovač", nickname: "NiKo", country: "BA" },
      { name: "Ilya Zalutskiy", nickname: "m0NESY", country: "RU" },
      { name: "Mario Samayoa", nickname: "malbsMd", country: "GT" },
      { name: "Nemanja Isaković", nickname: "nexa", country: "RS" },
      { name: "Rasmus Steensborg", nickname: "HooXi", country: "DK" }
    ]
  },
  finalScore: {
    team1: 0,
    team2: 0
  },
  prediction: {
    team1Score: 2,
    team2Score: 1,
    confidence: 72
  },
  status: "upcoming",
  date: "2024-09-18",
  time: "14:30",
  tournament: {
    name: "BLAST Premier Fall Final 2024",
    stage: "Semifinal",
    importance: "high",
    prizePool: "$425,000"
  },
  format: "BO3",
  maps: [],
  playerStats: [],
  matchContext: {
    importance: "Semifinal do BLAST Premier Fall Final - confronto entre top 3 mundial",
    stakes: "Vaga na grande final e garantia de pelo menos $85,000",
    rivalry: "Rivalidade histórica entre s1mple e NiKo, considerados dois dos melhores jogadores da história",
    previousMeetings: "NAVI lidera o head-to-head por 12-8 nos últimos 2 anos"
  },
  keyMoments: [],
  mvp: {
    playerId: "",
    playerName: "",
    team: "",
    reason: ""
  },
  streamUrl: "https://twitch.tv/blast"
};