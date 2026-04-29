import { TeamRanking, TeamDetails } from '../types/team';

export const teamRankings: TeamRanking[] = [
  {
    position: 1,
    team: {
      id: "navi",
      name: "Natus Vincere",
      shortName: "NAVI",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Natus_Vincere_logo.svg/1200px-Natus_Vincere_logo.svg.png",
      country: "UA"
    },
    points: 1000,
    change: 0,
    trend: 'stable',
    lastUpdated: "2024-09-15"
  },
  {
    position: 2,
    team: {
      id: "faze",
      name: "FaZe Clan",
      shortName: "FaZe",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FaZe_Clan_logo.svg/1200px-FaZe_Clan_logo.svg.png",
      country: "EU"
    },
    points: 897,
    change: 1,
    trend: 'up',
    lastUpdated: "2024-09-15"
  },
  {
    position: 3,
    team: {
      id: "g2",
      name: "G2 Esports",
      shortName: "G2",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/G2_Esports_logo.svg/1200px-G2_Esports_logo.svg.png",
      country: "FR"
    },
    points: 856,
    change: -1,
    trend: 'down',
    lastUpdated: "2024-09-15"
  },
  {
    position: 4,
    team: {
      id: "vitality",
      name: "Team Vitality",
      shortName: "VIT",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Team_Vitality_logo.svg/1200px-Team_Vitality_logo.svg.png",
      country: "FR"
    },
    points: 734,
    change: 2,
    trend: 'up',
    lastUpdated: "2024-09-15"
  },
  {
    position: 5,
    team: {
      id: "astralis",
      name: "Astralis",
      shortName: "AST",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Astralis_logo.svg/1200px-Astralis_logo.svg.png",
      country: "DK"
    },
    points: 698,
    change: -1,
    trend: 'down',
    lastUpdated: "2024-09-15"
  },
  {
    position: 6,
    team: {
      id: "liquid",
      name: "Team Liquid",
      shortName: "TL",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Team_Liquid_logo.svg/1200px-Team_Liquid_logo.svg.png",
      country: "US"
    },
    points: 645,
    change: 1,
    trend: 'up',
    lastUpdated: "2024-09-15"
  },
  {
    position: 7,
    team: {
      id: "heroic",
      name: "Heroic",
      shortName: "HER",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Heroic_logo.svg/1200px-Heroic_logo.svg.png",
      country: "DK"
    },
    points: 612,
    change: -2,
    trend: 'down',
    lastUpdated: "2024-09-15"
  },
  {
    position: 8,
    team: {
      id: "complexity",
      name: "Complexity Gaming",
      shortName: "COL",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Team_Complexity_logo.svg/1200px-Team_Complexity_logo.svg.png",
      country: "US"
    },
    points: 578,
    change: 0,
    trend: 'stable',
    lastUpdated: "2024-09-15"
  },
  {
    position: 9,
    team: {
      id: "nip",
      name: "Ninjas in Pyjamas",
      shortName: "NIP",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Ninjas_in_Pyjamas_logo.svg/1200px-Ninjas_in_Pyjamas_logo.svg.png",
      country: "SE"
    },
    points: 534,
    change: 1,
    trend: 'up',
    lastUpdated: "2024-09-15"
  },
  {
    position: 10,
    team: {
      id: "fnatic",
      name: "Fnatic",
      shortName: "FNC",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Fnatic_logo.svg/1200px-Fnatic_logo.svg.png",
      country: "SE"
    },
    points: 498,
    change: -1,
    trend: 'down',
    lastUpdated: "2024-09-15"
  },
  {
    position: 11,
    team: {
      id: "cloud9",
      name: "Cloud9",
      shortName: "C9",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Cloud9_logo.svg/1200px-Cloud9_logo.svg.png",
      country: "US"
    },
    points: 467,
    change: 0,
    trend: 'stable',
    lastUpdated: "2024-09-15"
  },
  {
    position: 12,
    team: {
      id: "red-canids",
      name: "Red Canids",
      shortName: "RED",
      logo: "https://images.seeklogo.com/logo-png/29/2/astralis-logo-png_seeklogo-299986.png",
      country: "BR"
    },
    points: 423,
    change: 2,
    trend: 'up',
    lastUpdated: "2024-09-15"
  }
];

