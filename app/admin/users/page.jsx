// app/admin/users/page.jsx
import { z } from "zod";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { UsersTable } from "@/components/admin/people/PeopleTables";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { ROLE_LABELS, ROLE_LIST } from "@/lib/constants/roles";
import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { FLAG_FILTERS, flagOptions } from "@/config/adminPeople";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  USER_SORTS,
  userAdminRepository,
} from "@/repositories/admin/userAdminRepository";

export const metadata = { title: "Users & Roles" };

export default async function AdminUsersPage({ searchParams }) {
  const user = await requirePermission(P.USERS_READ);
  const p = parseListParams(await searchParams, {
    sorts: USER_SORTS,
    filters: { ...FLAG_FILTERS, role: z.enum(ROLE_LIST) },
  });
  const { items, nextCursor, total } = await userAdminRepository.list({
    role: p.role,
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
        title="Users & Roles"
        description="Every account on the platform, including staff. Role changes are audited and sign the person out."
      />
      <DataTableToolbar
        searchPlaceholder="Search by name or email…"
        total={total}
        sorts={sortOptions(USER_SORTS)}
        filters={[
          {
            key: "role",
            label: "Role",
            allLabel: "All roles",
            options: ROLE_LIST.map((r) => ({
              value: r,
              label: ROLE_LABELS[r],
            })),
          },
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
        <UsersTable
          rows={items}
          perms={permissionsFor(user.role)}
          selfUid={user.uid}
        />
        <CursorPagination
          basePath="/admin/users"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

