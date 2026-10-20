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
import { levelLabel } from "@/config/courses";
import { formatCompact } from "@/lib/utils/format";
import { NewsletterForm } from "./NewsletterForm";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
// `apni-landing` activates the shared colour tokens (#111318 surface, #FACC15
// primary, violet accent). HeroSection and TechStrip already emit that CSS,
// so it is on the page whenever they are. If these sections are ever used
// without them, move THEME_CSS (see HeroSection.jsx) into globals.css.
const SCOPE = "apni-landing bg-background text-foreground";
const TINT = "apni-landing bg-muted/40 text-foreground border-y border-border";

const VIOLET = "text-[color:var(--violet)]";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
// Overlay badges that sit on top of linked cards.
const BADGE_SOLID =
  "pointer-events-none absolute rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm";
const BADGE_SOFT =
  "pointer-events-none absolute rounded-full border border-border bg-card/95 px-2.5 py-1 text-xs font-semibold tabular-nums text-foreground shadow-sm backdrop-blur-sm";
// Whole-card links: only the border reacts, so the card itself stays still.
const CARD_LINK = `group relative block rounded-2xl ${FOCUS}`;
const PANEL =
  "rounded-2xl border border-border bg-card p-6 text-card-foreground transition-colors duration-200 hover:border-primary/60 motion-reduce:transition-none";

const grid = (cols) => `grid gap-5 sm:grid-cols-2 ${cols}`;

/* ------------------------------------------------------------------ */
/* Browse by technology                                                */
/* ------------------------------------------------------------------ */
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

