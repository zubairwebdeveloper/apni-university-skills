// app/admin/categories/[slug]/edit/page.jsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
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
      <Link
        href="/admin/categories"
        className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <FiArrowLeft aria-hidden="true" className="size-4" />
        Back to categories
      </Link>
      <AdminPageHeader
        title={`Edit ${record.name}`}
        description={record.slug ? `Slug: ${record.slug}` : undefined}
        actions={<StatusBadge status={record.status} />}
      />
      <CategoryForm key={record.updatedAt} record={record} />
    </>
  );
}
