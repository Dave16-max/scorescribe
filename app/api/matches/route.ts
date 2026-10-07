import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  let matches:any[] = [];
  const today = new Date();

  const footLeagues = [
    { id:'eng.1', name:'Premier League' },
    { id:'esp.1', name:'La Liga' },
    { id:'ita.1', name:'Serie A' },
    { id:'ger.1', name:'Bundesliga' },
    { id:'fra.1', name:'Ligue 1' },
  ];

  const basketLeagues = [
    { id:'nba', name:'NBA' },
    { id:'euroleague', name:'EuroLeague' },
    { id:'liga-acb', name:'Liga ACB' },
    { id:'wnba', name:'WNBA' },
    { id:'mens-college-basketball', name:'NCAA' },
  ];

  for(let i=0; i<2; i++){
    const d = new Date();
    d.setDate(today.getDate()+i);
    const dateStr = d.toISOString().slice(0,10).replace(/-/g,'');

    // FOOTBALL - 5 LEAGUES
    for(const lg of footLeagues){
      try{
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${lg.id}/scoreboard?dates=${dateStr}`, { next:{revalidate:3600} });
        const data = await res.json();
        data.events?.forEach((e:any)=>{
          const comp = e.competitions[0];
          matches.push({
            home: comp.competitors[1]?.team?.shortDisplayName || comp.competitors[1]?.team?.abbreviation,
            away: comp.competitors[0]?.team?.shortDisplayName || comp.competitors[0]?.team?.abbreviation,
            league: lg.name,
            time: new Date(e.date).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Lagos'}) + ' WAT',
            sport:'Football'
          });
        });
      }catch{}
    }

    // BASKETBALL - 5 LEAGUES (NBA, EuroLeague, Liga ACB, WNBA, NCAA)
    for(const lg of basketLeagues){
      try{
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/${lg.id}/scoreboard?dates=${dateStr}`, { next:{revalidate:3600} });
        const data = await res.json();
        data.events?.slice(0,4).forEach((e:any)=>{
          const comp = e.competitions[0];
          matches.push({
            home: comp.competitors[0]?.team?.shortDisplayName || comp.competitors[0]?.team?.displayName,
            away: comp.competitors[1]?.team?.shortDisplayName || comp.competitors[1]?.team?.displayName,
            league: lg.name,
            time: new Date(e.date).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Africa/Lagos'}) + ' WAT',
            sport:'Basketball'
          });
        });
      }catch(e){
        console.log('Basket error', lg.name);
      }
    }
  }

  // Fallback if no games today
  if(matches.length===0){
    matches = [
      { home:"Arsenal", away:"Leeds", league:"Premier League", time:"12:30 WAT", sport:"Football" },
      { home:"Man United", away:"Tottenham", league:"Premier League", time:"17:30 WAT", sport:"Football" },
      { home:"Real Madrid", away:"Barcelona", league:"La Liga", time:"20:00 WAT", sport:"Football" },
      { home:"Lakers", away:"Warriors", league:"NBA", time:"02:00 WAT", sport:"Basketball" },
      { home:"Real Madrid", away:"Barcelona", league:"EuroLeague", time:"19:00 WAT", sport:"Basketball" },
      { home:"Barca Basket", away:"Baskonia", league:"Liga ACB", time:"18:30 WAT", sport:"Basketball" },
      { home:"Liberty", away:"Aces", league:"WNBA", time:"01:00 WAT", sport:"Basketball" },
      { home:"Duke", away:"UNC", league:"NCAA", time:"00:00 WAT", sport:"Basketball" },
    ];
  }

  return NextResponse.json(matches.slice(0,30));
}
