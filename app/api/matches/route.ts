import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Major leagues + European competitions
    // 39 = Premier League, 140 = LaLiga, 135 = Serie A, 78 = Bundesliga, 61 = Ligue 1
    // 2 = Champions League, 3 = Europa League, 848 = Conference League
    const leagueIds = [39, 140, 135, 78, 61, 2, 3, 848]
    let allFixtures: any[] = []

    for (const id of leagueIds) {
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&league=${id}&season=2024`, {
        headers: {
          'x-apisports-key': process.env.API_FOOTBALL_KEY!
        },
        next: { revalidate: 21600 } // 6 hours cache - saves API calls
      })
      const data = await res.json()
      if (data.response && data.response.length > 0) {
        allFixtures = [...allFixtures,...data.response]
      }
    }

    const formatted = allFixtures.map((f: any) => ({
      home: f.teams.home.name,
      away: f.teams.away.name,
      league: f.league.name.includes("Champions")? "Champions League"
              : f.league.name.includes("Europa League")? "Europa League"
              : f.league.name.includes("Conference")? "Conference League"
              : f.league.name,
      time: new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + " GMT",
      sport: "Football"
    }))

    return NextResponse.json(formatted.slice(0, 20))
  } catch (error) {
    console.log("API Error:", error)
    return NextResponse.json([])
  }
}
