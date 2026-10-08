// app/admin/reviews/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReviewRecordActions } from "@/components/admin/reviews/ReviewRecordActions";
import { Rating } from "@/components/shared/Rating";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { reviewAdminRepository } from "@/repositories/admin/reviewAdminRepository";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Review" };

export default async function AdminReviewPage({ params }) {
  const user = await requirePermission(P.REVIEWS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const r = await reviewAdminRepository.findBySlug(parsed.data);
  if (!r) notFound();
  const student =
    can(user.role, P.STUDENTS_READ) && r.studentId
      ? await userAdminRepository.findById(r.studentId).catch(() => null)
      : null;

  return (
    <>
      <AdminPageHeader
        title={r.title || "Untitled review"}
        description={`Review of ${r.courseTitle}`}
        actions={
          <>
            <StatusBadge status={r.status} />
            <ReviewRecordActions record={r} perms={permissionsFor(user.role)} />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="gap-4 p-6">
          <Rating value={r.rating} count={1} showCount={false} />
          <blockquote className="whitespace-pre-line text-sm leading-relaxed">
            {r.comment}
          </blockquote>
          <p className="text-xs text-muted-foreground">
            Review text is the student&apos;s own wording and can&apos;t be edited here.
            Reject, archive or delete it instead.
          </p>
        </Card>
        <aside className="space-y-6">
          <Card className="gap-2 p-5 text-sm">
            <p>
              <span className="text-muted-foreground">Student:</span>{" "}
              {student?.slug ? (
                <Link
                  href={`/admin/students/${student.slug}`}
                  className="hover:underline"
                >
                  {r.studentName}
                </Link>
              ) : (
                r.studentName
              )}
            </p>
            <p>
              <span className="text-muted-foreground">Course:</span>{" "}
              {can(user.role, P.COURSES_READ) ? (
                <Link
                  href={`/admin/courses/${r.courseSlug}`}
                  className="hover:underline"
                >
                  {r.courseTitle}
                </Link>
              ) : (
                r.courseTitle
              )}
            </p>
          </Card>
          <Card className="gap-1.5 p-5 text-xs text-muted-foreground">
            <p>
              Reference:{" "}
              <span className="font-mono text-foreground">{r.slug}</span>
            </p>
            <p>Submitted {formatDateTime(r.createdAt)}</p>
            <p>Last edited {formatDateTime(r.updatedAt)}</p>
            {r.moderatedAt && <p>Moderated {formatDateTime(r.moderatedAt)}</p>}
            {r.archivedAt && <p>Archived {formatDateTime(r.archivedAt)}</p>}
            {r.deletedAt && <p>Deleted {formatDateTime(r.deletedAt)}</p>}
          </Card>
        </aside>
      </div>
    </>
  );
}
