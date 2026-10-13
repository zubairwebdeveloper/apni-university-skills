// app/(public)/categories/[slug]/page.jsx
import { cache, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseFilters } from "@/components/public/courses/CourseFilters";
import { CourseResults } from "@/components/public/courses/CourseResults";
import { categoryService } from "@/services/categoryService";
import { courseService } from "@/services/courseService";
import { parseCourseFilters } from "@/lib/validations/courseFilters";
import { safe } from "@/lib/utils/safe";

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

        <Container className="relative py-8 sm:py-10">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <Suspense fallback={<Skeleton className="h-36 w-full" />}>
              <CourseFilters hideCategory />
            </Suspense>
          </div>

          {!after && (
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {listing.items.length}
              </span>{" "}
              {listing.items.length === 1 ? "course" : "courses"}
              {filtersActive
                ? " matching your filters"
                : ` in ${category.name}`}
            </p>
          )}

          <div className={after ? "mt-6" : "mt-4"}>
            <CourseResults
              items={listing.items}
              nextCursor={listing.nextCursor}
              basePath={`/categories/${category.slug}`}
              linkParams={linkParams}
              after={after}
            />
          </div>
        </Container>

        {/* Keep exploring, using only routes already used elsewhere in the app */}
        <section className="border-t border-border py-10 sm:py-12">
          <Container>
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Not sure {category.name} is the right fit?
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Browse every category or see how it connects to a career.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-center gap-3">
                <Link
                  href="/categories"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  All categories
                </Link>
                <Link
                  href="/careers"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Explore careers
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}
