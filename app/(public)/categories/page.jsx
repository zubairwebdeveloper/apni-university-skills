// app/(public)/categories/page.jsx
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiChevronDown,
  FiGrid,
  FiLayers,
  FiTarget,
  FiUsers,
} from "react-icons/fi";

import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { CategoriesExplorer } from "@/components/public/CategoriesExplorer";
import { PageGlows, Reveal } from "@/components/public/CategoriesMotion";
import { categoryService } from "@/services/categoryService";

export const revalidate = 300;
export const metadata = {
  title: "Course categories",
  description:
    "Explore Apni University courses by field: web development, AI, cloud, cybersecurity, design, and more.",
  alternates: { canonical: "/categories" },
};

const benefits = [
  {
    icon: FiLayers,
    title: "Organized by field",
    text: "Every course sits in the field it belongs to, so you never browse blindly.",
  },
  {
    icon: FiTarget,
    title: "Clear learning paths",
    text: "Start with the basics and move step by step towards advanced topics.",
  },
  {
    icon: FiUsers,
    title: "Mentor supported",
    text: "Ask questions, get code reviews and stay on track in every field.",
  },
  {
    icon: FiAward,
    title: "Certificates",
    text: "Finish a course and add a certificate to your CV and LinkedIn.",
  },
];

const steps = [
  {
    title: "Pick a field",
    text: "Choose the category that matches your interest or the job you want.",
  },
  {
    title: "Compare courses",
    text: "Open the category and check levels, lessons and projects.",
  },
  {
    title: "Start learning",
    text: "Enroll and build your first project the same week.",
  },
];

const faqs = [
  {
    q: "Which category should a beginner choose?",
    a: "Web development is the easiest place to start. If you are not sure, open a category and look for courses marked beginner friendly.",
  },
  {
    q: "Can I learn more than one field?",
    a: "Yes. Many learners start with web development and later add cloud, AI or security. Your progress in each course is saved separately.",
  },
  {
    q: "Are new categories added?",
    a: "We keep growing the catalog. New fields and courses appear here as soon as they are published.",
  },
  {
    q: "I cannot find the field I want. What now?",
    a: "Contact us and tell us what you want to learn. Your suggestions help us decide which courses to build next.",
  },
];

export default async function CategoriesPage() {
  const categories = await categoryService.getAllCategories();

  const totalCourses = categories.reduce(
    (sum, c) => sum + (typeof c.courseCount === "number" ? c.courseCount : 0),
    0,
  );

  const stats = [
    { label: "Categories", value: categories.length },
    ...(totalCourses > 0 ? [{ label: "Courses", value: totalCourses }] : []),
    { label: "Free to join", value: "Yes" },
  ];

  return (
    <>
      <PageHeader
        title="Browse by category"
        description="Choose a field to see only the courses that belong to it."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Categories" }]}
      />

      <div className="relative overflow-x-clip">
        <PageGlows />

        <Container className="py-10 sm:py-14">
          {/* Stats: one quiet strip, separated by hairlines */}
          {categories.length > 0 && (
            <Reveal>
              <dl
                className={`mb-12 grid divide-x divide-border border-y border-border ${
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
            </Reveal>
          )}

          {/* Categories (the main content; unchanged behavior) */}
          {categories.length ? (
            <CategoriesExplorer categories={categories} />
          ) : (
            <EmptyState
              icon={FiGrid}
              title="No categories yet"
              description="We're organizing our catalog. Check back soon, or browse all courses in the meantime."
            />
          )}
        </Container>

        {/* Why categories: heading left, ruled list right */}
        <section
          aria-labelledby="why-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <h2
                  id="why-title"
                  className="text-balance text-3xl sm:text-4xl"
                >
                  Learn in the right order
                </h2>
                <p className="mt-4 max-w-md text-muted-foreground">
                  Categories keep your learning focused, so you spend time
                  building skills instead of searching.
                </p>
              </div>

              <ul className="divide-y divide-border border-y border-border lg:col-span-8">
                {benefits.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="group flex items-start gap-4 py-5 sm:gap-5 sm:py-6"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-sans text-base font-semibold text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* How to choose: a real sequence, so numbers are meaningful */}
        <section
          aria-labelledby="choose-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <h2
              id="choose-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              How to choose your category
            </h2>

            <Reveal>
              <ol className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                {/* Connecting line (desktop only) */}
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                />
                {steps.map(({ title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 sm:block sm:pr-4"
                  >
                    <span
                      aria-hidden="true"
                      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border font-serif text-base font-semibold ${
                        i === steps.length - 1
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
                Common questions
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

        {/* CTA */}
        <section className="border-t py-14 sm:py-20">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground sm:px-12 sm:py-14">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-highlight"
                />
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <h2 className="text-balance text-3xl text-primary-foreground sm:text-4xl">
                      Not sure where to begin?
                    </h2>
                    <p className="mt-3 text-primary-foreground/90 sm:text-lg">
                      See all courses together, or talk to us and we will help
                      you pick the right path.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                    <Link
                      href="/courses"
                      className={buttonVariants({
                        size: "lg",
                        variant: "secondary",
                      })}
                    >
                      View all courses
                      <FiArrowRight aria-hidden="true" />
                    </Link>
                    <Link
                      href="/contact"
                      className={`${buttonVariants({
                        size: "lg",
                        variant: "ghost",
                      })} border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground`}
                    >
                      Talk to us
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </div>
    </>
  );
}
