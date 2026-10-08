// repositories/admin/certificateAdminRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { AppError } from "@/lib/errors";
import { createReadRepository } from "./listRepository";

export const CERT_SORTS = ["newest", "oldest"];
export const CERT_STATUSES = ["valid", "revoked"];
const base = createReadRepository({
  collection: "certificates",
  sorts: { newest: ["issuedAt", "desc"], oldest: ["issuedAt", "asc"] },
});

export const certificateAdminRepository = Object.assign(base, {
  /** to: "revoked" (from valid) or "valid" (from revoked). Certificates are never deleted. */
  async setStatus(slug, to, actor, reason = null) {
    const found = await base.col().where("slug", "==", slug).limit(1).get();
    if (found.empty) throw new AppError("Certificate not found.", 404);
    const ref = found.docs[0].ref;
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const from = snap.get("status") ?? "valid";
      if (to === "revoked" && from !== "valid")
        throw new AppError("This certificate is already revoked.", 409);
      if (to === "valid" && from !== "revoked")
        throw new AppError("This certificate isn't revoked.", 409);
      tx.update(
        ref,
        to === "revoked"
          ? {
              status: "revoked",
              revokedAt: FieldValue.serverTimestamp(),
              revokedBy: actor.uid,
              revokeReason: reason,
            }
          : {
              status: "valid",
              revokedAt: null,
              revokedBy: null,
              revokeReason: null,
            },
      );
      return {
        id: ref.id,
        slug: snap.get("slug"),
        studentId: snap.get("studentId"),
        courseSlug: snap.get("courseSlug"),
      };
    });
  },
});

