// app/(public)/technology/[slug]/page.jsx
import { cache } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BlogCard } from "@/components/public/BlogCard";
import { CareerCard } from "@/components/public/CareerCard";
import { CourseCard } from "@/components/public/CourseCard";
import { JobCard } from "@/components/public/JobCard";
import { technologyService } from "@/services/technologyService";
import { careerService } from "@/services/careerService";
import { courseService } from "@/services/courseService";
import { jobService } from "@/services/jobService";
import { blogService } from "@/services/blogService";
import { safe } from "@/lib/utils/safe";

export const revalidate = 300;
const getTech = cache((slug) => technologyService.getTechnologyBySlug(slug));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = await safe(getTech(slug), null);
  if (!t) return { title: "Topic not found", robots: { index: false } };
  return {
    title: t.title,
    description: t.summary,
    alternates: { canonical: `/technology/${t.slug}` },
    openGraph: {
      title: t.title,
      description: t.summary,
      url: `/technology/${t.slug}`,
    },
  };
}

export default async function TechnologyDetailPage({ params }) {
  const { slug } = await params;
  const tech = await getTech(slug);
  if (!tech) notFound();

  const [careers, courses, jobs, posts] = await Promise.all([
    safe(careerService.getCareersBySlugs(tech.careerSlugs ?? []), []),
    safe(courseService.getCoursesByCategorySlug(tech.categorySlug, 4), []),
    safe(jobService.getJobsBySkill(tech.jobSkill, 4), []),
    safe(blogService.getLatestPosts(3, { tag: tech.articleTag }), []),
  ]);

  return (
    <>
      <PageHeader
        title={tech.title}
        description={tech.summary}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Technology", href: "/technology" },
          { label: tech.title },
        ]}
      />
      <Container className="grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-12">
          <section aria-labelledby="what">
            <h2 id="what" className="mb-4 text-2xl">
              What it is
            </h2>
            <Paragraphs text={tech.whatItIs} />
          </section>
          <section aria-labelledby="why">
            <h2 id="why" className="mb-4 text-2xl">
              Why it matters
            </h2>
            <Paragraphs text={tech.whyItMatters} />
          </section>
        </div>
        {tech.skills?.length > 0 && (
          <aside
            aria-labelledby="skills-t"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <h2 id="skills-t" className="mb-4 text-lg">
              Skills required
            </h2>
            <ul className="flex flex-wrap gap-2">
              {tech.skills.map((s) => (
                <li key={s}>
                  <Badge variant="secondary">{s}</Badge>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </Container>

      {careers.length > 0 && (
        <Section labelledBy="careers-t" className="border-t bg-secondary/40">
          <SectionHeader
            id="careers-t"
            title="Career opportunities"
            href="/careers"
            hrefLabel="All careers"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((c) => (
              <CareerCard key={c.id} career={c} />
            ))}
          </div>
        </Section>
      )}

      <Section labelledBy="courses-t">
        <SectionHeader
          id="courses-t"
          title="Related courses"
          href={
            tech.categorySlug ? `/categories/${tech.categorySlug}` : "/courses"
          }
          hrefLabel="See more"
        />
        {courses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        ) : (
          <EmptyState title="No courses published for this topic yet" />
        )}
      </Section>

      <Section labelledBy="jobs-t" className="bg-secondary/40">
        <SectionHeader
          id="jobs-t"
          title="Related jobs"
          href="/jobs"
          hrefLabel="All jobs"
        />
        {jobs.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <EmptyState title="No matching openings right now" />
        )}
      </Section>

      {posts.length > 0 && (
        <Section labelledBy="posts-t">
          <SectionHeader
            id="posts-t"
            title="Related articles"
            href="/blog"
            hrefLabel="Read the blog"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
