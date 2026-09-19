"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/matches");
      const d = await r.json();
      setMatches(d.matches || []);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ padding: 20, background: "#0a0a0a", color: "white", minHeight: "100vh", fontFamily: "Arial" }}>
      <h1>ScoreScribe ⚽ Live</h1>
      <button onClick={load} style={{ padding: "10px 20px", background: "#22c55e", border: 0, borderRadius: 8, color: "white" }}>Refresh</button>
      {loading ? <p>Loading...</p> : matches.map((m:any, i:number) => (
        <div key={i} style={{ border: "1px solid #333", padding: 15, marginTop: 12, borderRadius: 10 }}>
          <small>{m.league} • {m.date}</small>
          <h3>{m.home} {m.score} {m.away}</h3>
          <p>Pred: {m.prediction} ({m.confidence}%) - {m.predText}</p>
          <p style={{ color: m.status === "Live" ? "#22c55e" : "#888" }}>{m.status} {m.time}</p>
        </div>
      ))}
    </div>
  );
}
