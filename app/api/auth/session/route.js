// app/api/auth/session/route.js
import { NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth/verifyToken";

const COOKIE = "__session";

export async function POST(req) {
  const { token } = await req.json().catch(() => ({}));

  if (!token) {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(COOKIE);
    return res;
  }

  try {
    await verifyIdToken(token);
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
