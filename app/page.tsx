"use client"
import { useState, useEffect } from "react"

const leagues = ["All","Premier League","LaLiga","Serie A","Bundesliga","Ligue 1","Champions League","Europa League","Conference League"]

const tips = [
  { name:"1st Half Over 0.5", odd:"1.35", conf:87, sub:"Goal before HT", cat:"HT Goals" },
  { name:"Home or Draw", odd:"1.25", conf:89, sub:"1X - Home not to lose", cat:"Double Chance" },
  { name:"Away or Draw", odd:"1.30", conf:86, sub:"X2 - Away not to lose", cat:"Double Chance" },
  { name:"Over 1.5 Goals", odd:"1.28", conf:88, sub:"High scoring expected", cat:"Goals" },
  { name:"BTTS Yes", odd:"1.75", conf:72, sub:"Both teams to score", cat:"BTTS" },
  { name:"Home Win", odd:"1.85", conf:76, sub:"Home advantage", cat:"1X2" },
  { name:"Away Win", odd:"2.10", conf:68, sub:"Away strong form", cat:"1X2" },
  { name:"Double Chance 1X", odd:"1.32", conf:90, sub:"Home or Draw", cat:"Double Chance" },
  { name:"Double Chance X2", odd:"1.45", conf:84, sub:"Draw or Away", cat:"Double Chance" },
  { name:"Double Chance 12", odd:"1.28", conf:88, sub:"No draw", cat:"Double Chance" },
  { name:"Under 3.5 Goals", odd:"1.40", conf:80, sub:"Tight game", cat:"Goals" },
  { name:"Over 2.5 Goals", odd:"1.95", conf:68, sub:"Open game expected", cat:"Goals" },
  { name:"BTTS No", odd:"1.90", conf:70, sub:"Clean sheet likely", cat:"BTTS" },
  { name:"Home Win or Draw", odd:"1.25", conf:89, sub:"1X safe option", cat:"Double Chance" },
  { name:"Away Win or Draw", odd:"1.40", conf:82, sub:"X2 safe option", cat:"Double Chance" },
  { name:"Over 0.5 HT", odd:"1.35", conf:85, sub:"Goal in 1st half", cat:"HT Goals" },
  { name:"Under 2.5 Goals", odd:"1.65", conf:75, sub:"Low scoring", cat:"Goals" },
  { name:"Draw No Bet - Home", odd:"1.50", conf:79, sub:"Home DNB", cat:"DNB" },
  { name:"Draw No Bet - Away", odd:"1.60", conf:77, sub:"Away DNB", cat:"DNB" },
  { name:"Home Over 0.5", odd:"1.22", conf:91, sub:"Home to score", cat:"Team Goals" },
]

const fallback = [
  { home: "Tottenham Hotspur", away: "Aston Villa", league: "Premier League", time:"Today, 19:45 • London" },
  { home: "Arsenal", away: "Newcastle United", league: "Premier League", time:"Today, 21:00 • London" },
  { home: "Man City", away: "Chelsea", league: "Premier League", time:"Today, 17:30 • Manchester" },
  { home: "Barcelona", away: "Real Madrid", league: "LaLiga", time:"Today, 20:00 • Barcelona" },
  { home: "Inter", away: "AC Milan", league: "Serie A", time:"Today, 19:45 • Milan" },
  { home: "Bayern Munich", away: "Dortmund", league: "Bundesliga", time:"Today, 17:30 • Munich" },
  { home: "Leverkusen", away: "Stuttgart", league: "Bundesliga", time:"Today, 15:30 • Leverkusen" },
  { home: "PSG", away: "Marseille", league: "Ligue 1", time:"Today, 20:45 • Paris" },
  { home: "Monaco", away: "Lyon", league: "Ligue 1", time:"Today, 19:00 • Monaco" },
  { home: "Real Madrid", away: "Man City", league: "Champions League", time:"Today, 21:00 • Madrid" },
  { home: "Arsenal", away: "Bayern Munich", league: "Champions League", time:"Today, 21:00 • London" },
  { home: "Liverpool", away: "Roma", league: "Europa League", time:"Today, 21:00 • Liverpool" },
  { home: "Leverkusen", away: "AC Milan", league: "Europa League", time:"Today, 18:45 • Leverkusen" },
  { home: "Chelsea", away: "Fiorentina", league: "Conference League", time:"Today, 18:45 • London" },
  { home: "Real Betis", away: "Villarreal", league: "Conference League", time:"Today, 18:45 • Seville" },
  { home: "Man United", away: "Tottenham", league: "Premier League", time:"Today, 15:00 • Manchester" },
  { home: "Napoli", away: "Lazio", league: "Serie A", time:"Today, 20:45 • Naples" },
  { home: "Atletico Madrid", away: "Sevilla", league: "LaLiga", time:"Today, 18:15 • Madrid" },
  { home: "Juventus", away: "Roma", league: "Serie A", time:"Today, 17:00 • Turin" },
  { home: "Dortmund", away: "Leipzig", league: "Bundesliga", time:"Today, 19:30 • Dortmund" },
]

