// app/actions/admin/instructors.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { cascadeToCourses } from "@/lib/admin/cascade";
import { changedFields } from "@/lib/audit/auditLog";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { instructorSchema } from "@/lib/validations/instructor";
import { adminSlug } from "@/lib/validations/common";
import {
  INSTRUCTOR_COUNTERS,
  instructorAdminRepository as repo,
} from "@/repositories/admin/instructorAdminRepository";

const paths = (...slugs) => [
  "/",
  "/instructors",
  "/courses",
  ...slugs.filter(Boolean).map((s) => `/instructors/${s}`),
];

export const createInstructor = adminAction({
  permission: P.INSTRUCTORS_CREATE,
  schema: instructorSchema,
  handler: async ({ input, actor }) => {
    const { id, slug } = await repo.create({
      data: input,
      slugSource: input.name,
      actor,
      initial: INSTRUCTOR_COUNTERS,
    });
    return {
      data: { slug },
      audit: {
        action: "instructor.created",
        resource: "instructor",
        resourceId: id,
        resourceSlug: slug,
        metadata: { name: input.name },
      },
      revalidate: paths(slug),
    };
  },
});

export const updateInstructor = adminAction({
  permission: P.INSTRUCTORS_UPDATE,
  schema: z.object({
    currentSlug: adminSlug,
    ifUpdatedAt: z.number().int().positive().optional(),
    values: instructorSchema,
  }),
  handler: async ({ input, actor }) => {
    const before = await repo.findBySlug(input.currentSlug);
    if (!before) throw new AppError("Instructor not found.", 404);
    if (before.status === "deleted")
      throw new AppError("Restore this instructor before editing.", 409);
    const patch = { ...input.values, slug: input.values.slug || before.slug };
    const r = await repo.update(input.currentSlug, patch, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });
    if (before.name !== patch.name || r.previousSlug)
      await cascadeToCourses("instructorId", r.id, {
        instructor: patch.name,
        instructorSlug: r.slug,
      });
    return {
      data: { slug: r.slug },
      audit: {
        action: "instructor.updated",
        resource: "instructor",
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

const lifecycle = makeLifecycleActions({
  repo,
  resource: "instructor",
  permissionPrefix: "instructors",
  revalidate: (slugs) => paths(...slugs),
});
export const runInstructorAction = lifecycle.run;
export const bulkInstructorAction = lifecycle.bulk;

