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
    <div className="min-h-screen bg-[#08080a] text-white selection:bg-green-500">
      {/* HEADER */}
      <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#08080a]/80 backdrop-blur-xl">
        <div className="max-w-[720px] mx-auto px-5 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black font-black grid place-items-center">S</div>
            <div className="leading-none">
              <div className="font-black tracking-tight">SCORESCRIBE</div>
              <div className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold">DAILY GUIDE</div>
            </div>
          </div>
          <div className="text-[11px] px-3 py-1 rounded-full bg-[#1a1a1d] border border-white/10 text-zinc-400">{matches.length} Matches Today</div>
        </div>
        <div className="max-w-[720px] mx-auto px-5 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {leagues.map(l=>(
            <button key={l} onClick={()=>setFilter(l)} className={`shrink-0 text-[13px] px-4 h-8 rounded-full border transition-all ${filter===l?"bg-white text-black border-white font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]":"bg-zinc-900/80 border-white/10 text-zinc-400 hover:text-white"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 py-6 space-y-4">
        {/* HERO */}
        <div className="rounded-[24px] bg-gradient-to-br from-zinc-900 to-zinc-900/30 border border-white/10 p-5 flex justify-between items-center">
          <div>
            <div className="text-[11px] tracking-widest text-green-400 font-bold">ACCURATE • SIMPLE • ONE PICK</div>
            <div className="text-[22px] font-black leading-tight mt-1">We pick 1 best tip per game.<br/>No confusion.</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-500/20 grid place-items-center text-xl">✓</div>
        </div>

        {filtered.map(m=>(
          <div key={m.id} className="group relative rounded-[22px] bg-[#121214] border border-white/[0.06] p-[1px] hover:border-white/15 transition">
            <div className="rounded-[21px] bg-gradient-to-b from-[#1a1a1e] to-[#121214] p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/10">{m.league}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${m.status==="Live"?"bg-red-500/15 text-red-400 animate-pulse":"text-zinc-500"}`}>● {m.status} {m.time}</span>
                </div>
                <div className="text-[20px] font-black tracking-tight">{m.score}</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-bold text-[17px] leading-none">{m.home}</div>
                  <div className="font-bold text-[17px] leading-none text-zinc-500">{m.away}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-500">PREDICTION</div>
                  <div className="w-10 h-10 rounded-full bg-zinc-800 grid place-items-center">vs</div>
                </div>
              </div>

              {/* SINGLE COOL TIP */}
              <div className="mt-4 rounded-[16px] bg-[#0a0a0c] border border-green-500/20 p-3.5 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/20 blur-[30px] rounded-full" />
                <div className="relative flex justify-between items-start">
                  <div>
                    <div className="text-[10px] tracking-widest font-bold text-green-400">{m.tip?.market} • {m.tip?.conf}% CONFIDENCE</div>
                    <div className="text-[18px] font-black mt-1 leading-tight">{m.tip?.pick}</div>
                    <div className="text-[12px] text-zinc-400 mt-1">{m.tip?.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-zinc-500">ODD</div>
                    <div className="text-[18px] font-black text-green-300">@{m.tip?.odd}</div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full" style={{width:`${m.tip?.conf}%`}} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
            }
