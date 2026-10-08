// app/(public)/blog/[slug]/page.jsx

import { cache } from "react";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
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

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: iso(post.publishedAt),
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

          <header className="mt-6">
            {post.category && (
              <Badge variant="secondary">{post.category}</Badge>
            )}

            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <p className="mt-5 text-sm text-muted-foreground">
              {post.authorName && <>By {post.authorName} · </>}
              <time dateTime={iso(post.publishedAt)}>
                {formatDate(post.publishedAt)}
              </time>
              {" · "}
              {readingMinutes(post.content)} min read
            </p>
          </header>

          {post.coverImage && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border bg-muted">
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
              className="mt-10 flex flex-wrap gap-2 border-t pt-6"
              aria-label="Tags"
            >
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="outline">#{tag}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 max-w-xs">
            <ShareButton
              url={pageUrl}
              title={post.title}
              label="Share this article"
            />
          </div>
        </Container>
      </article>

      {related.length > 0 && (
        <Section
          labelledBy="related-posts"
          className="border-t bg-secondary/40"
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
