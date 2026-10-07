import { NextResponse } from 'next/server'

const API_KEY = process.env.API_FOOTBALL_KEY

async function getTeamId(name: string){
  try{
    const r = await fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(name)}`, {
      headers: { "x-apisports-key": API_KEY! },
      next: { revalidate: 86400 }
    })
    const d = await r.json()
    return d.response?.[0]?.team?.id || null
  }catch{ return null }
}
async function getH2H(hId:number, aId:number){
  try{
    const r = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${hId}-${aId}&last=5`, {
      headers: { "x-apisports-key": API_KEY! }
    })
    const d = await r.json()
    return d.response || []
  }catch{ return [] }
}
function analyze(h2h:any[]){
  if(!h2h.length) return null
  let btts=0, o25=0, o15=0, fh=0
  h2h.forEach((m:any)=>{
    const hg=m.goals?.home||0, ag=m.goals?.away||0
    if(hg>0&&ag>0) btts++
    if(hg+ag>2.5) o25++
    if(hg+ag>1.5) o15++
    if((m.score?.halftime?.home||0)+(m.score?.halftime?.away||0)>0) fh++
  })
  return {btts:btts/h2h.length, o25:o25/h2h.length, o15:o15/h2h.length, fh:fh/h2h.length}
}
function pick(s:any){
  if(!s) return {name:"Over 1.5 Goals",odd:"1.28",conf:75}
  if(s.btts>=0.8) return {name:"BTTS Yes",odd:"1.75",conf:84}
  if(s.fh>=0.8) return {name:"1st Half Over 0.5",odd:"1.35",conf:87}
  if(s.o15>=0.8) return {name:"Over 1.5 Goals",odd:"1.28",conf:89}
  if(s.o25>=0.6) return {name:"Over 2.5 Goals",odd:"1.90",conf:80}
  return {name:"X2 - Draw or Away",odd:"1.65",conf:82}
}

export async function GET(){
  let all:any[] = []
  // FOOTBALL
  const fbLeagues = [
    {espn:"eng.1", name:"Premier League"},
    {espn:"esp.1", name:"LaLiga"},
    {espn:"ita.1", name:"Serie A"},
    {espn:"ger.1", name:"Bundesliga"},
    {espn:"fra.1", name:"Ligue 1"},
  ]
  for(const lg of fbLeagues){
    try{
      const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.espn}/scoreboard`, {next:{revalidate:3600}})
      const d = await r.json()
      d.events?.slice(0,3).forEach((e:any)=>{
        all.push({
          home:e.competitions[0].competitors[1]?.team?.displayName || "Home",
          away:e.competitions[0].competitors[0]?.team?.displayName || "Away",
          league: lg.name,
          time: new Date(e.date).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})+" WAT",
          sport:"Football"
        })
      })
    }catch{}
  }
  // BASKETBALL
  try{
    const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard`, {next:{revalidate:3600}})
    const d = await r.json()
    d.events?.slice(0,5).forEach((e:any)=>{
      all.push({
        home:e.competitions[0].competitors[1]?.team?.displayName || "Home",
        away:e.competitions[0].competitors[0]?.team?.displayName || "Away",
        league:"NBA",
        time: new Date(e.date).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})+" WAT",
        sport:"Basketball"
      })
    })
  }catch{}

  // ADD REAL H2H FOR FOOTBALL ONLY (first 5 to save API)
  const final = await Promise.all(all.map(async (m,i)=>{
    if(m.sport!=="Football" || i>4 ||!API_KEY) return m
    try{
      const hid = await getTeamId(m.home)
      const aid = await getTeamId(m.away)
      if(!hid||!aid) return m
      const h2h = await getH2H(hid,aid)
      const stats = analyze(h2h)
      return {...m, tip:pick(stats), realH2H:h2h.length>0, h2hCount:h2h.length}
    }catch{ return m }
  }))

  return NextResponse.json(final)
}
