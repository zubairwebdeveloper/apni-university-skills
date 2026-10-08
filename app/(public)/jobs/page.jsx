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
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CursorPagination } from "@/components/shared/CursorPagination";
import { QueryFilters } from "@/components/shared/QueryFilters";
import { JobCard } from "@/components/public/JobCard";
import { CTASection } from "@/components/public/CTASection";
import { Reveal } from "@/components/public/PricingMotion";
import { jobService } from "@/services/jobService";
import { parseJobFilters } from "@/lib/validations/listings";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/config/jobs";

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

  return (
    <>
      <PageHeader
        title="Jobs & internships"
        description="Put your skills to work. Listings are reviewed before they are published."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Jobs" }]}
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

        {/* Search and results */}
        <Container className="relative py-8 sm:py-10">
          {/* Quick filters */}
          <Reveal>
            <div className="mb-4">
              <p className="mb-2 text-xs  uppercase tracking-wide text-black font-bold">
                Quick filters
              </p>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                {quickFilters.map((q) => {
                  const active = String(linkParams[q.key]) === String(q.value);
                  return (
                    <Link
                      key={`${q.key}-${q.value}`}
                      href={active ? buildHref(linkParams, q.key) : q.href}
                      aria-pressed={active}
                      className={`inline-flex shrink-0 items-center rounded-full border bg-primary text-white  px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {q.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>

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
                  className="group inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {f.text}
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              ))}
              <Link
                href="/jobs"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
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
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                  {items.map((j, i) => (
                    <Reveal
                      key={j.id}
                      delay={Math.min(i * 0.05, 0.3)}
                      className="min-w-0"
                    >
                      <JobCard job={j} />
                    </Reveal>
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

        {/* Job types */}
        <section
          aria-labelledby="types-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Know the options
              </Badge>
              <h2 id="types-title" className="text-2xl sm:text-3xl">
                Which type of work fits you?
              </h2>
              <p className="mt-3 text-muted-foreground">
                A quick guide to the kinds of roles you will see on this page.
              </p>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {jobTypes.map(({ icon: Icon, title, text }, i) => (
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

        {/* Apply smarter */}
        <section
          aria-labelledby="tips-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Apply smarter
              </Badge>
              <h2 id="tips-title" className="text-2xl sm:text-3xl">
                Four habits that get you noticed
              </h2>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tips.map(({ icon: Icon, title, text }, i) => (
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

        {/* How listings are reviewed */}
        <section
          aria-labelledby="review-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-4xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Trust and safety
              </Badge>
              <h2 id="review-title" className="text-2xl sm:text-3xl">
                How listings are reviewed
              </h2>
              <p className="mt-3 text-muted-foreground">
                We want you to apply with confidence. Every job goes through
                three steps before you see it.
              </p>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {reviewSteps.map(({ title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="relative h-full rounded-2xl border bg-card p-5 text-center">
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
            <Reveal delay={0.1}>
              <p className="mt-6 flex items-start justify-center gap-2 text-center text-sm text-muted-foreground">
                <FiShield
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-primary"
                />
                A real employer will never ask you to pay money to get a job.
              </p>
            </Reveal>
          </Container>
        </section>

        {/* Skills banner */}
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
                        Not ready to apply yet?
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        Pick a career path, follow its roadmap and learn the
                        skills employers ask for. Many courses are free.
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
                      href="/courses"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <FiSearch aria-hidden="true" />
                      Browse courses
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
                Job search questions
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
