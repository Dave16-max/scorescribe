"use client"
import { useState, useEffect, useRef } from "react"

const leagues = ["All","Premier League","LaLiga","Serie A","Bundesliga","Ligue 1","Champions League","Europa League","Conference League","NBA","EuroLeague","Liga ACB"]
const tips = [
  { name:"1st Half Over 0.5", odd:"1.35", conf:87 },
  { name:"Home or Draw", odd:"1.25", conf:89 },
  { name:"Over 1.5 Goals", odd:"1.28", conf:88 },
  { name:"BTTS Yes", odd:"1.75", conf:72 },
  { name:"Home Win", odd:"1.85", conf:76 },
  { name:"Away Win", odd:"2.10", conf:68 },
  { name:"Under 3.5", odd:"1.40", conf:80 },
  { name:"Over 2.5", odd:"1.95", conf:68 },
]
const basketTips = [
  { name:"Over 165.5 Points", odd:"1.85", conf:82 },
  { name:"Home Over 82.5", odd:"1.80", conf:79 },
]
const fallbackMatches = [
  { home:"Man City", away:"Arsenal", league:"Premier League", time:"15:00 GMT", sport:"Football" },
  { home:"Liverpool", away:"Chelsea", league:"Premier League", time:"17:30 GMT", sport:"Football" },
  { home:"Real Madrid", away:"Barcelona", league:"LaLiga", time:"19:00 GMT", sport:"Football" },
  { home:"Inter", away:"AC Milan", league:"Serie A", time:"19:45 GMT", sport:"Football" },
  { home:"Bayern", away:"Dortmund", league:"Bundesliga", time:"17:30 GMT", sport:"Football" },
  { home:"PSG", away:"Marseille", league:"Ligue 1", time:"20:00 GMT", sport:"Football" },
  { home:"Man City", away:"Real Madrid", league:"Champions League", time:"20:00 GMT", sport:"Football" },
  { home:"Roma", away:"Leverkusen", league:"Europa League", time:"20:00 GMT", sport:"Football" },
  { home:"Lakers", away:"Warriors", league:"NBA", time:"19:00 GMT", sport:"Basketball" },
  { home:"Real Madrid", away:"Barcelona", league:"EuroLeague", time:"19:30 GMT", sport:"Basketball" },
]
const leagueTeams:any = {
  "Premier League": { home:["Man City","Arsenal","Liverpool","Chelsea","Tottenham","Man United"], away:["Man United","Chelsea","Man City","Tottenham","Newcastle","Liverpool"] },
  "LaLiga": { home:["Real Madrid","Barcelona","Atletico","Sevilla","Villarreal","Betis"], away:["Barcelona","Atletico","Real Madrid","Villarreal","Betis","Sevilla"] },
  "Serie A": { home:["Inter","AC Milan","Napoli","Juventus","Roma","Atalanta"], away:["AC Milan","Juventus","Inter","Roma","Napoli","Lazio"] },
  "Bundesliga": { home:["Bayern","Dortmund","Leverkusen","Leipzig","Stuttgart","Frankfurt"], away:["Dortmund","Bayern","Leipzig","Leverkusen","Frankfurt","Stuttgart"] },
  "Ligue 1": { home:["PSG","Marseille","Monaco","Lille","Lyon","Rennes"], away:["Marseille","PSG","Lille","Monaco","Nice","Lyon"] },
  "Champions League": { home:["Man City","Real Madrid","Arsenal","Bayern","Inter","PSG"], away:["Real Madrid","Bayern","Inter","Man City","Barcelona","Dortmund"] },
  "Europa League": { home:["Roma","Leverkusen","Man United","Tottenham","Ajax","Lazio"], away:["Leverkusen","Roma","Tottenham","Man United","Porto","Ajax"] },
  "Conference League": { home:["Chelsea","Fiorentina","Betis","Heidenheim","Copenhagen","Vitoria"], away:["Fiorentina","Chelsea","Heidenheim","Betis","Gent","Copenhagen"] },
  "NBA": { home:["Lakers","Warriors","Bulls","Celtics","Heat","Knicks"], away:["Celtics","Lakers","Heat","Warriors","Bulls","Mavericks"] },
  "EuroLeague": { home:["Real Madrid","Barcelona","Olympiacos","Fenerbahce","Panathinaikos","Monaco"], away:["Barcelona","Real Madrid","Fenerbahce","Olympiacos","Monaco","Panathinaikos"] },
  "Liga ACB": { home:["Unicaja","Valencia","Real Madrid","Barcelona","Baskonia","Gran Canaria"], away:["Valencia","Unicaja","Barcelona","Real Madrid","Tenerife","Baskonia"] },
}

