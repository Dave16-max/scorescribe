"use client"
export default function VipPage(){
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"white",padding:20, maxWidth:420, margin:"0 auto", textAlign:"center" as const, fontFamily:"Arial"}}>
      <h1 style={{fontSize:32, fontWeight:900, marginTop:20}}>🔥 ScoreScribe VIP 🔥</h1>
      
      <div style={{background:"#1a1a1a",padding:30,borderRadius:15,marginTop:20,border:"1px solid #333"}}>
        <h2>7 Days VIP</h2>
        <div style={{fontSize:36,color:"#00ff88",fontWeight:"bold",margin:"15px 0"}}>₦4,900</div>
        <a href="https://paystack.shop/pay/th62vob3uv" style={{display:"block",background:"#00ff88",color:"black",padding:15,borderRadius:10,textDecoration:"none",fontWeight:"bold",fontSize:18}}>Pay Weekly</a>
      </div>

      <div style={{background:"#1a1a1a",padding:30,borderRadius:15,marginTop:20,border:"1px solid #00ff88"}}>
        <h2>30 Days VIP</h2>
        <div style={{fontSize:36,color:"#00ff88",fontWeight:"bold",margin:"15px 0"}}>₦17,900</div>
        <a href="https://paystack.shop/pay/bx2cknegpx" style={{display:"block",background:"#00ff88",color:"black",padding:15,borderRadius:10,textDecoration:"none",fontWeight:"bold",fontSize:18}}>Pay Monthly - Best Value</a>
      </div>

      <a href="/" style={{display:"block",marginTop:30,color:"#777",textDecoration:"none"}}>← Back to Free Tips</a>
    </div>
  )
}



