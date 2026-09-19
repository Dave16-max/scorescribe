"use client"
import { useEffect, useState } from "react"
type Tip = { market:string, pick:string, odd:string, conf:number, desc:string }
type Match = { id:string, league:string, home:string, away:string, score:string, status:string, time:string, tip:Tip }

export default function Page(){
  const [matches,setMatches]=useState<Match[]>([])
  const [filter,setFilter]=useState("All")
  useEffect(()=>{ fetch("/api/matches").then(r=>r.json()).then(d=>setMatches(d.matches||[])) },[])
  const leagues=["All",...Array.from(new Set(matches.map(m=>m.league)))]
  const filtered=filter==="All"?matches:matches.filter(m=>m.league===filter)
  return(
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="sticky top-0 z-10 bg-[#0a0a0b]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="font-black text-xl">SCORESCRIBE ⚽ <span className="text-zinc-500 text-sm font-normal">- Daily Accurate Guide</span></div>
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {leagues.map(l=><button key={l} onClick={()=>setFilter(l)} className={`text-xs px-3 py-1.5 rounded-full border ${filter===l?"bg-white text-black":"bg-zinc-900 border-white/10 text-zinc-400"}`}>{l}</button>)}
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {filtered.map(m=>(
          <div key={m.id} className="bg-zinc-900 rounded-2xl p-4 border border-white/10">
            <div className="flex justify-between text-[11px] text-zinc-400"><span>{m.league} • {m.status}</span><span>{m.time}</span></div>
            <div className="mt-2 font-bold text-[16px]">{m.home} vs {m.away}</div>
            <div className="text-2xl font-black mt-1">{m.score}</div>
            <div className="mt-3 bg-black/50 rounded-xl p-3 border border-green-500/20">
              <div className="text-[10px] text-green-400 uppercase tracking-widest">{m.tip?.market} • {m.tip?.conf}% Confidence</div>
              <div className="font-black text-[15px] mt-1 text-green-300">{m.tip?.pick} @ {m.tip?.odd}</div>
              <div className="text-xs text-zinc-400 mt-1">{m.tip?.desc}</div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2"><div className="h-full bg-green-500 rounded-full" style={{width:`${m.tip?.conf}%`}}></div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
