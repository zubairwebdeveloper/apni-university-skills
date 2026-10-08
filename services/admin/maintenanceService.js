// services/admin/maintenanceService.js
import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { adminStorage } from "@/lib/firebase/admin/storage";
import { getStripe } from "@/lib/stripe/server";
import { count } from "@/lib/admin/aggregates";
import { recalcRatings } from "@/lib/admin/ratings";
import { syncCourseCounts } from "@/lib/admin/counts";
import { handleStripeEvent } from "@/services/stripeWebhookService";
import { couponService } from "@/services/couponService";
import { paymentRepository } from "@/repositories/paymentRepository";

const col = (n) => db.collection(n);

/** Safety net for lost webhooks: asks Stripe what really happened to payments still pending after an hour. */
export async function reconcilePayments() {
  const cutoff = Timestamp.fromMillis(Date.now() - 3600_000);
  const snap = await col("payments")
    .where("status", "==", "pending")
    .where("createdAt", "<=", cutoff)
    .orderBy("createdAt")
    .limit(25)
    .get();
  let paid = 0,
    cancelled = 0;
  for (const d of snap.docs) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(d.id);
      if (session.payment_status === "paid") {
        await handleStripeEvent({
          type: "checkout.session.completed",
          data: { object: session },
        });
        paid++;
      } else if (session.status === "expired") {
        await handleStripeEvent({
          type: "checkout.session.expired",
          data: { object: session },
        });
        cancelled++;
      }
    } catch (e) {
      if (e?.code === "resource_missing") {
        await paymentRepository.update(d.id, { status: "cancelled" });
        cancelled++;
      } else console.error("[reconcile]", d.id, e?.message ?? e);
    }
  }
  return { checked: snap.size, paid, cancelled };
}

/** Reservations the webhook never resolved (crash between reserve and payment, or a lost event). */
export async function releaseStaleReservations() {
  const cutoff = Timestamp.fromMillis(Date.now() - 2 * 3600_000);
  const snap = await col("couponRedemptions")
    .where("status", "==", "reserved")
    .where("createdAt", "<=", cutoff)
    .orderBy("createdAt")
    .limit(100)
    .get();
  let released = 0,
    redeemed = 0;
  for (const d of snap.docs) {
    const payment = d.get("sessionId")
      ? await paymentRepository.getBySessionId(d.get("sessionId"))
      : null;
    if (payment?.status === "pending") continue; // reconcilePayments owns this one
    if (payment?.status === "paid") {
      await couponService.redeem(d.id);
      redeemed++;
    } else {
      await couponService.release(d.id);
      released++;
    }
  }
  return { released, redeemed };
}

/** Recomputes denormalized counters for a slice of courses, resuming from a stored cursor. */
export async function recountCourses(limit = 200) {
  const meta = col("settings").doc("maintenance");
  const cursor = (await meta.get()).get("recountCursor") ?? null;
  let q = col("courses")
    .orderBy("__name__")
    .limit(limit)
    .select("categoryId", "instructorId");
  if (cursor) q = q.startAfter(cursor);
  const snap = await q.get();
  const cats = new Set(),
    ins = new Set();
  for (let i = 0; i < snap.docs.length; i += 10) {
    await Promise.all(
      snap.docs.slice(i, i + 10).map(async (d) => {
        const [students, lessons] = await Promise.all([
          count(
            col("enrollments")
              .where("courseId", "==", d.id)
              .where("status", "in", ["active", "completed"]),
          ),
          count(
            col("lessons")
              .where("courseId", "==", d.id)
              .where("isPublished", "==", true),
          ),
        ]);
        await d.ref.update({ studentsCount: students, lessonsCount: lessons });
        cats.add(d.get("categoryId"));
        ins.add(d.get("instructorId"));
      }),
    );
  }
  await recalcRatings({
    courseIds: snap.docs.map((d) => d.id),
    instructorIds: [...ins],
  });
  await syncCourseCounts({ categoryIds: [...cats], instructorIds: [...ins] });
  await meta.set(
    {
      recountCursor: snap.size < limit ? null : snap.docs.at(-1).id,
      recountAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return { courses: snap.size, finished: snap.size < limit };
}

// ---- Storage cleanup -------------------------------------------------------------------------
const FIELDS = [
  ["courses", ["thumbnail"]],
  ["categories", ["image"]],
  ["instructors", ["avatar", "coverImage"]],
  ["blogPosts", ["coverImage"]],
  ["jobs", ["companyLogo"]],
  ["settings", ["logo", "ogImage"]],
];
const PREFIXES = [
  "public/courses/",
  "public/categories/",
  "public/instructors/",
  "public/blog/",
  "public/jobs/",
  "public/settings/",
  "private/lessons/",
];
const objectPath = (url) => {
  try {
    const m = new URL(url).pathname.match(/^\/v0\/b\/[^/]+\/o\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

async function eachDoc(name, fields, fn) {
  let last = null;
  for (;;) {
    let q = col(name)
      .orderBy("__name__")
      .limit(500)
      .select(...fields);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    snap.docs.forEach(fn);
    if (snap.size < 500) return;
    last = snap.docs.at(-1);
  }
}

/** Deletes uploads nothing references. Dry-run unless STORAGE_CLEANUP=on. Any failure while collecting references aborts the run. */
export async function cleanupStorage() {
  const live = process.env.STORAGE_CLEANUP === "on";
  const referenced = new Set();
  for (const [name, fields] of FIELDS)
    await eachDoc(name, fields, (d) =>
      fields.forEach((f) => {
        const p = objectPath(d.get(f));
        if (p) referenced.add(p);
      }),
    );
  await eachDoc("lessons", ["attachments"], (d) =>
    (d.get("attachments") ?? []).forEach(
      (a) => a?.path && referenced.add(a.path),
    ),
  );

  const bucket = adminStorage.bucket(),
    minAge = Date.now() - 7 * 864e5;
  const candidates = [];
  for (const prefix of PREFIXES) {
    const [files] = await bucket.getFiles({
      prefix,
      maxResults: 1000,
      autoPaginate: false,
    });
    for (const f of files)
      if (
        !f.name.endsWith("/") &&
        Date.parse(f.metadata.timeCreated) < minAge &&
        !referenced.has(f.name)
      )
        candidates.push(f);
  }
  if (!referenced.size && candidates.length)
    return {
      aborted: "No references found while files exist. Refusing to delete.",
      candidates: candidates.length,
    };
  const batch = candidates.slice(0, 200);
  if (live) await Promise.allSettled(batch.map((f) => f.delete()));
  return {
    mode: live ? "deleted" : "dry-run",
    orphans: candidates.length,
    processed: batch.length,
  };
}

