// app/admin/blog/[slug]/page.jsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostRecordActions } from "@/components/admin/blog/PostRecordActions";
import { ArticleBody } from "@/components/shared/ArticleBody";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { requirePermission } from "@/lib/auth/authorize";
import {
  can,
  PERMISSIONS as P,
  permissionsFor,
} from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { blogAdminRepository } from "@/repositories/admin/blogAdminRepository";
import { blogGuard } from "@/lib/admin/guards";
import { formatDateTime, readingMinutes } from "@/lib/utils/format";

export const metadata = { title: "Post" };

export default async function AdminPostPage({ params }) {
  const user = await requirePermission(P.BLOG_READ);
  const parsed = adminSlug.safeParse((await params).slug);
  if (!parsed.success) notFound();
  const b = await blogAdminRepository.findBySlug(parsed.data);
  if (!b) notFound();
  const blocker = ["draft", "pending", "scheduled"].includes(b.status)
    ? await blogGuard("publish", b)
    : null;

  return (
    <>
      <AdminPageHeader
        title={b.title}
        description={b.excerpt}
        actions={
          <>
            <StatusBadge status={b.status} />
            {b.featured && (
              <Badge className="bg-highlight text-highlight-foreground">
                Featured
              </Badge>
            )}
            {b.status === "published" && (
              <Link
                href={`/blog/${b.slug}`}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                View on site
              </Link>
            )}
            {can(user.role, P.BLOG_UPDATE) && b.status !== "deleted" && (
              <Link
                href={`/admin/blog/${b.slug}/edit`}
                className={buttonVariants({ size: "sm" })}
              >
                Edit
              </Link>
            )}
            <PostRecordActions record={b} perms={permissionsFor(user.role)} />
          </>
        }
      />
      {blocker && (
        <Alert className="mb-6">
          <AlertTitle>Not ready to publish</AlertTitle>
          <AlertDescription>{blocker}</AlertDescription>
        </Alert>
      )}
      {b.status === "scheduled" && (
        <Alert className="mb-6">
          <AlertTitle>Scheduled</AlertTitle>
          <AlertDescription>
            Goes live {formatDateTime(b.scheduledFor)}. If it&apos;s incomplete
            by then, it returns to draft instead.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-6">
          <ArticleBody text={b.content} />
        </Card>
        <aside className="space-y-6">
          {b.coverImage && (
            <Card className="gap-0 overflow-hidden py-0">
              <div className="relative aspect-video">
                <Image
                  src={b.coverImage}
                  alt=""
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
            </Card>
          )}
          <Card className="gap-2 p-5 text-sm">
            <p>
              <span className="text-muted-foreground">Topic:</span> {b.category}
            </p>
            <p>
              <span className="text-muted-foreground">Author:</span>{" "}
              {b.authorName}
            </p>
            <p>
              <span className="text-muted-foreground">Reading time:</span>{" "}
              {readingMinutes(b.content)} min
            </p>
            {b.tags?.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 pt-1">
                {b.tags.map((t) => (
                  <li key={t}>
                    <Badge variant="outline">#{t}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="gap-2 p-5">
            <h2 className="text-base">Search preview</h2>
            <p className="text-primary">{b.seoTitle || b.title}</p>
            <p className="font-mono text-xs text-muted-foreground">
              /blog/{b.slug}
            </p>
            <p className="text-sm text-muted-foreground">
              {b.seoDescription || b.excerpt}
            </p>
          </Card>
          <Card className="gap-1.5 p-5 text-xs text-muted-foreground">
            <p>Created {formatDateTime(b.createdAt)}</p>
            <p>Updated {formatDateTime(b.updatedAt)}</p>
            {b.publishedAt && <p>Published {formatDateTime(b.publishedAt)}</p>}
            {b.archivedAt && <p>Archived {formatDateTime(b.archivedAt)}</p>}
            {b.deletedAt && <p>Deleted {formatDateTime(b.deletedAt)}</p>}
          </Card>
        </aside>
      </div>
    </>
  );
}
