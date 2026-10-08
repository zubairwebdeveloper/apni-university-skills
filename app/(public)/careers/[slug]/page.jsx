// app/(public)/careers/[slug]/page.jsx

import { cache } from "react";

import { notFound } from "next/navigation";

import { FiCheck } from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
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
      <li key={item} className="flex gap-3 text-sm">
        <FiCheck
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>{item}</span>
      </li>
    ))}
  </ul>
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
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="overview">
            <h2 id="overview" className="mb-4 text-2xl">
              What this role does
            </h2>

            <Paragraphs text={career.description} />
          </section>

          {career.roadmap?.length > 0 && (
            <section aria-labelledby="roadmap">
              <h2 id="roadmap" className="mb-5 text-2xl">
                Roadmap
              </h2>

              <ol className="space-y-5 border-l pl-6">
                {career.roadmap.map((step, index) => (
                  <li key={step.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[2.15rem] grid size-6 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                    >
                      {index + 1}
                    </span>

                    <h3 className="font-serif text-lg font-semibold">
                      {step.title}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {step.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {career.interviewPrep?.length > 0 && (
            <section aria-labelledby="interview">
              <h2 id="interview" className="mb-4 text-2xl">
                Interview preparation
              </h2>

              <Checklist items={career.interviewPrep} />
            </section>
          )}

          {career.portfolioIdeas?.length > 0 && (
            <section aria-labelledby="portfolio">
              <h2 id="portfolio" className="mb-4 text-2xl">
                Portfolio ideas
              </h2>

              <Checklist items={career.portfolioIdeas} />
            </section>
          )}

          {career.freelanceNotes && (
            <section aria-labelledby="freelance">
              <h2 id="freelance" className="mb-4 text-2xl">
                Freelancing and remote work
              </h2>

              <Paragraphs text={career.freelanceNotes} />
            </section>
          )}

          {career.jobRoles?.length > 0 && (
            <section aria-labelledby="roles">
              <h2 id="roles" className="mb-4 text-2xl">
                Job titles to look for
              </h2>

              <ul className="flex flex-wrap gap-2">
                {career.jobRoles.map((role) => (
                  <li key={role}>
                    <Badge variant="outline">{role}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasSalary && (
            <section aria-labelledby="salary">
              <h2 id="salary" className="mb-4 text-2xl">
                Typical annual salary
              </h2>

              <p className="text-sm font-medium">
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
            </section>
          )}
        </div>

        {career.skills?.length > 0 && (
          <aside
            aria-labelledby="skills"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <h2 id="skills" className="mb-4 text-lg">
              Key skills
            </h2>

            <ul className="flex flex-wrap gap-2">
              {career.skills.map((skill) => (
                <li key={skill}>
                  <Badge variant="secondary">{skill}</Badge>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </Container>

      <Section labelledBy="rel-courses" className="border-t bg-secondary/40">
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
    </>
  );
}
