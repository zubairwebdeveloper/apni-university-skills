// app/(public)/careers/page.jsx

import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiChevronDown,
  FiCompass,
  FiDollarSign,
  FiHelpCircle,
  FiLayers,
  FiMap,
  FiSearch,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { CTASection } from "@/components/public/CTASection";
import { CareersExplorer } from "@/components/public/CareersExplorer";
import { Reveal } from "@/components/public/PricingMotion";
import {
  getCareerCategory,
  getCareerSkills,
} from "@/components/public/careerUtils";

import { careerService } from "@/services/careerService";

import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata = {
  title: "Career paths",
  description:
    "Roadmaps, skills, interview preparation, and portfolio ideas for the most common technology roles.",
  alternates: {
    canonical: "/careers",
  },
};

const steps = [
  {
    icon: FiSearch,
    title: "Pick a role",
    text: "Search or filter the guides to find a role that matches your interests.",
  },
  {
    icon: FiTarget,
    title: "Check the skills",
    text: "See which skills the role needs and which ones you already have.",
  },
  {
    icon: FiMap,
    title: "Follow the roadmap",
    text: "Go step by step, from the basics to job-ready projects.",
  },
  {
    icon: FiAward,
    title: "Prepare and apply",
    text: "Practice interview questions and build a portfolio that proves your skills.",
  },
];

const faqs = [
  {
    q: "Which career path should I start with?",
    a: "Start with the role that interests you most. Each guide lists the skills and a beginner-friendly roadmap, so you can judge the effort before you commit.",
  },
  {
    q: "Do I need a degree to follow these roadmaps?",
    a: "No. The roadmaps focus on skills and portfolio projects, which many employers value highly. A degree can help, but it is not required to start learning.",
  },
  {
    q: "How long does a roadmap take?",
    a: "It depends on your starting level and how many hours you study each week. Consistent practice matters more than speed.",
  },
  {
    q: "Can I switch paths later?",
    a: "Yes. Many technology skills overlap, so what you learn for one role usually helps with another.",
  },
  {
    q: "What if a role needs a skill I already have?",
    a: "Skip ahead. Each roadmap is a guide, not a strict order, so you can start from wherever your current skills place you.",
  },
];

// Shared class strings keep every section consistent.
const sectionEyebrow =
  "mb-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider";
const sectionTitle =
  "text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl";
const cardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";
const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary motion-reduce:transition-none";
const countPill =
  "rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary";

