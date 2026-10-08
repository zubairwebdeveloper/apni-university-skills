// proxy.js (Next.js 16+; on Next 15 name it middleware.js and export `middleware`)
// UX only: bounces visitors with no cookie to login with ?next=. Real verification is in the layouts.
import { NextResponse } from "next/server";

export function proxy(request) {
  if (request.cookies.get("__session")) return NextResponse.next();
  const url = request.nextUrl.clone();
  const target = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(target)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/student/:path*", "/admin/:path*"] };

