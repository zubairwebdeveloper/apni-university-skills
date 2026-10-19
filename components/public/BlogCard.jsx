// components/public/BlogCard.jsx
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiFileText } from "react-icons/fi";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";

// Returns an ISO string, or undefined for missing or invalid dates, so a bad
// value in the data can never throw during render.
function toISO(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function BlogCard({ post }) {
  const isoDate = toISO(post.publishedAt);
  const author = post.authorName?.trim();
  const initial = author ? author.charAt(0).toUpperCase() : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card
        className={cn(
          "h-full gap-0 overflow-hidden py-0 transition-[transform,box-shadow,border-color] duration-300",
          "group-hover:border-primary/40 group-hover:shadow-xl",
          "motion-safe:group-hover:-translate-y-0.5",
        )}
      >
        {/* Cover */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04]"
            />
          ) : (
            <div
              aria-hidden="true"
              className="grid h-full w-full place-items-center text-muted-foreground/50"
            >
              <FiFileText className="size-10" strokeWidth={1.25} />
            </div>
          )}
          {/* Soft bottom edge so the cover separates cleanly from the body */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-px bg-border"
          />
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground">
            {post.category && (
              <Badge variant="secondary">{post.category}</Badge>
            )}
            {post.category && isoDate && (
              <span
                aria-hidden="true"
                className="size-1 rounded-full bg-border"
              />
            )}
            {isoDate && (
              <time dateTime={isoDate} className="tabular-nums">
                {formatDate(post.publishedAt)}
              </time>
            )}
          </div>

          <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-xl">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {/* Footer: author and read affordance */}
          <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
            {author ? (
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary"
                >
                  {initial}
                </span>
                <p className="truncate text-xs text-muted-foreground">
                  By{" "}
                  <span className="font-medium text-foreground">{author}</span>
                </p>
              </div>
            ) : (
              <span />
            )}

            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
              Read article
              <FiArrowRight
                aria-hidden="true"
                className="size-3.5 transition-transform duration-300 motion-safe:group-hover:translate-x-1"
              />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
