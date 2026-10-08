// app/admin/lessons/page.jsx: course picker, or the builder when ?course= is present
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { CurriculumBuilder } from "@/components/admin/lessons/CurriculumBuilder";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import { CONTENT_STATUS_OPTIONS, sortOptions } from "@/config/adminTable";
import { adminSlug } from "@/lib/validations/common";
import { parseListParams } from "@/lib/admin/listParams";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { lessonAdminRepository } from "@/repositories/admin/lessonAdminRepository";

export const metadata = { title: "Lessons" };
const PICKER_SORTS = ["newest", "oldest", "name-asc", "name-desc"];

function groupSections(lessons) {
  const map = new Map();
  for (const l of lessons) {
    const k = `${l.sectionOrder ?? 0}:${(l.sectionTitle ?? "").trim().toLowerCase()}`;
    if (!map.has(k))
      map.set(k, {
        key: k,
        title: l.sectionTitle || "Course content",
        order: l.sectionOrder ?? 0,
        lessons: [],
      });
    map.get(k).lessons.push(l);
  }
  return [...map.values()].sort((a, b) => a.order - b.order);
}

export default async function AdminLessonsPage({ searchParams }) {
  const user = await requirePermission(P.LESSONS_READ);
  const sp = await searchParams;
  const course =
    typeof sp.course === "string" ? adminSlug.safeParse(sp.course) : null;

  if (course) {
    if (!course.success) notFound();
    const c = await courseAdminRepository.findBySlug(course.data);
    if (!c) notFound();
    const all = await lessonAdminRepository.listByCourse(c.id);
    const live = all.filter((l) => l.status !== "deleted");
    const initialSections = groupSections(live).map(({ order, ...s }) => s);
    const key = all
      .map((l) => `${l.id}:${l.order}:${l.status}:${l.updatedAt}`)
      .join("|");
    return (
      <>
        <AdminPageHeader
          title={`Lessons: ${c.title}`}
          description={`${live.length} lessons in ${initialSections.length} sections`}
          actions={
            <>
              <StatusBadge status={c.status} />
              <Link
                href={`/admin/courses/${c.slug}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Course
              </Link>
              {can(user.role, P.LESSONS_CREATE) && c.status !== "deleted" && (
                <Link
                  href={`/admin/lessons/create?course=${c.slug}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Add lesson
                </Link>
              )}
            </>
          }
        />
        <CurriculumBuilder
          key={key}
          course={{ slug: c.slug, title: c.title }}
          initialSections={initialSections}
          trash={all.filter((l) => l.status === "deleted")}
          perms={permissionsFor(user.role)}
        />
      </>
    );
  }

  const p = parseListParams(sp, { sorts: PICKER_SORTS });
  const { items, nextCursor, total } = await courseAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
  });
  const { after, keyword, ...linkParams } = p;
  return (
    <>
      <AdminPageHeader
        title="Lessons"
        description="Choose a course to build or reorder its curriculum."
      />
      <DataTableToolbar
        searchPlaceholder="Search courses…"
        total={total}
        sorts={sortOptions(PICKER_SORTS)}
        filters={[
          {
            key: "status",
            label: "Status",
            allLabel: "All (not in trash)",
            options: CONTENT_STATUS_OPTIONS,
          },
        ]}
      />
      <div className="mt-4">
        {!items.length ? (
          <EmptyState
            title="No courses match"
            description="Create a course first, then add its lessons."
          />
        ) : (
          <div className="rounded-xl border bg-card">
            <Table className="min-w-[560px]">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Course</TableHead>
                  <TableHead scope="col">Status</TableHead>
                  <TableHead scope="col">Published lessons</TableHead>
                  <TableHead scope="col">
                    <span className="sr-only">Open</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {c.lessonsCount ?? 0}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/lessons?course=${c.slug}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        Manage lessons
                        <span className="sr-only"> for {c.title}</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <CursorPagination
          basePath="/admin/lessons"
          params={linkParams}
          after={after}
          nextCursor={nextCursor}
        />
      </div>
    </>
  );
}

