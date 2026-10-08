// app/actions/admin/categories.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { cascadeToCourses } from "@/lib/admin/cascade";
import { changedFields } from "@/lib/audit/auditLog";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { categorySchema } from "@/lib/validations/category";
import { adminSlug } from "@/lib/validations/common";
import { categoryAdminRepository as repo } from "@/repositories/admin/categoryAdminRepository";

const paths = (...slugs) => [
  "/",
  "/categories",
  "/courses",
  ...slugs.filter(Boolean).map((s) => `/categories/${s}`),
];

export const createCategory = adminAction({
  permission: P.CATEGORIES_CREATE,
  schema: categorySchema,
  handler: async ({ input, actor }) => {
    const { id, slug } = await repo.create({
      data: input,
      slugSource: input.name,
      actor,
      initial: { coursesCount: 0 },
    });
    return {
      data: { slug },
      audit: {
        action: "category.created",
        resource: "category",
        resourceId: id,
        resourceSlug: slug,
        metadata: { name: input.name },
      },
      revalidate: paths(slug),
    };
  },
});

export const updateCategory = adminAction({
  permission: P.CATEGORIES_UPDATE,
  schema: z.object({
    currentSlug: adminSlug,
    ifUpdatedAt: z.number().int().positive().optional(),
    values: categorySchema,
  }),
  handler: async ({ input, actor }) => {
    const before = await repo.findBySlug(input.currentSlug);
    if (!before) throw new AppError("Category not found.", 404);
    if (before.status === "deleted")
      throw new AppError("Restore this category before editing it.", 409);
    const patch = { ...input.values, slug: input.values.slug || before.slug };
    const r = await repo.update(input.currentSlug, patch, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });
    if (before.name !== patch.name || r.previousSlug)
      await cascadeToCourses("categoryId", r.id, {
        category: patch.name,
        categorySlug: r.slug,
      });
    return {
      data: { slug: r.slug },
      audit: {
        action: "category.updated",
        resource: "category",
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
  resource: "category",
  permissionPrefix: "categories",
  revalidate: (slugs) => paths(...slugs),
});
export const runCategoryAction = lifecycle.run;
export const bulkCategoryAction = lifecycle.bulk;

