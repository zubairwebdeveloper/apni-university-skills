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
import { AnimatePresence, motion } from "framer-motion";
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
    <Section labelledBy="why-title" className="bg-secondary/40">
      <SectionHeader
        id="why-title"
        eyebrow="Why Apni University"
        title="Learning built for real careers"
        center
      />
      <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {whyApni.map(({ icon: Icon, title, text }) => (
          <StaggerItem key={title}>
            <Card className="group relative h-full gap-3 overflow-hidden p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
              <span
                className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100 motion-reduce:transition-none"
                aria-hidden="true"
              />
              <span className="relative grid size-11 place-items-center rounded-lg bg-accent text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="relative font-serif text-lg font-semibold">
                {title}
              </h3>
              <p className="relative text-sm text-muted-foreground">{text}</p>
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
              className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full gap-4 p-6 transition-all group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-md motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold">
                    {p.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    {p.steps.length} steps
                  </Badge>
                </div>
                <ol className="space-y-3 border-l pl-5 text-sm text-muted-foreground">
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
      className="relative isolate overflow-hidden bg-foreground text-background"
      containerClassName="grid items-center gap-10 lg:grid-cols-2"
    >
      {/* Background: faint grid and two slow glows. Sits behind the content. */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.07]"
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
        <div className="absolute -bottom-24 right-0 size-80 rounded-full bg-highlight/10 blur-3xl motion-safe:animate-pulse" />
      </div>
      <style>{`@keyframes apni-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>

      <Reveal>
        <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-highlight">
          <FiCpu aria-hidden="true" />
          Technology & AI
        </p>
        <h2 id="tech-title" className="text-3xl sm:text-4xl">
          Understand the technology shaping your career
        </h2>
        <p className="mt-4 text-background/70">
          What each technology is, why it matters, which skills it needs, and
          the roles it leads to, with related courses, jobs, and articles.
        </p>

        <ul className="mt-6 space-y-3">
          {techPageCovers.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-background/10 text-highlight">
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="text-background/80">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/ai"
            className={buttonVariants({
              className:
                "bg-highlight text-highlight-foreground hover:bg-highlight/90",
            })}
          >
            Explore AI
          </Link>
          <Link
            href="/technology"
            className={buttonVariants({
              variant: "outline",
              className:
                "border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background",
            })}
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
              className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border border-background/15 bg-background/5 p-4 text-sm font-medium outline-none transition-all hover:-translate-y-1 hover:border-highlight/60 hover:bg-background/10 focus-visible:ring-2 focus-visible:ring-highlight motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <Icon
                className="size-5 text-highlight motion-safe:animate-[apni-float_4s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 300}ms` }}
                aria-hidden="true"
              />
              <span className="flex items-center justify-between gap-2">
                {title}
                <FiArrowRight
                  className="size-4 -translate-x-1 text-highlight opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
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
        <p className="mb-2 text-sm font-medium text-primary">Careers</p>
        <h2 id="career-title" className="text-3xl sm:text-4xl">
          From learning to earning
        </h2>
        <p className="mt-4 text-muted-foreground">
          Skills alone aren&apos;t enough. We help you plan the path, prepare
          for interviews, and build proof of work.
        </p>

        {/* The journey, as a short connected sequence. */}
        <ol className="mt-6 flex flex-col gap-3 border-l pl-5">
          {careerJourney.map((step, i) => (
            <li
              key={step}
              className="relative text-sm font-medium before:absolute before:-left-[1.6rem] before:top-1.5 before:size-2 before:rounded-full before:bg-primary"
            >
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
            <div className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0">
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
    <Section labelledBy="free-title" className="bg-secondary/40">
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
              className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full gap-2 p-6 transition-all group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-md motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-lg font-semibold">
                    {r.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    Free
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{r.text}</p>
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
  const [query, setQuery] = useState("");
  const [openAll, setOpenAll] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return faqs;
    const q = query.toLowerCase();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [query]);

  const shown = filtered.slice(0, 6);

  return (
    <Section labelledBy="faq-title" containerClassName="max-w-3xl">
      {/* Centered header */}
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

        {/* Search */}
        <div className="relative mt-6 w-full max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Expand / Collapse all */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setOpenAll((v) => !v)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {openAll ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <Accordion
        type={openAll ? "multiple" : "single"}
        collapsible
        value={openAll ? shown.map((_, i) => `faq-${i}`) : undefined}
        defaultValue={!openAll ? "faq-0" : undefined}
        className="w-full space-y-2"
      >
        <AnimatePresence initial={false}>
          {shown.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="group rounded-xl border border-border/60 bg-card/50 px-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <AccordionTrigger className="group/trigger text-left text-base font-medium hover:text-primary hover:no-underline [&>svg]:hidden">
                  <span>{f.q}</span>
                  <FiChevronDown
                    className="ml-2 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-primary"
                    aria-hidden="true"
                  />
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {f.a}
                  </motion.div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </AnimatePresence>

        {shown.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No questions match &quot;{query}&quot;.
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
      className="relative isolate overflow-hidden bg-secondary/40"
      containerClassName="text-center"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl motion-safe:animate-pulse" />
      </div>
      <h2 id="news-title" className="text-3xl text-center">
        Learn something new every week
      </h2>
      <p className="mx-auto mb-5 mt-3 text-center max-w-lg text-muted-foreground">
        Short, practical emails on AI, web development, and careers.
      </p>
      <ul
        className="mb-8 flex flex-wrap justify-center gap-2"
        aria-label="Topics covered"
      >
        {["AI", "Web development", "Careers"].map((t) => (
          <li
            key={t}
            className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground"
          >
            {t}
          </li>
        ))}
      </ul>
      {children}
    </Section>
  );
}
