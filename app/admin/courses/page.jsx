// app/admin/courses/page.jsx
import Link from "next/link";
import { z } from "zod";
import { buttonVariants } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CoursesTable } from "@/components/admin/courses/CoursesTable";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import {
  CONTENT_STATUS_OPTIONS,
  RANGE_OPTIONS,
  sortOptions,
} from "@/config/adminTable";
import { LEVELS } from "@/config/courses";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";
import {
  COURSE_SORTS,
  courseAdminRepository,
} from "@/repositories/admin/courseAdminRepository";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";

export const metadata = { title: "Courses" };
const slugParam = z.string().regex(/^[a-z0-9-]{1,80}$/);

export default async function AdminCoursesPage({ searchParams }) {
  const user = await requirePermission(P.COURSES_READ);
  const p = parseListParams(await searchParams, {
    sorts: COURSE_SORTS,
    filters: {
      category: slugParam,
      instructor: slugParam,
      price: z.enum(["free", "paid"]),
      level: z.enum(LEVELS.map((l) => l.value)),
      featured: z.literal("yes"),
    },
  });
  const filters = [...rangeFilter(p.range)];
  if (p.category) filters.push(["categorySlug", "==", p.category]);
  if (p.instructor) filters.push(["instructorSlug", "==", p.instructor]);
  if (p.price) filters.push(["isFree", "==", p.price === "free"]);
  if (p.level) filters.push(["level", "==", p.level]);
  if (p.featured) filters.push(["featured", "==", true]);

  const [{ items, nextCursor, total }, categories, instructors] =
    await Promise.all([
      courseAdminRepository.list({
        status: p.status,
        keyword: p.keyword,
        sort: p.sort,
        after: p.after,
        filters,
      }),
      categoryAdminRepository.options(),
      instructorAdminRepository.options(),
    ]);
  const { after, keyword, ...linkParams } = p;

  return (
    <>
      <AdminPageHeader
        title="Courses"
        description="Create, price, publish and organize your catalog."
        actions={
          can(user.role, P.COURSES_CREATE) && (
            <Link href="/admin/courses/create" className={buttonVariants()}>
              New course
            </Link>
          )
        }
      />
      <DataTableToolbar
        searchPlaceholder="Search by title, category, instructor or tag…"
        total={total}
        sorts={sortOptions(COURSE_SORTS)}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All (not in trash)",
            options: CONTENT_STATUS_OPTIONS,
          },
          {
            key: "category",
            label: "Category",
            allLabel: "All categories",
            options: categories.map((c) => ({ value: c.slug, label: c.name })),
          },
          {
            key: "instructor",
            label: "Instructor",
            allLabel: "All instructors",
            options: instructors.map((i) => ({ value: i.slug, label: i.name })),
          },
          {
            key: "price",
            label: "Price",
            allLabel: "Free & paid",
            options: [
              { value: "free", label: "Free" },
              { value: "paid", label: "Paid" },
            ],
          },
          {
            key: "level",
            label: "Level",
            allLabel: "All levels",
            options: LEVELS,
          },
          {
            key: "featured",
            label: "Featured",
            allLabel: "All",
            options: [{ value: "yes", label: "Featured only" }],
          },
          {
            key: "range",
            label: "Created",
            allLabel: "Any time",
            options: RANGE_OPTIONS,
          },
        ]}
      />
      <div className="mt-4">
        <CoursesTable rows={items} perms={permissionsFor(user.role)} />
        <CursorPagination
          basePath="/admin/courses"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

