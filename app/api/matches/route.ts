import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&league=39&league=140&league=135&league=78&league=61&league=2&season=2024`, {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
      next: { revalidate: 21600 }
    })
    const data = await res.json()
    const formatted = (data.response || []).slice(0,10).map((f:any)=>({
      home: f.teams.home.name,
      away: f.teams.away.name,
      league: f.league.name,
      time: new Date(f.fixture.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) + " GMT • Today",
      sport: "Football"
    }))
    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([])
  }
}
