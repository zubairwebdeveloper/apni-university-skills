// services/admin/studentActivityService.js
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";

const byStudent = async (name, uid, omit = []) => {
  const snap = await db
    .collection(name)
    .where("studentId", "==", uid)
    .limit(100)
    .get();
  return snap.docs.map((d) => serializeDoc(d, omit));
};
const newest = (k) => (a, b) => (b[k] ?? 0) - (a[k] ?? 0);

// null = couldn't load; undefined = this role may not see it
export async function getStudentActivity(uid, role) {
  const t = {};
  if (can(role, P.ENROLLMENTS_READ))
    t.enrollments = async () =>
      (await byStudent("enrollments", uid)).sort(newest("enrolledAt"));
  if (can(role, P.PAYMENTS_READ))
    t.payments = async () =>
      (
        await byStudent("payments", uid, [
          "stripeSessionId",
          "stripePaymentIntentId",
        ])
      ).sort(newest("createdAt"));
  if (can(role, P.CERTIFICATES_READ))
    t.certificates = async () =>
      (await byStudent("certificates", uid)).sort(newest("issuedAt"));
  if (can(role, P.REVIEWS_READ))
    t.reviews = async () =>
      (await byStudent("reviews", uid)).sort(newest("updatedAt"));
  const keys = Object.keys(t);
  const settled = await Promise.allSettled(keys.map((k) => t[k]()));
  return Object.fromEntries(
    keys.map((k, i) => {
      if (settled[i].status === "rejected")
        console.error(
          `[studentActivity] ${k}:`,
          settled[i].reason?.message ?? settled[i].reason,
        );
      return [k, settled[i].status === "fulfilled" ? settled[i].value : null];
    }),
  );
}

