import "server-only";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";

export const newsletterService = {
  async subscribe(email) {
    const id = createHash("sha256").update(email).digest("hex"); // idempotent, no duplicates
    try {
      await db
        .collection("newsletter")
        .doc(id)
        .create({
          email,
          status: "subscribed",
          createdAt: FieldValue.serverTimestamp(),
        });
    } catch (e) {
      if (e.code !== 6) throw e; // 6 = ALREADY_EXISTS: treat as success so emails can't be probed
    }
  },
};

