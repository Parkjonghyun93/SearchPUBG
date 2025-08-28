import { MatchData, PlayerInfo, MatchesResponse } from '@/types/pubg';

const PUBG_API_BASE = 'https://api.pubg.com/shards';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const VERCEL_API_BASE = '/api'; // Vercel Functions
const API_KEY = process.env.NEXT_PUBLIC_PUBG_API_KEY || '';

// API 호출 방식 결정
const getApiMethod = () => {
  const useVercel = process.env.NEXT_PUBLIC_USE_VERCEL_API === 'true';
  const useCorsProxy = process.env.NEXT_PUBLIC_USE_CORS_PROXY === 'true';

  return 'vercel';
  // if (useVercel) return 'vercel';
  // if (useCorsProxy) return 'cors-proxy';
  // return 'direct';
};

// CORS 우회를 위한 프록시 URL 생성
const getProxiedUrl = (url: string): string => {
  const method = getApiMethod();
  
  switch (method) {
    case 'cors-proxy':
      return `${CORS_PROXY}${url}`;
    case 'direct':
    default:
      return url;
  }
};

// PUBG API 응답 타입 정의
interface MatchReference {
  type: string;
  id: string;
}

interface PlayerApiData {
  data: {
    id: string;
    attributes: {
      name: string;
    };
    relationships: {
      matches: {
        data: MatchReference[];
      };
    };
  };
}

interface ParticipantStats {
  playerId: string;
  name: string;
  kills: number;
  damageDealt: number;
  assists: number;
  deathType: string;
  winPlace: number;
}

interface Participant {
  type: string;
  id: string;
  attributes: {
    stats: ParticipantStats;
  };
}

interface RosterParticipant {
  id: string;
}

interface Roster {
  type: string;
  relationships: {
    participants: {
      data: RosterParticipant[];
    };
  };
}

interface MatchAttributes {
  gameMode: string;
  mapName: string;
  duration: number;
  createdAt: string;
}

interface Match {
  id: string;
  attributes: MatchAttributes;
}

interface MatchApiData {
  data: Match;
  included: (Participant | Roster)[];
}

