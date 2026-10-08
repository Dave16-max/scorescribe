import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const API_KEY = process.env.API_FOOTBALL_KEY

async function getTeamId(name: string){
  try{
    const r = await fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(name)}`, {
      headers: { "x-apisports-key": API_KEY! }, cache: 'no-store'
    })
    const d = await r.json()
    return d.response?.[0]?.team?.id || null
  }catch{ return null }
}
async function getH2H(hId:number, aId:number){
  try{
    const r = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${hId}-${aId}&last=5`, {
      headers: { "x-apisports-key": API_KEY! }, cache: 'no-store'
    })
    const d = await r.json()
    return d.response || []
  }catch{ return [] }
}
function analyze(h2h:any[]){
  if(!h2h.length) return null
  let btts=0, o25=0, o15=0
  h2h.forEach((m:any)=>{
    const hg=m.goals?.home||0, ag=m.goals?.away||0
    if(hg>0&&ag>0) btts++
    if(hg+ag>2.5) o25++
    if(hg+ag>1.5) o15++
  })
  return {btts:btts/h2h.length, o25:o25/h2h.length, o15:o15/h2h.length}
}
function pick(s:any){
  if(!s) return {name:"Over 1.5 Goals",odd:"1.28",conf:75}
  if(s.btts>=0.8) return {name:"BTTS Yes",odd:"1.75",conf:84}
  if(s.o15>=0.8) return {name:"Over 1.5 Goals",odd:"1.28",conf:89}
  if(s.o25>=0.6) return {name:"Over 2.5 Goals",odd:"1.90",conf:80}
  return {name:"X2 - Draw or Away",odd:"1.65",conf:82}
}
function checkWon(tipName:string, hs:number, as:number): boolean{
  if(hs==null||as==null) return false
  if(tipName.includes("BTTS Yes")) return hs>0&&as>0
  if(tipName.includes("Over 1.5")) return hs+as>1.5
  if(tipName.includes("Over 2.5")) return hs+as>2.5
  if(tipName.includes("X2")) return as>=hs
  if(tipName.includes("Over 210")) return hs+as>210.5
  return false
}

export async function GET(){
  const now = new Date()
  const startOfToday = new Date(); startOfToday.setHours(0,0,0,0)
  let all:any[] = []

  const fbLeagues = [
    {espn:"eng.1", name:"Premier League"},
    {espn:"esp.1", name:"LaLiga"},
    {espn:"ita.1", name:"Serie A"},
    {espn:"ger.1", name:"Bundesliga"},
    {espn:"fra.1", name:"Ligue 1"},
  ]
  for(const lg of fbLeagues){
    try{
      const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.espn}/scoreboard`, {cache:'no-store'})
      const d = await r.json()
      for(const e of (d.events||[])){
        const eventDate = new Date(e.date)
        const isFinished = e.status?.type?.completed===true
        if(!isFinished && eventDate < startOfToday) continue
        if(isFinished && eventDate.getTime() < now.getTime() - 24*60*60*1000) continue
        const comps = e.competitions?.[0]?.competitors||[]
        const homeComp = comps.find((c:any)=>c.homeAway==="home")||comps[1]
        const awayComp = comps.find((c:any)=>c.homeAway==="away")||comps[0]
        all.push({
          home:homeComp?.team?.displayName||"Home",
          away:awayComp?.team?.displayName||"Away",
          league:lg.name, sport:"Football",
          rawDate:e.date, eventDate, isFinished,
          homeScore:parseInt(homeComp?.score), awayScore:parseInt(awayComp?.score)
        })
      }
    }catch{}
  }

  // BASKETBALL - ADD BACK
  try{
    const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`, {cache:'no-store'})
    const d = await r.json()
    for(const e of (d.events||[])){
      const eventDate = new Date(e.date)
      const isFinished = e.status?.type?.completed===true
      if(!isFinished && eventDate < startOfToday) continue
      if(isFinished && eventDate.getTime() < now.getTime() - 24*60*60*1000) continue
      const comps = e.competitions?.[0]?.competitors||[]
      const homeComp = comps.find((c:any)=>c.homeAway==="home")||comps[1]
      const awayComp = comps.find((c:any)=>c.homeAway==="away")||comps[0]
      all.push({
        home:homeComp?.team?.displayName||"Home",
        away:awayComp?.team?.displayName||"Away",
        league:"NBA", sport:"Basketball",
        rawDate:e.date, eventDate, isFinished,
        homeScore:parseInt(homeComp?.score), awayScore:parseInt(awayComp?.score)
      })
    }
  }catch{}

  let processed:any[] = []
  for(let i=0;i<all.length;i++){
    const m = all[i]
    let tip:any = m.sport==="Basketball"? {name:"Over 210.5 Points",odd:"1.85",conf:83} : {name:"Over 1.5 Goals",odd:"1.28",conf:75}
    let realH2H=false, h2hCount=0
    if(m.sport==="Football" && API_KEY && i<5 &&!m.isFinished){
      try{
        const hid=await getTeamId(m.home); const aid=await getTeamId(m.away)
        if(hid&&aid){ const h2h=await getH2H(hid,aid); const stats=analyze(h2h); if(stats) tip=pick(stats); realH2H=h2h.length>0; h2hCount=h2h.length }
      }catch{}
    }
    if(m.isFinished){
      const won = checkWon(tip.name, m.homeScore, m.awayScore)
      if(m.sport==="Football" &&!won) continue
      processed.push({
        home:m.home,away:m.away,league:m.league,sport:m.sport,
        rawDate:m.rawDate,
        time:`FT ${isNaN(m.homeScore)?0:m.homeScore}-${isNaN(m.awayScore)?0:m.awayScore}`,
        tip,realH2H,h2hCount,won: won? true:null, status:"finished"
      })
    }else{
      processed.push({
        home:m.home,away:m.away,league:m.league,sport:m.sport,
        rawDate:m.rawDate,
        time:new Date(m.rawDate).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})+" WAT",
        tip,realH2H,h2hCount,won:null,status:"upcoming"
      })
    }
  }

  processed.sort((a,b)=> new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
  return NextResponse.json(processed.slice(0,20), {headers:{'Cache-Control':'no-store'}})
    }
