import "server-only";
import { courseRepository } from "@/repositories/courseRepository";
import { enrollmentRepository } from "@/repositories/enrollmentRepository";
import { AppError } from "@/lib/errors";

export const enrollmentService = {
  getStudentEnrollment: (studentId, courseId) =>
    enrollmentRepository.find(studentId, courseId),
  getActiveEnrollment: (studentId, courseId) =>
    enrollmentRepository.findActive(studentId, courseId),

  async enrollInFreeCourse({ user, courseSlug }) {
    const course = await courseRepository.findBySlug(courseSlug);
    if (!course) throw new AppError("Course not found.", 404);
    if (!course.isFree)
      throw new AppError("This course needs to be purchased.", 403);
    return enrollmentRepository.enroll({
      studentId: user.uid,
      course,
      price: 0,
      currency: course.currency,
    });
  },

  // Student dashboard, My courses, Progress, Reviews pages
  async getStudentCourses(studentId) {
    const enrollments = await enrollmentRepository.listByStudent(studentId);
    const courses = await courseRepository.findManyByIds(
      enrollments.map((e) => e.courseId),
    );
    const byId = new Map(courses.map((c) => [c.id, c]));
    return enrollments.map((e) => ({
      ...e,
      course: byId.get(e.courseId) ?? null,
    }));
  },
};