export class PubgApiService {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/vnd.api+json'
    };
  }

  async searchPlayerByNickname(platform: 'kakao', nickname: string): Promise<PlayerInfo> {
    const method = getApiMethod();
    
    try {
      let response: Response;
      
      if (method === 'vercel') {
        // Vercel Functions 사용
        response = await fetch(
          `${VERCEL_API_BASE}/pubg-player?nickname=${encodeURIComponent(nickname)}&platform=${platform}`
        );
      } else {
        // Direct API 또는 CORS Proxy 사용
        if (!API_KEY) {
          throw new Error('PUBG API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
        }
        
        const url = `${PUBG_API_BASE}/${platform}/players?filter[playerNames]=${encodeURIComponent(nickname)}`;
        response = await fetch(
          getProxiedUrl(url),
          { headers: this.getHeaders() }
        );
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('플레이어를 찾을 수 없습니다. 닉네임을 다시 확인해주세요.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Vercel API 응답 처리
      if (method === 'vercel') {
        return data as PlayerInfo;
      }
      
      // Direct API 응답 처리
      if (!data.data || data.data.length === 0) {
        throw new Error('해당 닉네임의 플레이어를 찾을 수 없습니다.');
      }
      
      const player = data.data[0];
      
      return {
        id: player.id,
        name: player.attributes.name,
        platform: platform
      };
    } catch (error) {
      console.error('Player search error:', error);
      throw error;
    }
  }

  async getPlayerMatches(playerId: string, platform: 'kakao', offset: number = 0, limit: number = 20): Promise<MatchesResponse> {
    const method = getApiMethod();
    
    try {
      let response: Response;
      
      if (method === 'vercel') {
        // Vercel Functions 사용
        response = await fetch(
          `${VERCEL_API_BASE}/pubg-matches?playerId=${encodeURIComponent(playerId)}&platform=${platform}&offset=${offset}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error('매치 데이터를 가져올 수 없습니다.');
        }
        
        const data = await response.json();
        return data as MatchesResponse;
      }
      
      // Direct API 또는 CORS Proxy 사용
      if (!API_KEY) {
        throw new Error('PUBG API 키가 설정되지 않았습니다.');
      }

      // Step 1: Get player matches list
      const playerUrl = `${PUBG_API_BASE}/${platform}/players/${playerId}`;
      const playerResponse = await fetch(
        getProxiedUrl(playerUrl),
        { headers: this.getHeaders() }
      );
      
      if (!playerResponse.ok) {
        throw new Error('매치 데이터를 가져올 수 없습니다.');
      }
      
      const playerData = await playerResponse.json() as PlayerApiData;
      const allMatchIds = playerData.data.relationships.matches.data.map((match: MatchReference) => match.id);
      
      // Apply pagination
      const startIndex = offset;
      const endIndex = Math.min(startIndex + limit, allMatchIds.length);
      const paginatedMatchIds = allMatchIds.slice(startIndex, endIndex);
      
      // Step 2: Get detailed match data
      const matchPromises = paginatedMatchIds.map(async (matchId: string) => {
        try {
          const matchUrl = `${PUBG_API_BASE}/${platform}/matches/${matchId}`;
          const matchResponse = await fetch(
            getProxiedUrl(matchUrl),
            { headers: this.getHeaders() }
          );
          
          if (!matchResponse.ok) return null;
          
          const matchData = await matchResponse.json() as MatchApiData;
          const match = matchData.data;
          
          const participants = matchData.included.filter((item): item is Participant => item.type === 'participant');
          const playerParticipant = participants.find((p: Participant) => 
            p.attributes.stats.playerId === playerId
          );
          
          if (!playerParticipant) return null;
          
          const stats = playerParticipant.attributes.stats;
          
          // Get teammates from the same team
          const rosters = matchData.included.filter((item): item is Roster => item.type === 'roster');
          const playerRoster = rosters.find((roster: Roster) => 
            roster.relationships.participants.data.some((p: RosterParticipant) => p.id === playerParticipant.id)
          );
          
          interface TeammateData {
            playerId: string;
            name: string;
            kills: number;
            damage: number;
            assists: number;
            deaths: number;
            placement: number;
          }
          
          let teammates: TeammateData[] = [];
          if (playerRoster) {
            const teammateParticipantIds = playerRoster.relationships.participants.data
              .map((p: RosterParticipant) => p.id)
              .filter((id: string) => id !== playerParticipant.id);
              
            teammates = participants
              .filter((p: Participant) => teammateParticipantIds.includes(p.id))
              .map((teammate: Participant) => ({
                playerId: teammate.attributes.stats.playerId,
                name: teammate.attributes.stats.name,
                kills: teammate.attributes.stats.kills,
                damage: Math.round(teammate.attributes.stats.damageDealt),
                assists: teammate.attributes.stats.assists,
                deaths: teammate.attributes.stats.deathType !== 'alive' ? 1 : 0,
                placement: teammate.attributes.stats.winPlace
              }));
          }
          
          return {
            id: match.id,
            type: match.attributes.gameMode,
            gameMode: match.attributes.gameMode,
            mapName: match.attributes.mapName,
            duration: match.attributes.duration,
            createdAt: match.attributes.createdAt,
            stats: {
              kills: stats.kills,
              damage: Math.round(stats.damageDealt),
              deaths: stats.deathType !== 'alive' ? 1 : 0,
              assists: stats.assists,
              placement: stats.winPlace
            },
            teammates: teammates
          };
        } catch (error) {
          console.error('Match details error:', error);
          return null;
        }
      });
      
      const matches = await Promise.all(matchPromises);
      const validMatches = matches
        .filter(match => match !== null)
        .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()) as MatchData[];
      
      return {
        matches: validMatches,
        pagination: {
          offset: offset,
          limit: limit,
          total: allMatchIds.length,
          hasMore: endIndex < allMatchIds.length
        }
      };
    } catch (error) {
      console.error('Matches fetch error:', error);
      throw error;
    }
  }

  generateMockPlayerInfo(nickname: string): PlayerInfo {
    return {
      id: `player_${Date.now()}`,
      name: nickname,
      platform: 'kakao'
    };
  }

  generateMockData(count: number = 10): MatchData[] {
    const gameModes = ['squad', 'duo', 'solo'];
    const maps = ['Erangel', 'Miramar', 'Sanhok', 'Karakin'];
    
    return Array.from({ length: count }, (_, index) => ({
      id: `match-${index + 1}`,
      type: gameModes[Math.floor(Math.random() * gameModes.length)],
      gameMode: gameModes[Math.floor(Math.random() * gameModes.length)],
      mapName: maps[Math.floor(Math.random() * maps.length)],
      duration: 1800 + Math.random() * 1200,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      stats: {
        kills: Math.floor(Math.random() * 15),
        damage: Math.floor(Math.random() * 2000 + 100),
        deaths: Math.random() > 0.3 ? 1 : 0,
        assists: Math.floor(Math.random() * 8),
        placement: Math.floor(Math.random() * 100) + 1
      }
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const pubgApi = new PubgApiService();