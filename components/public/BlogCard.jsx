// components/public/BlogCard.jsx
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";

export function BlogCard({ post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-lg">
        <div className="relative aspect-[16/9] bg-muted">
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt=""
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {post.category && (
              <Badge variant="secondary">{post.category}</Badge>
            )}
            <time
              dateTime={
                post.publishedAt
                  ? new Date(post.publishedAt).toISOString()
                  : undefined
              }
            >
              {formatDate(post.publishedAt)}
            </time>
          </div>
          <h3 className="line-clamp-2 font-serif text-lg font-semibold leading-snug">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
          <p className="mt-auto pt-2 text-xs text-muted-foreground">
            By {post.authorName}
          </p>
        </div>
      </Card>
    </Link>
  );
}

