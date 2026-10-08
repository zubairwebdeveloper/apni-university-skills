// app/(public)/technology/page.jsx
import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
  FiCompass,
  FiCpu,
  FiHelpCircle,
  FiLayers,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { CTASection } from "@/components/public/CTASection";
import { Reveal } from "@/components/public/PricingMotion";
import { TechnologyExplorer } from "@/components/public/TechnologyExplorer";
import { getTechCategory } from "@/components/public/technologyUtils";
import { technologyService } from "@/services/technologyService";

export const revalidate = 300;

export const metadata = {
  title: "Technology",
  description:
    "Understand the technologies behind modern careers: what they are, why they matter, and how to start.",
  alternates: { canonical: "/technology" },
};

const chips = [
  { icon: FiHelpCircle, text: "What it is" },
  { icon: FiTarget, text: "Why it matters" },
  { icon: FiBriefcase, text: "Roles it leads to" },
];

const howTo = [
  {
    icon: FiSearch,
    title: "Find a technology",
    text: "Search or filter the guides to find what you are curious about.",
  },
  {
    icon: FiBookOpen,
    title: "Read the guide",
    text: "Learn what it is, why it matters and the skills it needs.",
  },
  {
    icon: FiBriefcase,
    title: "See the roles",
    text: "Check which careers use it, so you know where it can take you.",
  },
  {
    icon: FiLayers,
    title: "Start learning",
    text: "Pick a course or roadmap and begin building real projects.",
  },
];

const whyItMatters = [
  {
    icon: FiTrendingUp,
    title: "Employers ask for it",
    text: "Most job listings name specific technologies. Knowing them opens more doors.",
  },
  {
    icon: FiTarget,
    title: "Choose with confidence",
    text: "Understanding the options helps you pick what to learn, instead of guessing.",
  },
  {
    icon: FiZap,
    title: "Learn faster",
    text: "When you know how a technology fits into the bigger picture, new tools are easier to learn.",
  },
  {
    icon: FiCompass,
    title: "Plan your career",
    text: "See how skills connect to roles, so every step moves you forward.",
  },
];

const path = [
  {
    title: "Understand",
    text: "Read the guide to learn what the technology does and where it is used.",
  },
  {
    title: "Practice",
    text: "Follow a course and build small projects with it.",
  },
  {
    title: "Show it",
    text: "Put your best project in a portfolio and apply for roles.",
  },
];

const faqs = [
  {
    q: "What are these technology guides?",
    a: "Short, plain-language explainers: what a technology is, why it matters, the skills it needs and the roles it leads to.",
  },
  {
    q: "I am a beginner. Where should I start?",
    a: "Start with a guide that interests you, then follow a related course or career roadmap. You do not need to know everything first.",
  },
  {
    q: "Are the guides free?",
    a: "Yes. You can read every guide without an account or payment.",
  },
  {
    q: "How is this different from a course?",
    a: "A guide gives you the big picture quickly. A course teaches you the skill step by step, with projects.",
  },
];

export default async function TechnologyPage() {
  const raw = await technologyService.getAllTechnologies();

  // Make sure the data is plain JSON before it reaches a Client Component
  // (Firestore Timestamps and class instances would otherwise throw).
  const items = JSON.parse(JSON.stringify(raw ?? []));

  const categorySet = new Set(items.map(getTechCategory).filter(Boolean));

  const stats = [
    { icon: FiLayers, value: items.length + 1, label: "Technology guides" },
    ...(categorySet.size > 0
      ? [{ icon: FiCompass, value: categorySet.size, label: "Categories" }]
      : []),
    { icon: FiCpu, value: "AI", label: "Dedicated hub" },
  ];

  return (
    <>
      <PageHeader
        title="Understand the technology"
        description="What each technology is, why it matters, the skills it needs, and the roles it leads to."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Technology" }]}
      >
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-sm font-medium backdrop-blur"
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
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        {/* Stats */}
        <Container className="relative pt-10">
          <ul
            className={`grid grid-cols-1 gap-4 ${
              stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            {stats.map(({ icon: Icon, value, label }, i) => (
              <li key={label} className="min-w-0">
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="group flex h-full items-center gap-4 rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <p className="font-serif text-3xl font-semibold leading-none">
                        {value}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>

        {/* Featured AI hub */}
        <Container className="relative pt-8">
          <Reveal>
            <Link
              href="/ai"
              className="group relative block overflow-hidden rounded-3xl border border-primary/30 bg-accent p-6 outline-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-8"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/15 blur-3xl transition-transform duration-700 group-hover:scale-125 motion-reduce:transition-none"
              />
              <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-300 group-hover:rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                    <FiCpu aria-hidden="true" className="size-6" />
                  </span>
                  <div>
                    <Badge className="mb-2">Featured hub</Badge>
                    <h2 className="font-serif text-xl font-semibold sm:text-2xl">
                      Artificial Intelligence
                    </h2>
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                      Generative AI, agents, automation, and machine learning,
                      in one dedicated hub.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Explore the AI hub
                  <FiArrowRight
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </span>
              </div>
            </Link>
          </Reveal>
        </Container>

        {/* Explorer */}
        <Container className="relative py-10">
          <Reveal>
            <TechnologyExplorer items={items} />
          </Reveal>
        </Container>

        {/* How to use */}
        <section
          aria-labelledby="how-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                How to use this page
              </Badge>
              <h2 id="how-title" className="text-2xl sm:text-3xl">
                From curious to confident
              </h2>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {howTo.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group relative h-full rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="absolute right-4 top-3 font-serif text-4xl font-semibold text-primary/10">
                        {i + 1}
                      </span>
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Why it matters */}
        <section
          aria-labelledby="why-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Why it matters
              </Badge>
              <h2 id="why-title" className="text-2xl sm:text-3xl">
                Why technology knowledge pays off
              </h2>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {whyItMatters.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold">
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

        {/* Learning path */}
        <section
          aria-labelledby="path-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-4xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Your learning path
              </Badge>
              <h2 id="path-title" className="text-2xl sm:text-3xl">
                Three steps from guide to job-ready
              </h2>
            </Reveal>
            <ol className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <span
                aria-hidden="true"
                className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block"
              />
              {path.map(({ title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="relative h-full rounded-2xl border bg-card p-5 text-center">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary font-serif text-lg font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                      <h3 className="mt-3 font-sans text-base font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Careers banner */}
        <section className="border-t py-12 sm:py-14">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border bg-card p-8 sm:p-10">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FiCompass aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl">
                        Ready to turn knowledge into skills?
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        See which careers use these technologies, then learn
                        them with practical courses. Many are free.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/careers"
                      className={buttonVariants({ variant: "default" })}
                    >
                      Explore careers
                    </Link>
                    <Link
                      href="/courses"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      <FiSearch aria-hidden="true" />
                      Browse courses
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className="text-2xl sm:text-3xl">
                Technology questions
              </h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {faqs.map(({ q, a }, i) => (
                <Reveal key={q} delay={i * 0.06}>
                  <details className="group rounded-xl border bg-card px-4 py-3 open:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base [&::-webkit-details-marker]:hidden">
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
