// app/admin/enrollments/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";
import { isNavReady } from "@/config/adminNav";
import { adminSlug } from "@/lib/validations/common";
import { db } from "@/lib/firebase/admin/firestore";
import { enrollmentAdminRepository } from "@/repositories/admin/enrollmentAdminRepository";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { paymentRepository } from "@/repositories/paymentRepository";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export const metadata = { title: "Enrollment" };

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

export default async function AdminEnrollmentPage({ params }) {
  const user = await requirePermission(P.ENROLLMENTS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const e = await enrollmentAdminRepository.findBySlug(parsed.data);
  if (!e) notFound();

  const [student, payment, progress, cert] = await Promise.all([
    can(user.role, P.STUDENTS_READ)
      ? userAdminRepository.findById(e.studentId)
      : null,
    e.paymentId && can(user.role, P.PAYMENTS_READ)
      ? paymentRepository.getBySessionId(e.paymentId).catch(() => null)
      : null,
    db.collection("progress").doc(`${e.studentId}_${e.courseId}`).get(),
    can(user.role, P.CERTIFICATES_READ)
      ? db.collection("certificates").doc(`${e.studentId}_${e.courseId}`).get()
      : null,
  ]);
  const done = progress.exists
    ? (progress.get("completedLessonIds") ?? []).length
    : 0;

  return (
    <>
      <AdminPageHeader
        title={e.courseTitle}
        description={`Enrollment ${e.slug}`}
        actions={<StatusBadge status={e.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="gap-4 p-5">
          <h2 className="text-lg">Student</h2>
          {student ? (
            <Facts
              items={[
                [
                  "Name",
                  student.slug ? (
                    <Link
                      key="n"
                      href={`/admin/students/${student.slug}`}
                      className="hover:underline"
                    >
                      {student.displayName}
                    </Link>
                  ) : (
                    student.displayName
                  ),
                ],
                ["Email", student.email],
              ]}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              {can(user.role, P.STUDENTS_READ)
                ? "This account no longer exists."
                : "You don't have access to student details."}
            </p>
          )}
        </Card>
        <Card className="gap-4 p-5">
          <h2 className="text-lg">Course</h2>
          <Facts
            items={[
              [
                "Title",
                can(user.role, P.COURSES_READ) ? (
                  <Link
                    key="c"
                    href={`/admin/courses/${e.courseSlug}`}
                    className="hover:underline"
                  >
                    {e.courseTitle}
                  </Link>
                ) : (
                  e.courseTitle
                ),
              ],
              ["Slug", e.courseSlug],
            ]}
          />
        </Card>
        <Card className="gap-4 p-5">
          <h2 className="text-lg">Progress</h2>
          <div className="flex items-center gap-3">
            <Progress
              value={e.progress ?? 0}
              aria-label={`Progress ${e.progress ?? 0}%`}
            />
            <span className="text-sm tabular-nums">{e.progress ?? 0}%</span>
          </div>
          <Facts
            items={[
              ["Lessons completed", progress.exists ? done : "—"],
              ["Last activity", formatDateTime(e.lastActivityAt)],
              [
                "Completed",
                e.completedAt ? formatDateTime(e.completedAt) : null,
              ],
              [
                "Certificate",
                cert
                  ? cert.exists
                    ? cert.get("certificateNumber")
                    : "Not issued"
                  : null,
              ],
            ]}
          />
        </Card>
        <Card className="gap-4 p-5">
          <h2 className="text-lg">Payment</h2>
          {e.price > 0 ? (
            <Facts
              items={[
                ["Amount", formatPrice(e.price, e.currency)],
                [
                  "Payment",
                  payment ? (
                    payment.slug && isNavReady("/admin/payments") ? (
                      <Link
                        key="p"
                        href={`/admin/payments/${payment.slug}`}
                        className="hover:underline"
                      >
                        {payment.slug}
                      </Link>
                    ) : (
                      payment.slug
                    )
                  ) : null,
                ],
                [
                  "Payment status",
                  payment ? (
                    <StatusBadge key="s" status={payment.status} />
                  ) : null,
                ],
              ]}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Free enrollment. No payment.
            </p>
          )}
        </Card>
        <Card className="gap-1.5 p-5 text-xs text-muted-foreground lg:col-span-2">
          <p>Enrolled {formatDateTime(e.enrolledAt)}</p>
          {e.cancelledAt && <p>Cancelled {formatDateTime(e.cancelledAt)}</p>}
        </Card>
      </div>
    </>
  );
}
