// app/(public)/courses/page.jsx
import { Suspense } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiChevronDown,
  FiCompass,
  FiCreditCard,
  FiGift,
  FiLayers,
  FiPlay,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiX,
  FiZap,
} from "react-icons/fi";

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
        <ul className="mt-5 flex flex-wrap gap-2">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
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
          <div className="mb-4 flex items-center gap-3">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              Quick filters
            </span>
            <div className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:thin]">
              {quickFilters.map((q) => (
                <Link
                  key={q.value}
                  href={q.active ? q.removeHref : q.href}
                  aria-pressed={q.active}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
                    q.active
                      ? "border-primary bg-primary text-primary-foreground"
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
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  {f.text}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              ))}
              <Link
                href="/courses"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        {/* Browse by category: light ruled links, not cards */}
        {categoryList.length > 0 && (
          <section
            aria-labelledby="cat-title"
            className="border-t bg-muted/30 py-14 sm:py-20"
          >
            <Container>
              <h2
                id="cat-title"
                className="max-w-xl text-balance text-3xl sm:text-4xl"
              >
                Pick a subject and start learning
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Each category groups courses that build on each other.
              </p>
              <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                {categoryList.map((c, i) => {
                  const name = c.name || c.title || "Category";
                  const value = c.slug ?? c.id;
                  return (
                    <li key={c.id ?? value ?? i} className="min-w-0">
                      <Link
                        href={`/courses?category=${encodeURIComponent(value)}`}
                        className="group flex min-h-14 items-center justify-between gap-3 border-t py-4 outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                      >
                        <span className="min-w-0 truncate font-sans text-base font-semibold text-foreground">
                          {name}
                        </span>
                        <FiArrowRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Container>
          </section>
        )}

        {/* How learning works: a true sequence */}
        <section
          aria-labelledby="steps-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <h2
              id="steps-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              From search to certificate
            </h2>

            <Reveal>
              <ol className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border lg:block"
                />
                {steps.map(({ icon: Icon, title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 lg:block lg:pr-4"
                  >
                    <span
                      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ${
                        i === steps.length - 1
                          ? "bg-highlight text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="lg:mt-5">
                      <h3 className="font-sans text-base font-semibold text-foreground">
                        <span className="sr-only">Step {i + 1}: </span>
                        {title}
                      </h3>
                      <p className="mt-1 max-w-xs text-sm text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </Container>
        </section>

        {/* Free vs paid: a genuine comparison, so two panels stay */}
        <section
          aria-labelledby="price-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container className="max-w-4xl">
            <h2
              id="price-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              Free and paid courses
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="flex h-full flex-col rounded-3xl border bg-card p-6 sm:p-8">
                <FiGift aria-hidden="true" className="size-6 text-primary" />
                <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">
                  Free courses
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground sm:text-base">
                  Enroll with a free account and start right away. You get full
                  lessons and progress tracking.
                </p>
                <div className="mt-6">
                  <Link
                    href="/courses?price=free"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Browse free courses
                  </Link>
                </div>
              </div>

              <div className="flex h-full flex-col rounded-3xl border-2 border-primary bg-card p-6 sm:p-8">
                <FiCreditCard
                  aria-hidden="true"
                  className="size-6 text-primary"
                />
                <h3 className="mt-4 font-sans text-lg font-semibold text-foreground">
                  Paid courses
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground sm:text-base">
                  A one-time payment per course through secure Stripe Checkout.
                  No subscriptions, and many include free previews.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/courses?price=paid" className={buttonVariants()}>
                    Browse paid courses
                  </Link>
                  <Link
                    href="/pricing"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Why learn here: open columns */}
        <section
          aria-labelledby="why-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <h2
              id="why-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              Learning that leads somewhere
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {benefits.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="min-w-0 border-t-2 border-primary pt-5"
                >
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                  <h3 className="mt-3 font-sans text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Careers banner */}
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="flex items-start gap-4">
                <FiCompass
                  aria-hidden="true"
                  className="mt-1 size-7 shrink-0 text-primary"
                />
                <div>
                  <h2 className="text-balance text-2xl sm:text-3xl">
                    Not sure which course to pick?
                  </h2>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    Start with a career path. See the skills a role needs, then
                    choose the courses that teach them.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:shrink-0">
                <Link
                  href="/careers"
                  className={buttonVariants({ variant: "default", size: "lg" })}
                >
                  Explore careers
                </Link>
                <Link
                  href="/instructors"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Meet instructors
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ: heading left, accordion right */}
        <section
          aria-labelledby="faq-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <h2
                id="faq-title"
                className="text-balance text-3xl sm:text-4xl lg:col-span-4"
              >
                Course questions
              </h2>

              <div className="divide-y divide-border border-y border-border lg:col-span-8">
                {faqs.map(({ q, a }) => (
                  <details key={q} className="group py-1">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 text-left text-base font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="max-w-2xl pb-4 text-muted-foreground">{a}</p>
                  </details>
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
