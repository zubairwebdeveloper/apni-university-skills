// repositories/notificationInboxRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";

const col = () => db.collection("userNotifications");
export const notificationInboxRepository = {
  async listByUser(uid, limit = 50) {
    const snap = await col()
      .where("userId", "==", uid)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map((d) => serializeDoc(d));
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
};

