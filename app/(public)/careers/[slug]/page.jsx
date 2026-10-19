// app/(public)/careers/[slug]/page.jsx

import { cache } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiDollarSign,
  FiFolder,
  FiGlobe,
  FiMap,
  FiMessageCircle,
  FiTag,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { CourseCard } from "@/components/public/CourseCard";
import { JobCard } from "@/components/public/JobCard";
import { Reveal } from "@/components/public/PricingMotion";

import { careerService } from "@/services/careerService";
import { courseService } from "@/services/courseService";
import { jobService } from "@/services/jobService";

import { safe } from "@/lib/utils/safe";
import { formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const getCareer = cache((slug) => careerService.getCareerBySlug(slug));

export async function generateMetadata({ params }) {
  const { slug } = await params;

  const career = await safe(getCareer(slug), null);

  if (!career) {
    return {
      title: "Career not found",
      robots: {
        index: false,
      },
    };
  }

  const title = career.seoTitle || `${career.title} career path`;

  const description = career.seoDescription || career.summary;

  return {
    title,
    description,
    alternates: {
      canonical: `/careers/${career.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/careers/${career.slug}`,
    },
  };
}

const iconTile =
  "grid shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15";

const Checklist = ({ items }) => (
  <ul className="grid gap-3 sm:grid-cols-1">
    {items.map((item) => (
      <li
        key={item}
        className="flex gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground transition-colors duration-200 hover:border-primary/30 motion-reduce:transition-none"
      >
        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <FiCheck className="size-3" aria-hidden="true" />
        </span>
        <span className="min-w-0">{item}</span>
      </li>
    ))}
  </ul>
);

// Small wrapper so every content section shares the same card treatment
// and an icon that reinforces what the section is about.
const SectionCard = ({ id, icon: Icon, title, children }) => (
  <Reveal>
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className={cn(iconTile, "size-10")}>
          <Icon aria-hidden="true" className="size-[18px]" />
        </span>
        <h2
          id={`${id}-title`}
          className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  </Reveal>
);

export default async function CareerPage({ params }) {
  const { slug } = await params;

  const career = await getCareer(slug);

  if (!career) {
    notFound();
  }

  const [courses, jobs] = await Promise.all([
    safe(courseService.getCoursesByCategorySlug(career.categorySlug, 4), []),
    safe(jobService.getJobsBySkill(career.jobSkill, 4), []),
  ]);

  const hasSalary =
    career.salary && (career.salary.min != null || career.salary.max != null);

  const salaryMin =
    hasSalary && career.salary.min != null
      ? formatPrice(career.salary.min, career.salary.currency)
      : "—";
  const salaryMax =
    hasSalary && career.salary.max != null
      ? formatPrice(career.salary.max, career.salary.currency)
      : "—";

  const coursesHref = career.categorySlug
    ? `/categories/${career.categorySlug}`
    : "/courses";

  // Built from the same booleans the sections below already use, so this
  // nav can never link to a section that isn't actually rendered.
  const pageSections = [
    { id: "overview", label: "Overview" },
    { id: "roadmap", label: "Roadmap", show: career.roadmap?.length > 0 },
    {
      id: "interview",
      label: "Interview prep",
      show: career.interviewPrep?.length > 0,
    },
    {
      id: "portfolio",
      label: "Portfolio ideas",
      show: career.portfolioIdeas?.length > 0,
    },
    {
      id: "freelance",
      label: "Freelancing",
      show: Boolean(career.freelanceNotes),
    },
    { id: "roles", label: "Job titles", show: career.jobRoles?.length > 0 },
    { id: "salary", label: "Salary", show: hasSalary },
  ].filter((s) => s.show !== false);

  return (
    <>
      <PageHeader
        title={career.title}
        description={career.summary}
        breadcrumbs={[
          {
            label: "Home",
            href: "/",
          },
          {
            label: "Careers",
            href: "/careers",
          },
          {
            label: career.title,
          },
        ]}
      />

      <Container className="grid gap-10 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-12 lg:py-12">
        <div className="min-w-0 space-y-6 sm:space-y-8">
          {pageSections.length > 1 && (
            <nav
              aria-label="On this page"
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On this page
              </p>
              <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible sm:pb-0">
                {pageSections.map((s) => (
                  <li key={s.id} className="shrink-0">
                    <a
                      href={`#${s.id}`}
                      className="inline-flex rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <SectionCard
            id="overview"
            icon={FiBriefcase}
            title="What this role does"
          >
            <div className="max-w-prose text-pretty leading-relaxed text-muted-foreground">
              <Paragraphs text={career.description} />
            </div>
          </SectionCard>

          {career.roadmap?.length > 0 && (
            <SectionCard id="roadmap" icon={FiMap} title="Roadmap">
              <ol className="relative space-y-6 border-l-2 border-border pl-8">
                {career.roadmap.map((step, index) => (
                  <li key={step.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.9rem] grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold tabular-nums text-primary-foreground shadow-sm ring-4 ring-card"
                    >
                      {index + 1}
                    </span>

                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Step {index + 1}
                    </p>

                    <h3 className="mt-0.5 font-sans text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>

                    <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          )}

          {career.interviewPrep?.length > 0 && (
            <SectionCard
              id="interview"
              icon={FiMessageCircle}
              title="Interview preparation"
            >
              <Checklist items={career.interviewPrep} />
            </SectionCard>
          )}

          {career.portfolioIdeas?.length > 0 && (
            <SectionCard id="portfolio" icon={FiFolder} title="Portfolio ideas">
              <Checklist items={career.portfolioIdeas} />
            </SectionCard>
          )}

          {career.freelanceNotes && (
            <SectionCard
              id="freelance"
              icon={FiGlobe}
              title="Freelancing and remote work"
            >
              <div className="max-w-prose text-pretty leading-relaxed text-muted-foreground">
                <Paragraphs text={career.freelanceNotes} />
              </div>
            </SectionCard>
          )}

          {career.jobRoles?.length > 0 && (
            <SectionCard id="roles" icon={FiTag} title="Job titles to look for">
              <ul className="flex flex-wrap gap-2">
                {career.jobRoles.map((role) => (
                  <li key={role}>
                    <Badge variant="outline" className="px-3 py-1 text-sm">
                      {role}
                    </Badge>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {hasSalary && (
            <SectionCard
              id="salary"
              icon={FiDollarSign}
              title="Typical annual salary"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
                  <span>{salaryMin}</span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    –
                  </span>
                  <span className="sr-only">to</span>
                  <span>{salaryMax}</span>
                </p>

                {career.salary.note && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {career.salary.note}
                  </p>
                )}
              </div>
            </SectionCard>
          )}
        </div>

        <aside
          aria-label="Career summary"
          className="space-y-5 lg:sticky lg:top-24 lg:self-start"
        >
          {career.skills?.length > 0 && (
            <Reveal>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className={cn(iconTile, "size-8")}>
                    <FiZap aria-hidden="true" className="size-4" />
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    Key skills
                  </h2>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {career.skills.map((skill) => (
                    <li key={skill}>
                      <Badge variant="secondary">{skill}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {/* Quick facts: real counts from the data already fetched below,
              not invented figures. */}
          <Reveal delay={0.06}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2.5">
                <span className={cn(iconTile, "size-8")}>
                  <FiTrendingUp aria-hidden="true" className="size-4" />
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Quick facts
                </h2>
              </div>
              <dl className="divide-y divide-border text-sm">
                <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                  <dt className="text-muted-foreground">
                    Courses to start with
                  </dt>
                  <dd className="font-semibold tabular-nums text-foreground">
                    {courses.length}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2.5 last:pb-0">
                  <dt className="text-muted-foreground">
                    Open roles right now
                  </dt>
                  <dd className="font-semibold tabular-nums text-foreground">
                    {jobs.length}
                  </dd>
                </div>
                {hasSalary && (
                  <div className="flex items-start justify-between gap-3 py-2.5 last:pb-0">
                    <dt className="shrink-0 text-muted-foreground">
                      Salary range
                    </dt>
                    <dd className="text-right font-semibold tabular-nums text-foreground">
                      {salaryMin}
                      {" – "}
                      {salaryMax}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <h2 className="text-base font-semibold tracking-tight text-foreground">
                Start building these skills
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Pick a course from this path and practice step by step.
              </p>
              <Link
                href={coursesHref}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "group mt-4 w-full",
                )}
              >
                Browse courses
                <FiArrowRight
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
              </Link>
            </div>
          </Reveal>
        </aside>
      </Container>

      <Section
        labelledBy="rel-courses"
        className="border-t border-border bg-secondary/40"
      >
        <SectionHeader
          id="rel-courses"
          title="Courses to get started"
          href={coursesHref}
          hrefLabel="See more"
        />

        {courses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course, i) => (
              <Reveal
                key={course.id}
                delay={Math.min(i * 0.06, 0.24)}
                className="h-full min-w-0"
              >
                <CourseCard course={course} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No courses published for this path yet"
            description="Browse the full catalog in the meantime."
          />
        )}
      </Section>

      <Section labelledBy="rel-jobs">
        <SectionHeader
          id="rel-jobs"
          title="Related openings"
          href="/jobs"
          hrefLabel="All jobs"
        />

        {jobs.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((job, i) => (
              <Reveal
                key={job.id}
                delay={Math.min(i * 0.06, 0.24)}
                className="h-full min-w-0"
              >
                <JobCard job={job} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching openings right now"
            description="New roles are posted regularly."
          />
        )}
      </Section>

      {/* Closing CTA, reusing routes already used elsewhere in the app */}
      <section
        aria-labelledby="career-cta-title"
        className="border-t border-border py-12 sm:py-14 lg:py-16"
      >
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-highlight/20 p-8 text-center shadow-sm dark:from-primary/15 dark:via-card dark:to-highlight/10 sm:p-12">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
              />
              <h2
                id="career-cta-title"
                className="mx-auto max-w-2xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
              >
                Ready to work toward {career.title}?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground sm:text-lg">
                Start with a course from this path, or create a free account to
                track your progress.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={coursesHref}
                  className={cn(buttonVariants({ size: "lg" }), "group")}
                >
                  Browse courses
                  <FiArrowRight
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  Create free account
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
