"use client"
import { useState, useEffect } from "react"

const leagues = ["All","Premier League","LaLiga","Serie A","Bundesliga","Ligue 1","Champions League","NBA","EuroLeague","Liga ACB"]

const tips = [
  { name:"1st Half Over 0.5", odd:"1.35", conf:87, cat:"HT Goals" },
  { name:"Home or Draw", odd:"1.25", conf:89, cat:"Double Chance" },
  { name:"Over 1.5 Goals", odd:"1.28", conf:88, cat:"Goals" },
  { name:"BTTS Yes", odd:"1.75", conf:72, cat:"BTTS" },
  { name:"Home Win", odd:"1.85", conf:76, cat:"1X2" },
  { name:"Away Win", odd:"2.10", conf:68, cat:"1X2" },
  { name:"Double Chance X2", odd:"1.45", conf:84, cat:"Double Chance" },
  { name:"Under 3.5 Goals", odd:"1.40", conf:80, cat:"Goals" },
  { name:"Over 2.5 Goals", odd:"1.95", conf:68, cat:"Goals" },
  { name:"Home Win or Draw", odd:"1.25", conf:89, cat:"Double Chance" },
]

const basketTips = [
  { name:"Over 165.5 Points", odd:"1.85", conf:82, cat:"Total Points" },
  { name:"Home Over 82.5", odd:"1.80", conf:79, cat:"Team Points" },
  { name:"Over 75.5 HT", odd:"1.75", conf:80, cat:"HT Points" },
]

const fallbackMatches = [
  { home: "Tottenham Hotspur", away: "Aston Villa", league: "Premier League", time:"11:30 GMT • Today", sport:"Football", prediction:"Home or Draw", h2h:"H2H: TOT 3W - AVL 1W - Last 5: WWWDL", confidence:"87%" },
  { home: "Brighton", away: "Arsenal", league: "Premier League", time:"14:00 GMT • Today", sport:"Football", prediction:"Over 1.5 Goals", h2h:"H2H: BHA 1W - ARS 3W - Last 5: LWWWD", confidence:"88%" },
  { home: "Werder Bremen", away: "Augsburg", league: "Bundesliga", time:"13:30 GMT • Today", sport:"Football", prediction:"BTTS Yes", h2h:"H2H: BRE 2W - AUG 2W", confidence:"75%" },
  { home: "Sevilla", away: "Barcelona", league: "LaLiga", time:"19:00 GMT • Today", sport:"Football", prediction:"Away Win", h2h:"H2H: SEV 0W - BAR 4W", confidence:"82%" },
  { home: "Inter", away: "AC Milan", league: "Serie A", time:"19:45 GMT • Today", sport:"Football", prediction:"Over 2.5 Goals", h2h:"H2H: INT 2W - MIL 2W - Derby", confidence:"79%" },
  { home: "PSG", away: "Marseille", league: "Ligue 1", time:"20:00 GMT • Today", sport:"Football", prediction:"Home Win", h2h:"H2H: PSG 4W - MAR 1W", confidence:"80%" },
  { home: "Man City", away: "Real Madrid", league: "Champions League", time:"20:00 GMT • Today", sport:"Football", prediction:"BTTS Yes", h2h:"UCL H2H: Even - Last 3: Over 2.5", confidence:"84%" },
  { home: "Stuttgart", away: "Dortmund", league: "Bundesliga", time:"16:30 GMT • Today", sport:"Football", prediction:"Over 1.5 Goals", h2h:"H2H: STU 1W - DOR 3W", confidence:"86%" },
  { home: "Osasuna", away: "Rayo Vallecano", league: "LaLiga", time:"12:00 GMT • Today", sport:"Football", prediction:"Under 3.5 Goals", h2h:"H2H: Close", confidence:"81%" },
  { home: "Napoli", away: "Juventus", league: "Serie A", time:"19:45 GMT • Today", sport:"Football", prediction:"Double Chance 1X", h2h:"H2H: NAP 2W - JUV 2W", confidence:"77%" },
  { home: "Lakers", away: "Warriors", league: "NBA", time:"19:00 GMT • Today", sport:"Basketball", prediction:"Over 165.5 Points", h2h:"Last 5: LAL 3W - GSW 2W", confidence:"82%" },
  { home: "Real Madrid", away: "Barcelona", league: "EuroLeague", time:"19:30 GMT • Today", sport:"Basketball", prediction:"Home Over 82.5", h2h:"El Clasico Basketball", confidence:"80%" },
  { home: "Bulls", away: "Celtics", league: "NBA", time:"21:30 GMT • Today", sport:"Basketball", prediction:"Over 75.5 HT", h2h:"Last 5: CHI 1W - BOS 4W", confidence:"79%" },
  { home: "Baskonia", away: "Olympiacos", league: "EuroLeague", time:"20:00 GMT • Today", sport:"Basketball", prediction:"Over 165.5 Points", h2h:"Euro H2H: Even", confidence:"78%" },
  { home: "Unicaja", away: "Valencia", league: "Liga ACB", time:"18:00 GMT • Today", sport:"Basketball", prediction:"Home Win", h2h:"ACB H2H: UNI 3W - VAL 2W", confidence:"76%" },
]

