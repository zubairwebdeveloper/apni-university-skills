// app/(public)/careers/page.jsx

import Link from "next/link";
import {
  FiAward,
  FiBriefcase,
  FiChevronDown,
  FiCompass,
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
];

export default async function CareersPage() {
  const raw = await careerService.getAllCareers();

  // Make sure the data is plain JSON before it reaches a Client Component
  // (Firestore Timestamps and class instances would otherwise throw).
  const careers = JSON.parse(JSON.stringify(raw ?? []));

  // Stats derived from the data
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

  const stats = [
    { icon: FiBriefcase, value: careers.length, label: "Career paths" },
    { icon: FiLayers, value: categorySet.size, label: "Categories" },
    { icon: FiTrendingUp, value: skillCounts.size, label: "Skills covered" },
  ];

  return (
    <>
      <PageHeader
        title="Career paths in technology"
        description="Pick a role to see the skills it needs, a step-by-step roadmap, how to prepare for interviews, and what to put in your portfolio."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />

      <div className="relative overflow-x-clip">
        {/* Soft background glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        {/* Stats */}
        {careers.length > 0 && (
          <Container className="relative pt-10">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        )}

        {/* Explorer */}
        <Container className="relative py-10">
          <Reveal>
            <CareersExplorer careers={careers} />
          </Reveal>
        </Container>

        {/* Skills in demand */}
        {topSkills.length > 0 && (
          <section
            aria-labelledby="skills-title"
            className="border-t bg-muted/20 py-12 sm:py-16"
          >
            <Container>
              <Reveal className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className="mb-3">
                  Skills in demand
                </Badge>
                <h2 id="skills-title" className="text-2xl sm:text-3xl">
                  Skills that appear across many roles
                </h2>
                <p className="mt-3 text-muted-foreground">
                  These skills show up most often in our career guides. Learning
                  them keeps your options open.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {topSkills.map(([skill, count]) => (
                    <li key={skill}>
                      <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                        {skill}
                        <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
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
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                How it works
              </Badge>
              <h2 id="steps-title" className="text-2xl sm:text-3xl">
                From curious to job-ready
              </h2>
              <p className="mt-3 text-muted-foreground">
                Four simple steps to turn a career guide into a real plan.
              </p>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, text }, i) => (
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

        {/* Find courses banner */}
        <section className="border-t bg-muted/20 py-12 sm:py-14">
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
                        Ready to learn the skills?
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        Pick a role above, then find courses that teach the
                        skills it needs. Many courses are free.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/courses"
                    className={buttonVariants({ variant: "default" })}
                  >
                    Browse courses
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-title"
          className="border-t py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className="text-2xl sm:text-3xl">
                Career questions
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
