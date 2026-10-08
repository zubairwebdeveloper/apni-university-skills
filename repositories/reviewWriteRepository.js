// repositories/reviewWriteRepository.js

import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { AppError } from "@/lib/errors";
import { newRef } from "@/lib/utils";
import { serializeDoc } from "./baseRepository";

const col = () => db.collection("reviews");

export const reviewWriteRepository = {
  // Students can view their own reviews in every status except deleted.
  async listByStudent(studentId) {
    const snap = await col()
      .where("studentId", "==", studentId)
      .limit(100)
      .get();

    return snap.docs
      .map((doc) => serializeDoc(doc))
      .filter((review) => review.status !== "deleted")
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  },

  // One review per student per course.
  // Editing an existing review sends it back to moderation.
  async upsert(studentId, courseId, data) {
    const ref = col().doc(`${studentId}_${courseId}`);
    const now = FieldValue.serverTimestamp();

    let wasApproved = false;

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);

      if (snap.exists && snap.get("status") === "deleted") {
        throw new AppError(
          "This review was removed by our team and can't be edited.",
          403,
        );
      }

      wasApproved = snap.exists && snap.get("status") === "approved";

      tx.set(ref, {
        ...data,
        slug: snap.exists ? snap.get("slug") : newRef("rev"),
        studentId,
        courseId,
        status: "pending",
        createdAt: snap.exists ? snap.get("createdAt") : now,
        updatedAt: now,
      });
    });

    return {
      wasApproved,
    };
  },
};

