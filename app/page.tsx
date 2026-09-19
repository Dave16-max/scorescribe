"use client"
import { useEffect, useState } from "react"
type Tip = { market: string, pick: string, odd: string, conf: number }
type Match = { id: string, league: string, home: string, away: string, score: string, status: string, time: string, tips: Tip[] }
type Pick = { matchId: string, game: string, market: string, pick: string, odd: string }

function genCode(){
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let c=""; for(let i=0;i<6;i++) c+=chars[Math.floor(Math.random()*chars.length)]
  return c
}

export default function Page(){
  const [matches,setMatches]=useState<Match[]>([])
  const [slip,setSlip]=useState<Pick[]>([])
  const [code,setCode]=useState("")
  const [filter,setFilter]=useState("All")
  useEffect(()=>{fetch("/api/matches").then(r=>r.json()).then(d=>setMatches(d.matches||[])); setCode(genCode())},[])
  const addPick=(m:Match,t:Tip)=>{
    const ex=slip.find(s=>s.matchId===m.id && s.market===t.market)
    if(ex) setSlip(slip.filter(s=>!(s.matchId===m.id && s.market===t.market)))
    else setSlip([...slip,{matchId:m.id,game:`${m.home} vs ${m.away}`,market:t.market,pick:t.pick,odd:t.odd}])
  }
  const filtered=filter==="All"?matches:matches.filter(m=>m.league===filter)
  const total=slip.length?slip.reduce((a,b)=>a*parseFloat(b.odd),1).toFixed(2):"0"
  const leagues=["All",...Array.from(new Set(matches.map(m=>m.league)))]
  return(
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-[#0a0a0b]/80 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-white text-black font-black flex items-center justify-center">S</div><div><div className="font-black">SCORESCRIBE</div><div className="text-[10px] text-zinc-400">BET BUILDER</div></div></div>
          <div className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-400">{matches.length} Games</div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {leagues.map(l=><button key={l} onClick={()=>setFilter(l)} className={`text-xs px-4 py-2 rounded-full border ${filter===l?"bg-white text-black":"bg-zinc-900 border-white/10 text-zinc-400"}`}>{l}</button>)}
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-3 pb-28">
        {filtered.map(m=>(
          <div key={m.id} className="bg-zinc-900 rounded-[20px] p-4 border border-white/5">
            <div className="flex justify-between text-[11px] mb-2"><span className="px-2 py-1 rounded-full bg-white/10">{m.league}</span><span className="text-zinc-400">{m.status} {m.time}</span></div>
            <div className="flex justify-between"><div className="font-bold">{m.home} vs {m.away}</div><div className="font-black">{m.score}</div></div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {m.tips?.map((t,i)=>{
                const active=!!slip.find(s=>s.matchId===m.id && s.market===t.market)
                return <button key={i} onClick={()=>addPick(m,t)} className={`p-2 rounded-xl border text-[11px] text-left ${active?"bg-white text-black":"bg-black/40 border-white/10"}`}><div className="opacity-60 text-[9px]">{t.market}</div><div className="font-bold">{t.pick} @{t.odd}</div></button>
              })}
            </div>
          </div>
        ))}
      </div>
      {slip.length>0 && <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 p-4"><div className="flex justify-between text-sm"><span>{slip.length} picks • Code: {code}</span><span className="font-bold">{total}x</span></div><button onClick={()=>{const txt=`Ticket ${code}\n`+slip.map(s=>`${s.game} - ${s.market}:${s.pick} @${s.odd}`).join("\n")+`\nTotal:${total}`; navigator.clipboard.writeText(txt); alert("Copied "+code)}} className="w-full mt-3 bg-white text-black py-3 rounded-xl font-bold">Copy Ticket {code}</button><button onClick={()=>setSlip([])} className="w-full mt-2 text-xs text-zinc-500">Clear slip</button></div>}
    </div>
  )
      }
