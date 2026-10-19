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
  FiTrendingUp,
  FiMail,
  FiX,
  FiUnlock,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useMemo, useRef } from "react";
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

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
// `apni-landing` activates the shared colour tokens (#111318 surface, #FACC15
// primary, violet accent). HeroSection and TechStrip already emit that CSS,
// so it is on the page whenever they are. If these sections are used without
// them, move THEME_CSS (see HeroSection.jsx) into globals.css.
const SCOPE = "apni-landing bg-background text-foreground";
const TINT = "apni-landing bg-muted/40 text-foreground border-y border-border";

const VIOLET = "text-[color:var(--violet)]";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
// Cards react with a border change only, so they stay still when scanned.
const CARD_HOVER =
  "border-border transition-colors duration-200 motion-reduce:transition-none";
const LABEL_BADGE =
  "mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-foreground/80";
const H2 =
  "text-balance text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.1] tracking-[-0.025em]";
const LEAD =
  "mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-[1.0625rem]";
const MONO_INDEX = "font-mono text-xs font-medium tabular-nums tracking-wider";

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
  {
    title: "Plan the path",
    hint: "Pick a role and the roadmap that leads to it",
  },
  {
    title: "Prepare for interviews",
    hint: "Know what employers ask and how to answer",
  },
  {
    title: "Build proof of work",
    hint: "Turn what you learn into projects you can show",
  },
  { title: "Apply for jobs", hint: "Get in front of companies hiring for it" },
];

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */
// Real figures only. Pass `stats` ([{ label, value }]) from your data; the
// strip renders nothing when it is empty, so no invented numbers appear.
export function StatsStrip({ stats = [] }) {
  if (!Array.isArray(stats) || !stats.length) return null;

  return (
    <Section className={SCOPE} containerClassName="py-10 sm:py-12">
      <Reveal>
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`px-4 py-6 text-center sm:px-6 sm:py-7 ${
                i > 0 ? "sm:border-l sm:border-border" : ""
              } ${i % 2 === 1 ? "border-l border-border sm:border-l" : ""} ${
                i >= 2 ? "border-t border-border sm:border-t-0" : ""
              }`}
            >
              <dd className="text-3xl font-semibold tabular-nums tracking-tight text-primary sm:text-4xl">
                {s.value}
              </dd>
              <dt className="mt-1.5 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Why Apni                                                            */
/* ------------------------------------------------------------------ */
export function WhyApni() {
  return (
    <Section labelledBy="why-title" className={TINT}>
      <SectionHeader
        id="why-title"
        eyebrow="Why Apni University"
        title="Learning built for real careers"
        description="Four reasons students finish what they start here instead of abandoning another course halfway."
        center
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {whyApni.map(({ icon: Icon, title, text }, i) => (
          <StaggerItem key={title}>
            <Card
              className={`group relative h-full gap-3 overflow-hidden p-6 shadow-sm hover:border-primary/60 ${CARD_HOVER}`}
            >
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span
                  aria-hidden="true"
                  className={`${MONO_INDEX} ${VIOLET} opacity-70`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">{text}</p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Learning paths                                                      */
/* ------------------------------------------------------------------ */
// The "Most popular" tag follows `p.popular` when your data has it,
// and otherwise marks the first path, as before.
export function LearningPaths() {
  return (
    <Section labelledBy="paths-title" className={SCOPE}>
      <SectionHeader
        id="paths-title"
        eyebrow="Learning paths"
        title="Follow a roadmap, not a random playlist"
        description="Each roadmap lists what to learn, in the order we recommend. Pick one and every next step is already decided."
        href="/careers"
        hrefLabel="All career paths"
      />
      <Stagger className="grid gap-5 pt-2 sm:grid-cols-2 lg:grid-cols-4">
        {learningPaths.map((p, i) => (
          <StaggerItem key={p.slug}>
            <Link
              href={`/careers/${p.slug}`}
              className={`group relative block h-full rounded-xl ${FOCUS}`}
            >
              <Card
                className={`h-full gap-4 p-6 shadow-sm group-hover:border-primary/60 ${CARD_HOVER}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-snug tracking-tight">
                    {p.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    {p.steps.length} steps
                  </Badge>
                </div>
                <ol className="space-y-3 border-l border-border pl-5 text-sm text-muted-foreground">
                  {p.steps.map((s, idx) => (
                    <li
                      key={s}
                      className="relative before:absolute before:-left-[1.6rem] before:top-2 before:size-2 before:rounded-full before:bg-border before:transition-colors group-hover:text-foreground group-hover:before:bg-primary motion-reduce:before:transition-none"
                    >
                      <span className="sr-only">Step {idx + 1}: </span>
                      {s}
                    </li>
                  ))}
                </ol>
                <span className="mt-auto inline-flex items-center gap-1 border-t border-border pt-4 text-sm font-medium text-primary">
                  View roadmap
                  <FiArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    aria-hidden="true"
                  />
                </span>
              </Card>
              {(p.popular ?? i === 0) && (
                <span className="pointer-events-none absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
                  <FiTrendingUp className="size-3" aria-hidden="true" />
                  Most popular
                </span>
              )}
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Technology & AI                                                     */
/* ------------------------------------------------------------------ */
export function TechnologyAISection() {
  return (
    <Section
      labelledBy="tech-title"
      className={`relative isolate overflow-hidden ${TINT}`}
      containerClassName="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
    >
      {/* Decorative background: a faint grid, no moving parts. */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 text-foreground opacity-[0.05]"
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
      </div>

      <Reveal>
        <p className={LABEL_BADGE}>
          <FiCpu className="text-primary" aria-hidden="true" />
          Technology &amp; AI
        </p>
        <h2 id="tech-title" className={H2}>
          Understand the technology shaping your{" "}
          <span className="text-primary">career</span>
        </h2>
        <p className={LEAD}>
          What each technology is, why it matters, which skills it needs, and
          the roles it leads to, with related courses, jobs, and articles.
        </p>

        <p className="mt-8 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Every technology page covers
        </p>
        <ul className="mt-3 space-y-3">
          {techPageCovers.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-[color:var(--violet)]/10 ${VIOLET}`}
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="pt-1 leading-5 text-foreground/90">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/ai" className={buttonVariants({ size: "lg" })}>
            Explore AI
            <FiArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="/technology"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            All technologies
          </Link>
        </div>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {technologyTopics.map(({ title, href, icon: Icon }) => (
          <StaggerItem key={href}>
            <Link
              href={href}
              className={`group relative flex h-full min-h-28 flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4 text-sm font-medium text-card-foreground shadow-sm hover:border-primary/60 ${CARD_HOVER} ${FOCUS}`}
            >
              {/* Accent line, revealed on hover */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
              />
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="mt-auto flex items-center justify-between gap-2">
                {title}
                <FiArrowRight
                  className="size-4 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
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

/* ------------------------------------------------------------------ */
/* Careers                                                             */
/* ------------------------------------------------------------------ */
export function CareerSection() {
  return (
    <Section
      labelledBy="career-title"
      className={SCOPE}
      containerClassName="grid items-center gap-10 lg:grid-cols-2 lg:gap-14"
    >
      <Reveal>
        <p className={LABEL_BADGE}>Careers</p>
        <h2 id="career-title" className={H2}>
          From learning to <span className="text-primary">earning</span>
        </h2>
        <p className={LEAD}>
          Skills alone aren&apos;t enough. We help you plan the path, prepare
          for interviews, and build proof of work, then put you in front of the
          companies hiring for it.
        </p>

        {/* The journey is a real sequence, so the numbers stay. */}
        <ol className="mt-8 flex flex-col gap-5 border-l border-border pl-7">
          {careerJourney.map((step, i) => (
            <li
              key={step.title}
              className="relative before:absolute before:-left-[2.2rem] before:top-1.5 before:size-2.5 before:rounded-full before:bg-primary before:ring-4 before:ring-background"
            >
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span aria-hidden="true" className={`${MONO_INDEX} ${VIOLET}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </div>
              <p className="mt-1 pl-8 text-sm leading-6 text-muted-foreground">
                {step.hint}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/careers" className={buttonVariants({ size: "lg" })}>
            Explore careers
            <FiArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="/jobs"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            See open jobs
          </Link>
        </div>
      </Reveal>

      <Stagger className="grid gap-3 sm:grid-cols-2">
        {careerTopics.map((t) => (
          <StaggerItem key={t}>
            <div
              className={`group flex h-full items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium text-card-foreground shadow-sm hover:border-primary/60 ${CARD_HOVER}`}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
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

/* ------------------------------------------------------------------ */
/* Free resources                                                      */
/* ------------------------------------------------------------------ */
export function FreeResources() {
  return (
    <Section labelledBy="free-title" className={TINT}>
      <SectionHeader
        id="free-title"
        eyebrow="Free to start"
        title="Free learning resources"
        description="You don't need a credit card to begin. Browse, read, and try the platform before you commit."
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {freeResources.map((r) => (
          <StaggerItem key={r.href}>
            <Link
              href={r.href}
              className={`group block h-full rounded-xl ${FOCUS}`}
            >
              <Card
                className={`h-full gap-2 p-6 shadow-sm group-hover:border-primary/60 ${CARD_HOVER}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-snug tracking-tight">
                    {r.title}
                  </h3>
                  <Badge className="shrink-0 gap-1 bg-primary text-primary-foreground hover:bg-primary">
                    <FiUnlock className="size-3" aria-hidden="true" />
                    Free
                  </Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {r.text}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 border-t border-border pt-4 text-sm font-medium text-primary">
                  Open
                  <FiArrowRight
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
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

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */
export function FAQSection() {
  const reduce = useReducedMotion();
  const inputRef = useRef(null);
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

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <Section
      labelledBy="faq-title"
      className={SCOPE}
      containerClassName="max-w-3xl"
    >
      <div className="mx-auto mb-10 flex max-w-xl flex-col items-center text-center">
        <SectionHeader
          id="faq-title"
          eyebrow="FAQ"
          title="Questions, answered"
          center
        />
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Everything you need to know. Can&apos;t find your answer? Reach out
          anytime.
        </p>

        <div className="relative mt-6 w-full max-w-sm">
          <FiSearch
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            aria-label="Search frequently asked questions"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && query) {
                e.preventDefault();
                setQuery("");
              }
            }}
            placeholder="Search questions..."
            className="h-12 w-full rounded-xl border border-border bg-card py-2 pl-10 pr-11 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 motion-reduce:transition-none [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className={`absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none ${FOCUS}`}
            >
              <FiX className="size-4" aria-hidden="true" />
            </button>
          )}
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
          className={`min-h-9 rounded-md px-2 text-xs font-medium text-primary underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50 ${FOCUS}`}
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
                delay: reduce ? 0 : Math.min(i, 6) * 0.04,
              }}
            >
              <AccordionItem
                value={f.q}
                className="group rounded-xl border border-border bg-card px-4 text-card-foreground shadow-sm transition-colors duration-200 hover:border-primary/50 data-[state=open]:border-primary/60 motion-reduce:transition-none"
              >
                <AccordionTrigger className="group/trigger min-h-14 gap-3 text-left text-base font-medium hover:text-primary hover:no-underline [&>svg]:hidden">
                  <span>{f.q}</span>
                  <FiChevronDown
                    className="ml-2 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-primary motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </AccordionTrigger>
                <AccordionContent className="leading-7 text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </AnimatePresence>

        {shown.length === 0 && (
          <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
            <span className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <FiSearch className="size-5" aria-hidden="true" />
            </span>
            <p className="font-medium">
              No questions match &quot;{trimmed}&quot;
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a shorter search, or browse the full list.
            </p>
            <button
              type="button"
              onClick={clearSearch}
              className={buttonVariants({
                variant: "outline",
                className: "mt-4",
              })}
            >
              Clear search
            </button>
          </div>
        )}
      </Accordion>

      <p className="mt-6 text-center text-sm">
        <Link
          href="/faq"
          className={`group inline-flex min-h-10 items-center gap-1 rounded-sm font-medium text-primary underline-offset-4 hover:underline ${FOCUS}`}
        >
          {faqs.length > shown.length
            ? `See all ${faqs.length} questions`
            : "See all questions"}
          <FiArrowRight
            className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            aria-hidden="true"
          />
        </Link>
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */
export function NewsletterSection({ children }) {
  return (
    <Section
      labelledBy="news-title"
      className={TINT}
      containerClassName="text-center"
    >
      <Reveal>
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-border bg-card text-primary shadow-sm">
          <FiMail className="size-5" aria-hidden="true" />
        </span>
        <h2 id="news-title" className={H2}>
          Learn something new <span className="text-primary">every week</span>
        </h2>
        <p className="mx-auto mb-5 mt-3 max-w-lg text-pretty text-base leading-7 text-muted-foreground">
          Short, practical emails on AI, web development, and careers, read in
          under three minutes, no filler.
        </p>
        <ul
          className="mb-8 flex flex-wrap justify-center gap-2"
          aria-label="Topics covered"
        >
          {["AI", "Web development", "Careers"].map((t) => (
            <li
              key={t}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80"
            >
              <FiCheck className="size-3 text-primary" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
        <div className="mx-auto w-full max-w-lg">{children}</div>
        <p className="mt-5 text-xs text-muted-foreground">
          Free forever, unsubscribe in one click. No spam, ever.
        </p>
      </Reveal>
    </Section>
  );
}
