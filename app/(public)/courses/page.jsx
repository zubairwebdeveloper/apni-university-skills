// app/(public)/courses/page.jsx
import { Suspense } from "react";
import Link from "next/link";
import {
  FiAward,
  FiBookOpen,
  FiChevronDown,
  FiCompass,
  FiCreditCard,
  FiFolder,
  FiGift,
  FiLayers,
  FiPlay,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiX,
  FiZap,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/layout/Container";
import { CTASection } from "@/components/public/CTASection";
import { Reveal } from "@/components/public/PricingMotion";
import { CourseFilters } from "@/components/public/courses/CourseFilters";
import { CourseResults } from "@/components/public/courses/CourseResults";
import { courseService } from "@/services/courseService";
import { categoryService } from "@/services/categoryService";
import { parseCourseFilters } from "@/lib/validations/courseFilters";
import { safe } from "@/lib/utils/safe";

export const metadata = {
  title: "Courses",
  description:
    "Browse free and paid technology courses in web development, AI, cloud, cybersecurity, and more.",
  alternates: { canonical: "/courses" }, // filtered URLs canonicalize to the clean listing
};

const chips = [
  { icon: FiGift, text: "Many courses are free" },
  { icon: FiPlay, text: "Free preview lessons" },
  { icon: FiAward, text: "Certificate on completion" },
];

const steps = [
  {
    icon: FiSearch,
    title: "Find a course",
    text: "Search and filter by category, level, price and language.",
  },
  {
    icon: FiPlay,
    title: "Try a preview",
    text: "Watch free preview lessons to see the teaching style.",
  },
  {
    icon: FiLayers,
    title: "Learn by building",
    text: "Follow the lessons and build real projects as you go.",
  },
  {
    icon: FiAward,
    title: "Get certified",
    text: "Finish the lessons and earn your certificate.",
  },
];

const benefits = [
  {
    icon: FiTarget,
    title: "Project-based",
    text: "Every course connects to something you can build and show.",
  },
  {
    icon: FiBookOpen,
    title: "Beginner friendly",
    text: "Plain language and clear steps, with depth as you progress.",
  },
  {
    icon: FiTrendingUp,
    title: "Career linked",
    text: "Skills match real roles, so you know why you are learning them.",
  },
  {
    icon: FiZap,
    title: "No subscriptions",
    text: "Pay once per paid course. Many courses cost nothing.",
  },
];

const faqs = [
  {
    q: "Are the courses free?",
    a: "Many courses are free. Paid courses are a one-time payment through secure Stripe Checkout, and the price is shown before you pay.",
  },
  {
    q: "Can I try a course before I pay?",
    a: "Many paid courses include preview lessons that you can watch without enrolling.",
  },
  {
    q: "Which course should I start with?",
    a: "Pick a career path first to see the skills a role needs, then choose courses that teach them. If you are new, start with a beginner level course.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. You earn a certificate when you complete the lessons of a course.",
  },
];

function buildHref(params, omitKey) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (key === omitKey || !value) return;
    if (Array.isArray(value)) value.forEach((v) => sp.append(key, String(v)));
    else sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `/courses?${qs}` : "/courses";
}

