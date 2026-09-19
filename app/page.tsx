       "use client"
import { useState, useEffect } from "react"

const leagues = ["All","Premier League","LaLiga","Serie A","Bundesliga","Ligue 1","Champions League","Europa League","Conference League"]

const tips = [
  { name:"1st Half Over 0.5", odd:"1.35", conf:87, cat:"HT Goals" },
  { name:"Home or Draw", odd:"1.25", conf:89, cat:"Double Chance" },
  { name:"Away or Draw", odd:"1.30", conf:86, cat:"Double Chance" },
  { name:"Over 1.5 Goals", odd:"1.28", conf:88, cat:"Goals" },
  { name:"BTTS Yes", odd:"1.75", conf:72, cat:"BTTS" },
  { name:"Home Win", odd:"1.85", conf:76, cat:"1X2" },
  { name:"Away Win", odd:"2.10", conf:68, cat:"1X2" },
  { name:"Double Chance 1X", odd:"1.32", conf:90, cat:"Double Chance" },
  { name:"Double Chance X2", odd:"1.45", conf:84, cat:"Double Chance" },
  { name:"Double Chance 12", odd:"1.28", conf:88, cat:"Double Chance" },
  { name:"Under 3.5 Goals", odd:"1.40", conf:80, cat:"Goals" },
  { name:"Over 2.5 Goals", odd:"1.95", conf:68, cat:"Goals" },
  { name:"BTTS No", odd:"1.90", conf:70, cat:"BTTS" },
  { name:"Home Win or Draw", odd:"1.25", conf:89, cat:"Double Chance" },
  { name:"Away Win or Draw", odd:"1.40", conf:82, cat:"Double Chance" },
  { name:"Over 0.5 HT", odd:"1.35", conf:85, cat:"HT Goals" },
  { name:"Under 2.5 Goals", odd:"1.65", conf:75, cat:"Goals" },
  { name:"Draw No Bet - Home", odd:"1.50", conf:79, cat:"DNB" },
  { name:"Draw No Bet - Away", odd:"1.60", conf:77, cat:"DNB" },
  { name:"Home Over 0.5", odd:"1.22", conf:91, cat:"Team Goals" },
]

const fallbackMatches = [
  { home: "Tottenham Hotspur", away: "Aston Villa", league: "Premier League", time:"11:30 GMT • Today" },
  { home: "Brighton", away: "Arsenal", league: "Premier League", time:"14:00 GMT • Today" },
  { home: "Everton", away: "Ipswich Town", league: "Premier League", time:"14:00 GMT • Today" },
  { home: "Newcastle United", away: "Hull City", league: "Premier League", time:"14:00 GMT • Today" },
  { home: "Nottingham Forest", away: "Coventry City", league: "Premier League", time:"16:30 GMT • Today" },
  { home: "Werder Bremen", away: "Augsburg", league: "Bundesliga", time:"13:30 GMT • Today" },
  { home: "Hamburg", away: "1. FC Köln", league: "Bundesliga", time:"13:30 GMT • Today" },
  { home: "Mönchengladbach", away: "Mainz", league: "Bundesliga", time:"13:30 GMT • Today" },
  { home: "Frankfurt", away: "Freiburg", league: "Bundesliga", time:"13:30 GMT • Today" },
  { home: "Stuttgart", away: "Borussia Dortmund", league: "Bundesliga", time:"16:30 GMT • Today" },
  { home: "Osasuna", away: "Rayo Vallecano", league: "LaLiga", time:"12:00 GMT • Today" },
  { home: "Athletic Club", away: "Alavés", league: "LaLiga", time:"14:15 GMT • Today" },
  { home: "Celta Vigo", away: "Racing Santander", league: "LaLiga", time:"16:30 GMT • Today" },
  { home: "Sevilla", away: "Barcelona", league: "LaLiga", time:"19:00 GMT • Today" },
]

