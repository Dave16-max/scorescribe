"use client";

export function getVip() {
  if (typeof window === "undefined") return { active: false };
  const saved = localStorage.getItem("scorescribe_vip");
  if (!saved) return { active: false };
  try {
    const data = JSON.parse(saved);
    const isExpired = new Date(data.expiresAt) < new Date();
    if (isExpired) {
      localStorage.removeItem("scorescribe_vip");
      return { active: false };
    }
    return { active: true, ...data };
  } catch {
    return { active: false };
  }
}

export function activateVip(plan = "WEEKLY") {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (plan === "WEEKLY" ? 7 : 30));
  const data = {
    plan,
    active: true,
    expiresAt: expiresAt.toISOString(),
    displayExpiry: expiresAt.toDateString()
  };
  localStorage.setItem("scorescribe_vip", JSON.stringify(data));
  window.dispatchEvent(new Event("vip_changed")); // notify all pages
  return data;
}
