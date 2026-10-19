// app/(public)/technology/[slug]/page.jsx
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gauge,
  Hammer,
  HelpCircle,
  Layers,
  ListChecks,
  Route,
  Wrench,
} from "lucide-react";
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
import { ProgressLine, Reveal, Tilt } from "@/components/public/Reveal";
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

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

function Eyebrow({ children }) {
  return (
    <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
      <span aria-hidden="true" className="h-px w-6 bg-primary" />
      {children}
    </p>
  );
}

function Heading({ id, eyebrow, title, description }) {
  return (
    <div className="mb-10 max-w-2xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="mt-3 text-balance text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
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
    skills.length > 0 && {
      label: "Skills covered",
      value: skills.length,
      icon: Layers,
    },
    careers.length > 0 && {
      label: "Career paths",
      value: careers.length,
      icon: Briefcase,
    },
    tech.level && { label: "Level", value: tech.level, icon: Gauge },
    tech.duration && {
      label: "Typical time",
      value: tech.duration,
      icon: Clock,
    },
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
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:py-24">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="mb-7 text-sm text-muted-foreground"
            >
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link
                    href="/"
                    className={`rounded transition-colors hover:text-foreground motion-reduce:transition-none ${focusRing}`}
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/technology"
                    className={`rounded transition-colors hover:text-foreground motion-reduce:transition-none ${focusRing}`}
                  >
                    Technology
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-medium text-foreground">
                  {tech.title}
                </li>
              </ol>
            </nav>

            {MATURITY[tech.maturity] && (
              <Reveal>
                <Badge variant="secondary" className="mb-5">
                  {MATURITY[tech.maturity]}
                </Badge>
              </Reveal>
            )}

            <h1 className="text-balance text-[clamp(2.5rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight">
              {tech.title}
            </h1>

            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                {tech.summary}
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href={coursesHref}
                  className={buttonVariants({
                    size: "lg",
                    className: "group/btn min-h-11",
                  })}
                >
                  Explore courses
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
                <Link
                  href="#journey"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "min-h-11",
                  })}
                >
                  See the learning journey
                </Link>
              </div>
            </Reveal>

            {facts.length > 0 && (
              <Reveal delay={0.3}>
                <dl className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                  {facts.map((f) => (
                    <div
                      key={f.label}
                      className="min-w-0 rounded-xl border bg-card/80 p-4 shadow-sm"
                    >
                      <f.icon
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                      <dt className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {f.label}
                      </dt>
                      <dd className="mt-1 break-words text-xl font-semibold leading-tight">
                        {f.value}
                      </dd>
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
      <Container className="grid gap-14 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-16">
        <div className="min-w-0 space-y-16">
          <section aria-labelledby="what" id="overview">
            <Reveal>
              <Heading id="what" eyebrow="Overview" title="What it is" />
              <div className="max-w-prose text-base leading-8 text-muted-foreground sm:text-lg [&_p+p]:mt-4">
                <Paragraphs text={tech.whatItIs} />
              </div>
            </Reveal>
          </section>
          <section aria-labelledby="why">
            <Reveal>
              <Heading id="why" eyebrow="Context" title="Why it matters" />
              <div className="max-w-prose border-l-2 border-primary/40 pl-6 text-base leading-8 text-muted-foreground sm:text-lg [&_p+p]:mt-4">
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
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Wrench aria-hidden="true" className="size-5" />
                    </span>
                    <h2 id="skills-t" className="text-lg font-semibold">
                      Skills required
                    </h2>
                  </div>
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
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <ListChecks aria-hidden="true" className="size-5" />
                    </span>
                    <h2 className="text-lg font-semibold">Before you start</h2>
                  </div>
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
                    {prerequisites.map((p) => (
                      <li key={p} className="flex gap-3">
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-primary"
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
                <li key={s.id} className="relative pl-14">
                  <span className="absolute left-0 top-4 z-10 grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold tabular-nums text-primary-foreground shadow-md shadow-primary/20 ring-4 ring-background">
                    {i + 1}
                  </span>
                  <Reveal delay={0.05}>
                    <Tilt max={3}>
                      <a
                        href={`#${s.id}`}
                        className={`group flex items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-md motion-reduce:transition-none ${focusRing}`}
                      >
                        <span className="min-w-0">
                          <span className="block font-semibold">{s.title}</span>
                          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                            {s.text}
                          </span>
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary motion-reduce:transition-none"
                        />
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
                  <article className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 motion-reduce:transition-none sm:p-7">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Hammer aria-hidden="true" className="size-5" />
                      </span>
                      {p.level && <Badge variant="outline">{p.level}</Badge>}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] tabular-nums text-primary">
                      Project {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold leading-snug">
                      {p.title}
                    </h3>
                    {p.description && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
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
          <Heading
            id="faq"
            eyebrow="FAQ"
            title="Common questions"
            description={`Quick answers about ${tech.title}.`}
          />
          <div className="max-w-3xl space-y-3">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className="group rounded-xl border bg-card px-5 shadow-sm transition-colors hover:border-primary/30 open:border-primary/30 motion-reduce:transition-none sm:px-6"
              >
                <summary
                  className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-left font-medium focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden outline-none`}
                >
                  <span className="flex min-w-0 items-baseline gap-3">
                    <span
                      aria-hidden="true"
                      className="text-xs font-semibold tabular-nums text-primary"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{f.q}</span>
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 text-sm leading-7 text-muted-foreground sm:pl-8 sm:text-base">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </Section>
      )}

      {/* Closing call to action */}
      <Section labelledBy="cta-t">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl border bg-card p-8 shadow-sm sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 -z-10 size-72 rounded-full bg-primary/15 blur-3xl"
            />
            <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Route aria-hidden="true" className="size-6" />
            </span>
            <h2
              id="cta-t"
              className="mt-6 max-w-xl text-balance text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight"
            >
              Ready to start with {tech.title}?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pick a course, follow the journey above, or read more on the blog
              first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={coursesHref}
                className={buttonVariants({
                  size: "lg",
                  className: "group/btn min-h-11",
                })}
              >
                Browse courses
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover/btn:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
              <Link
                href="/blog"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "min-h-11",
                })}
              >
                <BookOpen aria-hidden="true" className="size-4" />
                Read the blog
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
