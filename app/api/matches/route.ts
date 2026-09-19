import { NextResponse } from 'next/server'
export const revalidate = 60

async function getESPN(leagueId: string, leagueName: string){
  try{
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard`, { next: { revalidate: 60 } })
    const data = await res.json()
    return (data.events || []).map((e:any)=>{
      const comp = e.competitions[0]
      const home = comp.competitors.find((c:any)=>c.homeAway==='home')
      const away = comp.competitors.find((c:any)=>c.homeAway==='away')
      const status = e.status.type.name
      let s = "Upcoming"
      if(status==="STATUS_IN_PROGRESS") s="Live"
      if(status==="STATUS_FINAL") s="FT"
      const score = `${home.score ?? 0}-${away.score ?? 0}`
      let pred = Math.random() > 0.6 ? "1" : Math.random() > 0.5 ? "2" : "X"
      let txt = pred==="1" ? "Home Win" : pred==="2" ? "Away Win" : "Draw"
      return {
        id: e.id,
        league: leagueName,
        home: home.team.displayName,
        away: away.team.displayName,
        score: s==="Upcoming" ? "vs" : score,
        status: s,
        time: e.status.displayClock || e.status.type.shortDetail || "",
        date: new Date(e.date).toLocaleDateString(),
        prediction: pred,
        predText: txt,
        confidence: Math.floor(65 + Math.random()*20)
      }
    })
  }catch{ return [] }
}

export async function GET(){
  const [epl, laliga, seriea, bundes, ligue1, ucl] = await Promise.all([
    getESPN("eng.1","Premier League"),
    getESPN("esp.1","LaLiga"),
    getESPN("ita.1","Serie A"),
    getESPN("ger.1","Bundesliga"),
    getESPN("fra.1","Ligue 1"),
    getESPN("uefa.champions","Champions League"),
  ])
  let all = [...epl, ...laliga, ...seriea, ...bundes, ...ligue1, ...ucl]
  if(all.length===0){
    all = [{ id: "1", league: "Info", home: "No BIG games today", away: "Season break / No fixtures", score: "vs", status: "Upcoming", time: "Check back tomorrow", date: new Date().toDateString(), prediction: "X", predText: "-", confidence: 0 }]
  }
  return NextResponse.json({ matches: all })
}
