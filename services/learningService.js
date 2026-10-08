// services/learningService.js

import "server-only";

import { courseRepository } from "@/repositories/courseRepository";

import {
  enrollmentRepository,
  ACTIVE,
} from "@/repositories/enrollmentRepository";

import { lessonRepository } from "@/repositories/lessonRepository";
import { progressRepository } from "@/repositories/progressRepository";
import { userRepository } from "@/repositories/userRepository";
import { groupBySection } from "@/services/lessonService";
import { emailService } from "@/services/email/emailService";

import { safeExternalUrl } from "@/lib/utils/url";
import { AppError } from "@/lib/errors";

// Full lesson data. Only ever built AFTER the enrollment check below.
const toStudentLesson = (lesson) => ({
  id: lesson.id,
  title: lesson.title,
  slug: lesson.slug,
  description: lesson.description ?? "",
  duration: lesson.duration ?? 0,
  order: lesson.order,
  isPreview: !!lesson.isPreview,
  sectionTitle: lesson.sectionTitle || "Course content",
  sectionOrder: lesson.sectionOrder ?? 0,
  videoUrl: lesson.videoUrl ?? null,
  resources: (lesson.resources ?? [])
    .map((resource) => ({
      title: String(resource.title ?? "Resource"),
      url: safeExternalUrl(resource.url),
    }))
    .filter((resource) => resource.url),
});

async function loadAccess(user, courseSlug) {
  const enrollment = await enrollmentRepository.findByStudentAndSlug(
    user.uid,
    courseSlug,
  );

  if (!enrollment || !ACTIVE.includes(enrollment.status)) {
    return null;
  }

  const course = await courseRepository.findById(enrollment.courseId);

  return course
    ? {
        enrollment,
        course,
      }
    : null;
}

export const learningService = {
  async getOutline({ user, courseSlug }) {
    const access = await loadAccess(user, courseSlug);

    if (!access) return null;

    const [rows, progress] = await Promise.all([
      lessonRepository.findPublishedByCourse(access.course.id),
      progressRepository.get(user.uid, access.course.id),
    ]);

    const lessons = rows.map(toStudentLesson);

    const valid = new Set(lessons.map((lesson) => lesson.id));

    const completedIds = (progress?.completedLessonIds ?? []).filter((id) =>
      valid.has(id),
    );

    const percent = lessons.length
      ? Math.round((completedIds.length / lessons.length) * 100)
      : 0;

    return {
      ...access,
      lessons,
      sections: groupBySection(lessons),
      completedIds,
      percent,
    };
  },

  async getLesson({ user, courseSlug, lessonSlug }) {
    const outline = await this.getOutline({
      user,
      courseSlug,
    });

    if (!outline) return null;

    const { lessons, completedIds } = outline;

    let index = lessonSlug
      ? lessons.findIndex((lesson) => lesson.slug === lessonSlug)
      : -1;

    if (index < 0) {
      index = Math.max(
        0,
        lessons.findIndex((lesson) => !completedIds.includes(lesson.id)),
      );
    }

    const pick = (lesson) =>
      lesson
        ? {
            slug: lesson.slug,
            title: lesson.title,
          }
        : null;

    const lesson = lessons[index] ?? null;

    let extra = {};

    if (lesson) {
      const row = await lessonRepository.findById(lesson.id);

      const valid =
        row && row.courseId === outline.course.id && row.isPublished;

      extra = {
        transcript: valid ? (row.transcript ?? "") : "",
        attachments: valid ? await signAttachments(row.attachments) : [],
      };
    }

    return {
      ...outline,
      lesson: lesson
        ? {
            ...lesson,
            ...extra,
          }
        : null,
      prev: pick(lessons[index - 1]),
      next: pick(lessons[index + 1]),
    };
  },

  async setLessonCompleted({ user, courseSlug, lessonSlug, completed }) {
    const access = await loadAccess(user, courseSlug);

    if (!access) {
      throw new AppError("You're not enrolled in this course.", 403);
    }

    const rows = await lessonRepository.findPublishedByCourse(access.course.id);

    const lesson = rows.find((item) => item.slug === lessonSlug);

    if (!lesson) {
      throw new AppError("Lesson not found.", 404);
    }

    const profile = await userRepository.getById(user.uid);

    const result = await progressRepository.recordLesson({
      studentId: user.uid,
      studentName:
        profile?.displayName || user.email?.split("@")[0] || "Student",
      course: access.course,
      lessonIds: rows.map((item) => item.id),
      lessonId: lesson.id,
      completed,
    });

    const site = process.env.NEXT_PUBLIC_SITE_URL;

    if (profile?.email && result.justCompleted) {
      await emailService.send(
        "completion",
        profile.email,
        {
          name: profile.displayName,
          course: access.course.title,
          url: `${site}/student/certificates`,
        },
        {
          flag: "completion",
        },
      );
    }

    if (profile?.email && result.certificateIssued) {
      await emailService.send(
        "certificate",
        profile.email,
        {
          name: profile.displayName,
          course: access.course.title,
          url: `${site}/verify/${result.verificationCode}`,
        },
        {
          flag: "certificate",
        },
      );
    }

    return result;
  },
};

