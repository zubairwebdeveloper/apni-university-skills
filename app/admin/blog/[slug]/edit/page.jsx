// app/admin/blog/[slug]/edit/page.jsx
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { blogAdminRepository } from "@/repositories/admin/blogAdminRepository";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }) {
  await requirePermission(P.BLOG_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await blogAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted") redirect(`/admin/blog/${record.slug}`);
  return (
    <>
      <AdminPageHeader
        title={`Edit ${record.title}`}
        actions={<StatusBadge status={record.status} />}
      />
      <BlogForm key={record.updatedAt} record={record} />
    </>
  );
}
