"use client";
import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiCompass,
  FiCpu,
  FiLayers,
  FiTarget,
  FiTool,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "@/components/layout/Container";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SectionHeader } from "@/components/shared/SectionHeader";
import {
  whyApni,
  learningPaths,
  technologyTopics,
  careerTopics,
  freeResources,
} from "@/config/content";
import { faqs } from "@/config/faq";

// Alternating tinted band, theme-aware.
const TINT = "bg-muted/40 border-y border-border/60";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// What every technology page on the site covers (matches the section copy).
const techPageCovers = [
  { icon: FiCompass, text: "What the technology is, in plain language" },
  { icon: FiTarget, text: "Why it matters for your career" },
  { icon: FiTool, text: "The skills you need to start" },
  {
    icon: FiLayers,
    text: "The roles it leads to, with related courses and jobs",
  },
];

// The steps of the "learning to earning" journey (matches the section copy).
const careerJourney = [
  "Plan the path",
  "Prepare for interviews",
  "Build proof of work",
  "Apply for jobs",
];

export function WhyApni() {
  return (
    <Section labelledBy="why-title" className={TINT}>
      <SectionHeader
        id="why-title"
        eyebrow="Why Apni University"
        title="Learning built for real careers"
        center
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {whyApni.map(({ icon: Icon, title, text }) => (
          <StaggerItem key={title}>
            <Card className="group relative h-full gap-3 overflow-hidden p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <span
                className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
              <span className="relative grid size-11 place-items-center rounded-lg bg-accent text-primary ring-1 ring-primary/15 transition-all group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="relative font-serif text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function LearningPaths() {
  return (
    <Section labelledBy="paths-title">
      <SectionHeader
        id="paths-title"
        eyebrow="Learning paths"
        title="Follow a roadmap, not a random playlist"
        description="Each roadmap lists what to learn, in the order we recommend."
        href="/careers"
        hrefLabel="All career paths"
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {learningPaths.map((p) => (
          <StaggerItem key={p.slug}>
            <Link
              href={`/careers/${p.slug}`}
              className={`group block h-full rounded-xl ${FOCUS}`}
            >
              <Card className="h-full gap-4 p-6 transition-all group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    {p.steps.length} steps
                  </Badge>
                </div>
                <ol className="space-y-3 border-l border-border pl-5 text-sm text-muted-foreground">
                  {p.steps.map((s, i) => (
                    <li
                      key={s}
                      style={{ transitionDelay: `${i * 40}ms` }}
                      className="relative transition-all before:absolute before:-left-[1.6rem] before:top-1.5 before:size-2 before:rounded-full before:bg-border before:transition-colors group-hover:translate-x-1 group-hover:text-foreground group-hover:before:bg-primary motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    >
                      <span className="sr-only">Step {i + 1}: </span>
                      {s}
                    </li>
                  ))}
                </ol>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                  View roadmap
                  <FiArrowRight
                    className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    aria-hidden="true"
                  />
                </span>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function TechnologyAISection() {
  return (
    <Section
      labelledBy="tech-title"
      className={`relative isolate overflow-hidden ${TINT}`}
      containerClassName="grid items-center gap-10 lg:grid-cols-2"
    >
      {/* Decorative background: faint grid and two slow glows. */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 text-foreground opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div className="absolute -left-24 top-0 size-72 rounded-full bg-highlight/20 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute -bottom-24 right-0 size-80 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse" />
      </div>
      <style>{`@keyframes apni-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>

      <Reveal>
        <p className="mb-2 flex items-center gap-1.5 font-mono text-xs font-medium uppercase tracking-widest text-primary">
          <FiCpu aria-hidden="true" />
          Technology & AI
        </p>
        <h2
          id="tech-title"
          className="text-balance text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight"
        >
          Understand the technology shaping your career
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
          What each technology is, why it matters, which skills it needs, and
          the roles it leads to, with related courses, jobs, and articles.
        </p>

        <ul className="mt-6 space-y-3">
          {techPageCovers.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-foreground/90">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/ai" className={buttonVariants()}>
            Explore AI
          </Link>
          <Link
            href="/technology"
            className={buttonVariants({ variant: "outline" })}
          >
            All technologies
          </Link>
        </div>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {technologyTopics.map(({ title, href, icon: Icon }, i) => (
          <StaggerItem key={href}>
            <Link
              href={href}
              className={`group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 text-sm font-medium text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${FOCUS}`}
            >
              {/* Brand-yellow accent line, revealed on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-highlight transition-transform group-hover:scale-x-100 motion-reduce:transition-none"
              />
              <Icon
                className="size-5 text-primary motion-safe:animate-[apni-float_4s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 300}ms` }}
                aria-hidden="true"
              />
              <span className="flex items-center justify-between gap-2">
                {title}
                <FiArrowRight
                  className="size-4 -translate-x-1 text-primary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function CareerSection() {
  return (
    <Section
      labelledBy="career-title"
      containerClassName="grid items-center gap-10 lg:grid-cols-2"
    >
      <Reveal>
        <p className="mb-2 font-mono text-xs font-medium uppercase tracking-widest text-primary">
          Careers
        </p>
        <h2
          id="career-title"
          className="text-balance text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight"
        >
          From learning to earning
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
          Skills alone aren&apos;t enough. We help you plan the path, prepare
          for interviews, and build proof of work.
        </p>

        {/* The journey, as a short connected sequence. */}
        <ol className="mt-6 flex flex-col gap-4 border-l border-border pl-6">
          {careerJourney.map((step, i) => (
            <li
              key={step}
              className="relative flex items-center gap-3 text-sm font-medium before:absolute before:-left-[1.9rem] before:top-1/2 before:size-2.5 before:-translate-y-1/2 before:rounded-full before:bg-primary before:ring-4 before:ring-background"
            >
              <span
                aria-hidden="true"
                className="font-mono text-xs tabular-nums text-muted-foreground"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="sr-only">Step {i + 1}: </span>
              {step}
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/careers" className={buttonVariants()}>
            Explore careers
          </Link>
          <Link href="/jobs" className={buttonVariants({ variant: "outline" })}>
            See open jobs
          </Link>
        </div>
      </Reveal>
      <Stagger className="grid gap-3 sm:grid-cols-2">
        {careerTopics.map((t) => (
          <StaggerItem key={t}>
            <div className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-card-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <FiCheck className="size-3.5" aria-hidden="true" />
              </span>
              {t}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function FreeResources() {
  return (
    <Section labelledBy="free-title" className={TINT}>
      <SectionHeader
        id="free-title"
        eyebrow="Free to start"
        title="Free learning resources"
        description="You don't need a credit card to begin."
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {freeResources.map((r) => (
          <StaggerItem key={r.href}>
            <Link
              href={r.href}
              className={`group block h-full rounded-xl ${FOCUS}`}
            >
              <Card className="h-full gap-2 p-6 transition-all group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold tracking-tight">
                    {r.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    Free
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {r.text}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                  Open
                  <FiArrowRight
                    className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    aria-hidden="true"
                  />
                </span>
              </Card>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

export function FAQSection() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  // Controlled list of open item values; always "multiple" so Expand/Collapse
  // all and individual toggling work together.
  const [open, setOpen] = useState(() => (faqs[0] ? [faqs[0].q] : []));

  const trimmed = query.trim();
  const filtered = useMemo(() => {
    if (!trimmed) return faqs;
    const q = trimmed.toLowerCase();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [trimmed]);

  // Browsing shows the top 6; searching shows every match.
  const shown = trimmed ? filtered : filtered.slice(0, 6);
  const allOpen = shown.length > 0 && shown.every((f) => open.includes(f.q));

  return (
    <Section labelledBy="faq-title" containerClassName="max-w-3xl">
      <div className="mx-auto mb-10 flex max-w-xl flex-col items-center text-center">
        <SectionHeader
          id="faq-title"
          eyebrow="FAQ"
          title="Questions, answered"
          center
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you need to know. Can&apos;t find your answer? Reach out
          anytime.
        </p>

        <div className="relative mt-6 w-full max-w-sm">
          <FiSearch
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search frequently asked questions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="h-11 w-full rounded-full border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p
          className="text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {trimmed
            ? `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`
            : ""}
        </p>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? [] : shown.map((f) => f.q))}
          disabled={shown.length === 0}
          className={`rounded-md px-1 text-xs font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <Accordion
        type="multiple"
        value={open}
        onValueChange={setOpen}
        className="w-full space-y-2"
      >
        <AnimatePresence initial={false}>
          {shown.map((f, i) => (
            <motion.div
              key={f.q}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{
                duration: reduce ? 0 : 0.25,
                delay: reduce ? 0 : i * 0.04,
              }}
            >
              <AccordionItem
                value={f.q}
                className="group rounded-xl border border-border bg-card px-4 text-card-foreground transition-all hover:border-primary/40 hover:shadow-sm data-[state=open]:border-primary/40 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="group/trigger text-left text-base font-medium hover:text-primary hover:no-underline [&>svg]:hidden">
                  <span>{f.q}</span>
                  <FiChevronDown
                    className="ml-2 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-primary motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </AccordionTrigger>
                <AccordionContent className="leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </AnimatePresence>

        {shown.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No questions match &quot;{trimmed}&quot;.
          </p>
        )}
      </Accordion>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/faq"
          className="group inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
        >
          {faqs.length > shown.length
            ? `See all ${faqs.length} questions`
            : "See all questions"}
          <FiArrowRight
            className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </Link>
      </p>
    </Section>
  );
}

export function NewsletterSection({ children }) {
  return (
    <Section
      labelledBy="news-title"
      className={`relative isolate overflow-hidden ${TINT}`}
      containerClassName="text-center"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute -bottom-20 right-1/4 size-56 rounded-full bg-highlight/10 blur-3xl" />
      </div>
      <h2
        id="news-title"
        className="text-balance text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight"
      >
        Learn something new every week
      </h2>
      <p className="mx-auto mb-5 mt-3 max-w-lg text-pretty text-muted-foreground">
        Short, practical emails on AI, web development, and careers.
      </p>
      <ul
        className="mb-8 flex flex-wrap justify-center gap-2"
        aria-label="Topics covered"
      >
        {["AI", "Web development", "Careers"].map((t) => (
          <li
            key={t}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
      {children}
    </Section>
  );
}
