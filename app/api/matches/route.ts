import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return NextResponse.json([]);

  const today = new Date().toISOString().split('T')[0];

  try {
    // Get today's real fixtures
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 3600 }
    });
    const data = await res.json();

    if (!data.response || data.response.length === 0) {
      // If no games today, get tomorrow
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const res2 = await fetch(`https://v3.football.api-sports.io/fixtures?date=${tomorrow}`, {
        headers: { "x-apisports-key": key },
      });
      const data2 = await res2.json();
      const fixtures = (data2.response || []).slice(0, 15);
      return NextResponse.json(fixtures.map((f:any) => ({
        home: f.teams.home.name,
        away: f.teams.away.name,
        league: f.league.name,
        time: new Date(f.fixture.date).toUTCString().split(' ')[4].slice(0,5) + ' GMT',
        sport: 'Football',
        h2hGoals: f.goals
      })));
    }

    const fixtures = data.response.slice(0, 20).map((f:any) => ({
      home: f.teams.home.name,
      away: f.teams.away.name,
      league: f.league.name,
      time: new Date(f.fixture.date).toUTCString().split(' ')[4].slice(0,5) + ' GMT',
      sport: 'Football'
    }));

    return NextResponse.json(fixtures);
  } catch (e) {
    return NextResponse.json([]);
  }
}
