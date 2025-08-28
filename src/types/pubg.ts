export interface PlayerSearchForm {
  platform: 'kakao';
  nickname: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  platform: string;
}

export interface MatchData {
  id: string;
  type: string;
  gameMode: string;
  mapName: string;
  duration: number;
  createdAt: string;
  stats: {
    kills: number;
    damage: number;
    deaths: number;
    assists: number;
    placement: number;
    dbno?: number; // Down But Not Out (기절)
  };
  teammates?: TeammateInfo[];
  weapons?: WeaponStats[];
  throwables?: ThrowableStats[];
}

export interface WeaponStats {
  name: string;
  kills: number;
  damage: number;
  shots: number;
  hits: number;
}

export interface ThrowableStats {
  name: string;
  count: number;
  damage?: number;
}

export interface TeammateInfo {
  playerId: string;
  name: string;
  kills: number;
  damage: number;
  assists: number;
  deaths: number;
  placement: number;
  weapons?: WeaponStats[];
  throwables?: ThrowableStats[];
  dbno?: number; // Down But Not Out (기절)
}

export interface PlayerStats {
  totalKills: number;
  totalDamage: number;
  totalDeaths: number;
  totalAssists: number;
  averageKills: number;
  averageDamage: number;
  averageDeaths: number;
  averageAssists: number;
  totalMatches: number;
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  gameMode?: string;
  mapName?: string;
}

export interface TeammateStats {
  name: string;
  playerId: string;
  matchCount: number;
  totalKills: number;
  totalAssists: number;
  totalDamage: number;
  averageKills: number;
  averageAssists: number;
  averageDamage: number;
}

export interface MatchesResponse {
  matches: MatchData[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}