// app/(public)/blog/page.jsx

import Link from "next/link";
import {
  FiAward,
  FiBookOpen,
  FiChevronDown,
  FiCloud,
  FiCode,
  FiCompass,
  FiCpu,
  FiEdit3,
  FiFileText,
  FiHash,
  FiLock,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiX,
  FiZap,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { BlogCard } from "@/components/public/BlogCard";
import { CTASection } from "@/components/public/CTASection";
import { Reveal } from "@/components/public/PricingMotion";

import { blogService } from "@/services/blogService";

import { parseBlogFilters } from "@/lib/validations/listings";
import { BLOG_TOPICS, topicLabel } from "@/config/blog";
import { buildQuery } from "@/lib/utils/url";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Blog",
  description:
    "Practical articles on AI, web development, cloud, cybersecurity, and careers in technology.",
  alternates: {
    canonical: "/blog",
  },
};

const chips = [
  { icon: FiEdit3, text: "Plain-language explainers" },
  { icon: FiZap, text: "Practical guides" },
  { icon: FiTrendingUp, text: "Career focused" },
];

const benefits = [
  {
    icon: FiBookOpen,
    title: "Easy to understand",
    text: "Hard ideas explained step by step, without confusing jargon.",
  },
  {
    icon: FiCode,
    title: "Built on real practice",
    text: "Guides that show what to build, not only what to memorize.",
  },
  {
    icon: FiTarget,
    title: "Linked to careers",
    text: "Articles connect skills to real roles, so you know why they matter.",
  },
  {
    icon: FiAward,
    title: "Free to read",
    text: "No sign-up needed. Read, share and come back whenever you like.",
  },
];

const principles = [
  {
    title: "Start with the basics",
    text: "Every article assumes you are new to the topic and builds from there.",
  },
  {
    title: "Show, do not just tell",
    text: "Examples, small projects and checklists help you apply what you read.",
  },
  {
    title: "Keep it honest",
    text: "We say what a skill can and cannot do for your career, with no hype.",
  },
];

const faqs = [
  {
    q: "Who is this blog for?",
    a: "Students, beginners and career changers who want clear, practical help with technology topics and careers.",
  },
  {
    q: "How do I find articles on one topic?",
    a: "Use the topic buttons at the top of the list, or open Explore by topic below. Clicking a tag inside an article shows other articles with that tag.",
  },
  {
    q: "Are the articles free?",
    a: "Yes. You can read every article without an account or payment.",
  },
  {
    q: "I finished an article. What next?",
    a: "Try a related course to practice the skill, or open a career path to see how it fits into a role.",
  },
];

// Server-side only: icons are rendered here, never passed to a Client Component.
function topicIcon(slug = "") {
  const s = String(slug).toLowerCase();
  if (s.includes("ai") || s.includes("machine") || s.includes("data"))
    return FiCpu;
  if (s.includes("web") || s.includes("dev") || s.includes("program"))
    return FiCode;
  if (s.includes("cloud") || s.includes("devops")) return FiCloud;
  if (s.includes("secur") || s.includes("cyber")) return FiLock;
  if (s.includes("career") || s.includes("job")) return FiTrendingUp;
  return FiHash;
}

