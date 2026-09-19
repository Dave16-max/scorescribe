"use client"
import { useEffect, useState } from "react"

export default function Page(){
  const [matches,setMatches]=useState<any[]>([])
  const [filter,setFilter]=useState("All")
  useEffect(()=>{ fetch("/api/matches").then(r=>r.json()).then(d=>setMatches(d.matches||[])) },[])
  const leagues=["All",...Array.from(new Set(matches.map((m:any)=>m.league)))]
  const filtered=filter==="All"?matches:matches.filter((m:any)=>m.league===filter)

  return(
    <div style={{minHeight:"100vh", background:"#08080a", color:"white", paddingBottom:40}}>
      <div style={{position:"sticky",top:0,zIndex:20,background:"rgba(8,8,10,0.9)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <div style={{maxWidth:720,margin:"0 auto",padding:"0 20px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:8,background:"white",color:"black",fontWeight:900,display:"grid",placeItems:"center"}}>S</div>
            <div>
              <div style={{fontWeight:900,letterSpacing:-0.5}}>SCORESCRIBE</div>
              <div style={{fontSize:10,letterSpacing:2,color:"#777",fontWeight:700}}>DAILY GUIDE</div>
            </div>
          </div>
          <div style={{fontSize:11,padding:"6px 12px",borderRadius:20,background:"#1a1a1d",border:"1px solid rgba(255,255,255,0.1)",color:"#999"}}>{matches.length} Matches</div>
        </div>
        <div style={{maxWidth:720,margin:"0 auto",padding:"0 20px 12px",display:"flex",gap:8,overflowX:"auto"}}>
          {leagues.map((l:any)=><button key={l} onClick={()=>setFilter(l)} style={{flexShrink:0,fontSize:13,padding:"0 16px",height:32,borderRadius:20,border:"1px solid rgba(255,255,255,0.1)",background:filter===l?"white":"#1a1a1d",color:filter===l?"black":"#999",fontWeight:filter===l?700:400}}>{l}</button>)}
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:24,display:"flex",flexDirection:"column",gap:16}}>
        <div style={{borderRadius:24,background:"#1a1a1d",border:"1px solid rgba(255,255,255,0.08)",padding:20,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,letterSpacing:2,color:"#4ade80",fontWeight:700}}>ACCURATE • ONE PICK</div>
            <div style={{fontSize:18,fontWeight:900,marginTop:4}}>We pick 1 best tip per game.<br/>No confusion.</div>
          </div>
          <div style={{width:48,height:48,borderRadius:24,background:"rgba(74,222,128,0.2)",display:"grid",placeItems:"center",fontSize:20}}>✓</div>
        </div>

        {filtered.map((m:any)=>(
          <div key={m.id} style={{borderRadius:22,background:"#121214",border:"1px solid rgba(255,255,255,0.06)",padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}>{m.league}</span>
                <span style={{fontSize:10,color:"#777"}}>● {m.status}</span>
              </div>
              <div style={{fontSize:22,fontWeight:900}}>{m.score}</div>
            </div>
            <div style={{marginTop:12,fontWeight:700,fontSize:16}}>{m.home} vs {m.away}</div>
            <div style={{fontSize:12,color:"#777"}}>{m.time}</div>
            
            <div style={{marginTop:16,borderRadius:16,background:"black",border:"1px solid rgba(74,222,128,0.2)",padding:14,position:"relative"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:10,letterSpacing:1,fontWeight:700,color:"#4ade80"}}>{m.tip?.market} • {m.tip?.conf}% CONFIDENCE</div>
                  <div style={{fontSize:17,fontWeight:900,marginTop:4}}>{m.tip?.pick}</div>
                  <div style={{fontSize:12,color:"#888",marginTop:4}}>{m.tip?.desc}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:"#666"}}>ODD</div>
                  <div style={{fontSize:18,fontWeight:900,color:"#86efac"}}>@{m.tip?.odd}</div>
                </div>
              </div>
              <div style={{marginTop:12,height:6,width:"100%",background:"#222",borderRadius:10}}><div style={{height:"100%",background:"#4ade80",borderRadius:10,width:`${m.tip?.conf}%`}} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
