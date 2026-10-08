// app/(public)/categories/page.jsx
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiChevronDown,
  FiGrid,
  FiLayers,
  FiTarget,
  FiTrendingUp,
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

        <Container className="py-10 sm:py-12">
          {/* Stats */}
          {categories.length > 0 && (
            <Reveal>
              <dl
                className={`mb-10 grid gap-3 sm:gap-4 ${
                  stats.length === 3 ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border bg-card/70 p-3 text-center backdrop-blur sm:p-5"
                  >
                    <dd className="font-serif text-xl font-semibold text-primary sm:text-3xl">
                      {s.value}
                    </dd>
                    <dt className="mt-1 text-xs text-muted-foreground sm:text-sm">
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          {/* Categories */}
          {categories.length ? (
            <CategoriesExplorer categories={categories} />
          ) : (
            <EmptyState
              icon={FiGrid}
              title="Categories are on the way"
              description="We're organizing our catalog. Check back soon."
            />
          )}
        </Container>

        {/* Why categories */}
        <section
          aria-labelledby="why-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 id="why-title" className="text-2xl sm:text-3xl">
                Learn in the right order
              </h2>
              <p className="mt-3 text-muted-foreground">
                Categories keep your learning focused, so you spend time
                building skills instead of searching.
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

        {/* How to choose */}
        <section
          aria-labelledby="choose-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 id="choose-title" className="text-2xl sm:text-3xl">
                How to choose your category
              </h2>
            </Reveal>

            <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {steps.map(({ title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="relative h-full overflow-hidden rounded-2xl border bg-card/70 p-5 backdrop-blur">
                      <span
                        aria-hidden="true"
                        className="absolute -right-2 -top-4 font-serif text-7xl font-bold text-primary/10"
                      >
                        {i + 1}
                      </span>
                      <h3 className="relative font-sans text-base font-semibold">
                        <span className="sr-only">Step {i + 1}: </span>
                        {title}
                      </h3>
                      <p className="relative mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className="text-2xl sm:text-3xl">
                Common questions
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

        {/* CTA */}
        <section className="border-t py-12 sm:py-16">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-primary/10 via-card to-highlight/20 p-6 text-center sm:p-10">
                <FiTrendingUp
                  aria-hidden="true"
                  className="mx-auto size-8 text-primary"
                />
                <h2 className="mt-3 text-2xl sm:text-3xl">
                  Not sure where to begin?
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                  See all courses together, or talk to us and we will help you
                  pick the right path.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/courses"
                    className={buttonVariants({ size: "lg" })}
                  >
                    View all courses
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                  <Link
                    href="/contact"
                    className={buttonVariants({
                      size: "lg",
                      variant: "outline",
                    })}
                  >
                    Talk to us
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </div>
    </>
  );
}
