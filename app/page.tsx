"use client"
import { useState, useEffect } from "react"

const markets = [
  { tip: "Over 1.5 Goals", odd: "1.28" },
  { tip: "BTTS Yes", odd: "1.75" },
  { tip: "Home Win", odd: "1.85" },
  { tip: "Double Chance 1X", odd: "1.32" },
  { tip: "Under 3.5 Goals", odd: "1.40" },
]

const fallback = [
  { home: "Man City", away: "Arsenal", time: "20:45", league: "Premier League" },
  { home: "Barcelona", away: "Real Madrid", time: "21:00", league: "LaLiga" },
]

export default function Page() {
  const [filter, setFilter] = useState("All")
  const [matches, setMatches] = useState(fallback)
  const [loading, setLoading] = useState(true)
  const [h2hData, setH2hData] = useState<any>({})
  const [openH2H, setOpenH2H] = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      try {
        const today = new Date().toISOString().split('T')[0]
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}&s=Soccer`)
        const data = await res.json()
        if (data.events?.length) {
          setMatches(data.events.slice(0,20).map((e:any)=>({
            home: e.strHomeTeam, away: e.strAwayTeam, time: e.strTime?.slice(0,5) || "TBD", league: e.strLeague
          })))
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  async function fetchH2H(home:string, away:string, key:string){
    if(h2hData[key]) { setOpenH2H(openH2H===key?null:key); return }
    setOpenH2H(key)
    try{
      const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(home)}_vs_${encodeURIComponent(away)}`)
      const data = await res.json()
      setH2hData((p:any)=>({...p, [key]: data.event?.slice(0,5) || []}))
    }catch{
      setH2hData((p:any)=>({...p, [key]: []}))
    }
  }

  const filtered = filter==="All"? matches : matches.filter(m=> m.league.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"white",paddingBottom:80}}>
      <div style={{padding:20}}>
        <h1 style={{fontSize:22,fontWeight:900,margin:0}}>SCORESRIBE DAILY GUIDE</h1>
        <div style={{color:"#888",fontSize:11,marginTop:5}}>{loading?"Loading live...":`Live • ${matches.length} Matches • Real H2H • ${new Date().toDateString()}`}</div>
      </div>

      <div style={{display:"flex",gap:8,padding:"0 15px",overflowX:"auto"}}>
        {["All","Premier League","LaLiga","Serie A"].map(l=>(
          <button key={l} onClick={()=>setFilter(l)} style={{padding:"9px 14px",borderRadius:20,border:"1px solid #333",background:filter===l?"#00ff88":"#1a1a1a",color:filter===l?"black":"white",fontWeight:700,fontSize:12}}>{l}</button>
        ))}
      </div>

      <div style={{padding:15,display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
        {filtered.map((m:any,i)=>{
          const key = `${m.home}-${m.away}`
          const h2h = h2hData[key]
          return (
            <div key={i} style={{background:"#151515",borderRadius:12,padding:12,border:"1px solid #222"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontWeight:800,fontSize:12,width:90,textAlign:"center"}}>{m.home}</div>
                <div style={{color:"#444",fontSize:10,fontWeight:900}}>VS</div>
                <div style={{fontWeight:800,fontSize:12,width:90,textAlign:"center"}}>{m.away}</div>
              </div>
              <div style={{marginTop:8,display:"flex",justifyContent:"space-between",fontSize:10,color:"#777"}}>
                <span>{m.time} • {m.league}</span>
                <span style={{background:"#00ff88",color:"black",padding:"4px 8px",borderRadius:20,fontWeight:900}}>{markets[i%markets.length].tip} @{markets[i%markets.length].odd}</span>
              </div>
              <button onClick={()=>fetchH2H(m.home,m.away,key)} style={{marginTop:10,width:"100%",background:"#1e1e1e",border:"1px solid #333",color:"#00ff88",padding:8,borderRadius:8,fontSize:11,fontWeight:700}}>
                {openH2H===key?"Hide H2H ▲":"View Real H2H ▼"}
              </button>
              {openH2H===key && (
                <div style={{marginTop:8,background:"#0f0f0f",borderRadius:8,padding:10}}>
                  {h2h===undefined? <div style={{fontSize:11,color:"#888"}}>Loading real H2H...</div> : h2h.length===0? <div style={{fontSize:11,color:"#888"}}>No H2H found for {m.home} vs {m.away}</div> : h2h.map((e:any,idx:number)=>(
                    <div key={idx} style={{fontSize:11,color:"#aaa",padding:"4px 0",borderBottom:"1px solid #222",display:"flex",justifyContent:"space-between"}}>
                      <span>{e.dateEvent}</span><span>{e.strHomeTeam} {e.intHomeScore}-{e.intAwayScore} {e.strAwayTeam}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <a href="/vip" style={{position:"fixed",bottom:75,right:15,background:"#00ff88",color:"black",padding:"13px 18px",borderRadius:30,fontWeight:900,textDecoration:"none",zIndex:99,fontSize:12}}>👑 VIP - ₦4900/week</a>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#111",borderTop:"1px solid #222",display:"flex",justifyContent:"space-around",padding:"8px 0"}}>
        <button style={{background:"none",border:"none",color:"#00ff88",fontWeight:900,fontSize:9}}><div style={{fontSize:16}}>🏠</div>HOME</button>
        <button onClick={()=>location.href="/vip"} style={{background:"none",border:"none",color:"#666",fontWeight:900,fontSize:9}}><div style={{fontSize:16}}>📊</div>ANALYSIS</button>
        <button onClick={()=>location.href="/vip"} style={{background:"none",border:"none",color:"#666",fontWeight:900,fontSize:9}}><div style={{fontSize:16}}>🎯</div>PREDICTIONS</button>
        <button onClick={()=>location.href="/vip"} style={{background:"none",border:"none",color:"#666",fontWeight:900,fontSize:9}}><div style={{fontSize:16}}>👤</div>PROFILE</button>
      </div>
    </div>
  )
}
