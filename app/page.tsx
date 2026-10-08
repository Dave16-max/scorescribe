"use client"
import { useState, useEffect } from "react"

const leagues = ["All","Premier League","LaLiga","Serie A","Bundesliga","Ligue 1","NBA"]

const fbFallback = [
  { name:"BTTS Yes", odd:"1.75", conf:82 },
  { name:"Over 1.5 Goals", odd:"1.28", conf:89 },
  { name:"Over 2.5 Goals", odd:"1.90", conf:80 },
]

const bbFallback = [
  { name:"Over 210.5 Points", odd:"1.85", conf:83 },
  { name:"Away +7.5 Handicap", odd:"1.85", conf:82 },
]

export default function Page() {
  const [filter, setFilter] = useState("All")
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = () => {
      fetch('/api/matches').then(r=>r.json()).then(d=>{
        if(d.length>0) setMatches(d)
        setLoading(false)
      })
    }
    load()
    const id = setInterval(load, 180000)
    return ()=>clearInterval(id)
  },[])

  const finalMatches = (() => {
    if(matches.length===0) return []
    if(filter==="All") return matches.slice(0,15)

    // FIX: No mixing
    if(filter==="NBA"){
      return matches.filter(m=> m.sport==="Basketball" || m.league==="NBA").slice(0,15)
    } else {
      return matches.filter(m=> m.sport==="Football" && m.league===filter).slice(0,15)
    }
  })()

  const getTip = (m:any) => m.tip || (m.sport==="Basketball"? bbFallback[0] : fbFallback[0])

  return (
    <div style={{minHeight:"100vh",background:"#050505",color:"white",paddingBottom:90}}>
      <div style={{display:"flex",justifyContent:"space-between",padding:14}}>
        <div style={{fontWeight:900,fontSize:11}}>SCORESRIBE<br/>REAL H2H</div>
        <a href="/vip" style={{background:"#00ff88",color:"black",padding:"7px 12px",borderRadius:18,fontWeight:800,textDecoration:"none",fontSize:11}}>👑 VIP ₦4900</a>
      </div>

      <div style={{display:"flex",gap:6,padding:"0 12px 10px",overflowX:"auto"}}>
        {leagues.map(l=>(
          <button key={l} onClick={()=>setFilter(l)} style={{whiteSpace:"nowrap",padding:"7px 10px",borderRadius:10,border:"none",background:filter===l?"#00ff88":"#1a1a1a",color:filter===l?"black":"#aaa",fontWeight:700,fontSize:10}}>{l}</button>
        ))}
      </div>

      <div style={{margin:"0 12px 10px",background:"#111",borderRadius:10,padding:9,border:"1px solid #222",fontSize:10}}>
        <span style={{color:"#00ff88",fontWeight:800}}>
          {loading? "LOADING..." : `${finalMatches.length} MATCHES • ${filter} • 🏀 ${matches.filter(m=>m.sport==="Basketball").length} BASKETBALL`}
        </span>
      </div>

      <div style={{padding:"0 12px",display:"flex",flexDirection:"column",gap:10}}>
        {finalMatches.length===0 &&!loading?
          <div style={{textAlign:"center",padding:30,color:"#666",fontSize:12}}>No {filter} games today<br/>NBA go show when season start</div> :
          finalMatches.map((m:any,i)=>{
            const t = getTip(m)
            const isBball = m.sport==="Basketball"
            return (
              <div key={i} style={{background:"#121212",borderRadius:12,padding:10,border: m.realH2H? "1px solid #00ff88":"1px solid #1e1e1e"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,alignItems:"center"}}>
                  <span style={{display:"flex",gap:4,alignItems:"center"}}>
                    <span style={{background: isBball? "#ff8800":"#222",padding:"3px 7px",borderRadius:20,color:isBball?"black":"white",fontWeight:700}}>
                      {m.league} • {m.sport} {m.realH2H? `• ${m.h2hCount} H2H` : ""}
                    </span>
                    {m.won===true && m.status==="finished" && (
                      <span style={{background:"#00ff88",color:"black",padding:"3px 7px",borderRadius:20,fontWeight:900,fontSize:9}}>✅ WON</span>
                    )}
                  </span>
                  <span style={{color:"#00ff88"}}>{m.time}</span>
                </div>
                <div style={{marginTop:6,fontWeight:800,fontSize:13}}>{m.home} vs {m.away}</div>
                <div style={{marginTop:7,background:"#0a0a0a",borderRadius:8,padding:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:"#00ff88",fontSize:8,fontWeight:800}}>{t.conf}% CONF • {isBball? "POINTS" : "REAL H2H"}</div>
                    <div style={{fontWeight:800,fontSize:12}}>{t.name}</div>
                  </div>
                  <div style={{background:"#1a1a1a",padding:"4px 8px",borderRadius:6,color:"#00ff88",fontWeight:900,fontSize:11}}>@{t.odd}</div>
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
