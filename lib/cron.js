// lib/cron.js
import "server-only";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Returns a response to send back, or null when the request is authorized
export function cronGuard(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Cron is not configured." },
      { status: 503 },
    );
  const got = Buffer.from(req.headers.get("authorization") ?? ""),
    want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want)
    ? null
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

