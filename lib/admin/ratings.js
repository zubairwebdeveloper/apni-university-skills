// lib/admin/ratings.js: recompute from approved reviews. Safe to call any time, any number of times.
import "server-only";
import { AggregateField } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";

const approved = () =>
  db.collection("reviews").where("status", "==", "approved");
const uniq = (a) => [...new Set(a.filter(Boolean))];

async function stats(q) {
  const d = (
    await q
      .aggregate({
        n: AggregateField.count(),
        avg: AggregateField.average("rating"),
      })
      .get()
  ).data();
  return { reviewCount: d.n, rating: d.n ? Math.round(d.avg * 100) / 100 : 0 };
}

export async function recalcRatings({ courseIds = [], instructorIds = [] }) {
  const jobs = [
    ...uniq(courseIds).map(async (id) =>
      db
        .collection("courses")
        .doc(id)
        .update(await stats(approved().where("courseId", "==", id))),
    ),
    ...uniq(instructorIds).map(async (id) =>
      db
        .collection("instructors")
        .doc(id)
        .update(await stats(approved().where("instructorId", "==", id))),
    ),
  ];
  (await Promise.allSettled(jobs)).forEach(
    (r) =>
      r.status === "rejected" &&
      console.error("[recalcRatings]", r.reason?.message ?? r.reason),
  );
}

export async function refsOfReviews(ids) {
  if (!ids.length) return { courseIds: [], instructorIds: [] };
  const snaps = await db.getAll(
    ...ids.map((id) => db.collection("reviews").doc(id)),
    { fieldMask: ["courseId", "instructorId"] },
  );
  return {
    courseIds: uniq(snaps.map((s) => s.get("courseId"))),
    instructorIds: uniq(snaps.map((s) => s.get("instructorId"))),
  };
}

