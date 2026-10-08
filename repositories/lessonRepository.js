// repositories/lessonRepository.js
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "./baseRepository";

export const lessonRepository = {
  async findById(id) {
    const s = await db.collection("lessons").doc(id).get();
    return s.exists ? serializeDoc(s) : null;
  },
  async findPublishedByCourse(courseId) {
    const snap = await db
      .collection("lessons")
      .where("courseId", "==", courseId)
      .where("isPublished", "==", true)
      .orderBy("sectionOrder")
      .orderBy("order")
      .get();
    return snap.docs.map((d) => serializeDoc(d));
  },
};