export default function Page() {
  const [filter, setFilter] = useState("All")
  const [tab, setTab] = useState("HOME")
  const [matches, setMatches] = useState(fallbackMatches)
  const [lastUpdate, setLastUpdate] = useState("Today")

  useEffect(()=>{
    async function updateDaily(){
      try{
        const [fRes, bRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/basketball')
        ])
        const fData = await fRes.json()
        const bData = await bRes.json()
        const combined = [...fData,...bData]
        if(combined.length >= 3){
          setMatches(combined.slice(0,15))
          setLastUpdate(new Date().toLocaleDateString() + " • Major Leagues Live")
        }
      }catch(e){ console.log("fallback") }
    }
    updateDaily()
  },[])

  const filtered = filter==="All"? matches : matches.filter(m => m.league === filter || m.sport === filter)

  return (
    <div style={{minHeight:"100vh",background:"#050505",color:"white",paddingBottom:90}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:38,height:38,background:"white",color:"black",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>S</div>
          <div style={{fontWeight:900,fontSize:12,lineHeight:1.1}}>SCORESRIBE<br/>DAILY GUIDE</div>
        </div>
        <a href="/vip" style={{background:"#00ff88",color:"black",padding:"8px 14px",borderRadius:18,fontWeight:800,textDecoration:"none",fontSize:12}}>👑 VIP ₦4900</a>
      </div>

      {tab==="HOME" && (
        <>
          <div style={{display:"flex",gap:7,padding:"0 12px 10px",overflowX:"auto"}}>
            {leagues.map(l=>(
              <button key={l} onClick={()=>setFilter(l)} style={{whiteSpace:"nowrap",padding:"8px 12px",borderRadius:10,border:"none",background:filter===l?"#00ff88":"#1a1a1a",color:filter===l?"black":"#aaa",fontWeight:700,fontSize:11}}>{l}</button>
            ))}
          </div>
          <div style={{margin:"0 12px 10px",background:"#111",borderRadius:10,padding:10,border:"1px solid #222",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:11}}><span style={{color:"#00ff88",fontWeight:800}}>5 FREE • 10 VIP • MAJOR ONLY</span><span style={{color:"#666",marginLeft:6}}>• {lastUpdate}</span></div>
            <div style={{fontSize:10,color:"#00ff88"}}>● Live</div>
          </div>
          <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map((m:any,i)=>{
              const t = m.sport === "Basketball"? basketTips[i % basketTips.length] : tips[i % tips.length]
              const predName = m.prediction || t.name
              const h2hText = m.h2h || "Form: Good"
              const conf = m.confidence || t.conf+"%"
              const odd = t.odd
              const isFree = i < 5
              return (
                <div key={i} style={{background:"#121212",borderRadius:14,padding:11,border:"1px solid #1e1e1e",position:"relative",overflow:"hidden"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{background:m.sport==="Basketball"?"#ff8800":"#222",padding:"3px 8px",borderRadius:20,fontSize:10,color:m.sport==="Basketball"?"black":"white"}}>{m.league} • {m.sport}</span>
                    <span style={{fontSize:10,color:"#00ff88"}}>● {m.time}</span>
                  </div>
                  <div style={{marginTop:7,fontWeight:800,fontSize:13}}>{m.home} vs {m.away}</div>
                  <div style={{marginTop:4,fontSize:9,color:"#888"}}>{h2hText}</div>
                  <div style={{marginTop:8,background:"#0a0a0a",borderRadius:8,padding:8,display:"flex",justifyContent:"space-between",alignItems:"center",filter:!isFree?"blur(7px)":"none"}}>
                    <div><div style={{color:"#00ff88",fontSize:9,fontWeight:800}}>{conf} CONF • H2H Based</div><div style={{fontWeight:800,fontSize:13}}>{predName}</div></div>
                    <div style={{background:"#1a1a1a",padding:"5px 10px",borderRadius:6}}><span style={{color:"#00ff88",fontWeight:900,fontSize:12}}>@{odd}</span></div>
                  </div>
                  {!isFree && (
                    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.80)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                      <div style={{fontSize:22}}>🔒</div><div style={{fontSize:11,fontWeight:800}}>VIP ONLY • #{i+1} • H2H Prediction</div>
                      <a href="/vip" style={{background:"#00ff88",color:"black",padding:"7px 16px",borderRadius:20,fontWeight:900,textDecoration:"none",fontSize:11,marginTop:4}}>👑 UNLOCK VIP ₦4900</a>
                    </div>
                  )}
                  {isFree && <div style={{position:"absolute",top:8,right:8,background:"#00ff88",color:"black",fontSize:8,fontWeight:900,padding:"3px 7px",borderRadius:10}}>FREE</div>}
                </div>
              )
            })}
          </div>
        </>
      )}
      {tab==="ANALYSIS" && <div style={{padding:16}}><h4>📊 H2H Analysis</h4><div style={{marginTop:10,background:"#121212",padding:12,borderRadius:10,fontSize:13}}>Major leagues only: Premier, LaLiga, Serie A, Bundesliga, Ligue 1, UCL + NBA, EuroLeague, ACB. Predictions based on H2H & form.<br/><a href="/vip" style={{display:"block",marginTop:10,background:"#00ff88",color:"black",padding:10,borderRadius:8,textAlign:"center",fontWeight:900,textDecoration:"none",fontSize:13}}>👑 VIP ₦4900</a></div></div>}
      {tab==="PREDICTIONS" && <div style={{padding:16}}><h4>🎯 VIP H2H</h4><div style={{marginTop:10,background:"#121212",padding:16,borderRadius:10,textAlign:"center",fontSize:13}}>🔒 10 VIP H2H predictions locked<br/><a href="/vip" style={{display:"block",marginTop:10,background:"#00ff88",color:"black",padding:10,borderRadius:8,fontWeight:900,textDecoration:"none"}}>👑 Join VIP ₦4900</a></div></div>}
      {tab==="PROFILE" && <div style={{padding:16}}><h4>👤 Profile</h4><div style={{marginTop:10,background:"#121212",padding:12,borderRadius:10,fontSize:13}}>Auto-updates daily • Major leagues only<br/>Guest • 84% Win Rate • H2H Based<br/><a href="/vip" style={{display:"block",marginTop:10,background:"#00ff88",color:"black",padding:12,borderRadius:8,textAlign:"center",fontWeight:900,textDecoration:"none"}}>👑 Upgrade to VIP</a></div></div>}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #222",display:"flex",justifyContent:"space-around",padding:"8px 0"}}>
        <button onClick={()=>setTab("HOME")} style={{background:"none",border:"none",color:tab==="HOME"?"#00ff88":"#666",fontSize:12}}>⌂<div style={{fontSize:9}}>HOME</div></button>
        <button onClick={()=>setTab("ANALYSIS")} style={{background:"none",border:"none",color:tab==="ANALYSIS"?"#00ff88":"#666",fontSize:12}}>📊<div style={{fontSize:9}}>ANALYSIS</div></button>
        <button onClick={()=>setTab("PREDICTIONS")} style={{background:"none",border:"none",color:tab==="PREDICTIONS"?"#00ff88":"#666",fontSize:12}}>🎯<div style={{fontSize:9}}>PREDICTIONS</div></button>
        <button onClick={()=>setTab("PROFILE")} style={{background:"none",border:"none",color:tab==="PROFILE"?"#00ff88":"#666",fontSize:12}}>👤<div style={{fontSize:9}}>PROFILE</div></button>
      </div>
    </div>
  )
                     }
