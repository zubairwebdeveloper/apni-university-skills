// app/admin/blog/[slug]/edit/page.jsx
import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogForm } from "@/components/admin/blog/BlogForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { blogAdminRepository } from "@/repositories/admin/blogAdminRepository";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }) {
  await requirePermission(P.BLOG_UPDATE);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const record = await blogAdminRepository.findBySlug(parsed.data);
  if (!record) notFound();
  if (record.status === "deleted") redirect(`/admin/blog/${record.slug}`);

  return (
    <div className="ea-stagger space-y-4">
      <style>{`
        @keyframes ea-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: no-preference) {
          .ea-stagger > * { animation: ea-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
          .ea-stagger > *:nth-child(1) { animation-delay: 0ms; }
          .ea-stagger > *:nth-child(2) { animation-delay: 60ms; }
        }
      `}</style>

      <AdminPageHeader
        title={`Edit ${record.title}`}
        back={{ href: "/admin/blog", label: "Posts" }}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={record.status} />
            <p className="text-xs text-muted-foreground">
              {record.createdAt && (
                <>Created {formatDateTime(record.createdAt)} · </>
              )}
              Updated {formatDateTime(record.updatedAt)}
            </p>
          </div>
        }
      />

      <BlogForm key={record.updatedAt} record={record} />
    </div>
  );
}
