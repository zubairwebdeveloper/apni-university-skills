// services/reviewService.js

import { reviewRepository } from "@/repositories/reviewRepository";
import { reviewWriteRepository } from "@/repositories/reviewWriteRepository";
import { courseRepository } from "@/repositories/courseRepository";
import { enrollmentRepository } from "@/repositories/enrollmentRepository";
import { userRepository } from "@/repositories/userRepository";
import { ACTIVE } from "@/lib/constants/enrollment";
import { AppError } from "@/lib/errors";
import { recalcRatings } from "@/lib/admin/ratings";

export const reviewService = {
  /* ------------------------------------------------------------------------ */
  /* Public reviews                                                           */
  /* ------------------------------------------------------------------------ */

  getLatestApproved: (limit = 3) =>
    reviewRepository.findMany({
      limit,
      orderBy: "createdAt",
    }),

  getCourseReviews: (courseId, limit = 6) =>
    reviewRepository.findMany({
      limit,
      where: [["courseId", "==", courseId]],
    }),

  getInstructorReviews: (instructorId, limit = 6) =>
    reviewRepository.findMany({
      limit,
      where: [["instructorId", "==", instructorId]],
    }),

  /* ------------------------------------------------------------------------ */
  /* Student reviews                                                          */
  /* ------------------------------------------------------------------------ */

  getStudentReviews: (uid) => reviewWriteRepository.listByStudent(uid),

  async submitReview({ user, courseSlug, rating, title, comment }) {
    const enrollment = await enrollmentRepository.findByStudentAndSlug(
      user.uid,
      courseSlug,
    );

    if (!enrollment || !ACTIVE.includes(enrollment.status)) {
      throw new AppError("Only enrolled students can review a course.", 403);
    }

    const [course, profile] = await Promise.all([
      courseRepository.findById(enrollment.courseId),
      userRepository.getById(user.uid),
    ]);

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    const { wasApproved } = await reviewWriteRepository.upsert(
      user.uid,
      course.id,
      {
        courseSlug: course.slug,
        courseTitle: course.title,
        instructorId: course.instructorId ?? null,
        studentName: profile?.displayName || "Student",
        studentPhotoURL: profile?.photoURL ?? null,
        rating,
        title,
        comment,
      },
    );

    // If an approved review was edited, it is now pending.
    // Recalculate ratings immediately so the old approved
    // rating is removed from the aggregates.
    if (wasApproved) {
      await recalcRatings({
        courseIds: [course.id],
        instructorIds: course.instructorId ? [course.instructorId] : [],
      });
    }
  },
};

