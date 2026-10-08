// lib/utils/url.js
export function buildQuery(base, params = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params))
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

// Database-sourced links must never become javascript: or data: URLs
export function safeExternalUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}
export function safeNext(value, fallback = "/student") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return fallback;
  try {
    return new URL(value, "http://x").origin === "http://x" ? value : fallback;
  } catch {
    return fallback;
  }
}
