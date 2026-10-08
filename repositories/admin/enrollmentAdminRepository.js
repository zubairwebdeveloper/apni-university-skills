// repositories/admin/enrollmentAdminRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";
import { AppError } from "@/lib/errors";

const col = () => db.collection("enrollments");
export const ENROLLMENT_SORTS = ["newest", "oldest", "progress"];
export const ENROLLMENT_STATUSES = [
  "active",
  "completed",
  "cancelled",
  "refunded",
];
const SORTS = {
  newest: ["enrolledAt", "desc"],
  oldest: ["enrolledAt", "asc"],
  progress: ["progress", "desc"],
};

export const enrollmentAdminRepository = {
  async list({ filters = [], sort = "newest", after, limit = 20 } = {}) {
    let base = col();
    for (const [f, op, v] of filters) base = base.where(f, op, v);
    const [field, dir] = SORTS[sort] ?? SORTS.newest;
    let q = base.orderBy(field, dir);
    if (after) {
      const c = await col().doc(after).get();
      if (c.exists) q = q.startAfter(c);
    }
    const [snap, total] = await Promise.all([
      q.limit(limit + 1).get(),
      base.count().get(),
    ]);
    const page = snap.docs.slice(0, limit);
    return {
      items: page.map((d) => serializeDoc(d)),
      nextCursor: snap.docs.length > limit ? page.at(-1).id : null,
      total: total.data().count,
    };
  },

  async findBySlug(slug) {
    const snap = await col().where("slug", "==", slug).limit(1).get();
    return snap.empty ? null : serializeDoc(snap.docs[0]);
  },

  /** to: "cancelled" (from active|completed) or "active" (reinstate, from cancelled). Refunded is Stripe-owned and never changed here. */
  async changeStatus(slug, to, actor) {
    const found = await col().where("slug", "==", slug).limit(1).get();
    if (found.empty) throw new AppError("Enrollment not found.", 404);
    const ref = found.docs[0].ref;
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const from = snap.get("status");
      let next, delta, patch;
      if (to === "cancelled") {
        if (!["active", "completed"].includes(from))
          throw new AppError(`A ${from} enrollment can't be cancelled.`, 409);
        next = "cancelled";
        delta = -1;
        patch = {
          status: next,
          cancelledAt: FieldValue.serverTimestamp(),
          cancelledBy: actor.uid,
        };
      } else if (to === "active") {
        if (from === "refunded")
          throw new AppError(
            "Refunded enrollments can't be changed manually. Refunds come from Stripe.",
            409,
          );
        if (from !== "cancelled")
          throw new AppError(`A ${from} enrollment can't be reinstated.`, 409);
        next = (snap.get("progress") ?? 0) >= 100 ? "completed" : "active";
        delta = 1;
        patch = { status: next, cancelledAt: null, cancelledBy: null };
      } else throw new AppError("Unsupported status change.", 400);
      tx.update(ref, patch);
      tx.update(db.collection("courses").doc(snap.get("courseId")), {
        studentsCount: FieldValue.increment(delta),
      });
      return {
        id: ref.id,
        slug: snap.get("slug"),
        courseId: snap.get("courseId"),
        courseSlug: snap.get("courseSlug"),
        studentId: snap.get("studentId"),
        from,
        next,
      };
    });
  },
};

