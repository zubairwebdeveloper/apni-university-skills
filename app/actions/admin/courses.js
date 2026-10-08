"use server";

import { z } from "zod";

import { adminAction } from "@/lib/admin/action";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";

import { refsOfCourses, syncCourseCounts } from "@/lib/admin/counts";

import { cascadeCourseRename } from "@/lib/admin/cascade";

import { changedFields } from "@/lib/audit/auditLog";

import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

import { courseSchema } from "@/lib/validations/course";
import { adminSlug } from "@/lib/validations/common";

import {
  COURSE_COUNTERS,
  courseAdminRepository as repo,
} from "@/repositories/admin/courseAdminRepository";

import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";
import { lessonAdminRepository } from "@/repositories/admin/lessonAdminRepository";

const paths = (...slugs) => [
  "/",
  "/courses",
  "/categories",
  ...slugs.filter(Boolean).map((slug) => `/courses/${slug}`),
];

/**
 * Resolve category/instructor references from the
 * actual database documents.
 *
 * Labels never come from the submitted form.
 */
async function resolveRefs(
  { categoryId, instructorId },
  { requirePublished = false } = {},
) {
  const [category, instructor] = await Promise.all([
    categoryAdminRepository.findById(categoryId),
    instructorAdminRepository.findById(instructorId),
  ]);

  if (!category || category.status === "deleted") {
    throw new AppError("Choose a valid category.", 400);
  }

  if (!instructor || instructor.status === "deleted") {
    throw new AppError("Choose a valid instructor.", 400);
  }

  if (
    requirePublished &&
    (category.status !== "published" || instructor.status !== "published")
  ) {
    throw new AppError(
      "A published course needs a published category and instructor.",
      409,
    );
  }

  return {
    categoryId,
    category: category.name,
    categorySlug: category.slug,

    instructorId,
    instructor: instructor.name,
    instructorSlug: instructor.slug,
  };
}

/**
 * Create course.
 */
export const createCourse = adminAction({
  permission: P.COURSES_CREATE,

  schema: courseSchema,

  handler: async ({ input, actor }) => {
    const refs = await resolveRefs(input);

    const { id, slug } = await repo.create({
      data: {
        ...input,
        ...refs,
      },
      slugSource: input.title,
      actor,
      initial: COURSE_COUNTERS,
    });

    return {
      data: { slug },

      audit: {
        action: "course.created",
        resource: "course",
        resourceId: id,
        resourceSlug: slug,

        metadata: {
          title: input.title,
        },
      },

      revalidate: paths(slug),
    };
  },
});

/**
 * Update course.
 *
 * If the course title or slug changes, dependent lesson
 * references are cascaded to the new course identity.
 */
export const updateCourse = adminAction({
  permission: P.COURSES_UPDATE,

  schema: z.object({
    currentSlug: adminSlug,

    ifUpdatedAt: z.number().int().positive().optional(),

    values: courseSchema,
  }),

  handler: async ({ input, actor }) => {
    const before = await repo.findBySlug(input.currentSlug);

    if (!before) {
      throw new AppError("Course not found.", 404);
    }

    if (before.status === "deleted") {
      throw new AppError("Restore this course before editing it.", 409);
    }

    const refs = await resolveRefs(input.values, {
      requirePublished: before.status === "published",
    });

    const patch = {
      ...input.values,
      ...refs,

      slug: input.values.slug || before.slug,
    };

    const r = await repo.update(input.currentSlug, patch, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });

    /**
     * Keep dependent records synchronized when
     * the course identity changes.
     *
     * This covers:
     * - title changes
     * - slug changes
     */
    if (before.title !== patch.title || r.previousSlug) {
      await cascadeCourseRename(r.id, {
        courseSlug: r.slug,
        courseTitle: patch.title,
      });
    }

    if (before.status === "published") {
      await syncCourseCounts({
        categoryIds: [before.categoryId, refs.categoryId],

        instructorIds: [before.instructorId, refs.instructorId],
      });
    }

    return {
      data: {
        slug: r.slug,
      },

      audit: {
        action: "course.updated",
        resource: "course",
        resourceId: r.id,
        resourceSlug: r.slug,

        metadata: {
          fields: changedFields(before, patch),

          previousSlug: r.previousSlug,
        },
      },

      revalidate: paths(r.slug, r.previousSlug),
    };
  },
});

/**
 * Toggle featured state.
 */
export const setCourseFeatured = adminAction({
  permission: P.COURSES_UPDATE,

  schema: z.object({
    slug: adminSlug,
    featured: z.boolean(),
  }),

  handler: async ({ input, actor }) => {
    const r = await repo.update(
      input.slug,
      {
        featured: input.featured,
      },
      actor,
    );

    return {
      data: {
        featured: input.featured,
      },

      audit: {
        action: input.featured ? "course.featured" : "course.unfeatured",

        resource: "course",
        resourceId: r.id,
        resourceSlug: r.slug,
      },

      revalidate: paths(r.slug),
    };
  },
});

/**
 * Fields copied when duplicating a course.
 *
 * Counters/identity fields intentionally stay out.
 */
const COPIED = [
  "shortDescription",
  "description",
  "thumbnail",
  "level",
  "language",
  "isFree",
  "price",
  "salePrice",
  "currency",
  "duration",
  "seoTitle",
  "seoDescription",
  "seoKeywords",
  "requirements",
  "outcomes",
  "tags",
  "faqs",

  "categoryId",
  "category",
  "categorySlug",

  "instructorId",
  "instructor",
  "instructorSlug",
];

/**
 * Duplicate course + all lessons.
 */
export const duplicateCourse = adminAction({
  permission: P.COURSES_CREATE,

  schema: z.object({
    slug: adminSlug,
  }),

  handler: async ({ input, actor }) => {
    const src = await repo.findBySlug(input.slug);

    if (!src) {
      throw new AppError("Course not found.", 404);
    }

    const data = {
      ...Object.fromEntries(
        COPIED.filter((key) => src[key] !== undefined).map((key) => [
          key,
          src[key],
        ]),
      ),

      title: `${src.title} (Copy)`,

      featured: false,
    };

    /**
     * Create the new course first so lessons
     * can reference its new ID + slug.
     */
    const { id, slug } = await repo.create({
      data,

      slugSource: data.title,

      actor,

      initial: COURSE_COUNTERS,
    });

    /**
     * Copy every lesson from the source course
     * to the duplicated course.
     */
    const lessons = await lessonAdminRepository.copyAll({
      from: src,

      to: {
        id,
        slug,
      },

      actor,
    });

    const lessonCount = Array.isArray(lessons)
      ? lessons.length
      : Number(lessons?.count ?? lessons?.created ?? 0);

    return {
      data: {
        slug,
      },

      audit: {
        action: "course.duplicated",

        resource: "course",

        resourceId: id,

        resourceSlug: slug,

        metadata: {
          from: src.slug,
          lessons: lessonCount,
        },
      },

      revalidate: [],
    };
  },
});

/**
 * Course lifecycle actions.
 */
const lifecycle = makeLifecycleActions({
  repo,

  resource: "course",

  permissionPrefix: "courses",

  revalidate: (slugs) => paths(...slugs),

  afterChange: async (updated) => {
    await syncCourseCounts(await refsOfCourses(updated.map((item) => item.id)));
  },
});

export const runCourseAction = lifecycle.run;

export const bulkCourseAction = lifecycle.bulk;

