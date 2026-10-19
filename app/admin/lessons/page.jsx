import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Layers3,
  ListChecks,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

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

export const metadata = {
  title: "Lessons",
};

const PICKER_SORTS = ["newest", "oldest", "name-asc", "name-desc"];

function groupSections(lessons) {
  const map = new Map();

  for (const lesson of lessons) {
    const key = `${lesson.sectionOrder ?? 0}:${(lesson.sectionTitle ?? "")
      .trim()
      .toLowerCase()}`;

    if (!map.has(key)) {
      map.set(key, {
        key,
        title: lesson.sectionTitle || "Course content",
        order: lesson.sectionOrder ?? 0,
        lessons: [],
      });
    }

    map.get(key).lessons.push(lesson);
  }

  return [...map.values()].sort((a, b) => a.order - b.order);
}

function SummaryCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg hover:shadow-black/[0.03]">
      <div
        className={`mb-5 flex size-11 items-center justify-center rounded-xl border ${accent}`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mb-1 hidden size-9 items-center justify-center rounded-full bg-muted/70 transition-transform duration-300 group-hover:translate-x-0.5 sm:flex">
          <ArrowRight
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

function CourseIdentity({ course }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400">
        <BookOpen className="size-5" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground transition-colors group-hover:text-purple-600 dark:group-hover:text-purple-400">
          {course.title}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          /admin/lessons?course={course.slug}
        </p>
      </div>
    </div>
  );
}

