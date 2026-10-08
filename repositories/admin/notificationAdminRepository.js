// repositories/admin/notificationAdminRepository.js
import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { AppError } from "@/lib/errors";
import { newRef } from "@/lib/utils/ref";
import { createReadRepository } from "./listRepository";

export const NOTIFICATION_STATUSES = [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "cancelled",
];
export const NOTIFICATION_SORTS = ["newest", "oldest"];
const base = createReadRepository({
  collection: "notifications",
  sorts: { newest: ["createdAt", "desc"], oldest: ["createdAt", "asc"] },
});

export const notificationAdminRepository = Object.assign(base, {
  async create({ data, status, scheduledFor, actor }) {
    const ref = base.col().doc();
    const now = FieldValue.serverTimestamp();
    await ref.set({
      ...data,
      slug: newRef("ntf"),
      status,
      scheduledFor: scheduledFor ? Timestamp.fromDate(scheduledFor) : null,
      recipientCount: 0,
      cursor: null,
      leaseUntil: null,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.uid,
    });
    return { id: ref.id, slug: (await ref.get()).get("slug") };
  },
  /** draft|scheduled -> sending | cancelled */
  async transition(slug, to, actor) {
    const found = await base.col().where("slug", "==", slug).limit(1).get();
    if (found.empty) throw new AppError("Notification not found.", 404);
    const ref = found.docs[0].ref;
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!["draft", "scheduled"].includes(snap.get("status")))
        throw new AppError(
          `A ${snap.get("status")} notification can't be ${to === "sending" ? "sent" : "cancelled"}.`,
          409,
        );
      tx.update(ref, {
        status: to,
        scheduledFor: null,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid,
      });
      return { id: ref.id, slug: snap.get("slug"), title: snap.get("title") };
    });
  },
});

