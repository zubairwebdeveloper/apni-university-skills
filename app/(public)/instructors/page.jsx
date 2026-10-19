// app/(public)/instructors/page.jsx
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBriefcase,
  FiChevronDown,
  FiCompass,
  FiHelpCircle,
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

import { cn } from "@/lib/utils";

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

const eyebrow =
  "mb-3 inline-block text-xs font-semibold uppercase tracking-wider text-primary";
const sectionTitle =
  "text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl";
const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15";

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
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur"
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

        {/* Stats: one quiet strip */}
        {instructors.length > 0 && (
          <Container className="relative pt-10 sm:pt-12">
            <Reveal>
              <dl
                className={cn(
                  "grid divide-x divide-border rounded-2xl border border-border bg-card/60 shadow-sm backdrop-blur",
                  stats.length === 3 ? "grid-cols-3" : "grid-cols-2",
                )}
              >
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col-reverse items-center gap-1 px-2 py-5 text-center sm:flex-row sm:justify-center sm:gap-3 sm:py-7"
                  >
                    <dt className="text-xs font-medium text-muted-foreground sm:text-sm">
                      {s.label}
                    </dt>
                    <dd className="font-serif text-2xl font-semibold tabular-nums text-foreground sm:text-4xl">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Container>
        )}

        {/* Explorer: the main job of this page, so nothing delays it */}
        <Container className="relative py-10 sm:py-12 lg:py-14">
          <InstructorsExplorer instructors={instructors} />
        </Container>

        {/* Spotlight: real data only, with a 3D depth treatment on desktop */}
        {spotlight.length >= 2 && (
          <section
            aria-labelledby="spotlight-title"
            className="border-t border-border bg-muted/30 py-14 sm:py-20 lg:py-24"
          >
            <Container>
              <span className={eyebrow}>Spotlight</span>
              <h2 id="spotlight-title" className={cn(sectionTitle, "max-w-xl")}>
                Most students taught
              </h2>
              <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
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
                        <div className="flex h-full flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-sm transition-colors [transform-style:preserve-3d] group-hover:border-primary/40 motion-reduce:transition-none sm:p-8">
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
                          <p className="mt-4 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-foreground [transform:translateZ(16px)]">
                            <span className="font-serif text-lg tabular-nums">
                              {formatNumber(students)}
                            </span>{" "}
                            students
                          </p>
                          <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary">
                            View profile
                            <FiArrowRight
                              aria-hidden="true"
                              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
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
            className="border-t border-border py-14 sm:py-20 lg:py-24"
          >
            <Container>
              <span className={eyebrow}>Expertise</span>
              <h2 id="skills-title" className={cn(sectionTitle, "max-w-xl")}>
                Expertise across our team
              </h2>
              <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
                These are the skills our instructors work with every day. The
                number shows how many instructors share each one.
              </p>
              <Reveal delay={0.1}>
                <ul className="mt-8 flex flex-wrap gap-2.5">
                  {topSkills.map(([skill, count]) => (
                    <li key={skill}>
                      <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-4 pr-2.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                        {skill}
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
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

        {/* Why practitioners: open columns */}
        <section
          aria-labelledby="why-title"
          className="border-t border-border bg-muted/30 py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <span className={eyebrow}>Why practitioners</span>
            <h2 id="why-title" className={cn(sectionTitle, "max-w-xl")}>
              Why learn from practitioners
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
              People who do the work every day teach what the job is really
              like.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {benefits.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="h-full border-t-2 border-primary pt-5">
                      <span className={cn(iconTile, "size-11")}>
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold text-foreground sm:text-lg">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* How we choose: numbered criteria */}
        <section
          aria-labelledby="select-title"
          className="border-t border-border py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <span className={eyebrow}>Our standard</span>
            <h2 id="select-title" className={cn(sectionTitle, "max-w-xl")}>
              How we choose our instructors
            </h2>

            <Reveal>
              <ol className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
                {/* Connecting line (desktop only) */}
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                />
                {selection.map(({ title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 sm:block sm:pr-4"
                  >
                    {/* Connecting line (mobile only) */}
                    {i < selection.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-10 left-5 top-10 w-px bg-border sm:hidden"
                      />
                    )}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 font-serif text-base font-semibold shadow-sm",
                        i === selection.length - 1
                          ? "border-highlight bg-highlight text-foreground"
                          : "border-primary bg-background text-primary",
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="sm:mt-5">
                      <h3 className="font-sans text-base font-semibold text-foreground sm:text-lg">
                        <span className="sr-only">Step {i + 1}: </span>
                        {title}
                      </h3>
                      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
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
        <section className="border-t border-border bg-muted/30 py-14 sm:py-16">
          <Container>
            <Reveal>
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
                <div className="flex items-start gap-4">
                  <span className={cn(iconTile, "size-12")}>
                    <FiMic aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Want to teach at Apni University?
                    </h2>
                    <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
                      If you have real experience and enjoy sharing it, tell us
                      about your background and the topic you would like to
                      teach.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
                  <Link
                    href="/contact"
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "group",
                    )}
                  >
                    Contact us
                    <FiArrowRight
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </Link>
                  <Link
                    href="/courses"
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                    })}
                  >
                    <FiSearch aria-hidden="true" />
                    Browse courses
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* Careers banner */}
        <section className="border-t border-border py-10 sm:py-12">
          <Container>
            <Reveal>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className={cn(iconTile, "size-11")}>
                    <FiCompass aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      Not sure where to start?
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
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

        {/* FAQ: heading left, accordion right */}
        <section
          aria-labelledby="faq-title"
          className="border-t border-border bg-muted/30 py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <span className={eyebrow}>FAQ</span>
                  <h2 id="faq-title" className={sectionTitle}>
                    Instructor questions
                  </h2>
                  <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    <FiHelpCircle
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-primary"
                    />
                    <span>
                      Answers about who teaches, and how to join the team.
                    </span>
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border border-y border-border lg:col-span-8">
                {faqs.map(({ q, a }) => (
                  <details key={q} className="group py-1">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 text-left text-base font-medium text-foreground outline-none transition-colors duration-200 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="max-w-2xl pb-4 leading-relaxed text-muted-foreground">
                      {a}
                    </p>
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
