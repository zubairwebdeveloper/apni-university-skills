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
  FiMapPin,
  FiMessageCircle,
  FiPenTool,
  FiPlayCircle,
  FiRefreshCw,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "@/components/layout/Container";
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

// New: how learning is actually structured day to day
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

// New: the shape of the journey, told qualitatively (no invented numbers)
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

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Learn skills. Build your future."
        description="Apni University exists to make practical technology education clear, project-based, and connected to real careers."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      >
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-sm font-medium text-foreground backdrop-blur"
            >
              <Icon aria-hidden="true" className="size-4 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className="relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />

        {/* At a glance */}
        <Container className="relative pt-10">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {glance.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="min-w-0">
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:hover:shadow-primary/5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-sans text-base font-semibold text-foreground">
                        {title}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>

        {/* Mission and vision */}
        <Container className="relative py-12 sm:py-16">
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal className="h-full">
              <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FiTarget aria-hidden="true" className="size-5" />
                </span>
                <h2 className="mt-4 text-2xl text-foreground">Our mission</h2>
                <p className="mt-2 text-muted-foreground">
                  To make practical technology education clear, affordable and
                  connected to real careers, so that anyone willing to learn can
                  build useful skills and use them.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-highlight to-primary"
                />
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FiEye aria-hidden="true" className="size-5" />
                </span>
                <h2 className="mt-4 text-2xl text-foreground">Our vision</h2>
                <p className="mt-2 text-muted-foreground">
                  A place where learners move from curiosity to confidence:
                  learning in one place, building real projects, and finding
                  their first role or client.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>

        {/* Story */}
        <section
          aria-labelledby="story-title"
          className="border-t border-border bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <Reveal>
                <Badge variant="secondary" className="mb-3">
                  Why we exist
                </Badge>
                <h2
                  id="story-title"
                  className="text-2xl text-foreground sm:text-3xl"
                >
                  Learning technology should not feel confusing
                </h2>
                <div className="mt-4 space-y-3 text-muted-foreground">
                  <p>
                    There is a lot of technology content online, but it is often
                    scattered, outdated or too hard for beginners. It is easy to
                    watch many videos and still not know what to build or what
                    to learn next.
                  </p>
                  <p>
                    Apni University brings structured courses, career roadmaps,
                    jobs and articles together, so each step leads clearly to
                    the next one.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <Card className="gap-4 p-6">
                  <h3 className="font-sans text-lg font-semibold text-foreground">
                    What we do differently
                  </h3>
                  <ul className="space-y-3">
                    {differences.map((d) => (
                      <li
                        key={d}
                        className="flex gap-3 text-sm text-foreground"
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
          </Container>
        </section>

        {/* Our journey / milestones (new) */}
        <Section labelledBy="journey">
          <SectionHeader
            id="journey"
            eyebrow="Our journey"
            title="How Apni University came together"
          />
          <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <span
              aria-hidden="true"
              className="absolute left-[8%] right-[8%] top-10 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block"
            />
            {milestones.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="min-w-0">
                <Reveal delay={i * 0.08} className="h-full">
                  <Card className="group relative h-full gap-2 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="mt-2 font-serif text-lg font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>

        {/* How it works */}
        <section
          aria-labelledby="how-title"
          className="border-t border-border bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <SectionHeader
              id="how-title"
              eyebrow="How it works"
              title="From first lesson to first role"
            />
            <ol className="relative grid gap-5 md:grid-cols-3">
              <span
                aria-hidden="true"
                className="absolute left-[16%] right-[16%] top-10 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block"
              />
              {steps.map(([t, text], i) => (
                <li key={t} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <Card className="group relative h-full gap-2 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="grid size-11 place-items-center rounded-full bg-primary font-serif text-lg font-semibold text-primary-foreground transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
                        {i + 1}
                      </span>
                      <h3 className="mt-2 font-serif text-lg font-semibold text-foreground">
                        {t}
                      </h3>
                      <p className="text-sm text-muted-foreground">{text}</p>
                    </Card>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* What you can learn */}
        <Section labelledBy="learn-title">
          <SectionHeader
            id="learn-title"
            eyebrow="What you can learn"
            title="Skills for the roles people are hiring for"
            description="Pick an area and follow a clear path from the basics to projects."
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="min-w-0">
                <Reveal delay={Math.min(i * 0.06, 0.4)} className="h-full">
                  <div className="group h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>

        {/* How learning is structured (new) */}
        <section
          aria-labelledby="formats-title"
          className="border-t border-border bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <SectionHeader
              id="formats-title"
              eyebrow="How you'll learn"
              title="Built for how people actually study"
              description="No fixed start dates and no falling behind a cohort. Learning fits around your schedule, not the other way around."
            />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {formats.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.07} className="h-full">
                    <div className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-sans text-base font-semibold text-foreground">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Principles */}
        <Section labelledBy="values">
          <SectionHeader
            id="values"
            eyebrow="What we believe"
            title="Principles behind the platform"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyApni.map(({ icon: Icon, title, text }, i) => (
              <Reveal
                key={title}
                delay={Math.min(i * 0.07, 0.4)}
                className="h-full"
              >
                <Card className="group h-full gap-3 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <span className="grid size-11 place-items-center rounded-lg bg-accent text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Who it's for */}
        <section
          aria-labelledby="who-title"
          className="border-t border-border bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Who it is for
              </Badge>
              <h2
                id="who-title"
                className="text-2xl text-foreground sm:text-3xl"
              >
                Made for people who want to grow
              </h2>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audience.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border border-border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Promise */}
        <section
          aria-labelledby="promise-title"
          className="border-t border-border py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Our promise
              </Badge>
              <h2
                id="promise-title"
                className="text-2xl text-foreground sm:text-3xl"
              >
                What you can expect from us
              </h2>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {promises.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-sans text-base font-semibold text-foreground">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Explore */}
        <section
          aria-labelledby="explore-title"
          className="border-t border-border bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2
                id="explore-title"
                className="text-2xl text-foreground sm:text-3xl"
              >
                Where to go next
              </h2>
              <p className="mt-3 text-muted-foreground">
                Everything you need is in one place.
              </p>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {explore.map(({ icon: Icon, title, text, href }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <Link
                      href={href}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Instructors banner */}
        <section className="border-t border-border py-12 sm:py-14">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FiUsers aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-xl text-foreground sm:text-2xl">
                        Learn from people who do the work
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        Meet the practitioners who build technology for a living
                        and teach it on Apni University.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/instructors"
                      className={buttonVariants({ variant: "default" })}
                    >
                      Meet instructors
                    </Link>
                    <Link
                      href="/courses"
                      className={buttonVariants({ variant: "outline" })}
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

        {/* Contact strip (new) */}
        <section className="border-t border-border bg-muted/20 py-10 sm:py-12">
          <Container>
            <Reveal>
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <FiMail aria-hidden="true" className="size-4" />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Questions about a course, a refund, or how to get started?
                    <span className="block text-foreground sm:inline sm:ml-1">
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
        <section
          aria-labelledby="faq-title"
          className="border-t border-border py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2
                id="faq-title"
                className="text-2xl text-foreground sm:text-3xl"
              >
                Common questions
              </h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {faqs.map(({ q, a }, i) => (
                <Reveal key={q} delay={i * 0.06}>
                  <details className="group rounded-xl border border-border bg-card px-4 py-3 open:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">{a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