type Pick = { id:string, match:string, tip:string }

export default function Page() {
  const [filter, setFilter] = useState("All")
  const [matches, setMatches] = useState(fallbackMatches)
  const [activeTab, setActiveTab] = useState("home")
  const [isVip, setIsVip] = useState(false)
  const [selected, setSelected] = useState<Pick[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(()=>{
    const vip = localStorage.getItem("scorescribe_vip_active")
    if(vip === "true") setIsVip(true)
    async function load(){
      try{
        const [f,b] = await Promise.all([fetch('/api/matches'), fetch('/api/basketball')])
        const fd = await f.json()
        const bd = await b.json()
        const combined = [...fd,...bd]
        if(combined.length>=3) setMatches(combined)
      }catch{}
    }
    load()
  },[])

  const getMatchesForLeague = (leagueName: string) => {
    let lm = matches.filter(m=>m.league===leagueName)
    if (lm.length < 10) {
      const teams = leagueTeams[leagueName] || leagueTeams["Premier League"]
      const sport = ["NBA","EuroLeague","Liga ACB"].includes(leagueName)? "Basketball" : "Football"
      const generated = Array.from({length: 10 - lm.length}, (_,i)=>({
        home: teams.home[i % teams.home.length],
        away: teams.away[i % teams.away.length],
        league: leagueName,
        time: `${15+i}:00 GMT`,
        sport: sport
      }))
      lm = [...lm,...generated].slice(0,10)
    }
    return lm.slice(0,10)
  }

  const togglePick = (m:any, t:any, uniqueId:string) => {
    if(!isVip && selected.length >=3) {
      alert("Free users can only select 3 games. Upgrade to VIP for unlimited.")
      return
    }
    const exists = selected.find(s=>s.id===uniqueId)
    if(exists){
      setSelected(selected.filter(s=>s.id!==uniqueId))
    } else {
      setSelected([...selected, { id: uniqueId, match: `${m.home} vs ${m.away}`, tip: t.name }])
    }
  }

  const downloadTicket = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext("2d")!
    canvas.width = 1080
    canvas.height = 400 + selected.length * 130
    ctx.fillStyle = "#050505"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "#00ff88"
    ctx.fillRect(0,0,canvas.width,12)
    ctx.fillStyle = "white"
    ctx.font = "bold 60px sans-serif"
    ctx.fillText("SCORESCRIBE", 40, 90)
    ctx.font = "bold 30px sans-serif"
    ctx.fillStyle = "#00ff88"
    ctx.fillText(`MY TICKET • ${new Date().toLocaleDateString()} • ${selected.length} GAMES`, 40, 135)
    ctx.fillStyle = "#666"
    ctx.font = "24px sans-serif"
    ctx.fillText(`Check odds on your bookie - Sportybet, Bet9ja, 1xBet`, 40, 175)
    let y = 220
    selected.forEach((p, idx)=>{
      ctx.fillStyle = "#121212"
      ctx.fillRect(30, y, 1020, 110)
      ctx.fillStyle = "white"
      ctx.font = "bold 30px sans-serif"
      ctx.fillText(`${idx+1}. ${p.match}`, 60, y+45)
      ctx.fillStyle = "#00ff88"
      ctx.font = "bold 26px sans-serif"
      ctx.fillText(`${p.tip}`, 60, y+85)
      y+=130
    })
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(30, y+20, 1020, 80)
    ctx.fillStyle = "#888"
    ctx.font = "26px sans-serif"
    ctx.fillText(`Generated by scorescribe.com`, 60, y+70)
    ctx.fillStyle = "#00ff88"
    ctx.font = "bold 26px sans-serif"
    ctx.fillText(`Good luck!`, 850, y+70)
    const link = document.createElement("a")
    link.download = `scorescribe-ticket-${selected.length}games.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const FREE_PER_LEAGUE = 3

  return (
    <div style={{minHeight:"100vh",background:"#050505",color:"white",paddingBottom:120}}>
      <canvas ref={canvasRef} style={{display:"none"}} />

      <div style={{display:"flex",justifyContent:"space-between",padding:14}}>
        <div style={{display:"flex",gap:9,alignItems:"center"}}><div style={{width:34,height:34,background:"white",color:"black",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>S</div><div style={{fontWeight:900,fontSize:11}}>SCORESCRIBE<br/>DAILY GUIDE</div></div>
        <a href="https://paystack.shop/pay/ymhc63wsn0" style={{background:"#00ff88",color:"black",padding:"7px 12px",borderRadius:18,fontWeight:800,textDecoration:"none",fontSize:11}}>👑 VIP ₦4900</a>
      </div>

      {selected.length>0 && (
        <div style={{position:"sticky",top:0,zIndex:20,background:"#00ff88",color:"black",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontWeight:900,fontSize:12}}>{selected.length} SELECTED</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setSelected([])} style={{background:"black",color:"white",border:"none",padding:"6px 10px",borderRadius:20,fontWeight:800,fontSize:10}}>CLEAR</button>
            <button onClick={downloadTicket} style={{background:"black",color:"#00ff88",border:"none",padding:"6px 12px",borderRadius:20,fontWeight:900,fontSize:10}}>📥 DOWNLOAD TICKET</button>
          </div>
        </div>
      )}

      {/* PAYSTACK BUTTONS */}
      <div style={{margin:"10px 12px",background:"#111",borderRadius:12,padding:12,border:"1px solid #00ff88"}}>
        <div style={{fontWeight:900,fontSize:12,marginBottom:8,textAlign:"center"}}>🔥 UNLOCK ALL 10 GAMES PER LEAGUE</div>
        <a href="https://paystack.shop/pay/ymhc63wsn0" style={{display:"block",background:"#00ff88",color:"black",padding:"14px",borderRadius:10,textAlign:"center",fontWeight:900,textDecoration:"none",marginBottom:8}}>WEEKLY VIP - ₦4,900 / WEEK</a>
        <a href="https://paystack.shop/pay/m9d3elg1uv" style={{display:"block",background:"white",color:"black",padding:"14px",borderRadius:10,textAlign:"center",fontWeight:900,textDecoration:"none",border:"2px solid #00ff88"}}>MONTHLY VIP - ₦17,900 (SAVE ₦1,700) - BEST VALUE</a>
      </div>

      <div style={{display:"flex",gap:6,padding:"10px 12px",overflowX:"auto"}}>
        {leagues.map(l=>(
          <button key={l} onClick={()=>setFilter(l)} style={{whiteSpace:"nowrap",padding:"7px 10px",borderRadius:10,border:"none",background:filter===l?"#00ff88":"#1a1a1a",color:filter===l?"black":"#aaa",fontWeight:700,fontSize:10}}>{l}</button>
        ))}
      </div>

      <div style={{margin:"0 12px 10px",background:"#111",borderRadius:10,padding:9,border:"1px solid #222",fontSize:10}}>
        <span style={{color:"#00ff88",fontWeight:800}}>{isVip? `VIP • SELECT GAMES TO BUILD TICKET • ${filter}` : `3 FREE PER LEAGUE • Select 3 to build ticket • ${filter}`}</span>
      </div>

      <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:14}}>
        {(filter==="All"? leagues.filter(l=>l!=="All") : [filter]).map(leagueName=>{
          const leagueMatches = getMatchesForLeague(leagueName)
          return (
            <div key={leagueName}>
              {filter==="All" && <div style={{fontWeight:900,fontSize:12,marginBottom:8,color:"#00ff88"}}>{leagueName}</div>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {leagueMatches.map((m:any,i)=>{
                  const t = m.sport==="Basketball"? basketTips[i % basketTips.length] : tips[i % tips.length]
                  const isFreeSlot = i < FREE_PER_LEAGUE
                  const isFree = isFreeSlot || isVip
                  const uniqueId = `${leagueName}-${m.home}-${m.away}-${i}`
                  const isSelected =!!selected.find(s=>s.id===uniqueId)
                  return (
                    <div key={uniqueId} style={{background:isSelected?"#0a2215":"#121212",borderRadius:12,padding:10,border:isSelected?"1px solid #00ff88":"1px solid #1e1e1e",position:"relative",overflow:"hidden"}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:9}}><span style={{background:"#222",padding:"3px 7px",borderRadius:20}}>{m.league}</span><span style={{color:"#00ff88"}}>{m.time}</span></div>
                      <div style={{marginTop:6,fontWeight:800,fontSize:13}}>{m.home} vs {m.away}</div>
                      <div style={{marginTop:7,background:"#0a0a0a",borderRadius:8,padding:7,display:"flex",justifyContent:"space-between",filter:!isFree?"blur(6px)":"none"}}>
                        <div><div style={{color:"#00ff88",fontSize:8,fontWeight:800}}>{t.conf}% CONF</div><div style={{fontWeight:800,fontSize:12}}>{t.name}</div></div>
                        <div style={{background:"#1a1a1a",padding:"4px 8px",borderRadius:6,color:"#00ff88",fontWeight:900,fontSize:11}}>{t.name}</div>
                      </div>
                      {isFree && <button onClick={()=>togglePick(m,t,uniqueId)} style={{marginTop:8,width:"100%",padding:"7px",borderRadius:8,border:"none",background:isSelected?"#00ff88":"white",color:"black",fontWeight:900,fontSize:10}}>{isSelected?"✅ SELECTED - TAP TO REMOVE":"➕ ADD TO MY TICKET"}</button>}
                      {!isFree && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div>🔒</div><div style={{fontSize:10,fontWeight:800}}>VIP ONLY • {i+1}/10</div><a href="https://paystack.shop/pay/m9d3elg1uv" style={{marginTop:5,background:"#00ff88",color:"black",padding:"6px 14px",borderRadius:20,fontWeight:900,textDecoration:"none",fontSize:10}}>👑 UNLOCK ₦4900</a></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0a0a0a",borderTop:"1px solid #222",display:"flex",justifyContent:"space-around",padding:"14px 0"}}>
        <button style={{background:"none",border:"none",color:"#00ff88",fontSize:11,fontWeight:800,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:20}}>🏠</span>HOME</button>
        <a href="https://paystack.shop/pay/m9d3elg1uv" style={{background:"#00ff88",color:"black",borderRadius:24,padding:"8px 22px",fontSize:11,fontWeight:900,textDecoration:"none",display:"flex",flexDirection:"column",alignItems:"center"}}><span style={{fontSize:18}}>👑</span>VIP MONTHLY</a>
        <button onClick={()=>setActiveTab("profile")} style={{background:"none",border:"none",color:"#666",fontSize:11,fontWeight:800,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:20}}>👤</span>PROFILE</button>
      </div>
    </div>
  )
   }
