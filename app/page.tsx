"use client"
import { useState, useEffect } from "react"

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
  { home:"Tottenham", away:"Aston Villa", league:"Premier League", time:"11:30 GMT", sport:"Football" },
  { home:"Man City", away:"Real Madrid", league:"Champions League", time:"20:00 GMT", sport:"Football" },
  { home:"Arsenal", away:"Bayern", league:"Champions League", time:"20:00 GMT", sport:"Football" },
  { home:"Roma", away:"Leverkusen", league:"Europa League", time:"20:00 GMT", sport:"Football" },
  { home:"Fiorentina", away:"Chelsea", league:"Conference League", time:"20:00 GMT", sport:"Football" },
  { home:"Barcelona", away:"Atletico", league:"LaLiga", time:"19:00 GMT", sport:"Football" },
  { home:"Inter", away:"AC Milan", league:"Serie A", time:"19:45 GMT", sport:"Football" },
  { home:"PSG", away:"Marseille", league:"Ligue 1", time:"20:00 GMT", sport:"Football" },
  { home:"Lakers", away:"Warriors", league:"NBA", time:"19:00 GMT", sport:"Basketball" },
  { home:"Real Madrid", away:"Barcelona", league:"EuroLeague", time:"19:30 GMT", sport:"Basketball" },
]

export default function Page() {
  const [filter, setFilter] = useState("All")
  const [matches, setMatches] = useState(fallbackMatches)

  useEffect(()=>{
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

  const filtered = (() => {
    if (filter==="All") return matches.slice(0,10)
    let lm = matches.filter(m=>m.league===filter)
    // For Europe: if 10 matches that day -> 5 free 5 vip, if 12 -> 6 free 6 vip
    if (lm.length < 2) {
      const isEuro = ["Champions League","Europa League","Conference League"].includes(filter)
      const count = isEuro? 12 : 10 // European nights get more
      const isBasket = ["NBA","EuroLeague","Liga ACB"].includes(filter)
      lm = Array.from({length:count}, (_,i)=>({
        home: filter==="Champions League"? ["Man City","Arsenal","Real Madrid","Inter","Bayern","PSG","Barcelona","Dortmund","Liverpool","Atletico","Leverkusen","Milan"][i%12] : filter==="Europa League"? ["Roma","Leverkusen","Man United","Tottenham","Ajax","Lazio","Porto","Bilbao","Galatasaray","Fenerbahce","Rangers","Frankfurt"][i%12] : filter==="Conference League"? ["Chelsea","Fiorentina","Betis","Heidenheim","Copenhagen","Vitoria","Legia","Gent","Djurgarden","Rapid Wien","Panathinaikos","Molde"][i%12] : ["Man City","Arsenal","Liverpool"][i%3],
        away: filter==="Champions League"? ["Real Madrid","Bayern","Inter","Barcelona","Arsenal","Dortmund","PSG","Liverpool","Milan","Leverkusen","Atletico","Man City"][i%12] : ["Sevilla","Braga","AZ","Lyon","Union","Qarabag"][i%6],
        league: filter,
        time: `${18+i%5}:00 GMT`,
        sport: isBasket?"Basketball":"Football"
      }))
    }
    return lm
  })()

  // HALF-HALF LOGIC: 5 free 5 paid, or 6 free 6 paid if 12 matches
  const freeCount = Math.ceil(filtered.length / 2)

  return (
    <div style={{minHeight:"100vh",background:"#050505",color:"white",paddingBottom:80}}>
      <div style={{display:"flex",justifyContent:"space-between",padding:14}}>
        <div style={{display:"flex",gap:9,alignItems:"center"}}><div style={{width:34,height:34,background:"white",color:"black",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900}}>S</div><div style={{fontWeight:900,fontSize:11}}>SCORESRIBE<br/>DAILY GUIDE</div></div>
        <a href="/vip" style={{background:"#00ff88",color:"black",padding:"7px 12px",borderRadius:18,fontWeight:800,textDecoration:"none",fontSize:11}}>👑 VIP ₦4900</a>
      </div>

      <div style={{display:"flex",gap:6,padding:"0 12px 10px",overflowX:"auto"}}>
        {leagues.map(l=>(
          <button key={l} onClick={()=>setFilter(l)} style={{whiteSpace:"nowrap",padding:"7px 10px",borderRadius:10,border:"none",background:filter===l?"#00ff88":"#1a1a1a",color:filter===l?"black":"#aaa",fontWeight:700,fontSize:10}}>{l}</button>
        ))}
      </div>

      <div style={{margin:"0 12px 10px",background:"#111",borderRadius:10,padding:9,border:"1px solid #222",fontSize:10}}>
        <span style={{color:"#00ff88",fontWeight:800}}>{filter==="All"? "5 FREE • 5 VIP" : `${freeCount} FREE • ${filtered.length-freeCount} VIP`} • {filtered.length} MATCHES TODAY • {filter}</span>
      </div>

      <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map((m:any,i)=>{
          const t = m.sport==="Basketball"? basketTips[i % basketTips.length] : tips[i % tips.length]
          const isFree = i < freeCount
          return (
            <div key={i} style={{background:"#121212",borderRadius:12,padding:10,border:"1px solid #1e1e1e",position:"relative",overflow:"hidden"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9}}><span style={{background:"#222",padding:"3px 7px",borderRadius:20}}>{m.league}</span><span style={{color:"#00ff88"}}>{m.time}</span></div>
              <div style={{marginTop:6,fontWeight:800,fontSize:13}}>{m.home} vs {m.away}</div>
              <div style={{marginTop:7,background:"#0a0a0a",borderRadius:8,padding:7,display:"flex",justifyContent:"space-between",filter:!isFree?"blur(6px)":"none"}}>
                <div><div style={{color:"#00ff88",fontSize:8,fontWeight:800}}>{t.conf}% CONF</div><div style={{fontWeight:800,fontSize:12}}>{t.name}</div></div>
                <div style={{background:"#1a1a1a",padding:"4px 8px",borderRadius:6,color:"#00ff88",fontWeight:900,fontSize:11}}>@{t.odd}</div>
              </div>
              {!isFree && <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div>🔒</div><div style={{fontSize:10,fontWeight:800}}>VIP ONLY • {i+1}/{filtered.length}</div><a href="/vip" style={{marginTop:5,background:"#00ff88",color:"black",padding:"6px 14px",borderRadius:20,fontWeight:900,textDecoration:"none",fontSize:10}}>👑 UNLOCK ₦4900</a></div>}
              {isFree && <div style={{position:"absolute",top:6,right:6,background:"#00ff88",color:"black",fontSize:7,fontWeight:900,padding:"2px 6px",borderRadius:10}}>FREE</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
                }
