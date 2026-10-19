// app/admin/careers/page.jsx
import Link from "next/link";
import { FiCompass } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CareersTable } from "@/components/admin/careers/CareersTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import {
  CONTENT_STATUS_OPTIONS,
  RANGE_OPTIONS,
  sortOptions,
} from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  CAREER_SORTS,
  careerAdminRepository,
} from "@/repositories/admin/careerAdminRepository";
import { cn } from "@/lib/utils";

export const metadata = { title: "Careers" };

// Shared entrance-animation classes/delays — same pattern used on the other
// admin pages (fade + slide-up, respects prefers-reduced-motion).
const ENTRANCE =
  "animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none";
const delay = (ms) => ({
  animationDelay: `${ms}ms`,
  animationFillMode: "backwards",
});

export default async function AdminCareersPage({ searchParams }) {
  const user = await requirePermission(P.CAREERS_READ);
  const p = parseListParams(await searchParams, { sorts: CAREER_SORTS });
  const { items, nextCursor, total } = await careerAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    filters: rangeFilter(p.range),
  });
  const { after, keyword, ...linkParams } = p;

  const canCreate = can(user.role, P.CAREERS_CREATE);

  // What is narrowing the list right now (status, date range, search)
  const activeFilterCount = [p.status, p.range].filter(Boolean).length;
  const searching = Boolean(keyword);
  const filtered = activeFilterCount > 0 || searching;

  const summary = [
    {
      label: filtered ? "Matching guides" : "All guides",
      value: typeof total === "number" ? total : "–",
    },
    { label: "On this page", value: items.length },
    {
      label: "Filters applied",
      value: activeFilterCount + (searching ? 1 : 0),
    },
  ];

  return (
    <>
      <div className={ENTRANCE} style={delay(0)}>
        <AdminPageHeader
          title="Careers"
          description="Role guides with roadmaps, skills, interview preparation and portfolio ideas."
          actions={
            canCreate && (
              <Link href="/admin/careers/create" className={buttonVariants()}>
                New guide
              </Link>
            )
          }
        />
      </div>

      {/* Summary: a compact read-out of the current view */}
      <dl
        className={cn(
          "mb-4 grid grid-cols-3 divide-x divide-border rounded-xl border bg-card",
          ENTRANCE,
        )}
        style={delay(60)}
      >
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex flex-col-reverse items-center gap-0.5 px-3 py-3 text-center sm:flex-row sm:justify-center sm:gap-3"
          >
            <dt className="text-xs text-muted-foreground sm:text-sm">
              {s.label}
            </dt>
            <dd className="text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
              {s.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className={ENTRANCE} style={delay(120)}>
        <DataTableToolbar
          searchPlaceholder="Search by title, summary or skill…"
          total={total}
          sorts={sortOptions(CAREER_SORTS)}
          filters={[
            {
              key: "status",
              label: "Status",
              allLabel: "All (not in trash)",
              options: CONTENT_STATUS_OPTIONS,
            },
            {
              key: "range",
              label: "Created",
              allLabel: "Any time",
              options: RANGE_OPTIONS,
            },
          ]}
        />
      </div>

      <div className={cn("mt-4", ENTRANCE)} style={delay(180)}>
        {items.length > 0 ? (
          <>
            <CareersTable rows={items} perms={permissionsFor(user.role)} />
            <CursorPagination
              basePath="/admin/careers"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </>
        ) : (
          <EmptyState
            icon={FiCompass}
            title={
              filtered ? "No guides match this view" : "No career guides yet"
            }
            description={
              filtered
                ? "Try removing a filter or searching for something else."
                : "Create your first role guide to get started."
            }
            action={
              filtered ? (
                <Link
                  href="/admin/careers"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : (
                canCreate && (
                  <Link
                    href="/admin/careers/create"
                    className={buttonVariants()}
                  >
                    New guide
                  </Link>
                )
              )
            }
          />
        )}
      </div>
    </>
  );
}
