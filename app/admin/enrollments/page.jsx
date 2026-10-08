// app/admin/enrollments/page.jsx
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { EnrollmentsTable } from "@/components/admin/enrollments/EnrollmentsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  ENROLLMENT_SORTS,
  ENROLLMENT_STATUSES,
  enrollmentAdminRepository,
} from "@/repositories/admin/enrollmentAdminRepository";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";

export const metadata = { title: "Enrollments" };

export default async function AdminEnrollmentsPage({ searchParams }) {
  const user = await requirePermission(P.ENROLLMENTS_READ);
  const p = parseListParams(await searchParams, {
    sorts: ENROLLMENT_SORTS,
    statuses: ENROLLMENT_STATUSES,
    filters: { course: z.string().regex(/^[a-z0-9-]{1,120}$/) },
  });
  const filters = [...rangeFilter(p.range, "enrolledAt")];
  if (p.status && p.status !== "all") filters.push(["status", "==", p.status]);
  if (p.course) filters.push(["courseSlug", "==", p.course]);

  let problem = null;
  if (p.q) {
    if (/^enr-[a-z0-9]{6}$/i.test(p.q))
      filters.push(["slug", "==", p.q.toLowerCase()]);
    else if (p.q.includes("@")) {
      const student = await userAdminRepository.findByEmail(p.q.toLowerCase());
      if (student) filters.push(["studentId", "==", student.id]);
      else problem = "No account uses that email.";
    } else
      problem =
        "Search by a student's full email address or an enrollment reference (enr-…).";
  }

  const [listing, courses] = await Promise.all([
    problem
      ? { items: [], nextCursor: null, total: 0 }
      : enrollmentAdminRepository.list({
          filters,
          sort: p.sort,
          after: p.after,
        }),
    courseAdminRepository
      .list({ status: "published", limit: 100, sort: "name-asc" })
      .catch(() => ({ items: [] })),
  ]);
  const names = await userAdminRepository.namesByIds(
    listing.items.map((i) => i.studentId),
  );
  const rows = listing.items.map((i) => ({
    ...i,
    student: names[i.studentId] ?? null,
  }));
  const { after, keyword, ...linkParams } = p;

  return (
    <>
      <AdminPageHeader
        title="Enrollments"
        description="Who is enrolled in what. Refunds and payment status are controlled by Stripe."
      />
      <DataTableToolbar
        searchPlaceholder="Student email or enr-…"
        searchHint="Exact student email or an enrollment reference."
        total={problem ? 0 : listing.total}
        sorts={sortOptions(ENROLLMENT_SORTS)}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All statuses",
            options: ENROLLMENT_STATUSES.map((s) => ({
              value: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
            })),
          },
          {
            key: "course",
            label: "Course",
            allLabel: "All courses",
            options: courses.items.map((c) => ({
              value: c.slug,
              label: c.title,
            })),
          },
          {
            key: "range",
            label: "Enrolled",
            allLabel: "Any time",
            options: RANGE_OPTIONS,
          },
        ]}
      />
      {problem && (
        <Alert className="mt-4">
          <AlertDescription>{problem}</AlertDescription>
        </Alert>
      )}
      <div className="mt-4">
        <EnrollmentsTable rows={rows} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/enrollments"
          params={linkParams}
          after={after}
          nextCursor={listing.nextCursor}
        />
      </div>
    </>
  );
}

