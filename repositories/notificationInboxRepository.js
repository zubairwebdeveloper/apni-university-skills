// repositories/notificationInboxRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";

const col = () => db.collection("userNotifications");

// Updates only the documents that belong to `uid`, so one user can never touch another's inbox.
async function updateOwned(uid, ids, fields) {
  const unique = [...new Set(ids)];
  const snaps = await db.getAll(...unique.map((id) => col().doc(id)));
  const batch = db.batch();
  let count = 0;
  for (const s of snaps) {
    if (s.exists && s.get("userId") === uid) {
      batch.update(s.ref, fields);
      count++;
    }
  }
  if (count) await batch.commit();
  return count;
}

export const notificationInboxRepository = {
  async listByUser(uid, limit = 50) {
    const snap = await col()
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    // Dismissed items stay in Firestore (so "Undo" works) but are hidden from the inbox.
    return snap.docs.map((d) => serializeDoc(d)).filter((n) => !n.dismissedAt);
  },

  async markAllRead(uid) {
    const snap = await col()
      .where("userId", "==", uid)
      .where("readAt", "==", null)
      .limit(400)
      .get();
    if (snap.empty) return;
    const batch = db.batch();
    snap.docs.forEach((d) =>
      batch.update(d.ref, { readAt: FieldValue.serverTimestamp() }),
    );
    await batch.commit();
  },

  setRead: (uid, ids, read) =>
    updateOwned(uid, ids, {
      readAt: read ? FieldValue.serverTimestamp() : null,
    }),

  setDismissed: (uid, ids, dismissed) =>
    updateOwned(uid, ids, {
      dismissedAt: dismissed ? FieldValue.serverTimestamp() : null,
    }),
};
