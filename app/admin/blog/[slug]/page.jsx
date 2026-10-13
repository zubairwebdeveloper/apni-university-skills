// app/admin/blog/[slug]/page.jsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Clock, Tag, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostRecordActions } from "@/components/admin/blog/PostRecordActions";
import { ArticleBody } from "@/components/shared/ArticleBody";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyTextButton } from "@/components/shared/CopyTextButton";
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

  const history = [
    { label: "Created", at: b.createdAt },
    { label: "Updated", at: b.updatedAt },
    b.publishedAt && { label: "Published", at: b.publishedAt },
    b.archivedAt && { label: "Archived", at: b.archivedAt },
    b.deletedAt && { label: "Deleted", at: b.deletedAt },
  ].filter(Boolean);

  return (
    <div className="ea-stagger">
      <style>{`
        @keyframes ea-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: no-preference) {
          .ea-stagger > * { animation: ea-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both; }
          .ea-stagger > *:nth-child(1) { animation-delay: 0ms; }
          .ea-stagger > *:nth-child(2) { animation-delay: 60ms; }
          .ea-stagger > *:nth-child(3) { animation-delay: 120ms; }
          .ea-stagger > *:nth-child(4) { animation-delay: 180ms; }
        }
      `}</style>

      <AdminPageHeader
        title={b.title}
        description={b.excerpt}
        back={{ href: "/admin/blog", label: "Posts" }}
        actions={
          <>
            <StatusBadge status={b.status} />
            {b.featured && (
              <Badge className="bg-highlight text-highlight-foreground">
                Featured
              </Badge>
            )}
            {b.status === "published" && (
              <>
                <Link
                  href={`/blog/${b.slug}`}
                  target="_blank"
                  rel="noopener"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View on site
                </Link>
                <CopyTextButton
                  text={`/blog/${b.slug}`}
                  prefixOrigin
                  label="Copy link"
                />
              </>
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
        <Alert className="mb-6 border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-200">
            Not ready to publish
          </AlertTitle>
          <AlertDescription className="text-amber-800/90 dark:text-amber-200/80">
            {blocker}
          </AlertDescription>
        </Alert>
      )}

      {b.status === "scheduled" && (
        <Alert className="mb-6 border-sky-500/30 bg-sky-500/10">
          <Clock className="size-4 text-sky-600 dark:text-sky-400" />
          <AlertTitle className="text-sky-900 dark:text-sky-200">
            Scheduled
          </AlertTitle>
          <AlertDescription className="text-sky-800/90 dark:text-sky-200/80">
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
                  alt={b.title}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
            </Card>
          )}

          <Card className="gap-2 p-5 text-sm">
            <p className="flex items-center gap-2">
              <Tag
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <span className="text-muted-foreground">Topic:</span> {b.category}
            </p>
            <p className="flex items-center gap-2">
              <User
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <span className="text-muted-foreground">Author:</span>{" "}
              {b.authorName}
            </p>
            <p className="flex items-center gap-2">
              <Clock
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground"
              />
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
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base">Search preview</h2>
              <CopyTextButton
                text={`/blog/${b.slug}`}
                prefixOrigin
                label="Copy URL"
              />
            </div>
            <div className="space-y-1 rounded-lg border bg-muted/30 p-3">
              <p className="truncate font-mono text-xs text-emerald-700 dark:text-emerald-400">
                /blog/{b.slug}
              </p>
              <p className="truncate text-base text-primary">
                {b.seoTitle || b.title}
              </p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {b.seoDescription || b.excerpt}
              </p>
            </div>
          </Card>

          <Card className="gap-3 p-5">
            <h2 className="text-base">History</h2>
            <ol className="relative space-y-4 border-l border-border pl-4">
              {history.map((h) => (
                <li key={h.label} className="relative">
                  <span className="absolute -left-[1.1rem] top-1 size-2 rounded-full border-2 border-background bg-primary" />
                  <p className="text-xs font-medium">{h.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(h.at)}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>
    </div>
  );
}
