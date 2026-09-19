import { NextResponse } from 'next/server'
export const revalidate = 30

function getTodayESPN(){
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth()+1).padStart(2,'0')
  const d = String(now.getDate()).padStart(2,'0')
  return `${y}${m}${d}`
}

function makeBetTips(home: string, away: string){
  const r = Math.random()
  // simple logic to make it look smart for bettors
  const tips = []
  if(r > 0.3) tips.push({ market: "Over 1.5 Goals", pick: "YES", odd: "1.25", conf: 85 })
  if(r > 0.5) tips.push({ market: "Over 2.5 Goals", pick: r>0.6 ? "YES" : "NO", odd: r>0.6 ? "1.85" : "1.90", conf: 72 })
  if(r > 0.2) tips.push({ market: "BTTS", pick: Math.random()>0.5 ? "YES" : "NO", odd: "1.80", conf: 70 })
  tips.push({ market: "HT Over 0.5", pick: "YES", odd: "1.35", conf: 78 })
  tips.push({ market: "Double Chance", pick: r>0.66 ? "1X" : r>0.33 ? "X2" : "12", odd: "1.40", conf: 80 })
  tips.push({ market: "1X2", pick: r>0.66 ? "1" : r>0.33 ? "2" : "X", odd: r>0.66 ? "2.10" : "2.50", conf: 68 })
  return tips
}

async function getESPN(leagueId: string, leagueName: string){
  try{
    const dateStr = getTodayESPN()
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard?dates=${dateStr}`, { next: { revalidate: 30 }, cache: 'no-store' })
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
      return {
        id: e.id,
        league: leagueName,
        home: home.team.displayName,
        away: away.team.displayName,
        score: s==="Upcoming" ? "vs" : score,
        status: s,
        time: e.status.displayClock || e.status.type.shortDetail || "Today",
        date: new Date().toLocaleDateString(),
        tips: makeBetTips(home.team.displayName, away.team.displayName)
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
  return NextResponse.json({ matches: all, fetchedFor: getTodayESPN() })
}
