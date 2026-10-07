"use client";
import { useState } from "react";

type Game = { id: string; home: string; away: string; time: string; pick: string; odds: string; league: string };

const PAYSTACK_WEEKLY = "https://paystack.shop/pay/ymhc63wsn0";
const PAYSTACK_MONTHLY = "https://paystack.shop/pay/m9d3elg1uv";

const footballLeagues = ["All Football","Premier League","LaLiga","Serie A","Bundesliga","Ligue 1","Champions League","Europa League","Conference League"];
const basketballLeagues = ["All Basketball","NBA","EuroLeague","Liga ACB"];

const leagueTeams: Record<string, [string,string][]> = {
  "Premier League":[["Man City","Arsenal"],["Liverpool","Chelsea"],["Man United","Tottenham"],["Newcastle","Brighton"]],
  "LaLiga":[["Real Madrid","Barcelona"],["Atletico Madrid","Sevilla"]],
  "Serie A":[["Inter","AC Milan"],["Juventus","Napoli"]],
  "Bundesliga":[["Bayern Munich","Leverkusen"],["Dortmund","Leipzig"]],
  "Ligue 1":[["PSG","Marseille"],["Lyon","Monaco"]],
  "Champions League":[["Man City","Real Madrid"],["Bayern","Barcelona"]],
  "Europa League":[["Man United","Roma"],["Tottenham","Lazio"]],
  "Conference League":[["Chelsea","Fiorentina"],["Betis","Copenhagen"]],
  "NBA":[["Lakers","Warriors"],["Celtics","Knicks"],["Bulls","Heat"]],
  "EuroLeague":[["Real Madrid","Barcelona"],["Fenerbahce","Olympiacos"]],
  "Liga ACB":[["Real Madrid","Barcelona"],["Unicaja","Valencia"]],
};

function makeGames(){
  const all: Record<string, Game[]> = {};
  Object.entries(leagueTeams).forEach(([lg, pairs])=>{
    all[lg] = pairs.map((p,i)=>({ id:`${lg}-${i}`, league: lg, home:p[0], away:p[1], time:`${18+i}:00`, pick: i%2===0? "Home Win" : "Over 2.5", odds: (1.65 + Math.random()*0.8).toFixed(2) }));
  });
  return all;
}
const ALL_GAMES = makeGames();

