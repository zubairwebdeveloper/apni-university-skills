import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin/auth";
import { userService } from "@/services/userService";
import { settingsService } from "@/services/settingsService";
import { emailService } from "@/services/email/emailService";
import { rateLimit } from "@/lib/security/rateLimit";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { STAFF_ROLES } from "@/lib/constants/roles";

const body = z.object({ idToken: z.string().min(20).max(4096) });
const fail = (error, status) => NextResponse.json({ error }, { status });
const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export async function POST(req) {
  if (!req.headers.get("content-type")?.includes("application/json"))
    return fail("Invalid request.", 415);
  if (!(await rateLimit("session", { limit: 20, windowSec: 300 })).ok)
    return fail("Too many attempts. Please wait a few minutes.", 429);

  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid request.", 400);

  try {
    const decoded = await adminAuth.verifyIdToken(parsed.data.idToken, true);
    if (Date.now() / 1000 - decoded.auth_time > 300)
      return fail("Please sign in again.", 401);

    const { isActive, created } = await userService.syncProfile(decoded);
    if (!isActive) return fail("This account has been disabled.", 403);

    const sec = await settingsService.getSecurity();
    const days = STAFF_ROLES.includes(decoded.role)
      ? sec.staffSessionDays
      : sec.sessionDays;
    const ms = days * 864e5;

    const cookie = await adminAuth.createSessionCookie(parsed.data.idToken, {
      expiresIn: ms,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, cookie, {
      ...cookieBase,
      maxAge: ms / 1000,
    });

    if (created)
      await emailService.send(
        "welcome",
        decoded.email,
        { name: decoded.name },
        { flag: "welcome" },
      );
    return res;
  } catch (e) {
    console.error("[session]", e?.code ?? e?.message ?? e);
    return fail("Could not start your session. Please try again.", 401);
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieBase, maxAge: 0 });
  return res;
}
