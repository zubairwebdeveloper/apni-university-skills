import Link from "next/link";
import {
  FiAward,
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiGrid,
  FiMail,
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
              className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:border-pink-400 hover:text-pink-600 hover:shadow-md focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:text-pink-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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

// Quick trust signal shown directly under the categories header.
// Purely numeric copy — swap for live counts whenever the API exposes them.
const trustStats = [
  { label: "Active learners", value: "40K+" },
  { label: "Hands-on courses", value: "350+" },
  { label: "Hiring partners", value: "120+" },
  { label: "Avg. course rating", value: "4.8/5" },
];

function TrustBar() {
  return (
    <dl className="mb-12 grid grid-cols-2 gap-6 border-y border-border/60 py-6 sm:grid-cols-4">
      {trustStats.map((s) => (
        <div key={s.label} className="text-center sm:text-left">
          <dt className="text-xs text-muted-foreground">{s.label}</dt>
          {/* Figures are the one spot that takes the pink accent, so they read as data, not decoration. */}
          <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-pink-600 dark:text-pink-400">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Shown under each category name — gives a reason to click beyond the label alone.
function formatCourseCount(n) {
  if (n == null) return null;
  return `${n} ${n === 1 ? "course" : "courses"}`;
}

export function PopularCategories({ categories }) {
  return (
    <Section aria-labelledby="categories-title">
      <SectionHeader
        id="cats-title"
        eyebrow="Explore"
        title="Popular categories"
        description="Pick a field and see only the courses that belong to it — course counts update as new lessons publish."
        href="/categories"
        hrefLabel="All categories"
      />
      <TrustBar />
      {categories.length ? (
        <Stagger className={grid("lg:grid-cols-4")}>
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              {/* Route by slug so the URL stays stable even if the category is renamed. */}
              <Link
                href={`/categories/${c.slug}`}
                className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <CategoryCard category={c} />
                {c.courseCount != null && (
                  <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-pink-600 ring-1 ring-pink-200 transition-transform group-hover:scale-105 dark:bg-pink-500/10 dark:text-pink-400 dark:ring-pink-500/20 motion-reduce:transition-none">
                    {formatCourseCount(c.courseCount)}
                  </span>
                )}
              </Link>
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
              {/* Route by slug, not id, so links stay readable and stable. */}
              <Link
                href={`/courses/${c.slug}`}
                className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <CourseCard course={c} priority={i < 2} />
                {c.level && (
                  <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-pink-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-transform group-hover:scale-105 motion-reduce:transition-none">
                    {c.level}
                  </span>
                )}
              </Link>
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
        description="No fixed schedule — move through the steps at whatever pace fits your week."
        center
      />
      <div className="relative">
        {/* Connecting line behind the cards on large screens */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] right-[12%] top-[2.75rem] hidden h-px bg-gradient-to-r from-transparent via-pink-300/60 to-transparent lg:block dark:via-pink-500/30"
        />
        <Stagger
          as="ol"
          className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <div className="group relative h-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:border-pink-400/70 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-pink-600 text-white ring-1 ring-pink-600/20 transition-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-mono text-sm tabular-nums text-pink-600 dark:text-pink-400"
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

// New: what the platform actually includes beyond video lessons.
const platformFeatures = [
  {
    icon: FiTool,
    title: "Project-based curriculum",
    text: "Every module ships a real build, not a quiz — the kind of work you can put in a portfolio.",
  },
  {
    icon: FiUsers,
    title: "Code review from mentors",
    text: "Submit your project and get specific, written feedback from someone who ships code for a living.",
  },
  {
    icon: FiAward,
    title: "Verified certificates",
    text: "Each certificate links back to the project behind it, so employers can see the work, not just the title.",
  },
  {
    icon: FiBriefcase,
    title: "Direct line to hiring partners",
    text: "Finish a track and your profile becomes visible to the companies posting on our jobs board.",
  },
];

export function PlatformFeatures() {
  return (
    <Section labelledBy="features-title" className={TINT}>
      <SectionHeader
        id="features-title"
        eyebrow="Why this platform"
        title="Built around proof of work, not watch time"
        description="Four things that separate finishing a course here from finishing a video playlist."
        center
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {platformFeatures.map((f) => {
          const Icon = f.icon;
          return (
            <StaggerItem key={f.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:border-pink-400/70 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="grid size-11 place-items-center rounded-xl bg-pink-600/10 text-pink-600 ring-1 ring-pink-600/20 dark:text-pink-400">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {f.text}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
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
        description={
          jobs.length
            ? `${jobs.length} open role${jobs.length === 1 ? "" : "s"} from companies hiring our graduates right now.`
            : "Put your skills to work with roles from our listings."
        }
        href="/jobs"
        hrefLabel="All jobs"
      />
      {jobs.length ? (
        <Stagger className="grid gap-4 lg:grid-cols-2">
          {jobs.map((j) => (
            <StaggerItem key={j.id}>
              <Link
                href={`/jobs/${j.slug}`}
                className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <JobCard job={j} />
                {j.remote && (
                  <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-600 ring-1 ring-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:ring-pink-500/20">
                    Remote
                  </span>
                )}
              </Link>
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
        description="Practitioners who still build, teaching from current work rather than old slides."
        href="/instructors"
        hrefLabel="All instructors"
      />
      {instructors.length ? (
        <Stagger className={grid("lg:grid-cols-4")}>
          {instructors.map((i) => (
            <StaggerItem key={i.id}>
              <Link
                href={`/instructors/${i.slug}`}
                className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <InstructorCard instructor={i} />
                {i.studentCount != null && (
                  <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-pink-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-transform group-hover:scale-105 motion-reduce:transition-none">
                    {i.studentCount}+ students
                  </span>
                )}
              </Link>
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
            <Link
              href={`/blog/${p.slug}`}
              className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <BlogCard post={p} />
              {p.readingMinutes != null && (
                <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-600 ring-1 ring-pink-200 dark:bg-pink-500/10 dark:text-pink-400 dark:ring-pink-500/20">
                  {p.readingMinutes} min read
                </span>
              )}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

// New: short answers to the questions that stop someone from signing up.
const faqs = [
  {
    q: "Do I need coding experience to start?",
    a: "No. Every track has a beginner entry point, and each lesson explains the why before the how.",
  },
  {
    q: "Can I learn at my own pace?",
    a: "Yes. Courses stay available after you start them, and nothing expires while your account is active.",
  },
  {
    q: "Will I get a certificate?",
    a: "Finished courses add a certificate and a project to your profile, both shareable with employers.",
  },
  {
    q: "Is the jobs board open to beginners?",
    a: "Many listings are internships and junior roles, and your finished projects count toward applying.",
  },
];

export function FaqSection() {
  return (
    <Section labelledBy="faq-title">
      <SectionHeader
        id="faq-title"
        eyebrow="Questions"
        title="Before you start"
        center
      />
      <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border bg-card">
        {faqs.map((item) => (
          <details key={item.q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-card-foreground">
              {item.q}
              <FiArrowRight
                className="size-4 shrink-0 text-pink-600 transition-transform group-open:rotate-90 dark:text-pink-400 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

// New: lightweight newsletter capture above the closing CTA.
export function NewsletterSection() {
  return (
    <Section labelledBy="newsletter-title" className={TINT}>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <span className="grid size-11 place-items-center rounded-xl bg-pink-600 text-white ring-1 ring-pink-600/20">
          <FiMail className="size-5" aria-hidden="true" />
        </span>
        <h2
          id="newsletter-title"
          className="text-2xl font-semibold tracking-tight"
        >
          New courses, every other week
        </h2>
        <p className="text-sm text-muted-foreground">
          One short email when a course, roadmap or job worth knowing about goes
          live. No spam.
        </p>
        <form className="flex w-full max-w-sm flex-col gap-2.5 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm text-card-foreground outline-none transition-colors focus-visible:border-pink-400 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-full bg-pink-600 px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-pink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Subscribe
          </button>
        </form>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FiCheckCircle className="size-3.5" aria-hidden="true" />
          Unsubscribe anytime, one click.
        </p>
      </div>
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
            className="pointer-events-none absolute -left-20 -top-20 -z-10 size-64 rounded-full bg-pink-400/20 blur-3xl motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-24 -right-16 -z-10 size-72 rounded-full bg-pink-500/20 blur-3xl motion-safe:animate-pulse"
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
          <p className="mt-6 text-xs text-primary-foreground/75">
            Free to join — no card required, no trial to remember to cancel.
          </p>
        </div>
      </Container>
    </section>
  );
}
