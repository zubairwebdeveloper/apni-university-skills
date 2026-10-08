import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";

async function clientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0] ??
    h.get("x-real-ip") ??
    "unknown"
  ).trim();
}

// Fixed-window counter in Firestore. Pass `key` (uid) for signed-in actions, else it uses the IP.
export async function rateLimit(scope, { limit, windowSec, key } = {}) {
  try {
    const id = key ?? (await clientIp());
    const win = Math.floor(Date.now() / (windowSec * 1000));
    const ref = db
      .collection("rateLimits")
      .doc(createHash("sha256").update(`${scope}:${id}:${win}`).digest("hex"));
    const count = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const n = (snap.exists ? snap.get("count") : 0) + 1;
      tx.set(ref, {
        scope,
        count: n,
        expiresAt: Timestamp.fromMillis((win + 2) * windowSec * 1000),
      });
      return n;
    });
    return { ok: count <= limit };
  } catch (e) {
    console.error("[rateLimit] failing open:", e?.message ?? e); // availability over lockout if Firestore hiccups
    return { ok: true };
  }
}

