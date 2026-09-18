"use client"
import useSWR from 'swr'
import {useState} from 'react'
const fetcher=(u:string)=>fetch(u).then(r=>r.json())
export default function Home(){
  const {data} = useSWR('/api/matches',fetcher,{refreshInterval:300000})
  const [f,setF]=useState('All')
  return(
    <div style={{background:'#F8F9FF',minHeight:'100vh',fontFamily:'sans-serif'}}>
      <div style={{background:'white',padding:'16px',display:'flex',justifyContent:'space-between',borderBottom:'1px solid #eee'}}>
        <b style={{fontSize:'20px'}}>⚽ ScoreScribe</b><span style={{background:'#0B5FFF',color:'white',padding:'4px 12px',borderRadius:'20px',fontSize:'12px'}}>LIVE • {new Date().toDateString()}</span>
      </div>
      <div style={{maxWidth:'800px',margin:'0 auto',padding:'20px'}}>
        <h1 style={{textAlign:'center',fontSize:'32px',fontWeight:800}}>Smart Predictions,<br/><span style={{color:'#0B5FFF'}}>Written By Data</span></h1>
        <div style={{display:'flex',gap:'8px',margin:'20px 0',overflowX:'auto'}}>
          {['All','Premier League','LaLiga','Serie A','NPFL'].map(l=><button key={l} onClick={()=>setF(l)} style={{padding:'8px 16px',borderRadius:'20px',border:'1px solid #ddd',background:f===l?'#0B5FFF':'white',color:f===l?'white':'black'}}>{l}</button>)}
        </div>
        <div style={{display:'grid',gap:'12px'}}>
          {data?.filter((m:any)=>f==='All'||m.league===f).map((m:any)=><div key={m.id} style={{background:'white',padding:'16px',borderRadius:'16px',border:'1px solid #eee'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'#888'}}><span>{m.league}</span><span>{m.time}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px',alignItems:'center'}}>
              <div><div style={{fontWeight:700}}>{m.home}</div><div style={{fontWeight:700}}>{m.away}</div></div>
              <div style={{background:'#0B5FFF',color:'white',padding:'8px 14px',borderRadius:'20px',fontWeight:700}}>{m.prediction} • {m.confidence}%</div>
            </div>
            <div style={{fontSize:'12px',marginTop:'8px',color:'#555'}}>Over 2.5: {m.over25} | BTTS: {m.btts}</div>
          </div>)||<p>Loading...</p>}
        </div>
        <p style={{textAlign:'center',marginTop:'30px',fontSize:'12px',color:'#999'}}>Auto-updates every 6 hours • ScoreScribe 2026</p>
      </div>
    </div>
  )
}
