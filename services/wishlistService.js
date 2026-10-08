// services/wishlistService.js
import "server-only";
import { courseRepository } from "@/repositories/courseRepository";
import { wishlistRepository } from "@/repositories/wishlistRepository";
import { AppError } from "@/lib/errors";

export const wishlistService = {
  // services/wishlistService.js: add
  async getWishlistCourses(studentId) {
    const entries = await wishlistRepository.listByStudent(studentId);
    const courses = await courseRepository.findManyByIds(
      entries.map((e) => e.courseId),
    );
    const byId = new Map(
      courses.filter((c) => c.status === "published").map((c) => [c.id, c]),
    );
    return entries.map((e) => byId.get(e.courseId)).filter(Boolean);
  },
  remove: ({ user, courseId }) => wishlistRepository.remove(user.uid, courseId),
  isWishlisted: (studentId, courseId) =>
    wishlistRepository.has(studentId, courseId),
  async toggle({ user, courseSlug }) {
    const course = await courseRepository.findBySlug(courseSlug);
    if (!course) throw new AppError("Course not found.", 404);
    if (await wishlistRepository.has(user.uid, course.id)) {
      await wishlistRepository.remove(user.uid, course.id);
      return { wishlisted: false };
    }
    await wishlistRepository.add(user.uid, course);
    return { wishlisted: true };
  },
};

