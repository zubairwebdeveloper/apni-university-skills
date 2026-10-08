import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase/admin/auth";

export const SESSION_COOKIE = "__session";

// cache() = one verification per request, even if layout + page + actions all ask
export const getSessionUser = cache(async () => {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const d = await adminAuth.verifySessionCookie(value, true); // true = reject revoked sessions
    return {
      uid: d.uid,
      email: d.email ?? null,
      name: d.name ?? null,
      role: d.role ?? "student",
      emailVerified: !!d.email_verified,
    };
  } catch {
    return null;
  }
});

export async function requireUser({ verified = true } = {}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  
  return user;
}

// Wrong role gets a 404, so admin routes don't confirm they exist
export async function requireRole(...roles) {
  const user = await requireUser();
  if (!roles.includes(user.role)) notFound();
  return user;
}

