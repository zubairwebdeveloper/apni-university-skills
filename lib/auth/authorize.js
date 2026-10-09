// lib/auth/authorize.js
import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

import { verifyIdToken } from "./verifyToken";
import { getAdminByEmail } from "./getAdmin";
import { can } from "@/lib/constants/permissions";
import { AppError } from "@/lib/errors";

const FRESH_WINDOW_SEC = 5 * 60;

const resolveActor = cache(async () => {
  const token = (await cookies()).get("__session")?.value;
  if (!token) throw new AppError("Please sign in.", 401);

  let payload;
  try {
    payload = await verifyIdToken(token);
  } catch {
    throw new AppError("Your session has expired. Please sign in again.", 401);
  }

  if (!payload.email || !payload.email_verified) {
    throw new AppError("Please verify your email first.", 401);
  }

  const admin = await getAdminByEmail(payload.email, token);
  if (!admin) throw new AppError("You do not have admin access.", 403);

  return {
    uid: payload.sub,
    email: admin.email,
    name: admin.name,
    image: admin.image,
    role: admin.role,
    authTime: payload.auth_time,
  };
});

// Server actions / route handlers: fail par AppError throw
export async function assertPermission(permission, { fresh = false } = {}) {
  if (process.env.ADMIN_ENABLED !== "true") {
    throw new AppError("Not found", 404); // admin temporarily band
  }

  const actor = await resolveActor();

  if (permission && !can(actor.role, permission)) {
    throw new AppError("You do not have permission to do that.", 403);
  }

  if (fresh) {
    const age = Math.floor(Date.now() / 1000) - (actor.authTime ?? 0);
    if (age > FRESH_WINDOW_SEC) {
      throw new AppError(
        "For security, please sign in again to continue.",
        401,
      );
    }
  }

  return actor;
}

// Admin pages/layouts: access nahi to 404 (page chhupa rehta hai)
export async function requirePermission(permission) {
  try {
    return await assertPermission(permission);
  } catch (e) {
    if (e instanceof AppError && (e.status === 403 || e.status === 404)) {
      notFound();
    }
    redirect("/login");
  }
}
