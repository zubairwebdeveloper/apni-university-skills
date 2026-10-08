// app/admin/reviews/page.jsx
import { z } from "zod";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { ReviewsTable } from "@/components/admin/reviews/ReviewsTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import {
  RANGE_OPTIONS,
  REVIEW_STATUS_OPTIONS,
  REVIEW_STATUSES,
  sortOptions,
} from "@/config/adminTable";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  REVIEW_SORTS,
  reviewAdminRepository,
} from "@/repositories/admin/reviewAdminRepository";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";

export const metadata = { title: "Reviews" };

export default async function AdminReviewsPage({ searchParams }) {
  const user = await requirePermission(P.REVIEWS_READ);
  const p = parseListParams(await searchParams, {
    sorts: REVIEW_SORTS,
    statuses: REVIEW_STATUSES,
    filters: {
      course: z.string().regex(/^[a-z0-9-]{1,120}$/),
      rating: z.enum(["1", "2", "3", "4", "5"]),
    },
  });
  if (p.rating && p.sort.startsWith("rating")) p.sort = "newest"; // an equality filter and a sort on the same field need an extra index; not worth it
  const filters = [...rangeFilter(p.range)];
  if (p.course) filters.push(["courseSlug", "==", p.course]);
  if (p.rating) filters.push(["rating", "==", Number(p.rating)]);

  const [{ items, nextCursor, total }, courses] = await Promise.all([
    reviewAdminRepository.list({
      status: p.status,
      sort: p.sort,
      after: p.after,
      filters,
    }),
    courseAdminRepository
      .list({ status: "published", limit: 100, sort: "name-asc" })
      .catch(() => ({ items: [] })),
  ]);
  const { after, keyword, q, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Only approved reviews appear publicly. Approving or removing a review updates the course and instructor ratings."
      />
      <DataTableToolbar
        searchable={false}
        total={total}
        sorts={sortOptions(REVIEW_SORTS)}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All (not in trash)",
            options: REVIEW_STATUS_OPTIONS,
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
            key: "rating",
            label: "Rating",
            allLabel: "Any rating",
            options: [5, 4, 3, 2, 1].map((n) => ({
              value: String(n),
              label: `${n} ${n === 1 ? "star" : "stars"}`,
            })),
          },
          {
            key: "range",
            label: "Submitted",
            allLabel: "Any time",
            options: RANGE_OPTIONS,
          },
        ]}
      />
      <div className="mt-4">
        <ReviewsTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/reviews"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

