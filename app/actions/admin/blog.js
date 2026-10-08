"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { makeFeatureAction } from "@/lib/admin/featureAction";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { blogGuard } from "@/lib/admin/guards";
import { changedFields } from "@/lib/audit/auditLog";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { blogSchema, scheduleSchema } from "@/lib/validations/blog";
import {
  BLOG_INITIAL,
  blogAdminRepository as repo,
} from "@/repositories/admin/blogAdminRepository";

const paths = (...slugs) => [
  "/",
  "/blog",
  ...slugs.filter(Boolean).map((s) => `/blog/${s}`),
];
const adminSlugSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9-]{1,120}$/);

export const createPost = adminAction({
  permission: P.BLOG_CREATE,
  schema: blogSchema,
  handler: async ({ input, actor }) => {
    const { id, slug } = await repo.create({
      data: input,
      slugSource: input.title,
      actor,
      initial: BLOG_INITIAL(actor),
    });
    return {
      data: { slug },
      audit: {
        action: "blog.created",
        resource: "blog",
        resourceId: id,
        resourceSlug: slug,
        metadata: { title: input.title },
      },
      revalidate: paths(slug),
    };
  },
});

export const updatePost = adminAction({
  permission: P.BLOG_UPDATE,
  schema: z.object({
    currentSlug: adminSlugSchema,
    ifUpdatedAt: z.number().int().positive().optional(),
    values: blogSchema,
  }),
  handler: async ({ input, actor }) => {
    const before = await repo.findBySlug(input.currentSlug);
    if (!before) throw new AppError("Post not found.", 404);
    if (before.status === "deleted")
      throw new AppError("Restore this post before editing it.", 409);
    const patch = { ...input.values, slug: input.values.slug || before.slug };
    const r = await repo.update(input.currentSlug, patch, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });
    return {
      data: { slug: r.slug },
      audit: {
        action: "blog.updated",
        resource: "blog",
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

export const schedulePost = adminAction({
  permission: P.BLOG_PUBLISH,
  schema: scheduleSchema,
  handler: async ({ input, actor }) => {
    const post = await repo.findBySlug(input.slug);
    if (!post) throw new AppError("Post not found.", 404);
    const blocked = await blogGuard("publish", post); // an incomplete post can't be scheduled either
    if (blocked)
      throw new AppError(blocked.replace("publish yet", "schedule yet"), 409);
    const r = await repo.schedule(
      input.slug,
      new Date(input.scheduledFor),
      actor,
    );
    return {
      data: { scheduledFor: input.scheduledFor },
      audit: {
        action: "blog.scheduled",
        resource: "blog",
        resourceId: r.id,
        resourceSlug: r.slug,
        metadata: { scheduledFor: input.scheduledFor },
      },
    };
  },
});

export const setPostFeatured = makeFeatureAction({
  repo,
  resource: "blog",
  permission: P.BLOG_UPDATE,
  revalidate: (s) => paths(...s),
});

const lifecycle = makeLifecycleActions({
  repo,
  resource: "blog",
  permissionPrefix: "blog",
  revalidate: (slugs) => paths(...slugs),
  verbs: {
    publish: P.BLOG_PUBLISH,
    unpublish: P.BLOG_PUBLISH,
    unschedule: P.BLOG_PUBLISH,
    archive: P.BLOG_UPDATE,
    restore: P.BLOG_UPDATE,
    delete: P.BLOG_DELETE,
  },
  past: { unschedule: "unscheduled" },
});
export const runPostAction = lifecycle.run;
export const bulkPostAction = lifecycle.bulk;

