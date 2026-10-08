// app/admin/categories/[slug]/edit/page.jsx
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { categoryAdminRepository } from "@/repositories/admin/categoryAdminRepository";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }) {
  await requirePermission(P.CATEGORIES_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await categoryAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted") redirect("/admin/categories?status=deleted");
  return (
    <>
      <AdminPageHeader
        title={`Edit ${record.name}`}
        actions={<StatusBadge status={record.status} />}
      />
      <CategoryForm key={record.updatedAt} record={record} />
    </>
  );
}
