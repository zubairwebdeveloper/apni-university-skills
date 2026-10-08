// app/admin/courses/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { FiBookOpen } from "react-icons/fi";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CourseRecordActions } from "@/components/admin/courses/CourseRecordActions";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import { isNavReady } from "@/config/adminNav";
import { levelLabel } from "@/config/courses";
import { adminSlug } from "@/lib/validations/common";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { courseGuard } from "@/lib/admin/guards";
import {
  formatCompact,
  formatDateTime,
  formatDuration,
  formatPrice,
} from "@/lib/utils/format";

export const metadata = { title: "Course" };

const Facts = ({ items }) => (
  <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
    {items.map(([k, v]) => (
      <div key={k}>
        <dt className="text-xs text-muted-foreground">{k}</dt>
        <dd className="font-medium">{v || "—"}</dd>
      </div>
    ))}
  </dl>
);

export default async function AdminCoursePage({ params }) {
  const user = await requirePermission(P.COURSES_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const c = await courseAdminRepository.findBySlug(parsed.data);
  if (!c) notFound();
  const blocker =
    c.status !== "published" && c.status !== "deleted"
      ? await courseGuard("publish", c).catch(() => null)
      : null;
  const perms = permissionsFor(user.role);

  return (
    <>
      <AdminPageHeader
        title={c.title}
        description={c.shortDescription}
        actions={
          <>
            <StatusBadge status={c.status} />
            {c.featured && (
              <Badge className="bg-highlight text-highlight-foreground">
                Featured
              </Badge>
            )}
            {c.status === "published" && (
              <Link
                href={`/courses/${c.slug}`}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View on site
              </Link>
            )}
            {isNavReady("/admin/lessons") && (
              <Link
                href={`/admin/lessons?course=${c.slug}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Lessons
              </Link>
            )}
            {can(user.role, P.COURSES_UPDATE) && c.status !== "deleted" && (
              <Link
                href={`/admin/courses/${c.slug}/edit`}
                className={buttonVariants({ size: "sm" })}
              >
                Edit
              </Link>
            )}
            <CourseRecordActions record={c} perms={perms} />
          </>
        }
      />

      {blocker && (
        <Alert className="mb-6">
          <AlertTitle>Not ready to publish</AlertTitle>
          <AlertDescription>{blocker}</AlertDescription>
        </Alert>
      )}
      {c.status === "deleted" && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>In trash</AlertTitle>
          <AlertDescription>
            This course is hidden everywhere. Use the actions menu to restore
            it.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card className="gap-4 p-5">
            <h2 className="text-lg">Overview</h2>
            <Facts
              items={[
                ["Category", c.category],
                ["Instructor", c.instructor],
                ["Level", levelLabel(c.level)],
                ["Language", c.language],
                ["Duration", formatDuration(c.duration)],
                ["Lessons", c.lessonsCount ?? 0],
              ]}
            />
          </Card>
          <Card className="gap-4 p-5">
            <h2 className="text-lg">Pricing</h2>
            <Facts
              items={[
                ["Type", c.isFree ? "Free" : "Paid"],
                ["Price", c.isFree ? "Free" : formatPrice(c.price, c.currency)],
                [
                  "Sale price",
                  c.salePrice != null
                    ? formatPrice(c.salePrice, c.currency)
                    : null,
                ],
                ["Currency", c.currency],
              ]}
            />
          </Card>
          <Card className="gap-3 p-5">
            <h2 className="text-lg">Search preview</h2>
            <p className="text-base text-primary">{c.seoTitle || c.title}</p>
            <p className="font-mono text-xs text-muted-foreground">
              /courses/{c.slug}
            </p>
            <p className="text-sm text-muted-foreground">
              {c.seoDescription || c.shortDescription}
            </p>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="gap-0 overflow-hidden py-0">
            <div className="relative aspect-video bg-muted">
              {c.thumbnail ? (
                <Image
                  src={c.thumbnail}
                  alt=""
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-muted-foreground">
                  <FiBookOpen className="size-7" aria-hidden="true" />
                  <span className="sr-only">No thumbnail</span>
                </div>
              )}
            </div>
          </Card>
          <Card className="p-5">
            <dl className="grid grid-cols-2 gap-4 text-center">
              {[
                ["Students", formatCompact(c.studentsCount ?? 0)],
                [
                  "Rating",
                  c.reviewCount
                    ? `${c.rating.toFixed(1)} (${c.reviewCount})`
                    : "—",
                ],
                [
                  "Revenue",
                  c.revenue ? formatPrice(c.revenue, c.currency) : "—",
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-serif text-xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="gap-1.5 p-5 text-xs text-muted-foreground">
            <p>Created {formatDateTime(c.createdAt)}</p>
            <p>Updated {formatDateTime(c.updatedAt)}</p>
            {c.publishedAt && <p>Published {formatDateTime(c.publishedAt)}</p>}
            {c.archivedAt && <p>Archived {formatDateTime(c.archivedAt)}</p>}
            {c.deletedAt && <p>Deleted {formatDateTime(c.deletedAt)}</p>}
          </Card>
        </aside>
      </div>
    </>
  );
}
