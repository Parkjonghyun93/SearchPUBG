import { NextResponse } from 'next/server';

export const runtime = 'nodejs';            // Edge 이슈 회피
export const dynamic = 'force-dynamic';     // 캐시 억제(선택)

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',                 // 같은 오리진에서만 쓰면 제거 가능
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const nickname = searchParams.get('nickname');
  const platform = searchParams.get('platform') || 'kakao';

  const API_KEY = process.env.PUBG_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }
  if (!nickname) {
    return NextResponse.json({ error: 'Nickname is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
        `https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${encodeURIComponent(nickname)}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: 'application/vnd.api+json',
          },
          cache: 'no-store',
        }
    );

    if (!response.ok) {
      // 그대로 전달해도 되고 메시지만 가공해도 됨
      return new Response(await response.text(), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    if (!data?.data?.length) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const player = data.data[0];

    // 클라이언트가 기대하는 PlayerInfo 형태로 반환
    return NextResponse.json(
        { id: player.id, name: player.attributes.name, platform },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
    );
  } catch (err) {
    console.error('Player search error:', err);
    return NextResponse.json({ error: 'Failed to fetch player data' }, { status: 500 });
  }
}