export default function Page(){
  const [sport, setSport] = useState<"football"|"basketball">("football");
  const [active, setActive] = useState("All Football");
  const [tab, setTab] = useState<"home"|"profile">("home");
  const [ticket, setTicket] = useState<Game[]>([]);

  const currentLeagues = sport==="football"? footballLeagues : basketballLeagues;

  // auto switch active when sport changes
  const handleSportChange = (s:"football"|"basketball")=>{
    setSport(s);
    setActive(s==="football"? "All Football" : "All Basketball");
  };

  const gamesToShow = active.includes("All")
   ? (sport==="football"? footballLeagues.slice(1).flatMap(l=>ALL_GAMES[l]||[]) : basketballLeagues.slice(1).flatMap(l=>ALL_GAMES[l]||[]))
    : ALL_GAMES[active] || [];

  return (
    <div style={{background:"#000",color:"#fff",minHeight:"100vh",paddingBottom:130}}>
      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:50,background:"#000",borderBottom:"1px solid #111",display:"flex",justifyContent:"space-between",padding:12,alignItems:"center"}}>
        <b>SCORE<span style={{color:"#00ff88"}}>SCRIBE</span></b>
        <a href={PAYSTACK_WEEKLY} target="_blank" style={{background:"#fff",color:"#000",padding:"6px 12px",borderRadius:20,fontWeight:800,fontSize:11,textDecoration:"none"}}>VIP</a>
      </div>

      {tab==="home"? (
        <>
          {/* SPORT TABS - FOOTBALL / BASKETBALL */}
          <div style={{display:"flex",gap:8,padding:"10px 12px"}}>
            <button onClick={()=>handleSportChange("football")} style={{flex:1,padding:"10px",borderRadius:12,fontWeight:900,fontSize:13,background:sport==="football"?"#fff":"#111",color:sport==="football"?"#000":"#666",border:"1px solid #222"}}>⚽ FOOTBALL</button>
            <button onClick={()=>handleSportChange("basketball")} style={{flex:1,padding:"10px",borderRadius:12,fontWeight:900,fontSize:13,background:sport==="basketball"?"#fff":"#111",color:sport==="basketball"?"#000":"#666",border:"1px solid #222"}}>🏀 BASKETBALL</button>
          </div>

          {/* LEAGUE TABS FOR SELECTED SPORT */}
          <div style={{display:"flex",gap:8,overflowX:"auto",padding:"0 12px 12px",borderBottom:"1px solid #111"}}>
            {currentLeagues.map(l=>(
              <button key={l} onClick={()=>setActive(l)} style={{whiteSpace:"nowrap",padding:"6px 12px",borderRadius:20,fontSize:11,fontWeight:600,background:active===l?"#00ff88":"#111",color:active===l?"#000":"#888"}}>{l.replace("All Football","ALL").replace("All Basketball","ALL")}</button>
            ))}
          </div>

          <div style={{padding:"10px 12px"}}>
            {gamesToShow.slice(0,10).map((g,idx)=>{
              const locked = idx>=3;
              const sel =!!ticket.find(t=>t.id===g.id);
              return (
                <div key={g.id} style={{background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:14,padding:12,marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#666"}}><span>{g.league} • {g.time}</span><span>@{g.odds}</span></div>
                  <div style={{fontWeight:700,margin:"6px 0",fontSize:14}}>{g.home} vs {g.away}</div>
                  <div style={{fontSize:11,color:"#00ff88"}}>{g.pick}</div>
                  {locked? <a href={PAYSTACK_MONTHLY} target="_blank" style={{display:"block",marginTop:8,textAlign:"center",background:"#111",border:"1px solid #222",color:"#888",padding:"8px",borderRadius:10,fontSize:11,textDecoration:"none"}}>🔒 VIP ONLY</a>
                  : <button onClick={()=> sel? setTicket(ticket.filter(t=>t.id!==g.id)) : setTicket([...ticket,g])} style={{marginTop:8,width:"100%",padding:"8px",borderRadius:10,fontSize:11,fontWeight:800,background:sel?"#00ff88":"#fff",color:"#000"}}>{sel?"✓ ADDED":"ADD TO TICKET"}</button>}
                </div>
              )
            })}
          </div>
        </>
      ):(
        <div style={{padding:20}}>
          <h2 style={{fontSize:18,fontWeight:900}}>PROFILE</h2>
          <div style={{marginTop:16,background:"#0e0e0e",border:"1px solid #1a1a1a",borderRadius:16,padding:16}}>
            <div style={{fontSize:11,color:"#888"}}>ACCOUNT STATUS</div>
            <div style={{fontSize:18,fontWeight:900,marginTop:6}}>FREE USER</div>
            <a href={PAYSTACK_WEEKLY} target="_blank" style={{display:"block",marginTop:14,background:"#00ff88",color:"#000",textAlign:"center",padding:"12px",borderRadius:12,fontWeight:900,textDecoration:"none"}}>WEEKLY VIP - ₦4,900</a>
            <a href={PAYSTACK_MONTHLY} target="_blank" style={{display:"block",marginTop:10,background:"#fff",color:"#000",textAlign:"center",padding:"12px",borderRadius:12,fontWeight:900,textDecoration:"none"}}>MONTHLY - ₦17,900</a>
          </div>
        </div>
      )}

      {ticket.length>0 && tab==="home" && (
        <div style={{position:"fixed",bottom:60,left:0,right:0,zIndex:100,background:"#0a0a0a",borderTop:"2px solid #00ff88",padding:"12px",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontWeight:900}}>{ticket.length} SELECTED</span>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setTicket([])} style={{background:"#222",color:"#fff",borderRadius:20,padding:"8px 14px",fontSize:12}}>CLEAR</button>
            <button onClick={()=>{
              const text = ticket.map(t=>`${t.home} vs ${t.away} - ${t.pick}`).join("\n");
              const blob = new Blob([text],{type:"text/plain"}); const url=URL.createObjectURL(blob);
              const a=document.createElement("a"); a.href=url; a.download="ticket.txt"; a.click();
            }} style={{background:"#00ff88",color:"#000",borderRadius:20,padding:"8px 16px",fontWeight:900,fontSize:12}}>DOWNLOAD</button>
          </div>
        </div>
      )}

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#000",borderTop:"1px solid #1a1a1a",display:"flex",justifyContent:"space-around",padding:"12px 0"}}>
        <button onClick={()=>setTab("home")} style={{color:tab==="home"?"#fff":"#555",fontSize:11,fontWeight:800,background:"none",border:"none"}}>HOME</button>
        <button style={{color:"#555",fontSize:11,background:"none",border:"none"}}>TICKET ({ticket.length})</button>
        <button onClick={()=>setTab("profile")} style={{color:tab==="profile"?"#fff":"#555",fontSize:11,fontWeight:800,background:"none",border:"none"}}>PROFILE</button>
      </div>
    </div>
  )
            }
