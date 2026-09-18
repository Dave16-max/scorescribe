import { NextResponse } from 'next/server'
export const revalidate = 21600

function predict(h:number, a:number){
  const diff = h-a
  if(diff>0.5) return {p:'1', c:70+Math.round(diff*10)}
  if(diff<-0.5) return {p:'2', c:68+Math.round(Math.abs(diff)*10)}
  return {p:'X', c:54}
}

export async function GET(){
  const today = new Date().toDateString()
  const data = [
    {id:1, league:'Premier League', home:'Arsenal', away:'Chelsea', time:'15:00', hs:1.8, as:1.2},
    {id:2, league:'Premier League', home:'Man City', away:'Liverpool', time:'17:30', hs:2.1, as:1.9},
    {id:3, league:'LaLiga', home:'Real Madrid', away:'Barcelona', time:'20:00', hs:1.9, as:1.7},
    {id:4, league:'Serie A', home:'Inter', away:'AC Milan', time:'18:00', hs:1.6, as:1.3},
    {id:5, league:'NPFL', home:'Enyimba', away:'Rangers', time:'16:00', hs:1.4, as:1.1},
  ].map(m=>{
    const r = predict(m.hs, m.as)
    return {...m, date:today, prediction:r.p, confidence:Math.min(r.c,84), over25:m.hs+m.as>2.5?'Yes':'No', btts:'Yes', analysis:`${m.home} stronger at home. Model favors ${r.p==='1'?'home':r.p==='2'?'away':'draw'} win.`}
  })
  return NextResponse.json(data, {headers:{'Cache-Control':'public, s-maxage=21600'}})
      }
