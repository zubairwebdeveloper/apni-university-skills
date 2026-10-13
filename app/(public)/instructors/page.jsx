// app/(public)/instructors/page.jsx
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiChevronDown,
  FiCompass,
  FiLayers,
  FiMic,
  FiSearch,
  FiTarget,
  FiZap,
} from "react-icons/fi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTASection } from "@/components/public/CTASection";
import { InstructorsExplorer } from "@/components/public/InstructorsExplorer";
import { TiltCard } from "@/components/public/TiltCard";
import { Reveal } from "@/components/public/PricingMotion";
import {
  getInstructorSkills,
  getInstructorStudents,
} from "@/components/public/instructorUtils";

import { instructorService } from "@/services/instructorService";

export const revalidate = 300;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

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

  // Spotlight: only instructors with real student numbers, so nothing is invented
  const spotlight = instructors
    .map((i) => ({ instructor: i, students: getInstructorStudents(i) }))
    .filter((x) => x.students > 0 && x.instructor.slug)
    .sort((a, b) => b.students - a.students)
    .slice(0, 3);

  const stats = [
    { value: formatNumber(instructors.length), label: "Instructors" },
    ...(totalStudents > 0
      ? [{ value: formatNumber(totalStudents), label: "Students taught" }]
      : []),
    { value: formatNumber(skillCounts.size), label: "Expertise areas" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Apni University instructors",
    itemListElement: instructors
      .filter((i) => i.slug && i.name)
      .map((i, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: i.name,
        url: `${siteUrl}/instructors/${i.slug}`,
      })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHeader
        title="Learn from practitioners"
        description="Our instructors build and ship technology for a living."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Instructors" }]}
      >
        <ul className="mt-5 flex flex-wrap gap-2">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
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

        {/* Stats: one quiet strip */}
        {instructors.length > 0 && (
          <Container className="relative pt-10 sm:pt-12">
            <dl
              className={`grid divide-x divide-border border-y border-border ${
                stats.length === 3 ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col-reverse items-center gap-1 px-2 py-5 text-center sm:flex-row sm:justify-center sm:gap-3 sm:py-6"
                >
                  <dt className="text-xs text-muted-foreground sm:text-sm">
                    {s.label}
                  </dt>
                  <dd className="font-serif text-2xl font-semibold tabular-nums text-foreground sm:text-4xl">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        )}

        {/* Explorer: the main job of this page, so nothing delays it */}
        <Container className="relative py-10 sm:py-12">
          <InstructorsExplorer instructors={instructors} />
        </Container>

        {/* Spotlight: real data only, with a 3D depth treatment on desktop */}
        {spotlight.length >= 2 && (
          <section
            aria-labelledby="spotlight-title"
            className="border-t bg-muted/30 py-14 sm:py-20"
          >
            <Container>
              <h2
                id="spotlight-title"
                className="max-w-xl text-balance text-3xl sm:text-4xl"
              >
                Most students taught
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                The instructors whose courses have reached the most learners.
              </p>

              <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {spotlight.map(({ instructor: i, students }) => (
                  <li key={i.slug} className="min-w-0">
                    <Link
                      href={`/instructors/${i.slug}`}
                      className="group block h-full rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <TiltCard className="h-full" max={8}>
                        <div className="flex h-full flex-col items-center rounded-3xl border bg-card p-6 text-center shadow-sm transition-colors [transform-style:preserve-3d] group-hover:border-primary/40 motion-reduce:transition-none sm:p-8">
                          <div className="relative size-24 [transform-style:preserve-3d] sm:size-28">
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 rounded-full bg-highlight/40 [transform:translateZ(-14px)_translate(8px,8px)]"
                            />
                            <Avatar className="size-full border-4 border-background shadow-lg [transform:translateZ(40px)]">
                              <AvatarImage src={i.avatar} alt="" />
                              <AvatarFallback className="font-serif text-3xl">
                                {i.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <h3 className="mt-6 font-serif text-xl font-semibold text-foreground [transform:translateZ(24px)]">
                            {i.name}
                          </h3>
                          {i.designation && (
                            <p className="mt-1 text-sm text-muted-foreground [transform:translateZ(16px)]">
                              {i.designation}
                            </p>
                          )}
                          <p className="mt-4 text-sm font-medium text-foreground [transform:translateZ(16px)]">
                            <span className="font-serif text-lg tabular-nums">
                              {formatNumber(students)}
                            </span>{" "}
                            students
                          </p>
                          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary">
                            View profile
                            <FiArrowRight
                              aria-hidden="true"
                              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                            />
                          </span>
                        </div>
                      </TiltCard>
                    </Link>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        {/* Top expertise */}
        {topSkills.length > 0 && (
          <section
            aria-labelledby="skills-title"
            className="border-t py-14 sm:py-20"
          >
            <Container>
              <h2
                id="skills-title"
                className="max-w-xl text-balance text-3xl sm:text-4xl"
              >
                Expertise across our team
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                These are the skills our instructors work with every day. The
                number shows how many instructors share each one.
              </p>
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {topSkills.map(([skill, count]) => (
                  <li key={skill}>
                    <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground">
                      {skill}
                      <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
                        {count}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        )}

        {/* Why practitioners: open columns */}
        <section
          aria-labelledby="why-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <h2
              id="why-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              Why learn from practitioners
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              People who do the work every day teach what the job is really
              like.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {benefits.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="min-w-0 border-t-2 border-primary pt-5"
                >
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                  <h3 className="mt-3 font-sans text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* How we choose: numbered criteria */}
        <section
          aria-labelledby="select-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <h2
              id="select-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              How we choose our instructors
            </h2>

            <Reveal>
              <ol className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                />
                {selection.map(({ title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 sm:block sm:pr-4"
                  >
                    <span
                      aria-hidden="true"
                      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border font-serif text-base font-semibold ${
                        i === selection.length - 1
                          ? "border-highlight bg-highlight text-foreground"
                          : "border-primary bg-background text-primary"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="sm:mt-5">
                      <h3 className="font-sans text-base font-semibold text-foreground">
                        <span className="sr-only">Step {i + 1}: </span>
                        {title}
                      </h3>
                      <p className="mt-1 max-w-xs text-sm text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </Container>
        </section>

        {/* Teach banner */}
        <section className="border-t bg-muted/30 py-14 sm:py-16">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="flex items-start gap-4">
                <FiMic
                  aria-hidden="true"
                  className="mt-1 size-7 shrink-0 text-primary"
                />
                <div>
                  <h2 className="text-balance text-2xl sm:text-3xl">
                    Want to teach at Apni University?
                  </h2>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    If you have real experience and enjoy sharing it, tell us
                    about your background and the topic you would like to teach.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:shrink-0">
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: "default", size: "lg" })}
                >
                  Contact us
                </Link>
                <Link
                  href="/courses"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  <FiSearch aria-hidden="true" />
                  Browse courses
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Careers banner */}
        <section className="border-t py-10 sm:py-12">
          <Container>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <FiCompass
                  aria-hidden="true"
                  className="mt-0.5 size-6 shrink-0 text-primary"
                />
                <div>
                  <h2 className="text-lg sm:text-xl">
                    Not sure where to start?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
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
          </Container>
        </section>

        {/* FAQ: heading left, accordion right */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <h2
                id="faq-title"
                className="text-balance text-3xl sm:text-4xl lg:col-span-4"
              >
                Instructor questions
              </h2>

              <div className="divide-y divide-border border-y border-border lg:col-span-8">
                {faqs.map(({ q, a }) => (
                  <details key={q} className="group py-1">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 text-left text-base font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="max-w-2xl pb-4 text-muted-foreground">{a}</p>
                  </details>
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
