// repositories/admin/settingsRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";
import { AppError } from "@/lib/errors";

const ref = (id) => db.collection("settings").doc(id);
export const settingsRepository = {
  async get(id) {
    const s = await ref(id).get();
    return s.exists ? serializeDoc(s) : null;
  },
  async save(id, data, actor, { ifUpdatedAt } = {}) {
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref(id));
      if (
        ifUpdatedAt &&
        snap.exists &&
        snap.get("updatedAt")?.toMillis?.() !== ifUpdatedAt
      )
        throw new AppError(
          "These settings were changed by someone else. Reload the page and try again.",
          409,
        );
      tx.set(ref(id), {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid,
      });
      return { before: snap.exists ? serializeDoc(snap) : {} };
    });
  },
};

