// app/admin/coupons/[slug]/edit/page.jsx
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { adminSlug } from "@/lib/validations/common";
import { couponAdminRepository } from "@/repositories/admin/couponAdminRepository";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CouponForm } from "@/components/admin/coupons/CouponForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
// ...same imports as create...
export const metadata = { title: "Edit coupon" };
export default async function EditCouponPage({ params }) {
  await requirePermission(P.COUPONS_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await couponAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted")
    return (
      <Alert variant="destructive">
        <AlertTitle>In trash</AlertTitle>
        <AlertDescription>
          Restore this coupon from the Coupons list (Trash filter) to edit it.
        </AlertDescription>
      </Alert>
    );
  const [courses, categories] = await Promise.all([
    courseAdminRepository.list({
      status: "published",
      limit: 100,
      sort: "name-asc",
    }),
    categoryAdminRepository.options(),
  ]);
  return (
    <>
      <AdminPageHeader
        title={`Edit ${record.code}`}
        actions={<StatusBadge status={record.status} />}
      />
      <CouponForm
        key={record.updatedAt}
        record={record}
        courses={courses.items}
        categories={categories}
      />
    </>
  );
}
