// lib/auth/authorize.js (extends Part 1's file; keep assertRole)
import "server-only";
import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { adminAuth } from "@/lib/firebase/admin/auth";
import { can } from "@/lib/constants/permissions";
import { requireUser, getSessionUser } from "./session";

export async function assertRole(...roles) {
  const user = await getSessionUser();
  if (!user) throw new AppError("Please log in to continue.", 401);
  if (!roles.includes(user.role))
    throw new AppError("You don't have permission to do that.", 403);
  return user;
}

// For server actions and route handlers. Throws AppError.
// fresh: re-read the claim from Firebase Auth instead of trusting the session cookie.
export async function assertPermission(permission, { fresh = false } = {}) {
  const user = await getSessionUser();
  if (!user) throw new AppError("Please log in to continue.", 401);
  if (!user.emailVerified)
    throw new AppError("Please verify your email first.", 403);
  let role = user.role;
  if (fresh) {
    const record = await adminAuth.getUser(user.uid);
    if (record.disabled)
      throw new AppError("This account has been disabled.", 403);
    role = record.customClaims?.role ?? "student";
  }
  if (!can(role, permission))
    throw new AppError("You don't have permission to do that.", 403);
  return { ...user, role };
}

// For pages and layouts. Wrong permission gets a 404, so admin routes don't confirm they exist.
export async function requirePermission(permission) {
  const user = await requireUser();
  if (!can(user.role, permission)) notFound();
  return user;
}

