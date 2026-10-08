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
function checkWon(tipName:string, homeScore:number, awayScore:number): boolean | null{
  if(homeScore==null||awayScore==null) return null
  const total = homeScore+awayScore
  if(tipName.includes("BTTS Yes")) return homeScore>0 && awayScore>0
  if(tipName.includes("Over 1.5")) return total>1.5
  if(tipName.includes("Over 2.5")) return total>2.5
  if(tipName.includes("X2")) return awayScore>=homeScore
  return null
}

export async function GET(){
  let all:any[] = []
  const now = new Date()

  const fbLeagues = [
    {espn:"eng.1", name:"Premier League"},
    {espn:"esp.1", name:"LaLiga"},
    {espn:"ita.1", name:"Serie A"},
    {espn:"ger.1", name:"Bundesliga"},
    {espn:"fra.1", name:"Ligue 1"},
  ]
  for(const lg of fbLeagues){
    try{
      const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.espn}/scoreboard`, {next:{revalidate:60}})
      const d = await r.json()
      d.events?.forEach((e:any)=>{
        const eventDate = new Date(e.date)
        const isFinished = e.status?.type?.completed === true

        const comps = e.competitions?.[0]?.competitors || []
        const homeScore = parseInt(comps.find((c:any)=>c.homeAway==="home")?.score || comps[1]?.score)
        const awayScore = parseInt(comps.find((c:any)=>c.homeAway==="away")?.score || comps[0]?.score)

        // TEMP store raw for won check
        all.push({
          home:e.competitions[0].competitors[1]?.team?.displayName || "Home",
          away:e.competitions[0].competitors[0]?.team?.displayName || "Away",
          league: lg.name,
          date: eventDate.toISOString().split('T')[0],
          rawDate: e.date,
          eventDate,
          isFinished,
          homeScore: isNaN(homeScore)? null : homeScore,
          awayScore: isNaN(awayScore)? null : awayScore,
          sport:"Football",
        })
      })
    }catch{}
  }

  // PROCESS AND FILTER
  let processed:any[] = []
  for(const m of all){
    // if not finished and time don pass 2hrs (postponed/cancelled) -> skip
    if(!m.isFinished && m.eventDate.getTime() < now.getTime() - 2*60*60*1000) continue

    let tip = {name:"Over 1.5 Goals",odd:"1.28",conf:75}
    let realH2H = false
    let h2hCount = 0

    if(m.sport==="Football" && API_KEY && processed.length<5){
      try{
        const hid = await getTeamId(m.home)
        const aid = await getTeamId(m.away)
        if(hid&&aid){
          const h2h = await getH2H(hid,aid)
          const stats = analyze(h2h)
          tip = pick(stats)
          realH2H = h2h.length>0
          h2hCount = h2h.length
        }
      }catch{}
    }

    const won = m.isFinished? checkWon(tip.name, m.homeScore, m.awayScore) : null

    // LOGIC YOU WANT:
    // 1. Upcoming -> show
    // 2. Finished + WON -> show for 24hrs with tick
    // 3. Finished + LOST or null -> comot immediately
    if(m.isFinished){
      if(won!==true) continue // comot LOST instantly
      if(m.eventDate.getTime() < now.getTime() - 24*60*60*1000) continue // WON don old pass 24hrs, comot
    }

    processed.push({
      home:m.home,
      away:m.away,
      league:m.league,
      date:m.date,
      rawDate:m.rawDate,
      time: m.isFinished? `FT ${m.homeScore}-${m.awayScore} • WON` : new Date(m.rawDate).toLocaleTimeString("en-NG",{hour:"2-digit",minute:"2-digit"})+" WAT",
      sport:m.sport,
      tip,
      realH2H,
      h2hCount,
      won: m.isFinished? true : null, // only true after final result
      status: m.isFinished? "finished":"upcoming"
    })
  }

  processed.sort((a,b)=> new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
  return NextResponse.json(processed.slice(0,12))
}