export default async function CareersPage() {
  const raw = await careerService.getAllCareers();

  // Make sure the data is plain JSON before it reaches a Client Component
  // (Firestore Timestamps and class instances would otherwise throw).
  const careers = JSON.parse(JSON.stringify(raw ?? []));

  // Stats derived from the data
  const categoryCounts = new Map();
  careers.forEach((c) => {
    const cat = getCareerCategory(c);
    if (cat) categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
  });
  const categorySet = new Set(careers.map(getCareerCategory));

  const skillCounts = new Map();
  careers.forEach((c) =>
    getCareerSkills(c).forEach((s) =>
      skillCounts.set(s, (skillCounts.get(s) || 0) + 1),
    ),
  );
  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14);

  const topCategories = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  );

  const withSalaryData = careers.filter(
    (c) => c.salary && (c.salary.min != null || c.salary.max != null),
  ).length;

  const stats = [
    { icon: FiBriefcase, value: careers.length, label: "Career paths" },
    { icon: FiLayers, value: categorySet.size, label: "Categories" },
    { icon: FiTrendingUp, value: skillCounts.size, label: "Skills covered" },
    { icon: FiDollarSign, value: withSalaryData, label: "With salary data" },
  ];

  return (
    <>
      <PageHeader
        title="Career paths in technology"
        description="Pick a role to see the skills it needs, a step-by-step roadmap, how to prepare for interviews, and what to put in your portfolio."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />

      <div className="relative overflow-x-clip">
        {/* Soft background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />

        {/* Stats */}
        {careers.length > 0 && (
          <Container className="relative pt-8 sm:pt-10">
            <ul
              aria-label="Careers at a glance"
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
            >
              {stats.map(({ icon: Icon, value, label }, i) => (
                <li key={label} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div
                      className={cn(
                        "group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5",
                        cardHover,
                      )}
                    >
                      <span className={cn(iconTile, "size-11 sm:size-12")}>
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-3xl font-semibold leading-none tabular-nums text-foreground">
                          {value}
                        </p>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                          {label}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        )}

        {/* Explorer */}
        <Container className="relative py-8 sm:py-10 lg:py-12">
          <Reveal>
            <CareersExplorer careers={careers} />
          </Reveal>
        </Container>

        {/* Categories at a glance (derived entirely from fetched data) */}
        {topCategories.length > 0 && (
          <section
            aria-labelledby="categories-title"
            className="border-t border-border py-12 sm:py-16 lg:py-20"
          >
            <Container>
              <Reveal className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className={sectionEyebrow}>
                  Categories at a glance
                </Badge>
                <h2 id="categories-title" className={sectionTitle}>
                  Roles grouped by category
                </h2>
                <p className="mx-auto mt-3 max-w-prose text-pretty text-muted-foreground">
                  Use the filters above to narrow the list to one of these.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
                  {topCategories.map(([category, count]) => (
                    <li key={category}>
                      <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-4 pr-2.5 text-sm font-medium text-foreground shadow-sm">
                        {category}
                        <span className={countPill}>
                          {count} {count === 1 ? "path" : "paths"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Container>
          </section>
        )}

        {/* Skills in demand */}
        {topSkills.length > 0 && (
          <section
            aria-labelledby="skills-title"
            className="border-t border-border bg-muted/20 py-12 sm:py-16 lg:py-20"
          >
            <Container>
              <Reveal className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className={sectionEyebrow}>
                  Skills in demand
                </Badge>
                <h2 id="skills-title" className={sectionTitle}>
                  Skills that appear across many roles
                </h2>
                <p className="mx-auto mt-3 max-w-prose text-pretty text-muted-foreground">
                  These skills show up most often in our career guides. Learning
                  them keeps your options open.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
                  {topSkills.map(([skill, count]) => (
                    <li key={skill}>
                      <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-4 pr-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                        {skill}
                        <span className={countPill}>
                          {count} {count === 1 ? "role" : "roles"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Container>
          </section>
        )}

        {/* How to use */}
        <section
          aria-labelledby="steps-title"
          className="border-t border-border py-12 sm:py-16 lg:py-20"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className={sectionEyebrow}>
                How it works
              </Badge>
              <h2 id="steps-title" className={sectionTitle}>
                From curious to job-ready
              </h2>
              <p className="mx-auto mt-3 max-w-prose text-pretty text-muted-foreground">
                Four simple steps to turn a career guide into a real plan.
              </p>
            </Reveal>
            <ol className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div
                      className={cn(
                        "group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-6",
                        cardHover,
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-1 -top-3 select-none font-serif text-7xl font-semibold tabular-nums text-primary/5"
                      >
                        {i + 1}
                      </span>
                      <span className={cn(iconTile, "relative size-11")}>
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <p className="relative mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                        Step {i + 1}
                      </p>
                      <h3 className="relative mt-0.5 font-sans text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* Find courses banner */}
        <section className="border-t border-border bg-muted/20 py-12 sm:py-14 lg:py-16">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10 lg:p-12">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/5 blur-2xl"
                />
                <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                      <FiCompass aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        Ready to learn the skills?
                      </h2>
                      <p className="mt-1.5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                        Pick a role above, then find courses that teach the
                        skills it needs. Many courses are free.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/courses"
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "group w-full sm:w-auto",
                    )}
                  >
                    Browse courses
                    <FiArrowRight
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-title"
          className="border-t border-border py-12 sm:py-16 lg:py-20"
        >
          <Container className="max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <Reveal className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                    <FiHelpCircle aria-hidden="true" className="size-5" />
                  </span>
                  <h2 id="faq-title" className={sectionTitle}>
                    Career questions
                  </h2>
                  <p className="mt-3 text-pretty text-muted-foreground">
                    Common questions about choosing and following a career path.
                  </p>
                </div>
              </Reveal>

              <div className="space-y-3 lg:col-span-8">
                {faqs.map(({ q, a }, i) => (
                  <Reveal key={q} delay={i * 0.06}>
                    <details className="group rounded-xl border border-border bg-card px-4 py-3.5 transition-colors duration-200 hover:border-primary/30 open:border-primary/30 open:shadow-md motion-reduce:transition-none sm:px-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base [&::-webkit-details-marker]:hidden">
                        {q}
                        <FiChevronDown
                          aria-hidden="true"
                          className="size-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                        />
                      </summary>
                      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {a}
                      </p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
