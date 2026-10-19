// app/(public)/about/page.jsx
import Link from "next/link";
import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCloud,
  FiCode,
  FiCompass,
  FiCpu,
  FiEdit3,
  FiEye,
  FiFileText,
  FiFlag,
  FiHeart,
  FiLayers,
  FiLock,
  FiMail,
  FiMessageCircle,
  FiPenTool,
  FiPlayCircle,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { CTASection } from "@/components/public/CTASection";
import { Reveal } from "@/components/public/PricingMotion";
import { whyApni } from "@/config/content";

export const metadata = {
  title: "About",
  description:
    "Apni University is a technology-focused learning platform built around practical skills, real projects, and career growth.",
  alternates: { canonical: "/about" },
};

/* ------------------------------------------------------------------ */
/* Design tokens + small building blocks                               */
/* ------------------------------------------------------------------ */
// `apni-landing` activates the shared colour tokens (#111318 surface, #FACC15
// primary, violet accent). HeroSection and TechStrip already emit that CSS.
// If this page is ever rendered without them, move THEME_CSS (see
// HeroSection.jsx) into globals.css.
const SCOPE = "apni-landing bg-background text-foreground";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const VIOLET = "text-[color:var(--violet)]";
const H2 =
  "text-balance text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-3xl";
const EYEBROW =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80";
// Cards react with a border change only, so the page stays calm to scan.
const CARD =
  "rounded-2xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/60 motion-reduce:transition-none";

function Eyebrow({ children }) {
  return (
    <span className={EYEBROW}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  );
}

