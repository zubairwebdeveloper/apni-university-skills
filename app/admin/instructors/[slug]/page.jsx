// app/admin/instructors/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InstructorRecordActions } from "@/components/admin/instructors/InstructorRecordActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { instructorAdminRepository } from "@/repositories/admin/instructorAdminRepository";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { formatCompact, formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Instructor" };

const COURSE_LIMIT = 10;

export default async function AdminInstructorPage({ params }) {
  const user = await requirePermission(P.INSTRUCTORS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const i = await instructorAdminRepository.findBySlug(parsed.data);
  if (!i) notFound();
  const courses = can(user.role, P.COURSES_READ)
    ? await courseAdminRepository
        .list({
          filters: [["instructorSlug", "==", i.slug]],
          limit: COURSE_LIMIT,
        })
        .catch(() => null)
    : undefined;
  const skills = [...(i.expertise ?? []), ...(i.skills ?? [])];
  const stats = [
    ["Courses", i.coursesCount ?? 0],
    ["Students", formatCompact(i.studentsCount ?? 0)],
    [
      "Rating",
      // Guarded: a missing rating with a review count used to throw here
      i.reviewCount
        ? `${Number(i.rating ?? 0).toFixed(1)} (${i.reviewCount})`
        : "—",
    ],
  ];

  return (
    <>
      <Link
        href="/admin/instructors"
        className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <FiArrowLeft aria-hidden="true" className="size-4" />
        Back to instructors
      </Link>
      <AdminPageHeader
        title={i.name}
        description={i.designation}
        actions={
          <>
            <StatusBadge status={i.status} />
            {i.status === "published" && (
              <Link
                href={`/instructors/${i.slug}`}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View on site
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            )}
            {can(user.role, P.INSTRUCTORS_UPDATE) && i.status !== "deleted" && (
              <Link
                href={`/admin/instructors/${i.slug}/edit`}
                className={buttonVariants({ size: "sm" })}
              >
                Edit
              </Link>
            )}
            <InstructorRecordActions
              record={i}
              perms={permissionsFor(user.role)}
            />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card className="flex-row items-start gap-4 p-5 sm:gap-5 sm:p-6">
            <Avatar className="size-16 sm:size-20">
              <AvatarImage src={i.avatar || undefined} alt="" />
              <AvatarFallback className="font-serif text-xl">
                {i.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-2 text-sm">
              {i.shortBio && <p>{i.shortBio}</p>}
              {i.email && (
                <p>
                  <a
                    href={`mailto:${i.email}`}
                    className="break-all text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {i.email}
                  </a>
                </p>
              )}
              {skills.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <li key={s}>
                      <Badge variant="secondary">{s}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
          {courses !== undefined && (
            <Card className="gap-3 p-5">
              <h2 className="text-lg">
                Courses
                {courses?.items?.length > 0 && (
                  <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
                    ({courses.items.length}
                    {courses.items.length >= COURSE_LIMIT ? "+" : ""})
                  </span>
                )}
              </h2>
              {courses === null ? (
                <p className="text-sm text-muted-foreground">
                  Couldn&apos;t load courses.
                </p>
              ) : !courses.items.length ? (
                <p className="text-sm text-muted-foreground">No courses yet.</p>
              ) : (
                <>
                  <ul className="divide-y">
                    {courses.items.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center justify-between gap-3 py-2.5 text-sm"
                      >
                        <Link
                          href={`/admin/courses/${c.slug}`}
                          className="min-w-0 truncate font-medium hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {c.title}
                        </Link>
                        <StatusBadge status={c.status} />
                      </li>
                    ))}
                  </ul>
                  {courses.items.length >= COURSE_LIMIT && (
                    <p className="text-xs text-muted-foreground">
                      Showing up to {COURSE_LIMIT} courses.{" "}
                      <Link
                        href="/admin/courses"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Open all courses
                      </Link>
                    </p>
                  )}
                </>
              )}
            </Card>
          )}
        </div>
        <aside className="space-y-6">
          <Card className="gap-3 p-5">
            <dl className="grid grid-cols-3 gap-2 text-center">
              {stats.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-serif text-xl font-semibold tabular-nums">
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="gap-1.5 p-5 text-xs text-muted-foreground">
            <p>
              Slug: <span className="font-mono text-foreground">{i.slug}</span>
            </p>
            <p>Created {formatDateTime(i.createdAt)}</p>
            <p>Updated {formatDateTime(i.updatedAt)}</p>
            {i.archivedAt && <p>Archived {formatDateTime(i.archivedAt)}</p>}
            {i.deletedAt && <p>Deleted {formatDateTime(i.deletedAt)}</p>}
          </Card>
        </aside>
      </div>
    </>
  );
}
