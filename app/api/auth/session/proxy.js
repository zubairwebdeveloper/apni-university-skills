// proxy.js
import { NextResponse } from "next/server";

const COOKIE = "__session";

// Sirf expiry dekhta hai. Asal verification layouts me hoti hai.
function isExpired(token) {
  try {
    const part = token.split(".")[1];
    const json = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return !json.exp || json.exp * 1000 <= Date.now() + 10_000;
  } catch {
    return true;
  }
}

export function proxy(request) {
  const token = request.cookies.get(COOKIE)?.value;
  if (token && !isExpired(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  const target = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(target)}`;

  const res = NextResponse.redirect(url);
  if (token) res.cookies.delete(COOKIE);
  return res;
}

export const config = { matcher: ["/student/:path*", "/admin/:path*"] };
