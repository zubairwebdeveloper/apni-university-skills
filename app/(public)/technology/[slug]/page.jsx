// app/(public)/technology/[slug]/page.jsx
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BlogCard } from "@/components/public/BlogCard";
import { CareerCard } from "@/components/public/CareerCard";
import { CourseCard } from "@/components/public/CourseCard";
import { JobCard } from "@/components/public/JobCard";
import {
  ProgressLine,
  Reveal,
  Tilt,
} from "@/components/public/Reveal";
import { SectionNav } from "@/components/public/SectionNav";
import { TechScene } from "@/components/public/TechScene";
import { technologyService } from "@/services/technologyService";
import { careerService } from "@/services/careerService";
import { courseService } from "@/services/courseService";
import { jobService } from "@/services/jobService";
import { blogService } from "@/services/blogService";
import { safe } from "@/lib/utils/safe";

export const revalidate = 300;
const getTech = cache((slug) => technologyService.getTechnologyBySlug(slug));

// Optional `maturity` field on a technology document.
const MATURITY = {
  established: "Established field",
  emerging: "Emerging field",
  experimental: "Experimental, still developing",
};

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

function Heading({ id, eyebrow, title, description }) {
  return (
    <div className="mb-8 max-w-2xl">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="text-balance text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-muted-foreground">{description}</p>
      )}
    </div>
  );
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

  const skills = tech.skills ?? [];
  const prerequisites = tech.prerequisites ?? [];
  const projects = tech.projects ?? [];
  const faqs = tech.faqs ?? [];
  const coursesHref = tech.categorySlug
    ? `/categories/${tech.categorySlug}`
    : "/courses";

  // Only real, optional fields are shown; nothing is invented.
  const facts = [
    skills.length > 0 && { label: "Skills covered", value: skills.length },
    careers.length > 0 && { label: "Career paths", value: careers.length },
    tech.level && { label: "Level", value: tech.level },
    tech.duration && { label: "Typical time", value: tech.duration },
  ].filter(Boolean);

  const journey = [
    {
      id: "overview",
      title: "Understand the topic",
      text: "Start with what it is and why it matters before choosing a course.",
    },
    courses.length > 0 && {
      id: "courses-t",
      title: "Learn with courses",
      text: "Structured courses from this category to build the fundamentals.",
    },
    projects.length > 0 && {
      id: "projects-t",
      title: "Build something real",
      text: "Practice the skills on projects instead of only reading about them.",
    },
    careers.length > 0 && {
      id: "careers-t",
      title: "See where it is used",
      text: "Roles that use these skills, so you can plan where to go next.",
    },
    jobs.length > 0 && {
      id: "jobs-t",
      title: "Check current openings",
      text: "Openings that list this skill right now.",
    },
    posts.length > 0 && {
      id: "posts-t",
      title: "Keep reading",
      text: "Articles that go deeper into the topic.",
    },
  ].filter(Boolean);

  const navItems = [
    { id: "overview", label: "Overview" },
    journey.length > 1 && { id: "journey", label: "Learning journey" },
    projects.length > 0 && { id: "projects-t", label: "Projects" },
    careers.length > 0 && { id: "careers-t", label: "Careers" },
    { id: "courses-t", label: "Courses" },
    { id: "jobs-t", label: "Jobs" },
    posts.length > 0 && { id: "posts-t", label: "Articles" },
    faqs.length > 0 && { id: "faq", label: "FAQ" },
  ].filter(Boolean);

  return (
    <>
      <style>{`html{scroll-padding-top:9rem}@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}`}</style>

      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 -z-10 size-[28rem] rounded-full bg-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-32 -z-10 size-80 rounded-full bg-primary/10 blur-3xl"
        />
        <Container className="grid items-center gap-10 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:py-20">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 text-sm text-muted-foreground"
            >
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link
                    href="/"
                    className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/technology"
                    className="rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Technology
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground">
                  {tech.title}
                </li>
              </ol>
            </nav>

            {MATURITY[tech.maturity] && (
              <Reveal>
                <Badge variant="secondary" className="mb-4">
                  {MATURITY[tech.maturity]}
                </Badge>
              </Reveal>
            )}

            <h1 className="text-balance text-[clamp(2.25rem,5.5vw,4.25rem)] font-semibold leading-[1.05] tracking-tight">
              {tech.title}
            </h1>

            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground">
                {tech.summary}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={coursesHref}
                  className={buttonVariants({ size: "lg" })}
                >
                  Explore courses
                </Link>
                <Link
                  href="#journey"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  See the learning journey
                </Link>
              </div>
            </Reveal>

            {facts.length > 0 && (
              <Reveal delay={0.3}>
                <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 border-t pt-6 sm:grid-cols-4">
                  {facts.map((f) => (
                    <div key={f.label}>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        {f.label}
                      </dt>
                      <dd className="mt-1 text-xl font-semibold">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>

          <div className="relative h-72 sm:h-96 lg:h-[30rem]">
            <TechScene
              nodeCount={skills.length || 6}
              className="absolute inset-0"
            />
          </div>
        </Container>
      </header>

      <SectionNav items={navItems} />

      {/* Overview */}
      <Container className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="what" id="overview">
            <Reveal>
              <Heading id="what" eyebrow="Overview" title="What it is" />
              <div className="max-w-prose">
                <Paragraphs text={tech.whatItIs} />
              </div>
            </Reveal>
          </section>
          <section aria-labelledby="why">
            <Reveal>
              <Heading id="why" eyebrow="Context" title="Why it matters" />
              <div className="max-w-prose">
                <Paragraphs text={tech.whyItMatters} />
              </div>
            </Reveal>
          </section>
        </div>

        {(skills.length > 0 || prerequisites.length > 0) && (
          <aside
            aria-label="Skills and prerequisites"
            className="space-y-6 lg:sticky lg:top-40 lg:self-start"
          >
            {skills.length > 0 && (
              <Reveal>
                <div className="rounded-2xl border bg-card p-6">
                  <h2 id="skills-t" className="mb-4 text-lg font-semibold">
                    Skills required
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <li key={s}>
                        <Badge variant="secondary">{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
            {prerequisites.length > 0 && (
              <Reveal delay={0.1}>
                <div className="rounded-2xl border bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold">
                    Before you start
                  </h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {prerequisites.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </aside>
        )}
      </Container>

      {/* Learning journey, built only from sections that have content */}
      {journey.length > 1 && (
        <Section labelledBy="journey-t" className="border-t bg-secondary/40">
          <span id="journey" />
          <Heading
            id="journey-t"
            eyebrow="Learning journey"
            title={`A path into ${tech.title}`}
            description="Follow the steps in order, or jump to the part you need."
          />
          <ProgressLine className="max-w-3xl">
            <ol className="space-y-6">
              {journey.map((s, i) => (
                <li key={s.id} className="relative pl-12">
                  <span className="absolute left-0 top-3 z-10 grid size-7 place-items-center rounded-full border bg-background text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <Reveal delay={0.05}>
                    <Tilt max={3}>
                      <a
                        href={`#${s.id}`}
                        className="group block rounded-xl border bg-card p-5 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <h3 className="font-semibold">{s.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {s.text}
                        </p>
                      </a>
                    </Tilt>
                  </Reveal>
                </li>
              ))}
            </ol>
          </ProgressLine>
        </Section>
      )}

      {/* Projects (optional `projects` field: [{ title, description, level }]) */}
      {projects.length > 0 && (
        <Section labelledBy="projects-t">
          <Heading
            id="projects-t"
            eyebrow="Build"
            title="Projects you can build"
            description="Practical work that applies the skills above."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal
                key={p.title}
                delay={Math.min(i, 3) * 0.07}
                className="h-full"
              >
                <Tilt className="h-full">
                  <article className="flex h-full flex-col rounded-2xl border bg-card p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Project {String(i + 1).padStart(2, "0")}
                      </span>
                      {p.level && <Badge variant="outline">{p.level}</Badge>}
                    </div>
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    {p.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </article>
                </Tilt>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {careers.length > 0 && (
        <Section labelledBy="careers-t" className="border-t bg-secondary/40">
          <SectionHeader
            id="careers-t"
            title="Career opportunities"
            href="/careers"
            hrefLabel="All careers"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((c, i) => (
              <Reveal
                key={c.id}
                delay={Math.min(i, 3) * 0.07}
                className="h-full"
              >
                <Tilt className="h-full">
                  <CareerCard career={c} />
                </Tilt>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      <Section labelledBy="courses-t">
        <SectionHeader
          id="courses-t"
          title="Related courses"
          href={coursesHref}
          hrefLabel="See more"
        />
        {courses.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((c, i) => (
              <Reveal
                key={c.id}
                delay={Math.min(i, 3) * 0.07}
                className="h-full"
              >
                <Tilt className="h-full">
                  <CourseCard course={c} />
                </Tilt>
              </Reveal>
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
            {jobs.map((j, i) => (
              <Reveal key={j.id} delay={Math.min(i, 3) * 0.07}>
                <JobCard job={j} />
              </Reveal>
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
            {posts.map((p, i) => (
              <Reveal
                key={p.id}
                delay={Math.min(i, 3) * 0.07}
                className="h-full"
              >
                <Tilt className="h-full">
                  <BlogCard post={p} />
                </Tilt>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ (optional `faqs` field: [{ q, a }]) */}
      {faqs.length > 0 && (
        <Section labelledBy="faq" className="border-t bg-secondary/40">
          <Heading id="faq" eyebrow="FAQ" title="Common questions" />
          <div className="max-w-3xl divide-y rounded-2xl border bg-card">
            {faqs.map((f) => (
              <details key={f.q} className="group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="text-xl text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>
      )}

      {/* Closing call to action */}
      <Section labelledBy="cta-t">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl border bg-card p-8 sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 -z-10 size-72 rounded-full bg-primary/15 blur-3xl"
            />
            <h2
              id="cta-t"
              className="max-w-xl text-balance text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight tracking-tight"
            >
              Ready to start with {tech.title}?
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Pick a course, follow the journey above, or read more on the blog
              first.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={coursesHref}
                className={buttonVariants({ size: "lg" })}
              >
                Browse courses
              </Link>
              <Link
                href="/blog"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Read the blog
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
