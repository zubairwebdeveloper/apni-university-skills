// app/(public)/blog/page.jsx

import Link from "next/link";
import {
  FiArrowRight,
  FiArrowUpRight,
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
  FiHeart,
  FiHelpCircle,
  FiLock,
  FiRefreshCw,
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
  {
    title: "Revisit and update",
    text: "Technology moves fast, so articles get rechecked rather than left to go stale.",
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
  {
    q: "Can I suggest a topic?",
    a: "Yes. Use the Contact page to send a suggestion and it will be considered for a future article.",
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

// Shared class strings keep every section consistent.
const sectionEyebrow =
  "mb-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider";
const sectionTitle =
  "text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl";
const filterPill =
  "group inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";
const cardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary motion-reduce:transition-none";

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

  const resultsHeading = activeTopic
    ? activeTopic.label
    : category
      ? category
      : tag
        ? `Tagged: ${tag}`
        : "Latest articles";

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
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur"
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
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />

        <Container className="relative py-8 sm:py-10 lg:py-12">
          {/* Topics */}
          <Reveal>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Browse by topic
                </p>
                {BLOG_TOPICS.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {BLOG_TOPICS.length}{" "}
                    {BLOG_TOPICS.length === 1 ? "topic" : "topics"}
                  </span>
                )}
              </div>
              <nav aria-label="Blog topics">
                <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
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
                      All articles
                    </Link>
                  </li>

                  {BLOG_TOPICS.map((topic) => {
                    const Icon = topicIcon(topic.slug);
                    const active = category === topic.slug;
                    return (
                      <li key={topic.slug} className="shrink-0">
                        <Link
                          href={buildQuery("/blog", {
                            category: topic.slug,
                          })}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            buttonVariants({
                              size: "sm",
                              variant: active ? "default" : "outline",
                              className: "rounded-full",
                            }),
                          )}
                        >
                          <Icon aria-hidden="true" className="size-3.5" />
                          {topic.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </Reveal>

          {/* Active filters */}
          {filtered && (
            <div
              className="mt-4 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Active filters"
            >
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {category && (
                <Link
                  href={buildQuery("/blog", { tag })}
                  aria-label={`Remove topic filter ${activeTopic?.label ?? category}`}
                  className={filterPill}
                >
                  {activeTopic?.label ?? category}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              )}
              {tag && (
                <Link
                  href={buildQuery("/blog", { category })}
                  aria-label={`Remove tag filter ${tag}`}
                  className={filterPill}
                >
                  Tag: {tag}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              )}
              <Link
                href="/blog"
                className="rounded-md px-1 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Results */}
          <section aria-labelledby="articles-title" className="mt-10">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h2
                id="articles-title"
                className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                {resultsHeading}
              </h2>
              {items.length > 0 && (
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Showing{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {items.length}
                  </span>{" "}
                  {items.length === 1 ? "article" : "articles"} on this page
                </p>
              )}
            </div>

            {items.length ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
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
                            <Badge className="absolute left-3 top-3 z-10 gap-1 shadow-md">
                              <FiZap aria-hidden="true" className="size-3" />
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
          </section>
        </Container>

        {/* Explore by topic */}
        {BLOG_TOPICS.length > 0 && (
          <section
            aria-labelledby="topics-title"
            className="border-t border-border bg-muted/20 py-12 sm:py-16 lg:py-20"
          >
            <Container>
              <Reveal className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className={sectionEyebrow}>
                  Explore by topic
                </Badge>
                <h2 id="topics-title" className={sectionTitle}>
                  Pick a subject and start reading
                </h2>
                <p className="mx-auto mt-3 max-w-prose text-pretty text-muted-foreground">
                  Each topic collects the articles that help you learn it step
                  by step.
                </p>
              </Reveal>
              <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          className={cn(
                            "group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            cardHover,
                          )}
                        >
                          <span className={cn(iconTile, "size-12")}>
                            <Icon aria-hidden="true" className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-sans text-base font-semibold text-foreground">
                              {topic.label}
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              Read articles on {topic.label}
                            </span>
                          </span>
                          <FiArrowUpRight
                            aria-hidden="true"
                            className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                          />
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
          className="border-t border-border py-12 sm:py-16 lg:py-20"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <Reveal className="lg:col-span-4">
                <div className="max-w-md lg:sticky lg:top-24">
                  <Badge variant="secondary" className={sectionEyebrow}>
                    Why read our blog
                  </Badge>
                  <h2 id="why-title" className={sectionTitle}>
                    Learning that fits real life
                  </h2>
                  <p className="mt-3 text-pretty text-muted-foreground">
                    Short, clear and useful, so you can learn in the time you
                    actually have.
                  </p>
                </div>
              </Reveal>

              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
                {benefits.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="min-w-0">
                    <Reveal delay={i * 0.08} className="h-full">
                      <div
                        className={cn(
                          "group h-full rounded-2xl border border-border bg-card p-6",
                          cardHover,
                        )}
                      >
                        <span className={cn(iconTile, "size-11")}>
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
                          {title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {text}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* How we write */}
        <section
          aria-labelledby="write-title"
          className="border-t border-border bg-muted/20 py-12 sm:py-16 lg:py-20"
        >
          <Container className="max-w-5xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className={sectionEyebrow}>
                Our approach
              </Badge>
              <h2 id="write-title" className={sectionTitle}>
                How we write our articles
              </h2>
            </Reveal>
            <ol className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {principles.map(({ title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-1 -top-3 select-none font-sans text-7xl font-bold tabular-nums text-primary/5"
                      >
                        {i + 1}
                      </span>
                      <span className="relative grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold tabular-nums text-primary-foreground shadow-sm">
                        {i + 1}
                      </span>
                      <h3 className="relative mt-4 font-sans text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Reader note */}
        <section className="border-t border-border py-10 sm:py-12">
          <Container className="max-w-3xl">
            <Reveal>
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-6 text-center shadow-sm sm:flex-row sm:text-left">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                  <FiHeart aria-hidden="true" className="size-5" />
                </span>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Notice something outdated or unclear?
                  </span>{" "}
                  Let us know through the Contact page and we&apos;ll take a
                  look.
                </p>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "shrink-0",
                  )}
                >
                  <FiRefreshCw aria-hidden="true" />
                  Suggest a fix
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Learn banner */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-14 lg:py-16">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10 lg:p-12">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/5 blur-2xl"
                />
                <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                      <FiCompass aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        Ready to turn reading into skills?
                      </h2>
                      <p className="mt-1.5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Practice with a course, or follow a career roadmap to
                        see where the skills can take you.
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link
                      href="/courses"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "group",
                      )}
                    >
                      Browse courses
                      <FiArrowRight
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
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
          className="border-t border-border py-12 sm:py-16 lg:py-20"
        >
          <Container className="max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <Reveal className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                    <FiHelpCircle aria-hidden="true" className="size-5" />
                  </span>
                  <h2 id="faq-title" className={sectionTitle}>
                    Blog questions
                  </h2>
                  <p className="mt-3 text-pretty text-muted-foreground">
                    Quick answers about how the blog works. Need something else?
                    Reach us through the{" "}
                    <Link
                      href="/contact"
                      className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Contact page
                    </Link>
                    .
                  </p>
                </div>
              </Reveal>

              <div className="space-y-3 lg:col-span-8">
                {faqs.map(({ q, a }, i) => (
                  <Reveal key={q} delay={i * 0.06}>
                    <details className="group rounded-xl border border-border bg-card px-4 py-3.5 transition-colors duration-200 hover:border-primary/30 open:border-primary/30 open:shadow-md motion-reduce:transition-none sm:px-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base [&::-webkit-details-marker]:hidden">
                        {q}
                        <FiChevronDown
                          aria-hidden="true"
                          className="size-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                        />
                      </summary>
                      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {a}
                      </p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