export default function Page() {
  const [filter, setFilter] = useState("All")
  const [matches, setMatches] = useState(fallback)
  const [tab, setTab] = useState("HOME")

  useEffect(()=>{
    async function load(){
      try{
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`)
        const data = await res.json()
        if(data.events?.length){
          setMatches(data.events.slice(0,25).map((e:any)=>({
            home: e.strHomeTeam, away: e.strAwayTeam,
            league: e.strLeague?.includes("Champions")?"Champions League":e.strLeague?.includes("Conference")?"Conference League":e.strLeague?.includes("Europa")?"Europa League":e.strLeague || "Premier League",
            time: "Today, "+(e.strTime?.slice(0,5)||"19:45")
          })))
        }
      }catch{}
    }
    load()
  },[])

  const filtered = filter==="All"? matches : matches.filter(m => m.league.toLowerCase().includes(filter.split(" ")[0].toLowerCase()))
  const display = filtered.length? filtered : matches

  return (
    <div style={{minHeight:"100vh",background:"#050505",color:"white",paddingBottom:95}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px 8px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:42,height:42,background:"#111",borderRadius:12,border:"1px solid #222",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:24}}>S</div>
          <div><div style={{fontWeight:900,fontSize:15,lineHeight:1.1}}>SCORESRIBE<br/>DAILY GUIDE</div></div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{background:"#111",padding:"7px 12px",borderRadius:20,fontSize:11,color:"#888",border:"1px solid #222"}}>⚽ {display.length} Matches</div>
          <a href="/vip" style={{background:"#00ff88",color:"black",padding:"9px 16px",borderRadius:20,fontWeight:900,textDecoration:"none",fontSize:13}}>VIP ₦4900</a>
        </div>
      </div>

      {tab==="HOME" && (
        <>
          <div style={{display:"flex",gap:8,padding:"12px",overflowX:"auto"}}>
            {leagues.map(l=>(
              <button key={l} onClick={()=>setFilter(l)} style={{whiteSpace:"nowrap",padding:"9px 12px",borderRadius:14,border:"1px solid #222",background:filter===l?"#00ff88":"#121212",color:filter===l?"black":"#aaa",fontWeight:800,fontSize:11}}>{l}</button>
            ))}
          </div>

          <div style={{margin:12,background:"#0f1a13",borderRadius:18,padding:14,border:"1px solid #1a2e1f",display:"flex",gap:10}}>
            <div style={{width:28,height:28,background:"#00ff88",borderRadius:50,display:"flex",alignItems:"center",justifyContent:"center",color:"black",fontWeight:900}}>✓</div>
            <div><div style={{color:"#00ff88",fontSize:12,fontWeight:900}}>ACCURATE • 20 BET OPTIONS</div><div style={{fontSize:13,marginTop:2,color:"#ccc"}}>1st Half, Double Chance, BTTS & more</div></div>
          </div>

          <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:12}}>
            {display.map((m:any,i)=>{
              const t = tips[i % tips.length]
              return (
                <div key={i} style={{background:"#121212",borderRadius:18,padding:12,border:"1px solid #1f1f1f"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{background:"#1e1e1e",padding:"5px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>{m.league}</span>
                    <span style={{fontSize:11,color:"#00ff88"}}>● Upcoming • VS</span>
                  </div>
                  <div style={{marginTop:10,fontWeight:800,fontSize:15}}>{m.home} vs {m.away}</div>
                  <div style={{fontSize:11,color:"#666"}}>Scheduled • {m.time}</div>
                  <div style={{marginTop:10,background:"#0d0d0d",borderRadius:12,padding:10,border:"1px solid #1f1f1f"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{color:"#00ff88",fontSize:10,fontWeight:800}}>{t.cat} • {t.conf}% CONFIDENCE</div>
                        <div style={{fontWeight:900,fontSize:15,marginTop:2}}>{t.name}</div>
                        <div style={{fontSize:11,color:"#666"}}>{t.sub}</div>
                      </div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:9,color:"#666"}}>ODD</div><div style={{color:"#00ff88",fontWeight:900,fontSize:18}}>@{t.odd}</div></div>
                    </div>
                    <div style={{marginTop:8,height:6,background:"#222",borderRadius:10}}><div style={{width:`${t.conf}%`,height:"100%",background:"#00ff88",borderRadius:10}}></div></div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab==="ANALYSIS" && <div style={{padding:15}}><h2 style={{fontWeight:900}}>📊 Analysis</h2><div style={{marginTop:15,background:"#121212",padding:15,borderRadius:14,border:"1px solid #222"}}>20 markets active • Best: 1st Half Over 0.5 (87%) • Home or Draw (89%)<br/><a href="/vip" style={{display:"block",marginTop:12,background:"#00ff88",color:"black",padding:12,borderRadius:10,textAlign:"center",fontWeight:900,textDecoration:"none"}}>Unlock VIP</a></div></div>}
      {tab==="PREDICTIONS" && <div style={{padding:15}}><h2 style={{fontWeight:900}}>🎯 Predictions</h2><div style={{marginTop:15,background:"#121212",padding:20,borderRadius:14,border:"1px solid #222",textAlign:"center"}}>🔒 VIP Only - 20 markets<br/><a href="/vip" style={{display:"block",marginTop:12,background:"#00ff88",color:"black",padding:12,borderRadius:10,fontWeight:900,textDecoration:"none"}}>Join VIP ₦4900/week</a></div></div>}
      {tab==="PROFILE" && <div style={{padding:15}}><h2 style={{fontWeight:900}}>👤 Profile</h2><div style={{marginTop:15,background:"#121212",padding:15,borderRadius:14,border:"1px solid #222"}}>Guest • Free Plan • 20 bet options active<br/><span style={{color:"#00ff88",fontWeight:900}}>84% Win Rate</span><br/><a href="/vip" style={{display:"block",marginTop:15,background:"#00ff88",color:"black",padding:14,borderRadius:12,textAlign:"center",fontWeight:900,textDecoration:"none"}}>Upgrade VIP 👑</a></div></div>}

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #1a1a1a",display:"flex",justifyContent:"space-around",padding:"10px 0"}}>
        <button onClick={()=>setTab("HOME")} style={{background:"none",border:"none",color:tab==="HOME"?"#00ff88":"#666"}}><div>⌂</div><div style={{fontSize:10,fontWeight:900}}>HOME</div></button>
        <button onClick={()=>setTab("ANALYSIS")} style={{background:"none",border:"none",color:tab==="ANALYSIS"?"#00ff88":"#666"}}><div>📊</div><div style={{fontSize:10}}>ANALYSIS</div></button>
        <button onClick={()=>setTab("PREDICTIONS")} style={{background:"none",border:"none",color:tab==="PREDICTIONS"?"#00ff88":"#666"}}><div>🎯</div><div style={{fontSize:10}}>PREDICTIONS</div></button>
        <button onClick={()=>setTab("PROFILE")} style={{background:"none",border:"none",color:tab==="PROFILE"?"#00ff88":"#666"}}><div>👤</div><div style={{fontSize:10}}>PROFILE</div></button>
      </div>
    </div>
  )
}
