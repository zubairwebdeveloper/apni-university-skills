import "server-only";

import { FieldValue } from "firebase-admin/firestore";

import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "./baseRepository";

const col = () => db.collection("enrollments");

export const ACTIVE = ["active", "completed"];

/**
 * Deterministic enrollment ID.
 *
 * One student + one course = one enrollment document.
 * This structurally prevents duplicate enrollments.
 */
export const enrollmentId = (studentId, courseId) => `${studentId}_${courseId}`;

async function find(studentId, courseId) {
  const snap = await col().doc(enrollmentId(studentId, courseId)).get();

  return snap.exists ? serializeDoc(snap) : null;
}

export const enrollmentRepository = {
  /**
   * Find an enrollment using the public course slug.
   */
  async findByStudentAndSlug(studentId, courseSlug) {
    const snap = await col()
      .where("studentId", "==", studentId)
      .where("courseSlug", "==", courseSlug)
      .limit(1)
      .get();

    return snap.empty ? null : serializeDoc(snap.docs[0]);
  },

  /**
   * A student usually has a limited number of enrollments,
   * so sorting is intentionally done in memory.
   *
   * This avoids requiring an additional composite Firestore index.
   */
  async listByStudent(studentId) {
    const snap = await col()
      .where("studentId", "==", studentId)
      .limit(200)
      .get();

    const activityTime = (enrollment) =>
      enrollment.lastActivityAt ?? enrollment.enrolledAt ?? 0;

    return snap.docs
      .map((doc) => serializeDoc(doc))
      .filter((enrollment) => ACTIVE.includes(enrollment.status))
      .sort((a, b) => activityTime(b) - activityTime(a));
  },

  /**
   * Used by the Stripe refund webhook.
   *
   * Only the enrollment belonging to the exact payment
   * can be refunded.
   */
  async markRefunded({ studentId, courseId, paymentId }) {
    const enrollmentRef = col().doc(enrollmentId(studentId, courseId));

    const courseRef = db.collection("courses").doc(courseId);

    return db.runTransaction(async (tx) => {
      const snap = await tx.get(enrollmentRef);

      if (
        !snap.exists ||
        snap.get("paymentId") !== paymentId ||
        !ACTIVE.includes(snap.get("status"))
      ) {
        return false;
      }

      const price = Number(snap.get("price") ?? 0);

      tx.update(enrollmentRef, {
        status: "refunded",
        refundedAt: FieldValue.serverTimestamp(),
      });

      tx.update(courseRef, {
        studentsCount: FieldValue.increment(-1),

        ...(price > 0
          ? {
              revenue: FieldValue.increment(-price),
            }
          : {}),
      });

      return true;
    });
  },

  /**
   * Find an enrollment regardless of status.
   */
  find,

  /**
   * Find only active/completed enrollments.
   */
  async findActive(studentId, courseId) {
    const enrollment = await find(studentId, courseId);

    return enrollment && ACTIVE.includes(enrollment.status) ? enrollment : null;
  },

  /**
   * Get all active/completed courses belonging to a student.
   */
  async getStudentCourses(studentId) {
    const enrollments = await enrollmentRepository.listByStudent(studentId);

    if (!enrollments.length) {
      return [];
    }

    const { courseRepository } =
      await import("@/repositories/courseRepository");

    const courses = await courseRepository.findManyByIds(
      enrollments.map((enrollment) => enrollment.courseId),
    );

    const byId = new Map(courses.map((course) => [course.id, course]));

    return enrollments.map((enrollment) => ({
      ...enrollment,
      course: byId.get(enrollment.courseId) ?? null,
    }));
  },

  /**
   * Idempotent + transactional enrollment.
   *
   * Stripe can retry the same webhook multiple times,
   * so an existing active/completed enrollment is not
   * created again.
   */
  async enroll({ studentId, course, price, currency, paymentId = null }) {
    const enrollmentRef = col().doc(enrollmentId(studentId, course.id));

    const courseRef = db.collection("courses").doc(course.id);

    return db.runTransaction(async (tx) => {
      const snap = await tx.get(enrollmentRef);

      /**
       * Idempotency:
       * Do not increment studentsCount/revenue again
       * when Stripe retries the webhook.
       */
      if (snap.exists && ACTIVE.includes(snap.get("status"))) {
        return {
          created: false,
          id: enrollmentRef.id,
        };
      }

      const numericPrice = Number(price ?? 0);

      tx.set(enrollmentRef, {
        studentId,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,

        price: numericPrice,
        currency,
        paymentId,

        status: "active",
        progress: 0,

        enrolledAt: FieldValue.serverTimestamp(),

        completedAt: null,
        refundedAt: null,
      });

      tx.update(courseRef, {
        studentsCount: FieldValue.increment(1),

        ...(numericPrice > 0
          ? {
              revenue: FieldValue.increment(numericPrice),
            }
          : {}),
      });

      return {
        created: true,
        id: enrollmentRef.id,
      };
    });
  },
};