export default async function BlogPage({ searchParams }) {
  const { category, tag, after } = parseBlogFilters(await searchParams);

  const { items, nextCursor } = await blogService.getPostsPage({
    category: topicLabel(category),
    tag,
    after,
  });

  const linkParams = {
    category,
    tag,
  };

  const filtered = Boolean(category || tag);
  const activeTopic = BLOG_TOPICS.find((t) => t.slug === category);
  const showLatest = !filtered && !after && items.length > 1;

  return (
    <>
      <PageHeader
        title="The Apni University blog"
        description="Plain-language explainers and practical guides for people building careers in technology."
        breadcrumbs={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Blog",
          },
        ]}
      >
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-sm font-medium backdrop-blur"
            >
              <Icon aria-hidden="true" className="size-4 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className="relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <Container className="relative py-8 sm:py-10">
          {/* Topics */}
          <Reveal>
            <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Browse by topic
              </p>
              <nav aria-label="Blog topics">
                <ul className="flex gap-2 flex-wrap overflow-x-auto pb-1 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
                  <li className="shrink-0">
                    <Link
                      href="/blog"
                      aria-current={!category && !tag ? "page" : undefined}
                      className={buttonVariants({
                        size: "sm",
                        variant: !category && !tag ? "default" : "outline",
                        className: "rounded-full",
                      })}
                    >
                      All
                    </Link>
                  </li>

                  {BLOG_TOPICS.map((topic) => (
                    <li key={topic.slug} className="shrink-0">
                      <Link
                        href={buildQuery("/blog", {
                          category: topic.slug,
                        })}
                        aria-current={
                          category === topic.slug ? "page" : undefined
                        }
                        className={cn(
                          buttonVariants({
                            size: "sm",
                            variant:
                              category === topic.slug ? "default" : "outline",
                            className: "rounded-full",
                          }),
                        )}
                      >
                        {topic.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </Reveal>

          {/* Active filters */}
          {filtered && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {category && (
                <Link
                  href={buildQuery("/blog", { tag })}
                  aria-label={`Remove topic filter ${activeTopic?.label ?? category}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {activeTopic?.label ?? category}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              )}
              {tag && (
                <Link
                  href={buildQuery("/blog", { category })}
                  aria-label={`Remove tag filter ${tag}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Tag: {tag}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              )}
              <Link
                href="/blog"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Results */}
          <div className="mt-8">
            {items.length ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {items.length}
                  </span>{" "}
                  {items.length === 1 ? "article" : "articles"} on this page
                </p>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((post, i) => {
                    const isLatest = showLatest && i === 0;
                    return (
                      <Reveal
                        key={post.id}
                        delay={Math.min(i * 0.05, 0.3)}
                        className={cn(
                          "min-w-0",
                          isLatest && "sm:col-span-2 lg:col-span-2",
                        )}
                      >
                        <div className="relative h-full">
                          {isLatest && (
                            <Badge className="absolute left-3 top-3 z-10 shadow-md">
                              Latest
                            </Badge>
                          )}
                          <BlogCard post={post} />
                        </div>
                      </Reveal>
                    );
                  })}
                </div>

                <CursorPagination
                  basePath="/blog"
                  params={linkParams}
                  after={after}
                  nextCursor={nextCursor}
                />
              </>
            ) : (
              <EmptyState
                icon={FiFileText}
                title={
                  filtered
                    ? "No articles in this topic yet"
                    : "No articles published yet"
                }
                description="New articles are on the way."
                action={
                  filtered ? (
                    <Link
                      href="/blog"
                      className={buttonVariants({
                        variant: "outline",
                      })}
                    >
                      View all articles
                    </Link>
                  ) : null
                }
              />
            )}
          </div>
        </Container>

        {/* Explore by topic */}
        {BLOG_TOPICS.length > 0 && (
          <section
            aria-labelledby="topics-title"
            className="border-t bg-muted/20 py-12 sm:py-16"
          >
            <Container>
              <Reveal className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className="mb-3">
                  Explore by topic
                </Badge>
                <h2 id="topics-title" className="text-2xl sm:text-3xl">
                  Pick a subject and start reading
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Each topic collects the articles that help you learn it step
                  by step.
                </p>
              </Reveal>
              <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {BLOG_TOPICS.map((topic, i) => {
                  const Icon = topicIcon(topic.slug);
                  return (
                    <li key={topic.slug} className="min-w-0">
                      <Reveal
                        delay={Math.min(i * 0.06, 0.4)}
                        className="h-full"
                      >
                        <Link
                          href={buildQuery("/blog", { category: topic.slug })}
                          className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                        >
                          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                            <Icon aria-hidden="true" className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-sans text-base font-semibold">
                              {topic.label}
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              Read articles on {topic.label}
                            </span>
                          </span>
                        </Link>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </Container>
          </section>
        )}

        {/* Why read */}
        <section
          aria-labelledby="why-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Why read our blog
              </Badge>
              <h2 id="why-title" className="text-2xl sm:text-3xl">
                Learning that fits real life
              </h2>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* How we write */}
        <section
          aria-labelledby="write-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-4xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Our approach
              </Badge>
              <h2 id="write-title" className="text-2xl sm:text-3xl">
                How we write our articles
              </h2>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {principles.map(({ title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="h-full rounded-2xl border bg-card p-5 text-center">
                      <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                      <h3 className="mt-3 font-sans text-base font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Learn banner */}
        <section className="border-t py-12 sm:py-14">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border bg-card p-8 sm:p-10">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FiCompass aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl">
                        Ready to turn reading into skills?
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        Practice with a course, or follow a career roadmap to
                        see where the skills can take you.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/courses"
                      className={buttonVariants({ variant: "default" })}
                    >
                      Browse courses
                    </Link>
                    <Link
                      href="/careers"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <FiSearch aria-hidden="true" />
                      Explore careers
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className="text-2xl sm:text-3xl">
                Blog questions
              </h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {faqs.map(({ q, a }, i) => (
                <Reveal key={q} delay={i * 0.06}>
                  <details className="group rounded-xl border bg-card px-4 py-3 open:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">{a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
