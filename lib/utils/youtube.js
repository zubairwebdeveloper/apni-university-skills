// lib/utils/youtube.js
const ID = /^[\w-]{11}$/;

/** Accepts a YouTube link (watch, youtu.be, embed, shorts, live) or a bare 11-char ID. Returns the ID or null. */
export function extractYouTubeId(input) {
  const s = String(input ?? "").trim();
  if (!s) return null;
  if (ID.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^(www|m|music)\./, "");
    let id = null;
    if (host === "youtu.be") {
      id = u.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else
        id = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)?.[1];
    }
    return id && ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function youtubeThumbnail(id) {
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function isHttpUrl(value) {
  try {
    const u = new URL(String(value ?? "").trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
