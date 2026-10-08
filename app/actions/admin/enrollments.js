// app/actions/admin/enrollments.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { refsOfCourses, syncCourseCounts } from "@/lib/admin/counts";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { enrollmentAdminRepository as repo } from "@/repositories/admin/enrollmentAdminRepository";

const make = (to, action) =>
  adminAction({
    permission: P.ENROLLMENTS_UPDATE,
    schema: z.object({ slug: adminSlug }),
    handler: async ({ input, actor }) => {
      const r = await repo.changeStatus(input.slug, to, actor);
      await syncCourseCounts(await refsOfCourses([r.courseId]));
      return {
        data: { status: r.next },
        audit: {
          action,
          resource: "enrollment",
          resourceId: r.id,
          resourceSlug: r.slug,
          metadata: {
            studentId: r.studentId,
            courseSlug: r.courseSlug,
            from: r.from,
            to: r.next,
          },
        },
        revalidate: [`/courses/${r.courseSlug}`],
      };
    },
  });
export const cancelEnrollment = make("cancelled", "enrollment.cancelled");
export const reinstateEnrollment = make("active", "enrollment.reinstated");

