// repositories/wishlistRepository.js
import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";

const ref = (studentId, courseId) =>
  db.collection("wishlists").doc(`${studentId}_${courseId}`);

export const wishlistRepository = {
  async listByStudent(studentId) {
    const snap = await db
      .collection("wishlists")
      .where("studentId", "==", studentId)
      .limit(100)
      .get();
    return snap.docs
      .map((d) => ({
        courseId: d.get("courseId"),
        createdAt: d.get("createdAt")?.toMillis?.() ?? 0,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  },
  async has(studentId, courseId) {
    return (await ref(studentId, courseId).get()).exists;
  },
  add: (studentId, course) =>
    ref(studentId, course.id).set({
      studentId,
      courseId: course.id,
      courseSlug: course.slug,
      createdAt: FieldValue.serverTimestamp(),
    }),
  remove: (studentId, courseId) => ref(studentId, courseId).delete(),
};

