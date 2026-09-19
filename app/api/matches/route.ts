import { NextResponse } from 'next/server'
export const revalidate = 30

function getTodayESPN(){
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
}

// SMART single prediction
function makeSingleTip(home:string, away:string){
  const r = Math.random()
  const tips = [
    { market: "Match Result", pick: `Home - ${home}`, odd: "2.10", conf: 72, desc: "Home Advantage" },
    { market: "Match Result", pick: `Away - ${away}`, odd: "2.40", conf: 70, desc: "Away Form" },
    { market: "Double Chance", pick: "Home or Draw (1X)", odd: "1.35", conf: 82, desc: "Safe pick" },
    { market: "Double Chance", pick: "Away or Draw (X2)", odd: "1.40", conf: 80, desc: "Safe pick" },
    { market: "Goals", pick: "Over 1.5 Goals", odd: "1.28", conf: 88, desc: "High scoring expected" },
    { market: "Combo", pick: `Home & Over 1.5`, odd: "2.05", conf: 75, desc: `${home} to win with goals` },
    { market: "Combo", pick: `Away & Over 1.5`, odd: "2.60", conf: 73, desc: `${away} to win with goals` },
    { market: "BTTS", pick: "BTTS Yes", odd: "1.85", conf: 68, desc: "Both teams scoring" },
  ]
  // pick one with high conf bias
  const weighted = tips.sort(()=>0.5-Math.random()).sort((a,b)=>b.conf-a.conf)
  return [weighted[0]] // ONLY ONE TIP
}

async function getESPN(leagueId:string, leagueName:string){
  try{
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard?dates=${getTodayESPN()}`, { next:{revalidate:30} })
    const data = await res.json()
    return (data.events||[]).map((e:any)=>{
      const comp = e.competitions[0]
      const home = comp.competitors.find((c:any)=>c.homeAway==='home')
      const away = comp.competitors.find((c:any)=>c.homeAway==='away')
      const s = e.status.type.name==="STATUS_IN_PROGRESS"?"Live": e.status.type.name==="STATUS_FINAL"?"FT":"Upcoming"
      return {
        id: e.id,
        league: leagueName,
        home: home.team.displayName,
        away: away.team.displayName,
        score: s==="Upcoming"?"vs":`${home.score??0}-${away.score??0}`,
        status: s,
        time: e.status.type.shortDetail||"Today",
        tip: makeSingleTip(home.team.displayName, away.team.displayName)[0] // SINGLE TIP
      }
    })
  }catch{ return [] }
}

export async function GET(){
  const [epl, laliga, seriea, bundes, ligue1] = await Promise.all([
    getESPN("eng.1","Premier League"),
    getESPN("esp.1","LaLiga"),
    getESPN("ita.1","Serie A"),
    getESPN("ger.1","Bundesliga"),
    getESPN("fra.1","Ligue 1"),
  ])
  return NextResponse.json({ matches: [...epl,...laliga,...seriea,...bundes,...ligue1] })
         }
