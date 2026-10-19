// app/(public)/blog/[slug]/page.jsx

import { cache } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiCalendar, FiClock, FiRefreshCw } from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/Container";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { ArticleBody } from "@/components/shared/ArticleBody";
import { JsonLd } from "@/components/shared/JsonLd";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ShareButton } from "@/components/public/courses/ShareButton";
import { BlogCard } from "@/components/public/BlogCard";
import {
  BackToTop,
  ReadingProgress,
  TableOfContents,
} from "@/components/public/blog/ArticleTools";

import { blogService } from "@/services/blogService";

import { safe } from "@/lib/utils/safe";
import { formatDate, readingMinutes } from "@/lib/utils/format";

export const revalidate = 300;

const BODY_ID = "article-body";
const DAY = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
// `apni-landing` activates the shared colour tokens (#111318 surface, #FACC15
// primary, violet accent). HeroSection and TechStrip already emit that CSS.
// If this page is ever rendered without them, move THEME_CSS (see
// HeroSection.jsx) into globals.css.
const SCOPE = "apni-landing bg-background text-foreground";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const VIOLET = "text-[color:var(--violet)]";
const PANEL = "rounded-2xl border border-border bg-card p-5";

const getPost = cache((slug) => blogService.getPostBySlug(slug));

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const iso = (ms) => (ms ? new Date(ms).toISOString() : undefined);

// Initials for the author avatar, derived only from the authorName the post carries.
function initialsFrom(name) {
  if (!name) return "A";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Avatar({ name, size = "md" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-[color:var(--violet)]/10 font-semibold ${VIOLET} ${
        size === "lg" ? "size-12 text-base" : "size-10 text-sm"
      }`}
    >
      {initialsFrom(name)}
    </span>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const post = await safe(getPost(slug), null);

  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false },
    };
  }

  const url = `/blog/${post.slug}`;
  const images = post.coverImage ? [{ url: post.coverImage }] : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.length ? post.tags : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: iso(post.publishedAt),
      modifiedTime: iso(post.updatedAt),
      authors: post.authorName ? [post.authorName] : undefined,
      tags: post.tags,
      images,
    },
    twitter: {
      // Without a cover image a large-image card would render empty.
      card: images ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  const post = await getPost(slug);
  if (!post) notFound();

  const related = await safe(blogService.getRelatedPosts(post, 3), []);

  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const minutes = readingMinutes(post.content);
  const wasUpdated =
    post.updatedAt &&
    post.publishedAt &&
    post.updatedAt - post.publishedAt > DAY;

  return (
    <div className={SCOPE}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage ? [post.coverImage] : undefined,
          datePublished: iso(post.publishedAt),
          dateModified: iso(post.updatedAt),
          timeRequired: `PT${minutes}M`,
          keywords: post.tags?.length ? post.tags.join(", ") : undefined,
          author: post.authorName
            ? { "@type": "Person", name: post.authorName }
            : undefined,
          publisher: { "@type": "Organization", name: "Apni University" },
          mainEntityOfPage: pageUrl,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${siteUrl}/blog`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: pageUrl,
            },
          ],
        }}
      />

      <ReadingProgress targetId={BODY_ID} />
      <BackToTop />

      <article>
        <Container className="max-w-5xl py-8 sm:py-12">
          <div className="flex items-center justify-between gap-4">
            <PageBreadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
            <Link
              href="/blog"
              className={`group hidden min-h-10 shrink-0 items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:inline-flex ${FOCUS}`}
            >
              <FiArrowLeft
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
              />
              All articles
            </Link>
          </div>

          {/* Header: kept to a readable width even though the page is wider */}
          <header className="mt-8 max-w-3xl">
            {post.category && (
              <Badge
                variant="secondary"
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80"
              >
                {post.category}
              </Badge>
            )}

            <h1 className="mt-4 text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {post.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-4">
              {post.authorName && (
                <div className="flex items-center gap-3">
                  <Avatar name={post.authorName} />
                  <span className="text-sm font-medium text-foreground">
                    {post.authorName}
                  </span>
                </div>
              )}
              <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FiCalendar aria-hidden="true" className="size-4" />
                  <time dateTime={iso(post.publishedAt)}>
                    {formatDate(post.publishedAt)}
                  </time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiClock aria-hidden="true" className="size-4" />
                  {minutes} min read
                </span>
                {wasUpdated && (
                  <span className="inline-flex items-center gap-1.5">
                    <FiRefreshCw aria-hidden="true" className="size-4" />
                    Updated {formatDate(post.updatedAt)}
                  </span>
                )}
              </p>
            </div>
          </header>

          {post.coverImage && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority
                sizes="(min-width:1024px) 1024px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Contents list for small screens */}
          <TableOfContents targetId={BODY_ID} variant="mobile" />

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="min-w-0 max-w-3xl">
              <div id={BODY_ID}>
                <ArticleBody text={post.content} />
              </div>

              {post.tags?.length > 0 && (
                <ul
                  className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6"
                  aria-label="Tags"
                >
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className={`inline-flex min-h-9 items-center rounded-full ${FOCUS}`}
                      >
                        <Badge
                          variant="outline"
                          className="h-full rounded-full border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/60 hover:text-primary motion-reduce:transition-none"
                        >
                          #{tag}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {post.authorName && (
                <div className={`mt-8 flex items-center gap-4 ${PANEL}`}>
                  <Avatar name={post.authorName} size="lg" />
                  <div>
                    <p className="text-sm text-muted-foreground">Written by</p>
                    <p className="font-semibold text-foreground">
                      {post.authorName}
                    </p>
                  </div>
                </div>
              )}

              <div
                className={`mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${PANEL}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Found this useful?
                  </p>
                  <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                    Share it with someone who&apos;s learning this too.
                  </p>
                </div>

                <div className="sm:shrink-0">
                  <ShareButton
                    url={pageUrl}
                    title={post.title}
                    label="Share this article"
                  />
                </div>
              </div>
            </div>

            {/* Sticky side column: contents + quick share (large screens) */}
            <TableOfContents targetId={BODY_ID} variant="desktop">
              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Share
                </p>
                <ShareButton url={pageUrl} title={post.title} label="Share" />
              </div>
            </TableOfContents>
          </div>
        </Container>
      </article>

      {/* Keep learning: only routes already used elsewhere on the site */}
      <section
        aria-labelledby="keep-learning"
        className="border-t border-border py-10 sm:py-12"
      >
        <Container className="max-w-5xl">
          <div className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1.5 bg-primary"
            />
            <div className="max-w-xl">
              <h2
                id="keep-learning"
                className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                Turn what you just read into a skill
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Articles explain the idea. Courses help you actually build with
                it.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
              <Link href="/courses" className={buttonVariants({ size: "lg" })}>
                Browse courses
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Create free account
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <Section
          labelledBy="related-posts"
          className="border-y border-border bg-muted/40"
        >
          <SectionHeader
            id="related-posts"
            title="Keep reading"
            href="/blog"
            hrefLabel="All articles"
          />

          <div className="grid gap-5 md:grid-cols-3">
            {related.map((relatedPost) => (
              <BlogCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
