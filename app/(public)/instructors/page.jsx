// app/(public)/instructors/page.jsx
import Link from "next/link";
import {
  FiAward,
  FiBriefcase,
  FiChevronDown,
  FiCompass,
  FiGlobe,
  FiLayers,
  FiMic,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { CTASection } from "@/components/public/CTASection";
import { InstructorsExplorer } from "@/components/public/InstructorsExplorer";
import { Reveal } from "@/components/public/PricingMotion";
import {
  getInstructorSkills,
  getInstructorStudents,
} from "@/components/public/instructorUtils";

import { instructorService } from "@/services/instructorService";

export const revalidate = 300;

export const metadata = {
  title: "Instructors",
  description: "Meet the practitioners who teach at Apni University.",
  alternates: { canonical: "/instructors" },
};

const chips = [
  { icon: FiBriefcase, text: "Working professionals" },
  { icon: FiTarget, text: "Real-world projects" },
  { icon: FiZap, text: "Practical teaching" },
];

const benefits = [
  {
    icon: FiBriefcase,
    title: "Real industry experience",
    text: "Our instructors build and ship products, so lessons come from the work, not only from books.",
  },
  {
    icon: FiTarget,
    title: "Focus on what matters",
    text: "They teach the skills employers ask for, and skip what you will never use.",
  },
  {
    icon: FiLayers,
    title: "Project-based learning",
    text: "You build real projects that you can show in your portfolio.",
  },
  {
    icon: FiAward,
    title: "Clear guidance",
    text: "Step-by-step lessons and honest advice on how to grow in your career.",
  },
];

const selection = [
  {
    title: "Proven experience",
    text: "We look for people who work in the field and have real projects to show.",
  },
  {
    title: "Teaching ability",
    text: "They must explain hard ideas clearly, in simple language, to beginners.",
  },
  {
    title: "Course review",
    text: "Each course is reviewed for quality and accuracy before it is published.",
  },
];

const faqs = [
  {
    q: "Who teaches the courses?",
    a: "Working practitioners: developers, designers and data professionals who build technology for a living and enjoy teaching it.",
  },
  {
    q: "How do I choose the right instructor?",
    a: "Search by skill, open an instructor profile to see their courses and background, and watch a free preview lesson to check that their teaching style suits you.",
  },
  {
    q: "Can I ask an instructor a question?",
    a: "It depends on the course. Check the course page for how questions and support are handled.",
  },
  {
    q: "Can I become an instructor?",
    a: "If you have real experience and enjoy explaining it, we would like to hear from you. Contact us with your background and the topic you would like to teach.",
  },
];

function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function InstructorsPage() {
  const raw = await instructorService.getAllInstructors();

  // Make sure the data is plain JSON before it reaches a Client Component
  // (Firestore Timestamps and class instances would otherwise throw).
  const instructors = JSON.parse(JSON.stringify(raw ?? []));

  const skillCounts = new Map();
  let totalStudents = 0;
  instructors.forEach((i) => {
    totalStudents += getInstructorStudents(i);
    getInstructorSkills(i).forEach((s) =>
      skillCounts.set(s, (skillCounts.get(s) || 0) + 1),
    );
  });

  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14);

  const stats = [
    {
      icon: FiUsers,
      value: formatNumber(instructors.length),
      label: "Instructors",
    },
    ...(totalStudents > 0
      ? [
          {
            icon: FiTrendingUp,
            value: formatNumber(totalStudents),
            label: "Students taught",
          },
        ]
      : []),
    {
      icon: FiGlobe,
      value: formatNumber(skillCounts.size),
      label: "Expertise areas",
    },
  ];

  return (
    <>
      <PageHeader
        title="Learn from practitioners"
        description="Our instructors build and ship technology for a living."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Instructors" }]}
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
        {instructors.length > 0 && (
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
        )}

        {/* Explorer */}
        <Container className="relative py-10">
          <Reveal>
            <InstructorsExplorer instructors={instructors} />
          </Reveal>
        </Container>

        {/* Top expertise */}
        {topSkills.length > 0 && (
          <section
            aria-labelledby="skills-title"
            className="border-t bg-muted/20 py-12 sm:py-16"
          >
            <Container>
              <Reveal className="mx-auto max-w-2xl text-center">
                <Badge variant="secondary" className="mb-3">
                  What they teach
                </Badge>
                <h2 id="skills-title" className="text-2xl sm:text-3xl">
                  Expertise across our team
                </h2>
                <p className="mt-3 text-muted-foreground">
                  These are the skills our instructors work with every day.
                </p>
              </Reveal>
              <Reveal delay={0.1}>
                <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
                  {topSkills.map(([skill, count]) => (
                    <li key={skill}>
                      <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                        {skill}
                        <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                          {count}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </Container>
          </section>
        )}

        {/* Why practitioners */}
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
                Why learn from practitioners
              </h2>
              <p className="mt-3 text-muted-foreground">
                People who do the work every day teach what the job is really
                like.
              </p>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
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
            </ul>
          </Container>
        </section>

        {/* How we choose */}
        <section
          aria-labelledby="select-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-4xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Quality first
              </Badge>
              <h2 id="select-title" className="text-2xl sm:text-3xl">
                How we choose our instructors
              </h2>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {selection.map(({ title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="h-full rounded-2xl border bg-card p-5 text-center">
                      <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
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

        {/* Teach banner */}
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
                      <FiMic aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl">
                        Want to teach at Apni University?
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        If you have real experience and enjoy sharing it, tell
                        us about your background and the topic you would like to
                        teach.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className={buttonVariants({ variant: "default" })}
                    >
                      Contact us
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

        {/* Careers banner */}
        <section className="border-t bg-muted/20 py-10 sm:py-12">
          <Container>
            <Reveal>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FiCompass aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl">
                      Not sure where to start?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pick a career path first, then learn the skills with the
                      right instructor.
                    </p>
                  </div>
                </div>
                <Link
                  href="/careers"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Explore career paths
                </Link>
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
                Instructor questions
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
