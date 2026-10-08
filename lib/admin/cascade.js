// lib/admin/cascade.js (generalized; the old export stays as a wrapper)
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";

export async function cascadeTo(collection, field, id, patch) {
  if (!Object.keys(patch).length) return;
  let last = null;
  for (;;) {
    let q = db
      .collection(collection)
      .where(field, "==", id)
      .orderBy("__name__")
      .limit(400);
    if (last) q = q.startAfter(last);
    const snap = await q.get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, patch));
    await batch.commit();
    last = snap.docs.at(-1);
    if (snap.size < 400) break;
  }
}
export const cascadeToCourses = (field, id, patch) =>
  cascadeTo("courses", field, id, patch);

const COURSE_REFS = {
  lessons: ["courseSlug"],
  enrollments: ["courseSlug", "courseTitle"],
  progress: ["courseSlug"],
  wishlists: ["courseSlug"],
  reviews: ["courseSlug", "courseTitle"],
  payments: ["courseSlug", "courseTitle"],
};
export async function cascadeCourseRename(courseId, values) {
  const jobs = Object.entries(COURSE_REFS).map(([c, fields]) =>
    cascadeTo(
      c,
      "courseId",
      courseId,
      Object.fromEntries(
        fields
          .filter((f) => values[f] !== undefined)
          .map((f) => [f, values[f]]),
      ),
    ),
  );
  (await Promise.allSettled(jobs)).forEach(
    (r) =>
      r.status === "rejected" &&
      console.error("[cascadeCourseRename]", r.reason?.message ?? r.reason),
  );
}

