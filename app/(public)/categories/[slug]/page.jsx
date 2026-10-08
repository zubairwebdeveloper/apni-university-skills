// app/(public)/categories/[slug]/page.jsx
import { cache, Suspense } from "react";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
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
  if (!category) {
    await redirectIfRenamed("categories", slug, "/categories");
    notFound();
  }
  // metadata: title: category.seoTitle || `${category.name} courses`, description: category.seoDescription || category.description || ...

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
      <Container className="py-8 sm:py-10">
        <Suspense fallback={<Skeleton className="h-36 w-full" />}>
          <CourseFilters hideCategory />
        </Suspense>
        <div className="mt-6">
          <CourseResults
            items={listing.items}
            nextCursor={listing.nextCursor}
            basePath={`/categories/${category.slug}`}
            linkParams={linkParams}
            after={after}
          />
        </div>
      </Container>
    </>
  );
}
