"use client";
import { useEffect, useState } from "react";

export default function VipPage() {
  const [isVip, setIsVip] = useState(false);
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    if (localStorage.getItem("vip_active") === "true") {
      setIsVip(true);
      setExpiry(localStorage.getItem("vip_expiry") || "");
    }
    // load paystack script
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    document.body.appendChild(script);
  }, []);

  const pay = (plan: string, amount: number, days: number) => {
    // @ts-ignore
    const handler = window.PaystackPop?.setup({
      key: "pk_test_b5c6d6ad2c3409000320aa388146e26d72cebec0",
      email: "user@scorescribe.com",
      amount: amount * 100,
      currency: "NGN",
      ref: Date.now().toString(),
      callback: function () {
        const exp = new Date();
        exp.setDate(exp.getDate() + days);
        localStorage.setItem("vip_active", "true");
        localStorage.setItem("vip_expiry", exp.toISOString());
        localStorage.setItem("vip_plan", plan);
        alert(`Payment successful! ${plan} Activated!`);
        location.href = "/";
      },
      onClose: function () {
        alert("Payment closed");
      },
    });
    handler.openIframe();
  };

  if (isVip) {
    return (
      <div style={{ minHeight: "100vh", padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "green", fontSize: "24px", fontWeight: "bold" }}>VIP ACTIVE</h1>
        <p>Expires: {new Date(expiry).toDateString()}</p>
        <button onClick={() => location.href="/"} style={{marginTop:"20px", background:"#0a5c36", color:"white", padding:"12px 24px", borderRadius:"8px"}}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "20px" }}>
      <button onClick={() => history.back()} style={{ marginBottom: "20px" }}>← Back</button>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center" }}>Unlock VIP</h1>
      
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
        <h2>WEEKLY - N4900</h2>
        <p>7 days access to all predictions</p>
        <button onClick={() => pay("WEEKLY", 4900, 7)} style={{ width: "100%", background: "#0a5c36", color: "white", padding: "14px", borderRadius: "8px", marginTop: "10px", fontWeight: "bold" }}>
          Pay N4900 with Paystack
        </button>
        <p style={{fontSize:"11px", color:"gray", marginTop:"8px", textAlign:"center"}}>Test card: 4084 0840 8408 4081</p>
      </div>

      <div style={{ background: "white", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
        <h2>MONTHLY - N8900</h2>
        <p>30 days access</p>
        <button onClick={() => pay("MONTHLY", 8900, 30)} style={{ width: "100%", background: "black", color: "white", padding: "14px", borderRadius: "8px", marginTop: "10px", fontWeight: "bold" }}>
          Pay N8900 with Paystack
        </button>
      </div>
    </div>
  );
}