function TechChips({ label = "Browse by technology" }) {
  return (
    <nav aria-label={label} className="mb-10">
      <p className="mb-3 text-sm font-medium text-muted-foreground">{label}</p>
      <ul className="flex flex-wrap gap-2.5">
        {popularTech.map((t) => (
          <li key={t}>
            <Link
              href={`/courses?q=${encodeURIComponent(t)}`}
              className={`group inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors duration-200 hover:border-primary/60 hover:bg-muted motion-reduce:transition-none ${FOCUS}`}
            >
              {t}
              <FiArrowRight
                className="size-3.5 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */
// Real figures only. Pass `stats` ([{ label, value }]) from your API; the bar
// is hidden when there is nothing to show, so no invented numbers appear.
function TrustBar({ stats }) {
  if (!Array.isArray(stats) || !stats.length) return null;

  return (
    <dl className="mb-12 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card px-6 py-5 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center sm:text-left">
          <dt className="text-xs text-muted-foreground">{s.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-primary">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function PopularCategories({ categories, stats = [] }) {
  return (
    <Section labelledBy="categories-title" className={SCOPE}>
      <SectionHeader
        id="categories-title"
        eyebrow="Explore"
        title="Popular categories"
        description="Pick a field and see only the courses that belong to it. Course counts update as new lessons publish."
        href="/categories"
        hrefLabel="All categories"
      />
      <TrustBar stats={stats} />
      {categories.length ? (
        <Stagger className={grid("lg:grid-cols-4")}>
          {categories.map((category) => (
            <StaggerItem key={category.id}>
              <CategoryCard category={category} />
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

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

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
          {courses.map((course, i) => (
            <StaggerItem key={course.id}>
              <div className="relative h-full">
                <CourseCard course={course} priority={i < 2} />

                {course.level && (
                  <span className={`${BADGE_SOLID} left-3 top-3`}>
                    {levelLabel(course.level)}
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={FiBookOpen}
          title="Courses are coming soon"
          description="New courses are being prepared. Create an account to be ready on day one."
          action={
            <Link
              href="/register"
              className={buttonVariants({ variant: "outline" })}
            >
              Create free account
            </Link>
          }
        />
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */
// This is a real sequence, so the step numbers stay.
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
    <Section labelledBy="how-title" className={SCOPE}>
      <SectionHeader
        id="how-title"
        eyebrow="How it works"
        title="From first lesson to first job in four steps"
        description="No fixed schedule. Move through the steps at whatever pace fits your week."
        center
      />
      <div className="relative">
        {/* Connecting line behind the cards on large screens */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] right-[12%] top-[2.75rem] hidden h-px bg-border lg:block"
        />
        <Stagger
          as="ol"
          className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <div className={`group h-full ${PANEL}`}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span
                      aria-hidden="true"
                      className={`font-mono text-sm tabular-nums ${VIOLET}`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
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

/* ------------------------------------------------------------------ */
/* Platform features                                                   */
/* ------------------------------------------------------------------ */
const platformFeatures = [
  {
    icon: FiTool,
    title: "Project-based curriculum",
    text: "Every module ships a real build, not a quiz. The kind of work you can put in a portfolio.",
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
              <div className={`h-full ${PANEL}`}>
                <span
                  className={`grid size-11 place-items-center rounded-xl bg-[color:var(--violet)]/10 ${VIOLET}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
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

/* ------------------------------------------------------------------ */
/* Jobs                                                                */
/* ------------------------------------------------------------------ */

export function JobsSection({ jobs }) {
  return (
    <Section labelledBy="jobs-title" className={SCOPE}>
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
          {jobs.map((job) => (
            <StaggerItem key={job.id}>
              <div className="relative h-full">
                <JobCard job={job} />

                {job.remote && (
                  <span className={`${BADGE_SOFT} right-4 top-4`}>Remote</span>
                )}
              </div>
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

/* ------------------------------------------------------------------ */
/* Instructors                                                         */
/* ------------------------------------------------------------------ */

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
          {instructors.map((instructor) => (
            <StaggerItem key={instructor.id}>
              <div className="relative h-full">
                <InstructorCard instructor={instructor} />

                {/* Exact count, no "+", so a small number is never overstated. */}
                {instructor.studentCount != null && (
                  <span className={`${BADGE_SOLID} right-3 top-3`}>
                    {formatCompact(instructor.studentCount)}{" "}
                    {instructor.studentCount === 1 ? "student" : "students"}
                  </span>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <EmptyState
          icon={FiUsers}
          title="Instructors joining soon"
          description="We're onboarding practitioners now. Their profiles will appear here."
        />
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Reviews + blog                                                      */
/* ------------------------------------------------------------------ */
// Hidden entirely when there are no approved reviews. We never show fabricated testimonials.
export function Testimonials({ reviews }) {
  if (!reviews.length) return null;
  return (
    <Section labelledBy="reviews-title" className={SCOPE}>
      <SectionHeader
        id="reviews-title"
        eyebrow="Student success"
        title="What our students say"
        center
      />
      <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <StaggerItem key={r.id} className="min-w-0">
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
    <Section labelledBy={id} className={tinted ? TINT : SCOPE}>
      <SectionHeader
        id={id}
        eyebrow={eyebrow}
        title={title}
        description={description}
        href="/blog"
        hrefLabel="Read the blog"
      />

      <Stagger className="grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <StaggerItem key={post.id}>
            <div className="relative h-full">
              <BlogCard post={post} />

              {post.readingMinutes != null && (
                <span className={`${BADGE_SOFT} left-3 top-3`}>
                  {post.readingMinutes} min read
                </span>
              )}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
// Short answers to the questions that stop someone from signing up.
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
    <Section labelledBy="faq-title" className={SCOPE}>
      <SectionHeader
        id="faq-title"
        eyebrow="Questions"
        title="Before you start"
        center
      />
      <div className="mx-auto max-w-2xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {faqs.map((item) => (
          <details key={item.q} className="group">
            <summary
              className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-card-foreground transition-colors hover:bg-muted/60 motion-reduce:transition-none [&::-webkit-details-marker]:hidden ${FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
            >
              {item.q}
              <FiArrowRight
                className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </summary>
            <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */
// Pass a subscribe server action from the page:
//   <NewsletterSection action={subscribeToNewsletter} />
// It receives ({ email }) and returns { ok, error?, message? }.
// Without an action the section is hidden, so visitors never see a form that
// cannot work.
export function NewsletterSection({ action }) {
  if (typeof action !== "function") return null;

  return (
    <Section labelledBy="newsletter-title" className={TINT}>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
          <FiMail className="size-5" aria-hidden="true" />
        </span>
        <h2
          id="newsletter-title"
          className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          New courses, every other week
        </h2>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          One short email when a course, roadmap or job worth knowing about goes
          live. No spam.
        </p>

        <NewsletterForm action={action} />

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <FiCheckCircle className="size-3.5 text-primary" aria-hidden="true" />
          Unsubscribe anytime, one click.
        </p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing call to action                                              */
/* ------------------------------------------------------------------ */
export function CtaBanner() {
  return (
    <section aria-labelledby="cta-title" className={`${SCOPE} py-16 sm:py-20`}>
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center text-card-foreground shadow-xl shadow-black/10 sm:px-12 sm:py-16">
          {/* Accent edge and a fine grid texture, both decorative */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-1 bg-primary"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <h2
            id="cta-title"
            className="mx-auto max-w-2xl text-balance text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.025em]"
          >
            Build your first project this week
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            Create a free account, choose a technology and start with a lesson
            that ends in something you can run.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              Create free account
            </Link>
            <Link
              href="/courses"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Browse courses
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Free to join. No card required, no trial to remember to cancel.
          </p>
        </div>
      </Container>
    </section>
  );
}
