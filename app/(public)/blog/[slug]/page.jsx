// app/(public)/blog/[slug]/page.jsx

import { cache } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/Container";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { ArticleBody } from "@/components/shared/ArticleBody";
import { JsonLd } from "@/components/shared/JsonLd";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ShareButton } from "@/components/public/courses/ShareButton";
import { BlogCard } from "@/components/public/BlogCard";

import { blogService } from "@/services/blogService";

import { safe } from "@/lib/utils/safe";
import { formatDate, readingMinutes } from "@/lib/utils/format";

export const revalidate = 300;

const getPost = cache((slug) => blogService.getPostBySlug(slug));

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const iso = (ms) => (ms ? new Date(ms).toISOString() : undefined);

// Derive initials from an author's name for the avatar badge, so nothing
// is invented beyond the authorName the post already carries.
function initialsFrom(name) {
  if (!name) return "A";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const post = await safe(getPost(slug), null);

  if (!post) {
    return {
      title: "Article not found",
      robots: {
        index: false,
      },
    };
  }

  const url = `/blog/${post.slug}`;

  const images = post.coverImage ? [{ url: post.coverImage }] : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags?.length ? post.tags : undefined,

    alternates: {
      canonical: url,
    },

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
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const related = await safe(blogService.getRelatedPosts(post, 3), []);

  const pageUrl = `${siteUrl}/blog/${post.slug}`;
  const minutes = readingMinutes(post.content);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage,
          datePublished: iso(post.publishedAt),
          dateModified: iso(post.updatedAt),

          author: post.authorName
            ? {
                "@type": "Person",
                name: post.authorName,
              }
            : undefined,

          publisher: {
            "@type": "Organization",
            name: "Apni University",
          },

          mainEntityOfPage: pageUrl,
        }}
      />

      <article>
        <Container className="max-w-3xl py-8 sm:py-12">
          <div className="flex items-center justify-between gap-4">
            <PageBreadcrumbs
              items={[
                {
                  label: "Home",
                  href: "/",
                },
                {
                  label: "Blog",
                  href: "/blog",
                },
                {
                  label: post.title,
                },
              ]}
            />
            <Link
              href="/blog"
              className="hidden shrink-0 text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:inline-flex"
            >
              ← All articles
            </Link>
          </div>

          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <Badge variant="secondary">{post.category}</Badge>
              )}
              <Badge variant="outline">{minutes} min read</Badge>
            </div>

            <h1 className="mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              {post.authorName && (
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-sans text-sm font-semibold text-primary"
                >
                  {initialsFrom(post.authorName)}
                </span>
              )}
              <p className="text-sm text-muted-foreground">
                {post.authorName && (
                  <span className="block font-medium text-foreground">
                    {post.authorName}
                  </span>
                )}
                <time dateTime={iso(post.publishedAt)}>
                  {formatDate(post.publishedAt)}
                </time>
                {post.updatedAt && post.updatedAt !== post.publishedAt && (
                  <> · Updated {formatDate(post.updatedAt)}</>
                )}
              </p>
            </div>
          </header>

          {post.coverImage && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority
                sizes="(min-width:768px) 768px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-8">
            <ArticleBody text={post.content} />
          </div>

          {post.tags?.length > 0 && (
            <ul
              className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6"
              aria-label="Tags"
            >
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge
                      variant="outline"
                      className="transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      #{tag}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Found this useful?
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Share it with someone who&apos;s learning this too.
              </p>
            </div>
            <ShareButton
              url={pageUrl}
              title={post.title}
              label="Share this article"
            />
          </div>
        </Container>
      </article>

      {/* Keep learning CTA, using only routes already used elsewhere on the site */}
      <section className="border-t border-border py-10 sm:py-12">
        <Container className="max-w-3xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-highlight/20 p-6 text-center dark:from-primary/15 dark:via-card dark:to-highlight/10 sm:p-8">
            <h2 className="text-xl text-foreground sm:text-2xl">
              Turn what you just read into a skill
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
              Articles explain the idea. Courses help you actually build with
              it.
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
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
          className="border-t border-border bg-secondary/40"
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
    </>
  );
}
