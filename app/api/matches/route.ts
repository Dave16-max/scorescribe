import { NextResponse } from 'next/server'
export const revalidate = 60

function predict(h:number, a:number){
  const diff = h-a
  if(diff>0.5) return { p:'1', c:78, text:'Home Win' }
  if(diff<-0.5) return { p:'2', c:75, text:'Away Win' }
  return { p:'X', c:54, text:'Draw' }
}

export async function GET(){
  const today = new Date().toDateString()
  const data = [
    {id:1, league:'Premier League', home:'Man City', away:'Arsenal', hs:2.1, as:1.4, score:'2-1', status:'Live', time:'67'},
    {id:2, league:'Premier League', home:'Chelsea', away:'Man Utd', hs:1.2, as:1.5, score:'1-1', status:'Live', time:'54'},
    {id:3, league:'LaLiga', home:'Real Madrid', away:'Barcelona', hs:1.9, as:1.8, score:'0-0', status:'Upcoming', time:'19:00'},
    {id:4, league:'Serie A', home:'Inter', away:'AC Milan', hs:1.6, as:1.3, score:'1-0', status:'FT', time:'FT'},
    {id:5, league:'NPFL', home:'Enyimba', away:'Rangers', hs:1.7, as:1.1, score:'2-0', status:'Live', time:'71'},
  ].map((m:any)=>{
    const r = predict(m.hs, m.as)
    return {...m, date:today, prediction:r.p, confidence:r.c, predText:r.text}
  })
  return NextResponse.json({ matches: data }, { headers: { 'Cache-Control': 's-maxage=60' } })
}
