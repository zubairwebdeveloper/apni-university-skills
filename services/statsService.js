import "server-only";
import { db } from "@/lib/firebase/admin/firestore";

const count = async (q) => (await q.count().get()).data().count;

export const statsService = {
  async getPublicStats() {
    const [courses, instructors, learners] = await Promise.all([
      count(db.collection("courses").where("status", "==", "published")),
      count(db.collection("instructors").where("status", "==", "active")),
      count(db.collection("enrollments")),
    ]);
    return [
      { label: "Courses", value: courses },
      { label: "Instructors", value: instructors },
      { label: "Enrollments", value: learners },
    ].filter((s) => s.value > 0); // hide zeros rather than show an empty-looking hero
  },
};