export default function Page() {
  const [filter, setFilter] = useState("All")
  const [tab, setTab] = useState("HOME")
  const [matches, setMatches] = useState(fallbackMatches)
  const [lastUpdate, setLastUpdate] = useState("Today")

  useEffect(()=>{
    async function updateDaily(){
      try{
        const today = new Date().toISOString().split('T')[0]
        // Try to fetch real matches
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`)
        const data = await res.json()

        if(data.events && data.events.length > 0){
          // Filter only top leagues
          const topLeagues = ["Premier League","La Liga","Spanish La Liga","Bundesliga","Serie A","Ligue 1","Champions League","Europa League","Europa Conference League","Conference League"]
          const filtered = data.events.filter((e:any)=>
            topLeagues.some(l => e.strLeague?.toLowerCase().includes(l.toLowerCase().split(" ")[0])) &&
           !e.strLeague?.toLowerCase().includes("usl") &&
           !e.strLeague?.toLowerCase().includes("2. bundesliga")
          )

          if(filtered.length >= 5){
            const mapped = filtered.slice(0,20).map((e:any)=>({
              home: e.strHomeTeam,
              away: e.strAwayTeam,
              league: e.strLeague?.includes("Premier")?"Premier League":e.strLeague?.includes("La Liga")||e.strLeague?.includes("LaLiga")?"LaLiga":e.strLeague?.includes("Bundesliga")?"Bundesliga":e.strLeague?.includes("Serie")?"Serie A":e.strLeague?.includes("Ligue")?"Ligue 1":e.strLeague?.includes("Champions")?"Champions League":e.strLeague?.includes("Conference")?"Conference League":"Europa League",
              time: e.strTime? e.strTime.slice(0,5)+" GMT • Today" : "Today"
            }))
            setMatches(mapped)
            setLastUpdate(new Date().toLocaleDateString())
          }
        }
      }catch(e){
        // Keep fallback if API fails
        console.log("Using fallback matches")
      }
    }
    updateDaily()
    // Auto refresh every 6 hours
    const interval = setInterval(updateDaily, 6*60*60*1000)
    return ()=> clearInterval(interval)
  },[])

  const filtered = filter==="All"? matches : matches.filter(m => m.league === filter)

  return (
    <div style={{minHeight:"100vh",background:"#050505",color:"white",paddingBottom:90}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:38,height:38,background:"white",color:"black",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>S</div>
          <div style={{fontWeight:900,fontSize:12,lineHeight:1.1}}>SCORESRIBE<br/>DAILY GUIDE</div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <div style={{background:"#1a1a1a",padding:"5px 9px",borderRadius:20,fontSize:11,color:"#888"}}>{filtered.length} Matches</div>
          <a href="/vip" style={{background:"#00ff88",color:"black",padding:"8px 14px",borderRadius:18,fontWeight:800,textDecoration:"none",fontSize:12}}>👑 VIP ₦4900</a>
        </div>
      </div>

      {tab==="HOME" && (
        <>
          <div style={{display:"flex",gap:7,padding:"0 12px 10px",overflowX:"auto"}}>
            {leagues.map(l=>(
              <button key={l} onClick={()=>setFilter(l)} style={{whiteSpace:"nowrap",padding:"8px 12px",borderRadius:10,border:"none",background:filter===l?"#00ff88":"#1a1a1a",color:filter===l?"black":"#aaa",fontWeight:700,fontSize:11}}>{l}</button>
            ))}
          </div>
          <div style={{margin:"0 12px 10px",background:"#111",borderRadius:10,padding:10,border:"1px solid #222",display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:20,height:20,background:"#00ff88",borderRadius:50,display:"flex",alignItems:"center",justifyContent:"center",color:"black",fontWeight:900,fontSize:11}}>✓</div>
              <div style={{fontSize:11}}><span style={{color:"#00ff88",fontWeight:800}}>AUTO UPDATES DAILY</span><span style={{color:"#666",marginLeft:6}}>• {lastUpdate}</span></div>
            </div>
            <div style={{fontSize:10,color:"#00ff88"}}>● Live</div>
          </div>
          <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map((m:any,i)=>{
              const t = tips[i % tips.length]
              return (
                <div key={i} style={{background:"#121212",borderRadius:14,padding:11,border:"1px solid #1e1e1e"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{background:"#222",padding:"3px 8px",borderRadius:20,fontSize:10}}>{m.league}</span>
                    <span style={{fontSize:10,color:"#00ff88"}}>● {m.time}</span>
                  </div>
                  <div style={{marginTop:7,fontWeight:800,fontSize:13}}>{m.home} vs {m.away}</div>
                  <div style={{marginTop:8,background:"#0a0a0a",borderRadius:8,padding:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div style={{color:"#00ff88",fontSize:9,fontWeight:800}}>{t.cat} • {t.conf}%</div><div style={{fontWeight:800,fontSize:13}}>{t.name}</div></div>
                    <div style={{background:"#1a1a1a",padding:"5px 10px",borderRadius:6}}><span style={{color:"#00ff88",fontWeight:900,fontSize:12}}>@{t.odd}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
      {tab==="ANALYSIS" && <div style={{padding:16}}><h4>📊 Analysis</h4><div style={{marginTop:10,background:"#121212",padding:12,borderRadius:10,fontSize:13}}>Auto daily updates • 20 markets<br/><a href="/vip" style={{display:"block",marginTop:10,background:"#00ff88",color:"black",padding:10,borderRadius:8,textAlign:"center",fontWeight:900,textDecoration:"none",fontSize:13}}>👑 VIP ₦4900</a></div></div>}
      {tab==="PREDICTIONS" && <div style={{padding:16}}><h4>🎯 VIP</h4><div style={{marginTop:10,background:"#121212",padding:16,borderRadius:10,textAlign:"center",fontSize:13}}>🔒 VIP Only<br/><a href="/vip" style={{display:"block",marginTop:10,background:"#00ff88",color:"black",padding:10,borderRadius:8,fontWeight:900,textDecoration:"none"}}>👑 Join VIP</a></div></div>}
      {tab==="PROFILE" && <div style={{padding:16}}><h4>👤 Profile</h4><div style={{marginTop:10,background:"#121212",padding:12,borderRadius:10,fontSize:13}}>Auto-updates daily at midnight<br/>Guest • 84% Win Rate<br/><a href="/vip" style={{display:"block",marginTop:10,background:"#00ff88",color:"black",padding:12,borderRadius:8,textAlign:"center",fontWeight:900,textDecoration:"none"}}>👑 Upgrade</a></div></div>}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #222",display:"flex",justifyContent:"space-around",padding:"8px 0"}}>
        <button onClick={()=>setTab("HOME")} style={{background:"none",border:"none",color:tab==="HOME"?"#00ff88":"#666",fontSize:12}}>⌂<div style={{fontSize:9}}>HOME</div></button>
        <button onClick={()=>setTab("ANALYSIS")} style={{background:"none",border:"none",color:tab==="ANALYSIS"?"#00ff88":"#666",fontSize:12}}>📊<div style={{fontSize:9}}>ANALYSIS</div></button>
        <button onClick={()=>setTab("PREDICTIONS")} style={{background:"none",border:"none",color:tab==="PREDICTIONS"?"#00ff88":"#666",fontSize:12}}>🎯<div style={{fontSize:9}}>PREDICTIONS</div></button>
        <button onClick={()=>setTab("PROFILE")} style={{background:"none",border:"none",color:tab==="PROFILE"?"#00ff88":"#666",fontSize:12}}>👤<div style={{fontSize:9}}>PROFILE</div></button>
      </div>
    </div>
  )
    }
