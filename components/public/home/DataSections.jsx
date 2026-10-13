import Link from "next/link";
import {
  FiAward,
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiGrid,
  FiSearch,
  FiTool,
  FiUsers,
} from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import Container, { Section } from "@/components/layout/Container";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CategoryCard } from "@/components/public/CategoryCard";
import { CourseCard } from "@/components/public/CourseCard";
import { InstructorCard } from "@/components/public/InstructorCard";
import { JobCard } from "@/components/public/JobCard";
import { BlogCard } from "@/components/public/BlogCard";
import { ReviewCard } from "@/components/public/ReviewCard";

const grid = (cols) => `grid gap-5 sm:grid-cols-2 ${cols}`;

// Subtle tinted band used to alternate sections in both themes.
const TINT = "bg-muted/40 border-y border-border/60";

// Technologies we teach. Each chip opens the course list filtered by that name.
const popularTech = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "Node.js",
  "Firebase",
  "Python",
  "TensorFlow",
  "Docker",
];

// Quick links to search the catalog by technology.
function TechChips({ label = "Browse by technology" }) {
  return (
    <nav aria-label={label} className="mb-10">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-wrap gap-2.5">
        {popularTech.map((t) => (
          <li key={t}>
            <Link
              href={`/courses?q=${encodeURIComponent(t)}`}
              className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              {t}
              <FiArrowRight
                className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PopularCategories({ categories }) {
  return (
    <Section aria-labelledby="categories-title">
      <SectionHeader
        id="cats-title"
        eyebrow="Explore"
        title="Popular categories"
        description="Pick a field and see only the courses that belong to it."
        href="/categories"
        hrefLabel="All categories"
      />
      {categories.length ? (
        <Stagger className={grid("lg:grid-cols-4")}>
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              <CategoryCard category={c} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={FiGrid}
          title="Categories are on the way"
          description="We're organizing our catalog. Check back soon."
        />
      )}
    </Section>
  );
}

export function FeaturedCourses({ courses }) {
  return (
    <Section labelledBy="courses-title" className={TINT}>
      <SectionHeader
        id="courses-title"
        eyebrow="Featured"
        title="Start with our featured courses"
        description="Hands-on courses designed around real projects."
        href="/courses"
        hrefLabel="Browse all courses"
      />
      <TechChips />
      {courses.length ? (
        <Stagger className={grid("lg:grid-cols-3 xl:grid-cols-4")}>
          {courses.map((c, i) => (
            <StaggerItem key={c.id}>
              <CourseCard course={c} priority={i < 2} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={FiBookOpen}
          title="Courses are coming soon"
          description="New courses are being prepared. Create an account to be ready on day one."
          
        />
      )}
    </Section>
  );
}

// Static content: explains the learning flow from first lesson to first job.
const steps = [
  {
    icon: FiSearch,
    title: "Pick a technology",
    text: "Search by name, such as React or Python, or follow a roadmap.",
  },
  {
    icon: FiTool,
    title: "Build a real project",
    text: "Every course ends with something you can run, show and explain.",
  },
  {
    icon: FiAward,
    title: "Show what you can do",
    text: "Collect finished projects that prove your skills to employers.",
  },
  {
    icon: FiBriefcase,
    title: "Apply for roles",
    text: "Use what you built to apply for jobs and internships on the platform.",
  },
];

export function HowItWorks() {
  return (
    <Section labelledBy="how-title">
      <SectionHeader
        id="how-title"
        eyebrow="How it works"
        title="From first lesson to first job in four steps"
        center
      />
      <div className="relative">
        {/* Connecting line behind the cards on large screens */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] right-[12%] top-[2.75rem] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
        />
        <Stagger
          as="ol"
          className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <div className="group relative h-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-sm tabular-nums text-muted-foreground"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}

export function JobsSection({ jobs }) {
  return (
    <Section labelledBy="jobs-title">
      <SectionHeader
        id="jobs-title"
        eyebrow="Opportunities"
        title="Jobs & internships"
        description="Put your skills to work with roles from our listings."
        href="/jobs"
        hrefLabel="All jobs"
      />
      {jobs.length ? (
        <Stagger className="grid gap-4 lg:grid-cols-2">
          {jobs.map((j) => (
            <StaggerItem key={j.id}>
              <JobCard job={j} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={FiBriefcase}
          title="No open positions right now"
          description="New roles are posted regularly."
          action={
            <Link
              href="/careers"
              className={buttonVariants({ variant: "outline" })}
            >
              Explore career paths
            </Link>
          }
        />
      )}
    </Section>
  );
}

export function FeaturedInstructors({ instructors }) {
  return (
    <Section labelledBy="inst-title" className={TINT}>
      <SectionHeader
        id="inst-title"
        eyebrow="Learn from the best"
        title="Featured instructors"
        href="/instructors"
        hrefLabel="All instructors"
      />
      {instructors.length ? (
        <Stagger className={grid("lg:grid-cols-4")}>
          {instructors.map((i) => (
            <StaggerItem key={i.id}>
              <InstructorCard instructor={i} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState icon={FiUsers} title="Instructors joining soon" />
      )}
    </Section>
  );
}

// Hidden entirely when there are no approved reviews. We never show fabricated testimonials.
export function Testimonials({ reviews }) {
  if (!reviews.length) return null;
  return (
    <Section labelledBy="reviews-title">
      <SectionHeader
        id="reviews-title"
        eyebrow="Student success"
        title="What our students say"
        center
      />
      <Stagger className="grid gap-5 md:grid-cols-3">
        {reviews.map((r) => (
          <StaggerItem key={r.id}>
            <ReviewCard review={r} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function BlogSection({
  id,
  title,
  eyebrow,
  description,
  posts,
  tinted = false,
}) {
  if (!posts.length) return null;
  return (
    <Section labelledBy={id} className={tinted ? TINT : ""}>
      <SectionHeader
        id={id}
        eyebrow={eyebrow}
        title={title}
        description={description}
        href="/blog"
        hrefLabel="Read the blog"
      />
      <Stagger className="grid gap-5 md:grid-cols-3">
        {posts.map((p) => (
          <StaggerItem key={p.id}>
            <BlogCard post={p} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

// Closing call to action at the bottom of the home page.
export function CtaBanner() {
  return (
    <section aria-labelledby="cta-title" className="py-16 sm:py-20">
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-primary px-6 py-14 text-center text-primary-foreground shadow-xl sm:px-12 sm:py-16">
          {/* Fine grid texture, purely decorative */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <span
            className="pointer-events-none absolute -left-20 -top-20 -z-10 size-64 rounded-full bg-primary-foreground/10 blur-3xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-24 -right-16 -z-10 size-72 rounded-full bg-primary-foreground/10 blur-3xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <h2
            id="cta-title"
            className="mx-auto max-w-2xl text-balance text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-tight tracking-tight"
          >
            Build your first project this week
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-primary-foreground/90 sm:text-lg">
            Create a free account, choose a technology and start with a lesson
            that ends in something you can run.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Create free account
            </Link>
            <Link
              href="/courses"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className:
                  "border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
              })}
            >
              Browse courses
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
