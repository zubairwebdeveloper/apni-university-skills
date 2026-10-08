// services/admin/attentionService.js
import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/firebase/admin/firestore";
import { count } from "@/lib/admin/aggregates";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";

async function build(role) {
  const items = [];
  const add = async (perm, label, href, q) => {
    if (!can(role, perm)) return;
    try {
      const n = await count(q);
      if (n) items.push({ label, href, n });
    } catch (e) {
      console.error("[attention]", label, e?.message ?? e);
    }
  };
  await Promise.all([
    add(
      P.CONTACTS_READ,
      "new messages",
      "/admin/contacts?status=new",
      db.collection("contacts").where("status", "==", "new"),
    ),
    add(
      P.REVIEWS_MODERATE,
      "reviews awaiting moderation",
      "/admin/reviews?status=pending",
      db.collection("reviews").where("status", "==", "pending"),
    ),
    add(
      P.PAYMENTS_READ,
      "failed payments in the last 24 hours",
      "/admin/payments?status=failed",
      db
        .collection("payments")
        .where("status", "==", "failed")
        .where("createdAt", ">=", new Date(Date.now() - 864e5)),
    ),
  ]);
  return items;
}
export const getAttention = unstable_cache(build, ["admin-attention"], {
  revalidate: 60,
});

