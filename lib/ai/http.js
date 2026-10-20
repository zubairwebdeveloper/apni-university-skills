// lib/ai/http.js
import "server-only";
import { requireUser } from "@/lib/auth/session";
import { AppError } from "./errors";
import { AI_LIMITS } from "./constants";

// Browsers always send Origin on cross-site POST/PATCH/DELETE
export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    // fall through to rejection
  }
  if (!host || originHost !== host) {
    throw new AppError("forbidden_origin", 403, "Request blocked.");
  }
}

export function assertJsonRequest(request) {
  const type = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!type.startsWith("application/json")) {
    throw new AppError("unsupported_media_type", 415, "Send JSON.");
  }
}

export async function readJsonBody(request) {
  const text = await request.text();
  if (text.length > AI_LIMITS.maxBodyBytes) {
    throw new AppError("payload_too_large", 413, "That request is too large.");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new AppError("invalid_json", 400, "Invalid request.");
  }
}

// requireUser may redirect/throw; API routes must answer 401 instead
export async function requireAIUser() {
  let user;

  try {
    user = await requireUser();
  } catch (error) {
    // Next.js redirect() ka error digest "NEXT_REDIRECT" se shuru hota hai:
    // yaani user logged in nahi hai. Baqi errors asal masle hain, unhe log karein.
    const isRedirect =
      typeof error?.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT");

    if (!isRedirect) {
      console.error("[ai] requireUser failed:", error);
    }

    throw new AppError(
      "unauthenticated",
      401,
      "Please sign in to use the assistant.",
    );
  }

  // Alag auth helpers uid ko alag naam se return karte hain
  const uid = user?.uid ?? user?.id ?? user?.userId;

  if (!uid) {
    console.error(
      "[ai] requireUser returned a user without uid. Keys:",
      user ? Object.keys(user) : user,
    );
    throw new AppError(
      "unauthenticated",
      401,
      "Please sign in to use the assistant.",
    );
  }

  return { ...user, uid };
}
