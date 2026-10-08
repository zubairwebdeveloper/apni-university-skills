// app/actions/admin/certificates.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { certificateAdminRepository as repo } from "@/repositories/admin/certificateAdminRepository";

export const revokeCertificate = adminAction({
  permission: P.CERTIFICATES_REVOKE,
  fresh: true,
  schema: z.object({
    slug: adminSlug,
    reason: z
      .string()
      .trim()
      .min(5, "Give a reason (at least 5 characters)")
      .max(200),
  }),
  handler: async ({ input, actor }) => {
    const r = await repo.setStatus(input.slug, "revoked", actor, input.reason);
    return {
      audit: {
        action: "certificate.revoked",
        resource: "certificate",
        resourceId: r.id,
        resourceSlug: r.slug,
        metadata: {
          reason: input.reason,
          studentId: r.studentId,
          courseSlug: r.courseSlug,
        },
      },
    };
  },
});
export const reinstateCertificate = adminAction({
  permission: P.CERTIFICATES_REVOKE,
  fresh: true,
  schema: z.object({ slug: adminSlug }),
  handler: async ({ input, actor }) => {
    const r = await repo.setStatus(input.slug, "valid", actor);
    return {
      audit: {
        action: "certificate.reinstated",
        resource: "certificate",
        resourceId: r.id,
        resourceSlug: r.slug,
        metadata: { studentId: r.studentId, courseSlug: r.courseSlug },
      },
    };
  },
});

