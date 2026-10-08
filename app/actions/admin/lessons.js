"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { syncLessonsCount } from "@/lib/admin/counts";
import { changedFields } from "@/lib/audit/auditLog";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { curriculumSchema, lessonSchema } from "@/lib/validations/lesson";
import { adminSlug } from "@/lib/validations/common";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { lessonAdminRepository as repo } from "@/repositories/admin/lessonAdminRepository";

const paths = (courseSlug) => ["/courses", `/courses/${courseSlug}`];
const ref = (course, slug) => `${course.slug}/${slug}`;

async function loadCourse(slug) {
  const c = await courseAdminRepository.findBySlug(slug);
  if (!c) throw new AppError("Course not found.", 404);
  if (c.status === "deleted")
    throw new AppError("Restore the course before changing its lessons.", 409);
  return c;
}
// Files must live in THIS course's private folder (they were put there by the upload route)
function checkAttachments(course, list) {
  const prefix = `private/lessons/${course.id}/`;
  if (list.some((a) => !a.path.startsWith(prefix) || a.path.includes("..")))
    throw new AppError("Invalid attachment.", 400);
}

export const createLesson = adminAction({
  permission: P.LESSONS_CREATE,
  schema: z.object({ courseSlug: adminSlug, values: lessonSchema }),
  handler: async ({ input, actor }) => {
    const course = await loadCourse(input.courseSlug);
    checkAttachments(course, input.values.attachments);
    const { id, slug } = await repo.create({
      course,
      data: input.values,
      actor,
    });
    return {
      data: { slug },
      audit: {
        action: "lesson.created",
        resource: "lesson",
        resourceId: id,
        resourceSlug: ref(course, slug),
        metadata: { title: input.values.title },
      },
    };
  },
});

export const updateLesson = adminAction({
  permission: P.LESSONS_UPDATE,
  schema: z.object({
    courseSlug: adminSlug,
    currentSlug: adminSlug,
    ifUpdatedAt: z.number().int().positive().optional(),
    values: lessonSchema,
  }),
  handler: async ({ input, actor }) => {
    const course = await loadCourse(input.courseSlug);
    checkAttachments(course, input.values.attachments);
    const before = await repo.findBySlug(course.id, input.currentSlug);
    if (!before) throw new AppError("Lesson not found.", 404);
    if (before.status === "deleted")
      throw new AppError("Restore this lesson before editing it.", 409);
    const patch = { ...input.values, slug: input.values.slug || before.slug };
    const r = await repo.update(course.id, input.currentSlug, patch, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });
    return {
      data: { slug: r.slug },
      audit: {
        action: "lesson.updated",
        resource: "lesson",
        resourceId: r.id,
        resourceSlug: ref(course, r.slug),
        metadata: { fields: changedFields(before, patch) },
      },
      revalidate: before.isPublished ? paths(course.slug) : [],
    };
  },
});

// Each verb has its own permission: publish/unpublish -> lessons.publish, delete -> lessons.delete, archive/restore -> lessons.update
const VERBS = {
  publish: P.LESSONS_PUBLISH,
  unpublish: P.LESSONS_PUBLISH,
  archive: P.LESSONS_UPDATE,
  restore: P.LESSONS_UPDATE,
  delete: P.LESSONS_DELETE,
};
const PAST = {
  publish: "published",
  unpublish: "unpublished",
  archive: "archived",
  restore: "restored",
  delete: "deleted",
};
const verbActions = Object.fromEntries(
  Object.entries(VERBS).map(([verb, permission]) => [
    verb,
    adminAction({
      permission,
      schema: z.object({ courseSlug: adminSlug, slug: adminSlug }),
      handler: async ({ input, actor }) => {
        const course = await loadCourse(input.courseSlug);
        const r = await repo.runAction(course, input.slug, verb, actor);
        await syncLessonsCount(course.id);
        return {
          data: { slug: r.slug },
          audit: {
            action: `lesson.${PAST[verb]}`,
            resource: "lesson",
            resourceId: r.id,
            resourceSlug: ref(course, r.slug),
            metadata: { from: r.from },
          },
          revalidate: paths(course.slug),
        };
      },
    }),
  ]),
);
export async function runLessonAction(input) {
  const run = Object.hasOwn(verbActions, input?.action)
    ? verbActions[input.action]
    : null; // own-property lookup only
  return run
    ? run(input)
    : { ok: false, code: "ERROR", error: "Unknown action." };
}

export const saveCurriculum = adminAction({
  permission: P.LESSONS_UPDATE,
  schema: curriculumSchema.extend({ courseSlug: adminSlug }),
  handler: async ({ input, actor }) => {
    const course = await loadCourse(input.courseSlug);
    const r = await repo.saveCurriculum(course.id, input.sections, actor);
    return {
      data: r,
      audit: {
        action: "lesson.reordered",
        resource: "lesson",
        resourceId: course.id,
        resourceSlug: course.slug,
        metadata: r,
      },
      revalidate: paths(course.slug),
    };
  },
});