export default async function AdminLessonsPage({ searchParams }) {
  const user = await requirePermission(P.LESSONS_READ);
  const sp = await searchParams;

  const course =
    typeof sp.course === "string" ? adminSlug.safeParse(sp.course) : null;

  // Curriculum builder for a selected course.
  if (course) {
    if (!course.success) notFound();

    const selectedCourse = await courseAdminRepository.findBySlug(course.data);

    if (!selectedCourse) notFound();

    const all = await lessonAdminRepository.listByCourse(selectedCourse.id);

    const live = all.filter((lesson) => lesson.status !== "deleted");

    const initialSections = groupSections(live).map(
      ({ order, ...section }) => section,
    );

    const key = all
      .map(
        (lesson) =>
          `${lesson.id}:${lesson.order}:${lesson.status}:${lesson.updatedAt}`,
      )
      .join("|");

    const trashedLessons = all.filter((lesson) => lesson.status === "deleted");

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Curriculum workspace
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <BookOpenCheck className="size-3.5" aria-hidden="true" />
              Course selected
            </span>
          </div>

          <AdminPageHeader
            title={`Lessons: ${selectedCourse.title}`}
            description={`${live.length} active lessons across ${initialSections.length} sections. Organize your curriculum and manage lesson content below.`}
            actions={
              <>
                <Link
                  href="/admin/lessons"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  <Layers3 className="mr-2 size-4" />
                  All courses
                </Link>

                <span className="inline-flex items-center">
                  <StatusBadge status={selectedCourse.status} />
                </span>

                <Link
                  href={`/admin/courses/${selectedCourse.slug}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                >
                  <BookOpen className="mr-2 size-4" />
                  View course
                </Link>

                {can(user.role, P.LESSONS_CREATE) &&
                  selectedCourse.status !== "deleted" && (
                    <Link
                      href={`/admin/lessons/create?course=${selectedCourse.slug}`}
                      className={buttonVariants({
                        size: "sm",
                        className:
                          "border border-yellow-400 bg-yellow-400 font-semibold text-black shadow-sm transition-all hover:bg-yellow-300 hover:shadow-md",
                      })}
                    >
                      <Plus className="mr-2 size-4" />
                      Add lesson
                    </Link>
                  )}
              </>
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            icon={BookOpenCheck}
            label="Active lessons"
            value={live.length}
            description="Lessons available in this curriculum"
            accent="border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400"
          />

          <SummaryCard
            icon={Layers3}
            label="Curriculum sections"
            value={initialSections.length}
            description="Organized sections in this course"
            accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
          />

          <SummaryCard
            icon={ListChecks}
            label="In trash"
            value={trashedLessons.length}
            description="Deleted lessons in this course"
            accent="border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Layers3 className="size-5" aria-hidden="true" />
              </div>

              <div>
                <h2 className="font-semibold tracking-tight text-foreground">
                  Curriculum builder
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage lessons, sections and their order.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-2 rounded-full bg-yellow-400" />
              Changes managed by the builder
            </span>
          </div>

          <div className="p-3 sm:p-5">
            <CurriculumBuilder
              key={key}
              course={{
                slug: selectedCourse.slug,
                title: selectedCourse.title,
              }}
              initialSections={initialSections}
              trash={trashedLessons}
              perms={permissionsFor(user.role)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Course picker when no course query parameter is present.
  const p = parseListParams(sp, {
    sorts: PICKER_SORTS,
  });

  const { items, nextCursor, total } = await courseAdminRepository.list({
    status: p.status,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
  });

  const { after, keyword, ...linkParams } = p;
  const searching = Boolean(keyword);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-400/10 px-3 py-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            <BookOpen className="size-3.5" aria-hidden="true" />
            Learning management
          </span>

          <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Curriculum studio
          </span>
        </div>

        <AdminPageHeader
          title="Lessons"
          description="Choose a course to create, organize and reorder its learning curriculum."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          icon={BookOpen}
          label="Matching courses"
          value={typeof total === "number" ? total : "–"}
          description={
            searching
              ? "Courses matching your search"
              : "Courses matching the current filters"
          }
          accent="border-yellow-500/20 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400"
        />

        <SummaryCard
          icon={Layers3}
          label="Courses on this page"
          value={items.length}
          description="Courses in the current result set"
          accent="border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />

        <SummaryCard
          icon={ListChecks}
          label="Curriculum management"
          value="Ready"
          description="Select a course to open its builder"
          accent="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/15 text-yellow-700 dark:text-yellow-300">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-semibold tracking-tight text-foreground">
                Choose a course
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open a course to manage its lessons and sections.
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-purple-500" />
            {typeof total === "number" ? total : items.length} results
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <DataTableToolbar
            searchPlaceholder="Search courses..."
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
        </div>

        {!items.length ? (
          <div className="border-t border-border p-5 sm:p-8">
            <EmptyState
              title="No courses match"
              description="Try adjusting your search or status filter. You can create a course first, then return here to add its lessons."
            />
          </div>
        ) : (
          <>
            <div className="border-t border-border">
              <div className="overflow-x-auto">
                <Table className="min-w-[680px]">
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead scope="col" className="h-12 pl-5">
                        Course
                      </TableHead>

                      <TableHead scope="col" className="h-12">
                        Status
                      </TableHead>

                      <TableHead scope="col" className="h-12 text-right">
                        Lessons
                      </TableHead>

                      <TableHead scope="col" className="h-12 pr-5 text-right">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((course) => (
                      <TableRow
                        key={course.id}
                        className="group transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="py-4 pl-5">
                          <CourseIdentity course={course} />
                        </TableCell>

                        <TableCell className="py-4">
                          <StatusBadge status={course.status} />
                        </TableCell>

                        <TableCell className="py-4 text-right">
                          <span className="inline-flex min-w-10 items-center justify-center rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-sm font-semibold tabular-nums text-foreground">
                            {course.lessonsCount ?? 0}
                          </span>
                        </TableCell>

                        <TableCell className="py-4 pr-5 text-right">
                          <Link
                            href={`/admin/lessons?course=${course.slug}`}
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className:
                                "gap-2 whitespace-nowrap transition-all hover:border-purple-500/40 hover:bg-purple-500/5 hover:text-purple-600 dark:hover:text-purple-400",
                            })}
                          >
                            Manage lessons
                            <ArrowRight
                              className="size-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                            <span className="sr-only"> for {course.title}</span>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-muted-foreground">
                Select a course to open its curriculum workspace.
              </p>

              <p className="text-xs font-medium text-muted-foreground">
                Lesson counts reflect the course data provided by the
                repository.
              </p>
            </div>
          </>
        )}
      </div>

      <CursorPagination
        basePath="/admin/lessons"
        params={linkParams}
        after={after}
        nextCursor={nextCursor}
      />
    </div>
  );
}
