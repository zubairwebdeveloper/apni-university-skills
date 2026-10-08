// app/actions/admin/careers.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { changedFields } from "@/lib/audit/auditLog";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { careerSchema, toCareerData } from "@/lib/validations/career";
import { adminSlug } from "@/lib/validations/common";
import { careerAdminRepository as repo } from "@/repositories/admin/careerAdminRepository";

const paths = (...slugs) => [
  "/",
  "/careers",
  "/technology",
  ...slugs.filter(Boolean).map((s) => `/careers/${s}`),
];

export const createCareer = adminAction({
  permission: P.CAREERS_CREATE,
  schema: careerSchema,
  handler: async ({ input, actor }) => {
    const { id, slug } = await repo.create({
      data: toCareerData(input),
      slugSource: input.title,
      actor,
    });
    return {
      data: { slug },
      audit: {
        action: "career.created",
        resource: "career",
        resourceId: id,
        resourceSlug: slug,
        metadata: { title: input.title },
      },
      revalidate: paths(slug),
    };
  },
});

export const updateCareer = adminAction({
  permission: P.CAREERS_UPDATE,
  schema: z.object({
    currentSlug: adminSlug,
    ifUpdatedAt: z.number().int().positive().optional(),
    values: careerSchema,
  }),
  handler: async ({ input, actor }) => {
    const before = await repo.findBySlug(input.currentSlug);
    if (!before) throw new AppError("Career guide not found.", 404);
    if (before.status === "deleted")
      throw new AppError("Restore this guide before editing it.", 409);
    const patch = {
      ...toCareerData(input.values),
      slug: input.values.slug || before.slug,
    };
    const r = await repo.update(input.currentSlug, patch, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });
    return {
      data: { slug: r.slug },
      audit: {
        action: "career.updated",
        resource: "career",
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
  resource: "career",
  permissionPrefix: "careers",
  revalidate: (slugs) => paths(...slugs),
});
export const runCareerAction = lifecycle.run;
export const bulkCareerAction = lifecycle.bulk;

