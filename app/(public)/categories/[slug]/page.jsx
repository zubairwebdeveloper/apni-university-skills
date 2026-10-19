// app/(public)/categories/[slug]/page.jsx
import { cache, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiCompass,
  FiGrid,
  FiSliders,
  FiX,
} from "react-icons/fi";

import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/public/PricingMotion";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseFilters } from "@/components/public/courses/CourseFilters";
import { CourseResults } from "@/components/public/courses/CourseResults";
import { categoryService } from "@/services/categoryService";
import { courseService } from "@/services/courseService";
import { parseCourseFilters } from "@/lib/validations/courseFilters";
import { safe } from "@/lib/utils/safe";
import { cn } from "@/lib/utils";

const getCategory = cache((slug) => categoryService.getCategoryBySlug(slug));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await safe(getCategory(slug), null);
  if (!category)
    return { title: "Category not found", robots: { index: false } };

  const description =
    category.description ||
    `Browse ${category.name} courses on Apni University.`;
  return {
    title: `${category.name} courses`,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title: `${category.name} courses`,
      description,
      url: `/categories/${category.slug}`,
    },
  };
}

const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary motion-reduce:transition-none";
const cardHover =
  "transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const filters = parseCourseFilters(await searchParams);
  // Firestore query constrained by categoryId; never "fetch all, filter in the browser"
  const listing = await courseService.searchCourses(filters, {
    categoryId: category.id,
  });
  const { after, category: _ignored, ...rest } = filters;
  const linkParams = {
    ...rest,
    sort: rest.sort === "newest" ? undefined : rest.sort,
  };

  const filtersActive = Object.values(rest).some(Boolean);
  const basePath = `/categories/${category.slug}`;

  const nextLinks = [
    {
      href: "/categories",
      icon: FiGrid,
      title: "All categories",
      text: "Browse every subject area in the catalog.",
    },
    {
      href: "/careers",
      icon: FiCompass,
      title: "Explore careers",
      text: "See how these skills connect to real roles.",
    },
  ];

  return (
    <>
      <PageHeader
        title={`${category.name} courses`}
        description={category.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />

        <Container className="relative py-8 sm:py-10 lg:py-12">
          <Reveal>
            <section
              aria-label={`Filter ${category.name} courses`}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                  <FiSliders aria-hidden="true" className="size-4" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Refine courses
                </p>
              </div>
              <Suspense fallback={<Skeleton className="h-36 w-full" />}>
                <CourseFilters hideCategory />
              </Suspense>
            </section>
          </Reveal>

          <section aria-labelledby="results-title" className="mt-10">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="results-title"
                  className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
                >
                  {filtersActive
                    ? "Matching courses"
                    : `${category.name} courses`}
                </h2>
                {!after && (
                  <p
                    className="mt-1 text-sm text-muted-foreground"
                    aria-live="polite"
                  >
                    <span className="font-semibold tabular-nums text-foreground">
                      {listing.items.length}
                    </span>{" "}
                    {listing.items.length === 1 ? "course" : "courses"}
                    {filtersActive
                      ? " matching your filters"
                      : ` in ${category.name}`}
                  </p>
                )}
              </div>

              {filtersActive && (
                <Link
                  href={basePath}
                  className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                >
                  Clear filters
                  <FiX aria-hidden="true" className="size-3.5" />
                </Link>
              )}
            </div>

            <CourseResults
              items={listing.items}
              nextCursor={listing.nextCursor}
              basePath={basePath}
              linkParams={linkParams}
              after={after}
            />
          </section>
        </Container>

        {/* Keep exploring, using only routes already used elsewhere in the app */}
        <section
          aria-labelledby="keep-exploring"
          className="border-t border-border bg-muted/20 py-10 sm:py-14"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                <FiBookOpen aria-hidden="true" className="size-5" />
              </span>
              <h2
                id="keep-exploring"
                className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                Not sure {category.name} is the right fit?
              </h2>
              <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                Browse every category or see how it connects to a career.
              </p>
            </Reveal>

            <ul className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
              {nextLinks.map(({ href, icon: Icon, title, text }, i) => (
                <li key={href} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <Link
                      href={href}
                      className={cn(
                        "group flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        cardHover,
                      )}
                    >
                      <span className={cn(iconTile, "size-12")}>
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-sans text-base font-semibold text-foreground">
                          {title}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {text}
                        </span>
                      </span>
                      <FiArrowUpRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                      />
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      </div>
    </>
  );
}
