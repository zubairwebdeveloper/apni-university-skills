// app/(public)/jobs/page.jsx
import { Suspense } from "react";
import Link from "next/link";
import {
  FiAward,
  FiBriefcase,
  FiChevronDown,
  FiClipboard,
  FiCompass,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiMessageSquare,
  FiSearch,
  FiShield,
  FiUser,
  FiX,
  FiZap,
} from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { JsonLd } from "@/components/shared/JsonLd";
import { QueryFilters } from "@/components/shared/QueryFilters";
import { JobCard } from "@/components/public/JobCard";
import { CTASection } from "@/components/public/CTASection";
import { TiltCard } from "@/components/public/TiltCard";
import { Reveal } from "@/components/public/PricingMotion";
import { jobService } from "@/services/jobService";
import { parseJobFilters } from "@/lib/validations/listings";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/config/jobs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const DAY_MS = 24 * 60 * 60 * 1000;

export const metadata = {
  title: "Jobs & internships",
  description:
    "Technology jobs, internships, and freelance opportunities for developers, designers, and data professionals.",
  alternates: { canonical: "/jobs" },
};

const FIELDS = [
  {
    key: "type",
    label: "Job type",
    allLabel: "All types",
    options: EMPLOYMENT_TYPES,
  },
  {
    key: "level",
    label: "Experience",
    allLabel: "All levels",
    options: EXPERIENCE_LEVELS,
  },
  {
    key: "remote",
    label: "Location",
    allLabel: "Remote & on-site",
    options: [{ value: "true", label: "Remote only" }],
  },
];

const chips = [
  { icon: FiShield, text: "Reviewed before publishing" },
  { icon: FiGlobe, text: "Remote friendly roles" },
  { icon: FiZap, text: "Internships and freelance" },
];

const jobTypes = [
  {
    icon: FiBriefcase,
    title: "Full-time",
    text: "A regular position with a company. Best when you want stability, a team and long-term growth.",
  },
  {
    icon: FiAward,
    title: "Internship",
    text: "A short learning role for students and beginners. A great way to get first real-world experience.",
  },
  {
    icon: FiEdit3,
    title: "Freelance",
    text: "Project-based work for different clients. You choose your projects and manage your own time.",
  },
  {
    icon: FiGlobe,
    title: "Remote",
    text: "Work from anywhere. Good communication and self-discipline matter more than location.",
  },
];

const tips = [
  {
    icon: FiFileText,
    title: "Keep your resume short",
    text: "One page, clear skills, and the projects that match the role. Remove anything that does not help.",
  },
  {
    icon: FiUser,
    title: "Show a portfolio",
    text: "Two or three real projects with a live link and code beat a long list of certificates.",
  },
  {
    icon: FiClipboard,
    title: "Match the job post",
    text: "Read the required skills and mention the ones you really have, using the same words.",
  },
  {
    icon: FiMessageSquare,
    title: "Practice interviews",
    text: "Explain your projects out loud. Prepare for common questions about the skills in the listing.",
  },
];

const reviewSteps = [
  {
    title: "Submitted",
    text: "A company or recruiter sends the job details.",
  },
  {
    title: "Reviewed",
    text: "We check the role is real, clear and relevant to technology.",
  },
  {
    title: "Published",
    text: "Only approved listings appear on this page.",
  },
];

const faqs = [
  {
    q: "Do I need experience to apply?",
    a: "Not always. Use the experience filter to find entry-level roles and internships made for beginners.",
  },
  {
    q: "Are these listings checked?",
    a: "Yes. Listings are reviewed before they are published. Still, never pay money to get a job, and be careful with offers that sound too good to be true.",
  },
  {
    q: "How do I find remote jobs?",
    a: "Choose Remote only in the Location filter, or use the Remote quick filter above the list.",
  },
  {
    q: "What if there are no jobs for my role?",
    a: "New roles are posted regularly. In the meantime, explore a career path and build the skills and portfolio employers ask for.",
  },
];

function buildHref(params, omitKey) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== omitKey) sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

function getLabel(key, value) {
  const field = FIELDS.find((f) => f.key === key);
  const option = field?.options?.find((o) => String(o.value) === String(value));
  return option?.label ?? String(value);
}

function countClosingSoon(items) {
  const now = Date.now();
  return items.filter(
    (j) => j.expiresAt && j.expiresAt > now && j.expiresAt - now <= 7 * DAY_MS,
  ).length;
}

