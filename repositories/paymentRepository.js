// repositories/paymentRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "./baseRepository";

const col = () => db.collection("payments");

// The document id IS the Stripe session id, so webhook retries always hit the same record
export const paymentRepository = {
  createPending: (d) =>
    col()
      .doc(d.stripeSessionId)
      .set({
        ...d,
        status: "pending",
        stripePaymentIntentId: null,
        paymentMethod: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
  async getBySessionId(id) {
    const s = await col().doc(id).get();
    return s.exists ? serializeDoc(s) : null;
  },
  async findByPaymentIntent(pi) {
    if (!pi) return null;
    const snap = await col()
      .where("stripePaymentIntentId", "==", pi)
      .limit(1)
      .get();
    return snap.empty ? null : serializeDoc(snap.docs[0]);
  },
  update: (id, patch) =>
    col()
      .doc(id)
      .update({ ...patch, updatedAt: FieldValue.serverTimestamp() }),
  // Stripe ids never reach the browser
  async listByStudent(studentId) {
    const snap = await col()
      .where("studentId", "==", studentId)
      .limit(100)
      .get();
    return snap.docs
      .map((d) => serializeDoc(d, ["stripeSessionId", "stripePaymentIntentId"]))
      .filter((p) => ["succeeded", "refunded", "failed"].includes(p.status)) // hide abandoned checkouts
      .filter((p) => ["paid", "refunded", "failed"].includes(p.status))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
};

