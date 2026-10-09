// lib/auth/session.js
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyIdToken } from "./verifyToken";

export const getToken = async () =>
  (await cookies()).get("__session")?.value ?? null;

// Redirect nahi karta. Token valid ho to user, warna null.
export const getSessionUser = cache(async () => {
  const token = await getToken();
  if (!token) return null;
  try {
    const p = await verifyIdToken(token);
    return {
      uid: p.sub,
      email: p.email,
      name: p.name ?? "",
      emailVerified: !!p.email_verified,
    };
  } catch {
    return null;
  }
});

// Student pages/layouts ke liye
export const requireUser = cache(async () => {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.emailVerified) redirect("/verify-email");
  return user;
});
