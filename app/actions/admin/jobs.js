// app/actions/admin/jobs.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { makeFeatureAction } from "@/lib/admin/featureAction";
import { makeLifecycleActions } from "@/lib/admin/lifecycleActions";
import { changedFields } from "@/lib/audit/auditLog";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { jobSchema } from "@/lib/validations/jobs";
import { adminSlug } from "@/lib/validations/common";
import { endOfDayUTC } from "@/lib/utils/date";
import {
  JOB_INITIAL,
  jobAdminRepository as repo,
} from "@/repositories/admin/jobAdminRepository";

const paths = (...slugs) => [
  "/",
  "/jobs",
  "/careers",
  ...slugs.filter(Boolean).map((s) => `/jobs/${s}`),
];
const toData = ({ expiresAt, ...rest }) => ({
  ...rest,
  expiresAt: expiresAt ? endOfDayUTC(expiresAt) : null,
});

export const createJob = adminAction({
  permission: P.JOBS_CREATE,
  schema: jobSchema,
  handler: async ({ input, actor }) => {
    const { id, slug } = await repo.create({
      data: toData(input),
      slugSource: `${input.title} ${input.company}`,
      actor,
      initial: JOB_INITIAL,
    });
    return {
      data: { slug },
      audit: {
        action: "job.created",
        resource: "job",
        resourceId: id,
        resourceSlug: slug,
        metadata: { title: input.title, company: input.company },
      },
      revalidate: paths(slug),
    };
  },
});

export const updateJob = adminAction({
  permission: P.JOBS_UPDATE,
  schema: z.object({
    currentSlug: adminSlug,
    ifUpdatedAt: z.number().int().positive().optional(),
    values: jobSchema,
  }),
  handler: async ({ input, actor }) => {
    const before = await repo.findBySlug(input.currentSlug);
    if (!before) throw new AppError("Job not found.", 404);
    if (before.status === "deleted")
      throw new AppError("Restore this job before editing it.", 409);
    const patch = {
      ...toData(input.values),
      slug: input.values.slug || before.slug,
    };
    const r = await repo.update(input.currentSlug, patch, actor, {
      ifUpdatedAt: input.ifUpdatedAt,
    });
    return {
      data: { slug: r.slug },
      audit: {
        action: "job.updated",
        resource: "job",
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

export const setJobFeatured = makeFeatureAction({
  repo,
  resource: "job",
  permission: P.JOBS_UPDATE,
  revalidate: (s) => paths(...s),
});
const lifecycle = makeLifecycleActions({
  repo,
  resource: "job",
  permissionPrefix: "jobs",
  revalidate: (slugs) => paths(...slugs),
});
export const runJobAction = lifecycle.run;
export const bulkJobAction = lifecycle.bulk;

