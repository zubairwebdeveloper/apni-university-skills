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
import { AreasMap } from "@/components/public/AreasMap";
import { Tilt } from "@/components/public/Reveal";
import { SectionNav } from "@/components/public/SectionNav";
import { TechScene } from "@/components/public/TechScene";
import { technologyService } from "@/services/technologyService";

export const revalidate = 300;

export const metadata = {
  title: "Technology",
  description:
    "Understand the technologies behind modern careers: what they are, why they matter, and how to start.",
  alternates: { canonical: "/technology" },
};

const h2Class =
  "text-balance text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// Hover fix: the outer "group" element never moves. Only the inner card
// transforms, so the cursor cannot leave the hover area and cause flicker.
const cardHover =
  "shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:translate-y-0";

const chips = [
  { icon: FiHelpCircle, text: "What it is" },
  { icon: FiTarget, text: "Why it matters" },
  { icon: FiBriefcase, text: "Roles it leads to" },
];

const navItems = [
  { id: "explorer", label: "Explore" },
  { id: "areas", label: "Fields overview" },
  { id: "how", label: "How it works" },
  { id: "why", label: "Why it matters" },
  { id: "path", label: "Learning path" },
  { id: "faq", label: "FAQ" },
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

// FAQPage structured data built from the same visible questions.
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
}).replace(/</g, "\\u003c");

function Eyebrow({ children }) {
  return (
    <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
      <span aria-hidden="true" className="h-px w-6 bg-primary" />
      {children}
      <span aria-hidden="true" className="h-px w-6 bg-primary" />
    </p>
  );
}

