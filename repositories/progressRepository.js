// repositories/progressRepository.js

import "server-only";

import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { db } from "@/lib/firebase/admin/firestore";

import { serializeDoc } from "./baseRepository";
import { ACTIVE, enrollmentId } from "./enrollmentRepository";

import { certificateRef, newCertificateNumber } from "./certificateRepository";

import { AppError } from "@/lib/errors";

const pid = (studentId, courseId) => `${studentId}_${courseId}`;

export const progressRepository = {
  async get(studentId, courseId) {
    const snap = await db
      .collection("progress")
      .doc(pid(studentId, courseId))
      .get();

    return snap.exists ? serializeDoc(snap) : null;
  },

  // One transaction updates progress, the enrollment,
  // and (at 100%) issues the certificate exactly once.
  async recordLesson({
    studentId,
    studentName,
    course,
    lessonIds,
    lessonId,
    completed,
  }) {
    const pRef = db.collection("progress").doc(pid(studentId, course.id));

    const eRef = db
      .collection("enrollments")
      .doc(enrollmentId(studentId, course.id));

    const cRef = certificateRef(studentId, course.id);

    return db.runTransaction(async (tx) => {
      // Transaction callbacks can retry. Keep these values
      // inside the callback so every retry starts clean.
      let issued = false;
      let justCompleted = false;
      let verificationCode = null;
      let certificateNumber = null;

      const [pSnap, eSnap, cSnap] = await Promise.all([
        tx.get(pRef),
        tx.get(eRef),
        tx.get(cRef),
      ]);

      if (!eSnap.exists || !ACTIVE.includes(eSnap.get("status"))) {
        throw new AppError("Your enrollment is not active.", 403);
      }

      const valid = new Set(lessonIds);

      const done = new Set(
        (pSnap.get("completedLessonIds") ?? []).filter((id) => valid.has(id)),
      );

      completed ? done.add(lessonId) : done.delete(lessonId);

      const completedIds = [...done];

      const percent = lessonIds.length
        ? Math.round((completedIds.length / lessonIds.length) * 100)
        : 0;

      const courseCompleted =
        lessonIds.length > 0 && completedIds.length === lessonIds.length;

      const now = FieldValue.serverTimestamp();

      tx.set(
        pRef,
        {
          studentId,
          courseId: course.id,
          courseSlug: course.slug,
          completedLessonIds: completedIds,
          lastLessonId: lessonId,
          percent,
          updatedAt: now,
        },
        { merge: true },
      );

      const enrollment = {
        progress: percent,
        lastActivityAt: now,
      };

      if (courseCompleted) {
        justCompleted = eSnap.get("status") !== "completed";

        enrollment.status = "completed";

        if (!eSnap.get("completedAt")) {
          enrollment.completedAt = now;
        }

        if (!cSnap.exists) {
          certificateNumber = newCertificateNumber();

          verificationCode = randomBytes(8).toString("hex");

          tx.create(cRef, {
            slug: certificateNumber,
            verificationCode,
            status: "valid",
            studentId,
            studentName,
            courseId: course.id,
            courseSlug: course.slug,
            courseTitle: course.title,
            certificateNumber,
            issuedAt: now,
          });

          issued = true;
        }
      } else if (eSnap.get("status") === "completed") {
        // An issued certificate stays valid.
        enrollment.status = "active";
        enrollment.completedAt = null;
      }

      tx.update(eRef, enrollment);

      return {
        percent,
        courseCompleted,
        justCompleted,
        certificateIssued: issued,
        verificationCode,
      };
    });
  },
};

