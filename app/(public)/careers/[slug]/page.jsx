// app/(public)/careers/[slug]/page.jsx

import { cache } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  FiBriefcase,
  FiCheck,
  FiDollarSign,
  FiFolder,
  FiGlobe,
  FiMap,
  FiMessageCircle,
  FiTag,
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

import { careerService } from "@/services/careerService";
import { courseService } from "@/services/courseService";
import { jobService } from "@/services/jobService";

import { safe } from "@/lib/utils/safe";
import { formatPrice } from "@/lib/utils/format";

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

const Checklist = ({ items }) => (
  <ul className="space-y-3">
    {items.map((item) => (
      <li key={item} className="flex gap-3 text-sm text-foreground">
        <FiCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// Small wrapper so every content section shares the same card treatment
// and an icon that reinforces what the section is about.
const SectionCard = ({ id, icon: Icon, title, children }) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-7"
  >
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <h2 id={`${id}-title`} className="text-xl text-foreground sm:text-2xl">
        {title}
      </h2>
    </div>
    {children}
  </section>
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

      <Container className="grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-8">
          {pageSections.length > 1 && (
            <nav
              aria-label="On this page"
              className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-3"
            >
              {pageSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          )}

          <SectionCard
            id="overview"
            icon={FiBriefcase}
            title="What this role does"
          >
            <Paragraphs text={career.description} />
          </SectionCard>

          {career.roadmap?.length > 0 && (
            <SectionCard id="roadmap" icon={FiMap} title="Roadmap">
              <ol className="space-y-5 border-l border-border pl-6">
                {career.roadmap.map((step, index) => (
                  <li key={step.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.15rem] grid size-6 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                    >
                      {index + 1}
                    </span>

                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
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
              <Paragraphs text={career.freelanceNotes} />
            </SectionCard>
          )}

          {career.jobRoles?.length > 0 && (
            <SectionCard id="roles" icon={FiTag} title="Job titles to look for">
              <ul className="flex flex-wrap gap-2">
                {career.jobRoles.map((role) => (
                  <li key={role}>
                    <Badge variant="outline">{role}</Badge>
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
              <p className="text-lg font-semibold text-foreground">
                {career.salary.min != null
                  ? formatPrice(career.salary.min, career.salary.currency)
                  : "—"}{" "}
                –{" "}
                {career.salary.max != null
                  ? formatPrice(career.salary.max, career.salary.currency)
                  : "—"}
              </p>

              {career.salary.note && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {career.salary.note}
                </p>
              )}
            </SectionCard>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {career.skills?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 text-lg text-foreground">Key skills</h2>
              <ul className="flex flex-wrap gap-2">
                {career.skills.map((skill) => (
                  <li key={skill}>
                    <Badge variant="secondary">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick facts: real counts from the data already fetched below,
              not invented figures. */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 text-lg text-foreground">Quick facts</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Courses to start with</dt>
                <dd className="font-semibold text-foreground">
                  {courses.length}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Open roles right now</dt>
                <dd className="font-semibold text-foreground">{jobs.length}</dd>
              </div>
              {hasSalary && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Salary range</dt>
                  <dd className="font-semibold text-foreground">
                    {career.salary.min != null
                      ? formatPrice(career.salary.min, career.salary.currency)
                      : "—"}
                    {" – "}
                    {career.salary.max != null
                      ? formatPrice(career.salary.max, career.salary.currency)
                      : "—"}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </Container>

      <Section
        labelledBy="rel-courses"
        className="border-t border-border bg-secondary/40"
      >
        <SectionHeader
          id="rel-courses"
          title="Courses to get started"
          href={
            career.categorySlug
              ? `/categories/${career.categorySlug}`
              : "/courses"
          }
          hrefLabel="See more"
        />

        {courses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
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
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
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
      <section className="border-t border-border py-12 sm:py-14">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-highlight/20 p-6 text-center dark:from-primary/15 dark:via-card dark:to-highlight/10 sm:p-10">
            <h2 className="text-2xl text-foreground sm:text-3xl">
              Ready to work toward {career.title}?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Start with a course from this path, or create a free account to
              track your progress.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={
                  career.categorySlug
                    ? `/categories/${career.categorySlug}`
                    : "/courses"
                }
                className={buttonVariants({ size: "lg" })}
              >
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
    </>
  );
}