function SectionHeading({ id, eyebrow, title, description }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className={`${eyebrow ? "mt-3" : ""} ${h2Class}`}>
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </Reveal>
  );
}

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
      <style>{`html{scroll-padding-top:8rem}@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}`}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd }}
      />

      <PageHeader
        title="Understand the technology"
        description="What each technology is, why it matters, the skills it needs, and the roles it leads to."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Technology" }]}
      >
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur"
            >
              <Icon aria-hidden="true" className="size-4 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </PageHeader>

      <SectionNav items={navItems} />

      <div className="relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        {/* Stats */}
        <Container className="relative pt-12">
          <ul
            className={`grid grid-cols-1 gap-4 ${
              stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            {stats.map(({ icon: Icon, value, label }, i) => (
              <li key={label} className="min-w-0">
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="group h-full">
                    <div
                      className={`flex h-full items-center gap-5 rounded-2xl border bg-card p-6 ${cardHover}`}
                    >
                      <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                        <Icon aria-hidden="true" className="size-6" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-4xl font-semibold leading-none tracking-tight text-foreground">
                          {value}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                          {label}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>

        {/* Featured AI hub, with the single 3D scene of this page */}
        <Container className="relative pt-8">
          <Reveal>
            <div className="group">
              <Link
                href="/ai"
                className="relative block overflow-hidden rounded-3xl border border-primary/30 bg-accent p-6 shadow-sm outline-none transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:p-10"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/15 blur-3xl transition-transform duration-700 group-hover:scale-125 motion-reduce:transition-none"
                />
                <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="flex items-start gap-5">
                    <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-300 group-hover:rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <FiCpu aria-hidden="true" className="size-6" />
                    </span>
                    <div className="min-w-0">
                      <Badge className="mb-3">Featured hub</Badge>
                      <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                        Artificial Intelligence
                      </h2>
                      <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
                        Generative AI, agents, automation, and machine learning,
                        in one dedicated hub.
                      </p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Explore the AI hub
                        <FiArrowRight
                          aria-hidden="true"
                          className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                        />
                      </span>
                    </div>
                  </div>
                  <div className="pointer-events-none relative h-44 md:h-52">
                    <TechScene
                      nodeCount={Math.max(categorySet.size, 6)}
                      scrollLinked={false}
                      className="absolute inset-0"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </Reveal>
        </Container>

        {/* Explorer */}
        <span id="explorer" className="block" />
        <Container className="relative py-12 sm:py-16">
          <Reveal>
            <TechnologyExplorer items={items} />
          </Reveal>
        </Container>

        {/* Fields overview with maturity filter */}
        <section
          id="areas"
          aria-labelledby="areas-title"
          className="border-t py-16 sm:py-24"
        >
          <Container>
            <SectionHeading
              id="areas-title"
              eyebrow="Fields overview"
              title="What is established and what is still developing"
              description="See what you could build in each field and what to know first. Newer fields change fast, so we label them honestly."
            />
            <div className="mt-12">
              <AreasMap />
            </div>
          </Container>
        </section>

        {/* How to use */}
        <section
          id="how"
          aria-labelledby="how-title"
          className="border-t bg-muted/20 py-16 sm:py-24"
        >
          <Container>
            <SectionHeading
              id="how-title"
              eyebrow="How to use this page"
              title="From curious to confident"
              description="Four steps to go from browsing to learning."
            />
            <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {howTo.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full">
                      <div
                        className={`relative h-full rounded-2xl border bg-card p-6 ${cardHover}`}
                      >
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute right-5 top-4 font-serif text-5xl font-semibold tabular-nums text-primary/10"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <h3 className="mt-5 font-sans text-lg font-semibold leading-snug">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                          {text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Why it matters */}
        <section
          id="why"
          aria-labelledby="why-title"
          className="border-t py-16 sm:py-24"
        >
          <Container>
            <SectionHeading
              id="why-title"
              eyebrow="Why it matters"
              title="Why technology knowledge pays off"
            />
            <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {whyItMatters.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full">
                      <div
                        className={`h-full rounded-2xl border bg-card p-6 text-center ${cardHover}`}
                      >
                        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                          <Icon aria-hidden="true" className="size-6" />
                        </span>
                        <h3 className="mt-5 font-sans text-lg font-semibold leading-snug">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
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

        {/* Learning path */}
        <section
          id="path"
          aria-labelledby="path-title"
          className="border-t bg-muted/20 py-16 sm:py-24"
        >
          <Container className="max-w-4xl">
            <SectionHeading
              id="path-title"
              eyebrow="Your learning path"
              title="Three steps from guide to job-ready"
            />
            <ol className="relative mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[16%] right-[16%] top-11 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block"
              />
              {path.map(({ title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <Tilt className="h-full" max={4}>
                      <div className="relative h-full rounded-2xl border bg-card p-6 text-center shadow-sm transition-colors hover:border-primary/40 motion-reduce:transition-none sm:p-7">
                        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary font-serif text-xl font-semibold tabular-nums text-primary-foreground shadow-md shadow-primary/20 ring-4 ring-card">
                          {i + 1}
                        </span>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                          Step {String(i + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-1 font-sans text-lg font-semibold leading-snug">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                          {text}
                        </p>
                      </div>
                    </Tilt>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Careers banner */}
        <section className="border-t py-16 sm:py-20">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border bg-card p-8 shadow-sm sm:p-12">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-5">
                    <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                      <FiCompass aria-hidden="true" className="size-6" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                        Ready to turn knowledge into skills?
                      </h2>
                      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                        See which careers use these technologies, then learn
                        them with practical courses. Many are free.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/careers"
                      className={buttonVariants({
                        variant: "default",
                        size: "lg",
                        className: "group/btn min-h-11",
                      })}
                    >
                      Explore careers
                      <FiArrowRight
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/btn:translate-x-1 motion-reduce:transition-none"
                      />
                    </Link>
                    <Link
                      href="/courses"
                      className={buttonVariants({
                        variant: "outline",
                        size: "lg",
                        className: "min-h-11",
                      })}
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
          id="faq"
          aria-labelledby="faq-title"
          className="border-t bg-muted/20 py-16 sm:py-24"
        >
          <Container className="max-w-3xl">
            <SectionHeading
              id="faq-title"
              eyebrow="FAQ"
              title="Technology questions"
              description="Quick answers about the guides and how to use them."
            />
            <div className="mt-12 space-y-3">
              {faqs.map(({ q, a }, i) => (
                <Reveal key={q} delay={i * 0.06}>
                  <details className="group rounded-xl border bg-card px-5 shadow-sm transition-colors hover:border-primary/30 open:border-primary/30 open:shadow-md motion-reduce:transition-none sm:px-6">
                    <summary
                      className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-left text-base font-medium focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden outline-none`}
                    >
                      <span className="flex min-w-0 items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="text-xs font-semibold tabular-nums text-primary"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{q}</span>
                      </span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <FiChevronDown
                          aria-hidden="true"
                          className="size-4 transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                        />
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-5 leading-7 text-muted-foreground sm:pl-8">
                      {a}
                    </p>
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
