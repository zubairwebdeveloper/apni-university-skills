// app/actions/admin/students.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { changedFields } from "@/lib/audit/auditLog";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { profileSchema } from "@/lib/validations/profile";
import { adminSlug, docIds } from "@/lib/validations/common";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { userAdminService as svc } from "@/services/admin/userAdminService";

const STUDENT = ["student"];

export const updateStudentProfile = adminAction({
  permission: P.STUDENTS_UPDATE,
  schema: z.object({ slug: adminSlug, values: profileSchema }),
  handler: async ({ input, actor }) => {
    const before = await userAdminRepository.findBySlug(input.slug);
    const t = await svc.updateProfile({
      slug: input.slug,
      data: input.values,
      actor,
      allowedRoles: STUDENT,
    });
    return {
      audit: {
        action: "student.updated",
        resource: "student",
        resourceId: t.id,
        resourceSlug: t.slug,
        metadata: { fields: changedFields(before ?? {}, input.values) },
      },
      revalidate: [],
    };
  },
});

export const setStudentActive = adminAction({
  permission: P.STUDENTS_UPDATE,
  schema: z.object({ slug: adminSlug, active: z.boolean() }),
  handler: async ({ input, actor }) => {
    await svc.setActive({ ...input, actor, allowedRoles: STUDENT });
    return {};
  }, // audited inside the transaction
});

export const markStudentVerified = adminAction({
  permission: P.STUDENTS_UPDATE,
  schema: z.object({ slug: adminSlug }),
  handler: async ({ input, actor }) => {
    const t = await svc.markEmailVerified({
      slug: input.slug,
      actor,
      allowedRoles: STUDENT,
    });
    return {
      audit: {
        action: "student.email_verified",
        resource: "student",
        resourceId: t.id,
        resourceSlug: t.slug,
      },
    };
  },
});

export const bulkSetStudentsActive = adminAction({
  permission: P.STUDENTS_UPDATE,
  schema: z.object({ ids: docIds, active: z.boolean() }),
  limit: { limit: 10, windowSec: 60 },
  fresh: true,
  handler: async ({ input, actor }) => {
    const r = await svc.bulkSetStudentsActive({ ...input, actor });
    const verb = input.active ? "activated" : "deactivated";
    return {
      data: {
        updated: r.updated,
        skipped: r.skipped,
        message: r.updated
          ? `${r.updated} ${verb}${r.skipped ? `, ${r.skipped} skipped` : ""}.`
          : "Nothing changed: the selected accounts were already in that state.",
      },
      audit: r.updated
        ? {
            action: `student.bulk_${verb}`,
            resource: "student",
            metadata: { count: r.updated, slugs: r.slugs },
          }
        : undefined,
    };
  },
});

