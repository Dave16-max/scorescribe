"use client"
import { useEffect, useState } from "react"
export default function VIPPage(){
  const [isVIP,setIsVIP]=useState(false)
  const [expiry,setExpiry]=useState("")
  const [plan,setPlan]=useState("")
  useEffect(()=>{ 
    if(localStorage.getItem("vip_active")==="true"){ 
      setIsVIP(true); 
      setExpiry(localStorage.getItem("vip_expiry")||"")
      setPlan(localStorage.getItem("vip_plan")||"")
    } 
  },[])

  const pay=(t:string,a:number,d:number)=>{ 
    localStorage.setItem("vip_active","true"); 
    localStorage.setItem("vip_expiry",new Date(Date.now()+d*24*60*60*1000).toDateString()); 
    localStorage.setItem("vip_plan",t); 
    alert(`${t} payment ₦${a} successful!`); 
    location.href="/"
  }

  return(
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"white",padding:20}}>
      <button onClick={()=>history.back()} style={{background:"#222",border:"none",color:"white",padding:"8px 12px",borderRadius:20}}>← Back</button>
      <h1 style={{marginTop:20,fontWeight:900}}>👑 VIP PLANS</h1>

      {!isVIP?(
        <>
          <div onClick={()=>pay("WEEKLY",4900,7)} style={{marginTop:20,background:"#151515",border:"2px solid #00ff88",borderRadius:12,padding:16,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:900}}>WEEKLY PLAN</span>
              <span style={{background:"#00ff88",color:"black",padding:"4px 10px",borderRadius:20,fontWeight:900,fontSize:12}}>POPULAR</span>
            </div>
            <div style={{fontSize:28,fontWeight:900,marginTop:8}}>₦4,900<span style={{fontSize:14,color:"#888"}}>/week</span></div>
            <div style={{fontSize:12,color:"#aaa",marginTop:6}}>✅ Exact scores • Daily tips • 7 days access</div>
          </div>

          <div onClick={()=>pay("MONTHLY",17900,30)} style={{marginTop:12,background:"#1a1a1a",border:"1px solid #333",borderRadius:12,padding:16,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:900}}>MONTHLY PLAN</span>
              <span style={{background:"#333",color:"white",padding:"4px 10px",borderRadius:20,fontWeight:900,fontSize:12}}>BEST VALUE</span>
            </div>
            <div style={{fontSize:28,fontWeight:900,marginTop:8}}>₦17,900<span style={{fontSize:14,color:"#888"}}>/month</span></div>
            <div style={{fontSize:12,color:"#aaa",marginTop:6}}>✅ Save ₦1700 • 30 days • All VIP tips + Telegram</div>
          </div>

          <div style={{marginTop:15,textAlign:"center",color:"#666",fontSize:11}}>Secure payment • Instant activation</div>
        </>
      ):(
        <div style={{background:"#00ff88",color:"black",borderRadius:12,padding:20,marginTop:20}}>
          <h2 style={{margin:0}}>✅ {plan} ACTIVE</h2>
          <div style={{marginTop:8,fontWeight:700}}>Expires: {expiry}</div>
          <div style={{marginTop:10,fontSize:12}}>You now have full access to all VIP predictions</div>
          <button onClick={()=>{localStorage.clear(); location.reload()}} style={{marginTop:15,background:"black",color:"white",border:"none",padding:10,borderRadius:8,width:"100%"}}>Cancel Subscription</button>
        </div>
      )}
    </div>
  )
                                                                                                                                        }