function formatValue(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function formatKey(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export default async function CoursesPage({ searchParams }) {
  const filters = parseCourseFilters(await searchParams);
  const [categories, listing] = await Promise.all([
    safe(categoryService.getAllCategories(), []),
    courseService.searchCourses(filters), // errors bubble to error.jsx rather than showing a fake empty list
  ]);
  const { after, ...rest } = filters;
  const linkParams = {
    ...rest,
    sort: rest.sort === "newest" ? undefined : rest.sort,
  };

  const activeFilters = Object.entries(linkParams)
    .filter(([, value]) =>
      Array.isArray(value) ? value.length : Boolean(value),
    )
    .map(([key, value]) => ({
      key,
      text: `${formatKey(key)}: ${formatValue(value)}`,
      href: buildHref(linkParams, key),
    }));
  const filtered = activeFilters.length > 0;

  const quickFilters = [
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
  ].map((q) => ({
    ...q,
    active: String(linkParams.price) === q.value,
    href: buildHref({ ...linkParams, price: q.value }),
    removeHref: buildHref(linkParams, "price"),
  }));

  const categoryList = (categories ?? []).slice(0, 8);

  return (
    <>
      <PageHeader
        title="Explore courses"
        description="Practical, project-based courses. Filter by category, level, price, and language."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Courses" }]}
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
          {/* Quick filters */}
          <Reveal>
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Quick filters
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {quickFilters.map((q) => (
                  <Link
                    key={q.value}
                    href={q.active ? q.removeHref : q.href}
                    aria-pressed={q.active}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      q.active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {q.value === "free" ? (
                      <FiGift aria-hidden="true" className="size-3.5" />
                    ) : (
                      <FiCreditCard aria-hidden="true" className="size-3.5" />
                    )}
                    {q.label}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Filters */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <Suspense fallback={<Skeleton className="h-40 w-full" />}>
              <CourseFilters categories={categories} />
            </Suspense>
          </div>

          {/* Active filters */}
          {filtered && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {activeFilters.map((f) => (
                <Link
                  key={f.key}
                  href={f.href}
                  aria-label={`Remove filter ${f.text}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {f.text}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              ))}
              <Link
                href="/courses"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Results */}
          <div className="mt-6">
            <CourseResults
              items={listing.items}
              nextCursor={listing.nextCursor}
              basePath="/courses"
              linkParams={linkParams}
              after={after}
            />
          </div>
        </Container>

        {/* Browse by category */}
        {categoryList.length > 0 && (
          <section
            aria-labelledby="cat-title"
            className="border-t bg-muted/20 py-12 sm:py-16"
          >
            <Container>
              <Reveal className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className="mb-3">
                  Browse by category
                </Badge>
                <h2 id="cat-title" className="text-2xl sm:text-3xl">
                  Pick a subject and start learning
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Each category groups courses that build on each other.
                </p>
              </Reveal>
              <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categoryList.map((c, i) => {
                  const name = c.name || c.title || "Category";
                  const value = c.slug ?? c.id;
                  return (
                    <li key={c.id ?? value ?? i} className="min-w-0">
                      <Reveal
                        delay={Math.min(i * 0.06, 0.4)}
                        className="h-full"
                      >
                        <Link
                          href={`/courses?category=${encodeURIComponent(value)}`}
                          className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                            <FiFolder aria-hidden="true" className="size-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-sans text-base font-semibold">
                              {name}
                            </span>
                            <span className="block text-sm text-muted-foreground">
                              View courses <span aria-hidden="true">→</span>
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

        {/* How learning works */}
        <section
          aria-labelledby="steps-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                How it works
              </Badge>
              <h2 id="steps-title" className="text-2xl sm:text-3xl">
                From search to certificate
              </h2>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group relative h-full rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="absolute right-4 top-3 font-serif text-4xl font-semibold text-primary/10">
                        {i + 1}
                      </span>
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
            </ol>
          </Container>
        </section>

        {/* Free vs paid */}
        <section
          aria-labelledby="price-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-4xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Simple pricing
              </Badge>
              <h2 id="price-title" className="text-2xl sm:text-3xl">
                Free and paid courses
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Reveal className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                  />
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FiGift aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="mt-4 font-sans text-lg font-semibold">
                    Free courses
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enroll with a free account and start right away. You get
                    full lessons and progress tracking.
                  </p>
                  <Link
                    href="/courses?price=free"
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "mt-4",
                    })}
                  >
                    Browse free courses
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={0.1} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl border border-primary/40 bg-card p-6 shadow-lg shadow-primary/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-highlight to-primary"
                  />
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FiCreditCard aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="mt-4 font-sans text-lg font-semibold">
                    Paid courses
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A one-time payment per course through secure Stripe
                    Checkout. No subscriptions, and many include free previews.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/courses?price=paid"
                      className={buttonVariants({ size: "sm" })}
                    >
                      Browse paid courses
                    </Link>
                    <Link
                      href="/pricing"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      See pricing
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* Why learn here */}
        <section
          aria-labelledby="why-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Why learn here
              </Badge>
              <h2 id="why-title" className="text-2xl sm:text-3xl">
                Learning that leads somewhere
              </h2>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
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

        {/* Careers banner */}
        <section className="border-t bg-muted/20 py-12 sm:py-14">
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
                        Not sure which course to pick?
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        Start with a career path. See the skills a role needs,
                        then choose the courses that teach them.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/careers"
                      className={buttonVariants({ variant: "default" })}
                    >
                      Explore careers
                    </Link>
                    <Link
                      href="/instructors"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Meet instructors
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
          className="border-t py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className="text-2xl sm:text-3xl">
                Course questions
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
