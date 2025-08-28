import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS = (origin) => {
  const h = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  // credentials 안 쓰면 '*', 쓰면 정확한 origin + Allow-Credentials
  h['Access-Control-Allow-Origin'] = origin ?? '*';
  // h['Access-Control-Allow-Credentials'] = 'true'; // 필요 시
  return h;
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS(origin)
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const playerId = searchParams.get('playerId');
  const platform = searchParams.get('platform') || 'kakao';
  const offset = Number(searchParams.get('offset') || 0);
  const limit  = Number(searchParams.get('limit')  || 20);

  const API_KEY = process.env.PUBG_API_KEY;
  if (!API_KEY) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  if (!playerId) return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });

  try {
    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      Accept: 'application/vnd.api+json',
    };

    // 1) 플레이어 → 매치 ID 목록
    const pRes = await fetch(`https://api.pubg.com/shards/${platform}/players/${playerId}`, {
      headers,
      cache: 'no-store',
    });
    if (!pRes.ok) {
      return new Response(await pRes.text(), {
        status: pRes.status,
        headers: { 'Content-Type': 'application/json', ...CORS(origin) },
      });
    }

    const pJson = await pRes.json();
    const allMatchIds = pJson?.data?.relationships?.matches?.data?.map(m => m.id) ?? [];

    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, allMatchIds.length);
    const paginatedMatchIds = allMatchIds.slice(startIndex, endIndex);

    // 2) 매치 상세
    const matchPromises = paginatedMatchIds.map(async (matchId) => {
      const mRes = await fetch(`https://api.pubg.com/shards/${platform}/matches/${matchId}`, {
        headers,
        cache: 'no-store',
      });
      if (!mRes.ok) return null;

      const matchData = await mRes.json();
      const match = matchData.data;

      const participants = matchData.included.filter((x) => x.type === 'participant');
      const playerParticipant = participants.find((p) => p.attributes?.stats?.playerId === playerId);
      if (!playerParticipant) return null;

      const s = playerParticipant.attributes.stats;

      // 같은 팀(로스터) 찾기
      const rosters = matchData.included.filter((x) => x.type === 'roster');
      const playerRoster = rosters.find((r) =>
          r.relationships?.participants?.data?.some((p) => p.id === playerParticipant.id)
      );

      let teammates = [];
      if (playerRoster) {
        const teammateIds = playerRoster.relationships.participants.data
            .map((p) => p.id)
            .filter((id) => id !== playerParticipant.id);

        teammates = participants
            .filter((p) => teammateIds.includes(p.id))
            .map((tm) => ({
              playerId: tm.attributes.stats.playerId,
              name: tm.attributes.stats.name,
              kills: tm.attributes.stats.kills,
              damage: Math.round(tm.attributes.stats.damageDealt),
              assists: tm.attributes.stats.assists,
              deaths: tm.attributes.stats.deathType !== 'alive' ? 1 : 0,
              placement: tm.attributes.stats.winPlace,
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
          kills: s.kills,
          damage: Math.round(s.damageDealt),
          deaths: s.deathType !== 'alive' ? 1 : 0,
          assists: s.assists,
          placement: s.winPlace,
        },
        teammates,
      };
    });

    const matches = (await Promise.all(matchPromises)).filter(Boolean);
    matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(
        {
          matches,
          pagination: {
            offset,
            limit,
            total: allMatchIds.length,
            hasMore: endIndex < allMatchIds.length,
          },
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
    );
  } catch (err) {
    console.error('Matches fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch match data' }, { status: 500 });
  }
}
