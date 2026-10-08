// app/admin/coupons/create/page.jsx
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CouponForm } from "@/components/admin/coupons/CouponForm";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";
export const metadata = { title: "New coupon" };
export default async function CreateCouponPage() {
  await requirePermission(P.COUPONS_CREATE);
  const [courses, categories] = await Promise.all([courseAdminRepository.list({ status: "published", limit: 100, sort: "name-asc" }), categoryAdminRepository.options()]);
  return (<><AdminPageHeader title="New coupon" description="Saved as a draft. Publish it to make it usable." /><CouponForm courses={courses.items} categories={categories} /></>);
}


