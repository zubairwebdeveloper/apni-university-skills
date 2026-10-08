// app/admin/payments/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefundCard } from "@/components/admin/payments/RefundCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { paymentAdminRepository } from "@/repositories/admin/paymentAdminRepository";
import { userAdminRepository } from "@/repositories/admin/userAdminRepository";
import { formatDateTime, formatPrice } from "@/lib/utils/format";

export const metadata = { title: "Payment" };
const Facts = ({ items }) => (
  <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
    {items.map(([k, v]) => (
      <div key={k} className="min-w-0">
        <dt className="text-xs text-muted-foreground">{k}</dt>
        <dd className="break-all font-medium">{v || "—"}</dd>
      </div>
    ))}
  </dl>
);

export default async function AdminPaymentPage({ params }) {
  const user = await requirePermission(P.PAYMENTS_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const p = await paymentAdminRepository.findBySlug(parsed.data);
  if (!p) notFound();
  const student = can(user.role, P.STUDENTS_READ)
    ? await userAdminRepository.findById(p.studentId).catch(() => null)
    : null;

  return (
    <>
      <AdminPageHeader
        title={`Payment ${p.slug}`}
        description={p.courseTitle}
        actions={<StatusBadge status={p.status} />}
      />
      <Alert className="mb-6">
        <AlertDescription>
          Payments can&apos;t be edited manually. Status, refunds and enrollment
          access follow what Stripe reports.
        </AlertDescription>
      </Alert>
      {p.flag === "amount_mismatch" && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Stripe reported a different amount than we recorded, so access was
            withheld. Check this payment in the Stripe dashboard.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card className="gap-4 p-5">
            <h2 className="text-lg">Amount</h2>
            <Facts
              items={[
                ["Charged", formatPrice(p.amount, p.currency)],
                ["Currency", p.currency],
                [
                  "List price",
                  p.originalAmount != null
                    ? formatPrice(p.originalAmount, p.currency)
                    : null,
                ],
                [
                  "Coupon",
                  p.couponCode
                    ? `${p.couponCode} (−${formatPrice(p.discountAmount ?? 0, p.currency)})`
                    : null,
                ],
                [
                  "Refunded",
                  p.refundedAmount
                    ? formatPrice(p.refundedAmount, p.currency)
                    : null,
                ],
                ["Method", p.paymentMethod],
              ]}
            />
          </Card>
          <Card className="gap-4 p-5">
            <h2 className="text-lg">Stripe</h2>
            <Facts
              items={[
                ["Checkout session", p.stripeSessionId],
                ["Payment intent", p.stripePaymentIntentId],
              ]}
            />
          </Card>
          <Card className="gap-4 p-5">
            <h2 className="text-lg">People</h2>
            <Facts
              items={[
                [
                  "Student",
                  student?.slug ? (
                    <Link
                      key="s"
                      href={`/admin/students/${student.slug}`}
                      className="hover:underline"
                    >
                      {student.displayName}
                    </Link>
                  ) : (
                    student?.displayName
                  ),
                ],
                ["Email", student?.email],
                [
                  "Course",
                  can(user.role, P.COURSES_READ) ? (
                    <Link
                      key="c"
                      href={`/admin/courses/${p.courseSlug}`}
                      className="hover:underline"
                    >
                      {p.courseTitle}
                    </Link>
                  ) : (
                    p.courseTitle
                  ),
                ],
              ]}
            />
          </Card>
        </div>
        <aside className="space-y-6">
          {p.status === "paid" && can(user.role, P.PAYMENTS_REFUND) && (
            <RefundCard slug={p.slug} amount={p.amount} currency={p.currency} />
          )}
          <Card className="gap-1.5 p-5 text-xs text-muted-foreground">
            <p>Created {formatDateTime(p.createdAt)}</p>
            <p>Updated {formatDateTime(p.updatedAt)}</p>
          </Card>
        </aside>
      </div>
    </>
  );
}