export const sampleTeamDetail: TeamDetails = {
  id: "red-canids",
  name: "Red Canids",
  shortName: "RED",
  logo: "https://images.seeklogo.com/logo-png/29/2/astralis-logo-png_seeklogo-299986.png",
  country: "BR",
  ranking: 12,
  points: 423,
  founded: "2020",
  region: "Americas",
  coach: "Gabriel 'FalleN' Toledo",
  players: [
    {
      name: "Marcelo David",
      nickname: "coldzera",
      role: "Lurker",
      country: "BR",
      age: 29,
      joinDate: "2023-01-15",
      avatar: "https://example.com/coldzera.jpg"
    },
    {
      name: "Henrique Teles",
      nickname: "HEN1",
      role: "AWPer",
      country: "BR",
      age: 27,
      joinDate: "2022-06-10",
      avatar: "https://example.com/hen1.jpg"
    },
    {
      name: "Lucas Teles",
      nickname: "LUCAS1",
      role: "Support",
      country: "BR",
      age: 27,
      joinDate: "2022-06-10",
      avatar: "https://example.com/lucas1.jpg"
    },
    {
      name: "Ricardo Sinigaglia",
      nickname: "boltz",
      role: "Entry Fragger",
      country: "BR",
      age: 26,
      joinDate: "2023-03-20",
      avatar: "https://example.com/boltz.jpg"
    },
    {
      name: "Vinicius Figueiredo",
      nickname: "VINI",
      role: "IGL",
      country: "BR",
      age: 24,
      joinDate: "2023-08-01",
      avatar: "https://example.com/vini.jpg"
    }
  ],
  stats: {
    matchesPlayed: 45,
    wins: 28,
    losses: 17,
    winRate: 62.2,
    averageRating: 1.08,
    mapsPlayed: 134,
    roundsWon: 2156,
    roundsLost: 1987
  },
  achievements: [
    {
      title: "ESL Pro League S18 - 3º lugar",
      date: "2023-09-17",
      importance: "premier"
    },
    {
      title: "IEM Rio Major 2022 - Top 8",
      date: "2022-11-13",
      importance: "major"
    },
    {
      title: "BLAST Spring Groups 2023 - Classificação",
      date: "2023-03-26",
      importance: "premier"
    }
  ],
  recentMatches: [
    {
      id: "1",
      opponent: {
        name: "Complexity Gaming",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Team_Complexity_logo.svg/1200px-Team_Complexity_logo.svg.png"
      },
      result: "W",
      score: "2-1",
      date: "2024-09-15",
      tournament: "ESL Pro League S20",
      maps: ["Inferno", "Mirage", "Ancient"]
    },
    {
      id: "2",
      opponent: {
        name: "FURIA",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/FURIA_Esports_logo.svg/1200px-FURIA_Esports_logo.svg.png"
      },
      result: "L",
      score: "0-2",
      date: "2024-09-12",
      tournament: "ESL Pro League S20",
      maps: ["Dust2", "Mirage"]
    },
    {
      id: "3",
      opponent: {
        name: "Team Liquid",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Team_Liquid_logo.svg/1200px-Team_Liquid_logo.svg.png"
      },
      result: "W",
      score: "2-0",
      date: "2024-09-08",
      tournament: "ESL Pro League S20",
      maps: ["Overpass", "Vertigo"]
    },
    {
      id: "4",
      opponent: {
        name: "Astralis",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Astralis_logo.svg/1200px-Astralis_logo.svg.png"
      },
      result: "L",
      score: "1-2",
      date: "2024-09-05",
      tournament: "BLAST Premier Fall",
      maps: ["Inferno", "Nuke", "Ancient"]
    },
    {
      id: "5",
      opponent: {
        name: "G2 Esports",
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/G2_Esports_logo.svg/1200px-G2_Esports_logo.svg.png"
      },
      result: "W",
      score: "2-1",
      date: "2024-09-01",
      tournament: "BLAST Premier Fall",
      maps: ["Mirage", "Dust2", "Overpass"]
    }
  ],
  socialMedia: {
    twitter: "@redcanids",
    instagram: "@redcanids",
    website: "https://redcanids.com.br"
  }
};
