// lib/ai/rate-limit.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./db";
import { AI_LIMITS } from "./constants";
import { AppError } from "./errors";

// Fixed-window limiter inside a Firestore transaction (atomic, shared across instances)
export async function enforceRateLimit(uid) {
  const ref = db.collection("aiRateLimits").doc(uid);
  const now = Date.now();
  const { rateWindowMs: windowMs, rateMaxRequests: max } = AI_LIMITS;

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : null;
    const sameWindow = data && now - data.windowStart < windowMs;
    const windowStart = sameWindow ? data.windowStart : now;
    const count = sameWindow ? data.count : 0;

    if (count >= max) {
      return {
        ok: false,
        retryAfter: Math.max(
          1,
          Math.ceil((windowStart + windowMs - now) / 1000),
        ),
      };
    }
    tx.set(ref, {
      windowStart,
      count: count + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true };
  });

  if (!result.ok) {
    throw new AppError(
      "rate_limited",
      429,
      "You're sending messages too quickly. Please wait a moment.",
      { retryAfter: result.retryAfter },
    );
  }
}