export default async function JobsPage({ searchParams }) {
  const filters = parseJobFilters(await searchParams);
  const { after, ...linkParams } = filters;
  const { items, nextCursor } = await jobService.getJobsPage(filters);
  const filtered = Object.values(linkParams).some(Boolean);

  const activeFilters = Object.entries(linkParams)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({
      key,
      value,
      label: FIELDS.find((f) => f.key === key)?.label ?? key,
      text: getLabel(key, value),
      href: buildHref(linkParams, key),
    }));

  const quickFilters = [
    {
      key: "remote",
      value: "true",
      label: "Remote",
      href: buildHref({ ...linkParams, remote: "true" }),
    },
    ...EMPLOYMENT_TYPES.slice(0, 4).map((o) => ({
      key: "type",
      value: o.value,
      label: o.label,
      href: buildHref({ ...linkParams, type: o.value }),
    })),
    ...EXPERIENCE_LEVELS.slice(0, 3).map((o) => ({
      key: "level",
      value: o.value,
      label: o.label,
      href: buildHref({ ...linkParams, level: o.value }),
    })),
  ];

  // Summary of the jobs on this page, from real fields only
  const remoteCount = items.filter((j) => j.remote).length;
  const closingSoonCount = countClosingSoon(items);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Jobs and internships at Apni University",
    itemListElement: items
      .filter((j) => j.slug && j.title)
      .map((j, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: j.company ? `${j.title} at ${j.company}` : j.title,
        url: `${siteUrl}/jobs/${j.slug}`,
      })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHeader
        title="Jobs & internships"
        description="Put your skills to work. Listings are reviewed before they are published."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Jobs" }]}
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

        {/* Search and results */}
        <Container className="relative py-8 sm:py-10">
          {/* Quick filters */}
          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Quick filters
            </p>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((q) => {
                const active = String(linkParams[q.key]) === String(q.value);
                return (
                  <Link
                    key={`${q.key}-${q.value}`}
                    href={active ? buildHref(linkParams, q.key) : q.href}
                    aria-pressed={active}
                    className={`inline-flex min-h-9 shrink-0 items-center rounded-full border px-4 py-1.5 text-sm font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {q.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <QueryFilters fields={FIELDS} />
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
                  aria-label={`Remove filter ${f.label}: ${f.text}`}
                  className="group inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  {f.text}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              ))}
              <Link
                href="/jobs"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Results */}
          <div className="mt-6">
            {items.length ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {items.length}
                  </span>{" "}
                  {items.length === 1 ? "job" : "jobs"} on this page
                  {remoteCount > 0 && (
                    <>
                      <span aria-hidden="true"> · </span>
                      {remoteCount} remote
                    </>
                  )}
                  {closingSoonCount > 0 && (
                    <>
                      <span aria-hidden="true"> · </span>
                      <span className="font-medium text-foreground">
                        {closingSoonCount} closing within 7 days
                      </span>
                    </>
                  )}
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                  {items.map((j) => (
                    // Subtle 3D tilt toward the pointer (desktop only, off for reduced motion)
                    <TiltCard key={j.id} className="h-full min-w-0" max={4}>
                      <JobCard job={j} />
                    </TiltCard>
                  ))}
                </div>
                <CursorPagination
                  basePath="/jobs"
                  params={linkParams}
                  after={after}
                  nextCursor={nextCursor}
                />
              </>
            ) : (
              <EmptyState
                icon={FiBriefcase}
                title={
                  filtered
                    ? "No jobs match your filters"
                    : "No open positions right now"
                }
                description="New roles are posted regularly."
                action={
                  <Link
                    href={filtered ? "/jobs" : "/careers"}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    {filtered ? "Clear filters" : "Explore career paths"}
                  </Link>
                }
              />
            )}
          </div>
        </Container>

        {/* Job types: open columns */}
        <section
          aria-labelledby="types-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <h2
              id="types-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              Which type of work fits you?
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              A quick guide to the kinds of roles you will see on this page.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {jobTypes.map(({ icon: Icon, title, text }) => (
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

        {/* Apply smarter: ruled list */}
        <section
          aria-labelledby="tips-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <h2
                  id="tips-title"
                  className="text-balance text-3xl sm:text-4xl"
                >
                  Four habits that get you noticed
                </h2>
              </div>

              <ul className="divide-y divide-border border-y border-border lg:col-span-8">
                {tips.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 py-5 sm:gap-5 sm:py-6"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-sans text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* How listings are reviewed: a 3D trust scene beside a real sequence */}
        <section
          aria-labelledby="review-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
              <TiltCard className="mx-auto size-44 sm:size-52" max={14}>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-3xl bg-highlight/40 [transform:translateZ(-40px)_translate(14px,14px)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-3xl border-2 border-primary/40 bg-card"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-6 grid place-items-center rounded-2xl bg-primary text-primary-foreground shadow-xl [transform:translateZ(44px)]"
                >
                  <FiShield aria-hidden="true" className="size-14" />
                </span>
              </TiltCard>

              <div className="min-w-0">
                <h2
                  id="review-title"
                  className="max-w-xl text-balance text-3xl sm:text-4xl"
                >
                  How listings are reviewed
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  We want you to apply with confidence. Every job goes through
                  three steps before you see it.
                </p>

                <Reveal>
                  <ol className="relative mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                    <span
                      aria-hidden="true"
                      className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                    />
                    {reviewSteps.map(({ title, text }, i) => (
                      <li
                        key={title}
                        className="relative flex gap-4 sm:block sm:pr-4"
                      >
                        <span
                          aria-hidden="true"
                          className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border font-serif text-base font-semibold ${
                            i === reviewSteps.length - 1
                              ? "border-highlight bg-highlight text-foreground"
                              : "border-primary bg-background text-primary"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="sm:mt-5">
                          <h3 className="font-sans text-base font-semibold text-foreground">
                            <span className="sr-only">Step {i + 1}: </span>
                            {title}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                            {text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
                  <FiShield
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-primary"
                  />
                  A real employer will never ask you to pay money to get a job.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* Skills banner */}
        <section className="border-t py-14 sm:py-16">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="flex items-start gap-4">
                <FiCompass
                  aria-hidden="true"
                  className="mt-1 size-7 shrink-0 text-primary"
                />
                <div>
                  <h2 className="text-balance text-2xl sm:text-3xl">
                    Not ready to apply yet?
                  </h2>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    Pick a career path, follow its roadmap and learn the skills
                    employers ask for. Many courses are free.
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
                  href="/courses"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <FiSearch aria-hidden="true" />
                  Browse courses
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ: heading left, accordion right */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <h2
                id="faq-title"
                className="text-balance text-3xl sm:text-4xl lg:col-span-4"
              >
                Job search questions
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