// Alternating page band. Tinted bands have a top and bottom border.
function Band({ labelledBy, tinted = false, className = "", children }) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`py-12 sm:py-16 ${
        tinted ? "border-y border-border bg-muted/40" : ""
      } ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

function Tile({ icon: Icon, tone = "primary", round = false }) {
  return (
    <span
      className={`grid size-11 shrink-0 place-items-center ${
        round ? "rounded-full" : "rounded-xl"
      } ${
        tone === "violet"
          ? `bg-[color:var(--violet)]/10 ${VIOLET}`
          : "bg-primary/10 text-primary"
      }`}
    >
      <Icon aria-hidden="true" className="size-5" />
    </span>
  );
}

// One card pattern for every icon + title + text block on the page.
function Feature({
  icon,
  title,
  text,
  href,
  layout = "stack",
  center = false,
  tone,
  delay = 0,
}) {
  const row = layout === "row";
  const body = (
    <>
      <Tile icon={icon} tone={tone} round={center} />
      <div className={row ? "" : "mt-4"}>
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
      </div>
    </>
  );
  const cls = `group flex h-full ${
    row ? "items-start gap-4" : "flex-col"
  } ${center ? "items-center text-center" : ""} ${CARD} ${FOCUS}`;

  return (
    <Reveal delay={delay} className="h-full">
      {href ? (
        <Link href={href} className={cls}>
          {body}
        </Link>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </Reveal>
  );
}

function FeatureList({ items, cols, step = 0.07, ...rest }) {
  return (
    <ul className={`grid grid-cols-1 gap-4 ${cols}`}>
      {items.map((item, i) => (
        <li key={item.title} className="min-w-0">
          <Feature {...item} {...rest} delay={Math.min(i * step, 0.4)} />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */
const chips = [
  { icon: FiLayers, text: "Project-based learning" },
  { icon: FiZap, text: "Free and paid courses" },
  { icon: FiTrendingUp, text: "Connected to careers" },
];

const glance = [
  {
    icon: FiCode,
    title: "Practical first",
    text: "Every lesson ends with something you can build.",
  },
  {
    icon: FiBookOpen,
    title: "Clear roadmaps",
    text: "Know what to learn next, in the right order.",
  },
  {
    icon: FiBriefcase,
    title: "Career linked",
    text: "Skills connect to real roles, jobs and portfolios.",
  },
];

const steps = [
  [
    "Learn",
    "Follow structured courses and roadmaps in web development, AI, cloud, security, design, and more.",
  ],
  [
    "Build",
    "Apply every concept in projects you can show to employers and clients.",
  ],
  [
    "Grow",
    "Prepare for interviews, build a portfolio, and find jobs, internships, or freelance work.",
  ],
];

const differences = [
  "Lessons focus on skills employers ask for, not trivia.",
  "Every course connects to a project you can put in a portfolio.",
  "Plain language for beginners, with depth as you progress.",
  "Many courses are free, and paid courses are a one-time payment.",
];

const topics = [
  {
    icon: FiCode,
    title: "Web development",
    text: "HTML, CSS, JavaScript, React and Next.js, from basics to full applications.",
  },
  {
    icon: FiCpu,
    title: "AI and data",
    text: "Python, machine learning and data skills that are useful in real work.",
  },
  {
    icon: FiCloud,
    title: "Cloud and DevOps",
    text: "Deploy, scale and run applications with modern cloud tools.",
  },
  {
    icon: FiLock,
    title: "Cybersecurity",
    text: "Understand threats and learn how to build and protect safely.",
  },
  {
    icon: FiPenTool,
    title: "Design",
    text: "UI and UX principles that make products clear and pleasant to use.",
  },
  {
    icon: FiTrendingUp,
    title: "Career skills",
    text: "Portfolios, interviews and job search help to take the next step.",
  },
];

// How learning is structured day to day.
const formats = [
  {
    icon: FiPlayCircle,
    title: "Self-paced lessons",
    text: "Work through video and written lessons on your own schedule, picking up exactly where you left off.",
  },
  {
    icon: FiLayers,
    title: "Project checkpoints",
    text: "Each module ends in a build, not a quiz, so progress is something you can actually show.",
  },
  {
    icon: FiClock,
    title: "Flexible pacing",
    text: "No cohorts to keep up with. Move fast through what you know and slow down where it's new.",
  },
  {
    icon: FiMessageCircle,
    title: "Community support",
    text: "Ask questions and get help from instructors and other learners when you get stuck.",
  },
];

const audience = [
  {
    icon: FiBookOpen,
    title: "Students",
    text: "Add practical skills to what you study and graduate with real projects.",
  },
  {
    icon: FiRefreshCw,
    title: "Career changers",
    text: "Move into technology with a clear path instead of guessing.",
  },
  {
    icon: FiEdit3,
    title: "Freelancers",
    text: "Sharpen your skills and show proof of your work to clients.",
  },
  {
    icon: FiBriefcase,
    title: "Job seekers",
    text: "Prepare for interviews and find jobs and internships in one place.",
  },
];

const promises = [
  {
    icon: FiEye,
    title: "Honest information",
    text: "Prices, content and refund terms are written plainly, with no hidden surprises.",
  },
  {
    icon: FiTarget,
    title: "Quality over quantity",
    text: "We would rather have fewer, better courses than many weak ones.",
  },
  {
    icon: FiLock,
    title: "Safe payments",
    text: "Paid courses use secure Stripe Checkout. We never store your card details.",
  },
  {
    icon: FiHeart,
    title: "Learner first",
    text: "We listen to feedback and keep improving the platform for learners.",
  },
];

// The shape of the journey, told qualitatively (no invented numbers).
const milestones = [
  {
    icon: FiFlag,
    title: "Why we started",
    text: "Apni University began from a simple frustration: great technology content exists, but it is scattered across videos, blogs and forums with no clear order.",
  },
  {
    icon: FiLayers,
    title: "Building the platform",
    text: "We brought courses, roadmaps, projects and jobs into one connected place, so learners always know what to do next.",
  },
  {
    icon: FiUsers,
    title: "Where we are now",
    text: "We keep adding courses and instructors based on what learners are actually asking to learn, and what employers are actually hiring for.",
  },
  {
    icon: FiCompass,
    title: "Where we're headed",
    text: "More career paths, more hands-on projects, and tighter links between learning and real opportunities.",
  },
];

const explore = [
  {
    icon: FiBookOpen,
    title: "Courses",
    text: "Free and paid courses with previews.",
    href: "/courses",
  },
  {
    icon: FiCompass,
    title: "Career paths",
    text: "Roadmaps for common technology roles.",
    href: "/careers",
  },
  {
    icon: FiBriefcase,
    title: "Jobs",
    text: "Jobs and internships, reviewed before they are published.",
    href: "/jobs",
  },
  {
    icon: FiFileText,
    title: "Blog",
    text: "Practical articles on technology and careers.",
    href: "/blog",
  },
];

const faqs = [
  {
    q: "What is Apni University?",
    a: "A technology-focused learning platform with practical courses, career roadmaps, and job listings, all built around real projects and real careers.",
  },
  {
    q: "Is it free to use?",
    a: "Creating an account is free, and many courses are free. Paid courses are a one-time payment per course, with no subscriptions.",
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. Courses give you a certificate when you complete the lessons.",
  },
  {
    q: "I am a complete beginner. Can I start?",
    a: "Yes. Courses and roadmaps are written for beginners, and many paid courses include free preview lessons so you can try before you buy.",
  },
  {
    q: "How is this different from watching free videos online?",
    a: "Free videos rarely tell you what to learn next or how it connects to a job. Apni University links lessons into a roadmap, pairs them with a project, and points you toward real roles once you're ready.",
  },
  {
    q: "Can I learn at my own pace?",
    a: "Yes. There are no cohorts or deadlines. Courses stay open so you can revisit lessons whenever you need to.",
  },
  {
    q: "How can I contact you?",
    a: "Use the Contact page to send a message. We read every one.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function AboutPage() {
  return (
    <div className={SCOPE}>
      <PageHeader
        title="Learn skills. Build your future."
        description="Apni University exists to make practical technology education clear, project-based, and connected to real careers."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      >
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
            >
              <Icon aria-hidden="true" className="size-4 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className="relative overflow-x-clip">
        {/* At a glance */}
        <Container className="pt-10">
          <h2 className="sr-only">At a glance</h2>
          <FeatureList items={glance} cols="sm:grid-cols-3" layout="row" />
        </Container>

        {/* Mission and vision */}
        <Container className="py-12 sm:py-16">
          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                icon: FiTarget,
                title: "Our mission",
                tone: "primary",
                text: "To make practical technology education clear, affordable and connected to real careers, so that anyone willing to learn can build useful skills and use them.",
              },
              {
                icon: FiEye,
                title: "Our vision",
                tone: "violet",
                text: "A place where learners move from curiosity to confidence: learning in one place, building real projects, and finding their first role or client.",
              },
            ].map(({ icon, title, text, tone }, i) => (
              <Reveal key={title} delay={i * 0.1} className="h-full">
                <div className="relative h-full overflow-hidden rounded-3xl border border-border bg-card p-8">
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 ${
                      tone === "violet"
                        ? "bg-[color:var(--violet)]"
                        : "bg-primary"
                    }`}
                  />
                  <Tile icon={icon} tone={tone} />
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h2>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">
                    {text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>

        {/* Story */}
        <Band labelledBy="story-title" tinted>
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <Reveal>
              <Eyebrow>Why we exist</Eyebrow>
              <h2 id="story-title" className={`mt-4 ${H2}`}>
                Learning technology should not feel confusing
              </h2>
              <div className="mt-4 max-w-xl space-y-3 text-base leading-7 text-muted-foreground">
                <p>
                  There is a lot of technology content online, but it is often
                  scattered, outdated or too hard for beginners. It is easy to
                  watch many videos and still not know what to build or what to
                  learn next.
                </p>
                <p>
                  Apni University brings structured courses, career roadmaps,
                  jobs and articles together, so each step leads clearly to the
                  next one.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <Card className="gap-4 border-border p-6">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  What we do differently
                </h3>
                <ul className="space-y-3">
                  {differences.map((d) => (
                    <li
                      key={d}
                      className="flex gap-3 text-sm leading-6 text-foreground"
                    >
                      <FiCheckCircle
                        aria-hidden="true"
                        className="mt-0.5 size-5 shrink-0 text-primary"
                      />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </Band>

        {/* Our journey */}
        <Band labelledBy="journey">
          <SectionHeader
            id="journey"
            eyebrow="Our journey"
            title="How Apni University came together"
          />
          <FeatureList
            items={milestones}
            cols="sm:grid-cols-2 lg:grid-cols-4"
            step={0.08}
            tone="violet"
          />
        </Band>

        {/* How it works: a real sequence, so the numbers stay */}
        <Band labelledBy="how-title" tinted>
          <SectionHeader
            id="how-title"
            eyebrow="How it works"
            title="From first lesson to first role"
          />
          <ol className="relative grid gap-5 md:grid-cols-3">
            <span
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-11 hidden h-px bg-border md:block"
            />
            {steps.map(([t, text], i) => (
              <li key={t} className="min-w-0">
                <Reveal delay={i * 0.1} className="h-full">
                  <div className={`relative h-full ${CARD} p-6`}>
                    <span className="grid size-11 place-items-center rounded-full bg-primary text-lg font-semibold tabular-nums text-primary-foreground">
                      <span aria-hidden="true">{i + 1}</span>
                      <span className="sr-only">Step {i + 1}</span>
                    </span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                      {t}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Band>

        {/* What you can learn */}
        <Band labelledBy="learn-title">
          <SectionHeader
            id="learn-title"
            eyebrow="What you can learn"
            title="Skills for the roles people are hiring for"
            description="Pick an area and follow a clear path from the basics to projects."
          />
          <FeatureList
            items={topics}
            cols="sm:grid-cols-2 lg:grid-cols-3"
            step={0.06}
          />
        </Band>

        {/* How learning is structured */}
        <Band labelledBy="formats-title" tinted>
          <SectionHeader
            id="formats-title"
            eyebrow="How you'll learn"
            title="Built for how people actually study"
            description="No fixed start dates and no falling behind a cohort. Learning fits around your schedule, not the other way around."
          />
          <FeatureList
            items={formats}
            cols="sm:grid-cols-2 lg:grid-cols-4"
            tone="violet"
          />
        </Band>

        {/* Principles */}
        <Band labelledBy="values">
          <SectionHeader
            id="values"
            eyebrow="What we believe"
            title="Principles behind the platform"
          />
          <FeatureList items={whyApni} cols="sm:grid-cols-2 lg:grid-cols-3" />
        </Band>

        {/* Who it's for */}
        <Band labelledBy="who-title" tinted>
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Who it is for</Eyebrow>
            <h2 id="who-title" className={`mt-4 ${H2}`}>
              Made for people who want to grow
            </h2>
          </Reveal>
          <div className="mt-8">
            <FeatureList
              items={audience}
              cols="sm:grid-cols-2 lg:grid-cols-4"
              center
              tone="violet"
              step={0.08}
            />
          </div>
        </Band>

        {/* Promise */}
        <Band labelledBy="promise-title">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Our promise</Eyebrow>
            <h2 id="promise-title" className={`mt-4 ${H2}`}>
              What you can expect from us
            </h2>
          </Reveal>
          <div className="mt-8">
            <FeatureList
              items={promises}
              cols="sm:grid-cols-2"
              layout="row"
              step={0.08}
            />
          </div>
        </Band>

        {/* Explore */}
        <Band labelledBy="explore-title" tinted>
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 id="explore-title" className={H2}>
              Where to go next
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Everything you need is in one place.
            </p>
          </Reveal>
          <div className="mt-8">
            <FeatureList
              items={explore}
              cols="sm:grid-cols-2 lg:grid-cols-4"
              step={0.08}
            />
          </div>
        </Band>

        {/* Instructors banner */}
        <section className="py-12 sm:py-14">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-primary"
                />
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <Tile icon={FiUsers} />
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        Learn from people who do the work
                      </h2>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                        Meet the practitioners who build technology for a living
                        and teach it on Apni University.
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Link
                      href="/instructors"
                      className={buttonVariants({
                        variant: "default",
                        size: "lg",
                      })}
                    >
                      Meet instructors
                    </Link>
                    <Link
                      href="/courses"
                      className={buttonVariants({
                        variant: "outline",
                        size: "lg",
                      })}
                    >
                      <FiAward aria-hidden="true" />
                      Explore courses
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Contact strip */}
        <section className="border-y border-border bg-muted/40 py-10 sm:py-12">
          <Container>
            <Reveal>
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <FiMail aria-hidden="true" className="size-4" />
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Questions about a course, a refund, or how to get started?
                    <span className="block text-foreground sm:ml-1 sm:inline">
                      We read every message.
                    </span>
                  </p>
                </div>
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Contact us
                </Link>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* FAQ */}
        <Band labelledBy="faq-title">
          <div className="mx-auto max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className={H2}>
                Common questions
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {faqs.map(({ q, a }) => (
                  <details key={q} className="group">
                    <summary
                      className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60 motion-reduce:transition-none sm:text-base [&::-webkit-details-marker]:hidden ${FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
                    >
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="px-5 pb-5 text-sm leading-7 text-muted-foreground">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </Band>

        <CTASection />
      </div>
    </div>
  );
}
