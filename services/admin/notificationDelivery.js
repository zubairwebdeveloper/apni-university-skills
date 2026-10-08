// services/admin/notificationDelivery.js
import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { writeAudit, SYSTEM_ACTOR } from "@/lib/audit/auditLog";

const PAGE = 400;
const col = (n) => db.collection(n);

async function recipients(n, cursor) {
  const a = n.audience;
  if (a.kind === "users") {
    // static list; the cursor is an index
    const i = Number(cursor ?? 0),
      ids = a.targetIds.slice(i, i + PAGE);
    return {
      ids,
      last: String(i + ids.length),
      exhausted: i + PAGE >= a.targetIds.length,
    };
  }
  let q;
  if (a.kind === "course")
    q = col("enrollments").where("courseId", "==", a.courseId);
  else if (a.kind === "all_students")
    q = col("users")
      .where("role", "==", "student")
      .where("isActive", "==", true);
  else
    q = col("users")
      .where("role", "==", a.kind === "admins" ? "admin" : "instructor")
      .where("isActive", "==", true);
  q = q.orderBy("__name__");
  if (cursor) q = q.startAfter(cursor);
  const snap = await q.limit(PAGE).get();
  const ids = snap.docs
    .filter(
      (d) =>
        a.kind !== "course" ||
        ["active", "completed"].includes(d.get("status")),
    )
    .map((d) => (a.kind === "course" ? d.get("studentId") : d.id));
  return {
    ids: [...new Set(ids)],
    last: snap.docs.at(-1)?.id ?? cursor,
    exhausted: snap.size < PAGE,
  };
}

/** Delivers up to `max` recipients for a notification in "sending" state. A lease keeps two workers from overlapping. */
export async function deliver(id, { max = 1000 } = {}) {
  const ref = col("notifications").doc(id);
  const n = await db.runTransaction(async (tx) => {
    const s = await tx.get(ref);
    if (
      s.get("status") !== "sending" ||
      s.get("leaseUntil")?.toMillis() > Date.now()
    )
      return null;
    tx.update(ref, { leaseUntil: Timestamp.fromMillis(Date.now() + 120_000) });
    return { id, ...s.data() };
  });
  if (!n) return { delivered: 0, done: false };

  let delivered = 0,
    cursor = n.cursor ?? null,
    done = false;
  try {
    while (delivered < max) {
      const page = await recipients(n, cursor);
      if (page.ids.length) {
        const batch = db.batch();
        for (const uid of page.ids)
          batch.set(col("userNotifications").doc(`${id}_${uid}`), {
            userId: uid,
            notificationId: id,
            title: n.title,
            body: n.body,
            type: n.type,
            link: n.link ?? null,
            readAt: null,
            createdAt: FieldValue.serverTimestamp(),
          });
        await batch.commit();
        delivered += page.ids.length;
      }
      cursor = page.last ?? cursor;
      await ref.update({
        cursor,
        recipientCount: FieldValue.increment(page.ids.length),
        leaseUntil: Timestamp.fromMillis(Date.now() + 120_000),
      });
      if (page.exhausted) {
        done = true;
        break;
      }
    }
  } finally {
    await ref
      .update({
        leaseUntil: null,
        ...(done
          ? { status: "sent", sentAt: FieldValue.serverTimestamp() }
          : {}),
      })
      .catch((e) =>
        console.error("[deliver] lease release failed", e?.message ?? e),
      );
  }
  if (done)
    await writeAudit(SYSTEM_ACTOR, {
      action: "notification.delivered",
      resource: "notification",
      resourceId: id,
      resourceSlug: n.slug,
      metadata: { recipients: (n.recipientCount ?? 0) + delivered },
    }).catch(() => {});
  return { delivered, done };
}

/** Called by the cron: starts due scheduled notifications, then continues unfinished ones. */
export async function processNotifications(now) {
  let started = 0,
    delivered = 0;
  const due = await col("notifications")
    .where("status", "==", "scheduled")
    .where("scheduledFor", "<=", now)
    .orderBy("scheduledFor")
    .limit(10)
    .get();
  for (const d of due.docs) {
    const ok = await db.runTransaction(async (tx) => {
      const s = await tx.get(d.ref);
      if (s.get("status") !== "scheduled") return false;
      tx.update(d.ref, {
        status: "sending",
        scheduledFor: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    });
    if (ok) started++;
  }
  const active = await col("notifications")
    .where("status", "==", "sending")
    .limit(5)
    .get();
  for (const d of active.docs) {
    try {
      delivered += (await deliver(d.id)).delivered;
    } catch (e) {
      console.error("[notifications] deliver failed", d.id, e?.message ?? e);
    }
  }
  return { started, delivered };
}

