// app/admin/students/page.jsx
import { z } from "zod";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { StudentsTable } from "@/components/admin/people/PeopleTables";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  USER_SORTS,
  userAdminRepository,
} from "@/repositories/admin/userAdminRepository";

export const metadata = { title: "Students" };

export const FLAG_FILTERS = {
  active: z.enum(["active", "inactive"]),
  verified: z.enum(["yes", "no"]),
};
export const flagOptions = [
  {
    key: "active",
    label: "Account",
    allLabel: "Active & inactive",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  {
    key: "verified",
    label: "Email",
    allLabel: "Verified & not",
    options: [
      { value: "yes", label: "Verified" },
      { value: "no", label: "Not verified" },
    ],
  },
];

export default async function AdminStudentsPage({ searchParams }) {
  const user = await requirePermission(P.STUDENTS_READ);
  const p = parseListParams(await searchParams, {
    sorts: USER_SORTS,
    filters: FLAG_FILTERS,
  });
  const { items, nextCursor, total } = await userAdminRepository.list({
    role: "student",
    active: p.active ? p.active === "active" : undefined,
    verified: p.verified ? p.verified === "yes" : undefined,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    range: rangeFilter(p.range),
  });
  const { after, keyword, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader
        title="Students"
        description="Learners on the platform. Open a student to see their enrollments, payments and certificates."
      />
      <DataTableToolbar
        searchPlaceholder="Search by name or email…"
        total={total}
        sorts={sortOptions(USER_SORTS)}
        filters={[
          ...flagOptions,
          {
            key: "range",
            label: "Joined",
            allLabel: "Any time",
            options: RANGE_OPTIONS,
          },
        ]}
      />
      <div className="mt-4">
        <StudentsTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/students"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

