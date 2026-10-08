// lib/admin/counts.js: recompute coursesCount (+ studentsCount for instructors) from published courses
import "server-only";
import { AggregateField } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";

const published = () =>
  db.collection("courses").where("status", "==", "published");
const uniq = (a) => [...new Set(a.filter(Boolean))];

export async function syncCourseCounts({
  categoryIds = [],
  instructorIds = [],
}) {
  const jobs = [
    ...uniq(categoryIds).map(async (id) => {
      const n = (
        await published().where("categoryId", "==", id).count().get()
      ).data().count;
      await db.collection("categories").doc(id).update({ coursesCount: n });
    }),
    ...uniq(instructorIds).map(async (id) => {
      const q = published().where("instructorId", "==", id);
      const [c, s] = await Promise.all([
        q.count().get(),
        q.aggregate({ t: AggregateField.sum("studentsCount") }).get(),
      ]);
      await db
        .collection("instructors")
        .doc(id)
        .update({
          coursesCount: c.data().count,
          studentsCount: s.data().t ?? 0,
        });
    }),
  ];
  (await Promise.allSettled(jobs)).forEach(
    (r) =>
      r.status === "rejected" &&
      console.error("[syncCounts]", r.reason?.message ?? r.reason),
  );
}

export async function refsOfCourses(ids) {
  if (!ids.length) return { categoryIds: [], instructorIds: [] };
  const snaps = await db.getAll(
    ...ids.map((id) => db.collection("courses").doc(id)),
    { fieldMask: ["categoryId", "instructorId"] },
  );
  return {
    categoryIds: uniq(snaps.map((s) => s.get("categoryId"))),
    instructorIds: uniq(snaps.map((s) => s.get("instructorId"))),
  };
}
export async function syncLessonsCount(courseId) {
  try {
    const n = (
      await db
        .collection("lessons")
        .where("courseId", "==", courseId)
        .where("isPublished", "==", true)
        .count()
        .get()
    ).data().count;
    await db.collection("courses").doc(courseId).update({ lessonsCount: n });
  } catch (e) {
    console.error("[syncLessonsCount]", e?.message ?? e);
  }
}
