import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiCheck, FiUsers } from "react-icons/fi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Container, Section } from "@/components/layout/Container";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { Rating } from "@/components/shared/Rating";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { EmptyState } from "@/components/shared/EmptyState";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { JsonLd } from "@/components/shared/JsonLd";
import { CourseCard } from "@/components/public/CourseCard";
import { ReviewCard } from "@/components/public/ReviewCard";
import { Curriculum } from "@/components/public/courses/Curriculum";
import { EnrollmentCard } from "@/components/public/courses/EnrollmentCard";
import { courseService } from "@/services/courseService";
import { lessonService } from "@/services/lessonService";
import { instructorService } from "@/services/instructorService";
import { reviewService } from "@/services/reviewService";
import { safe } from "@/lib/utils/safe";
import { formatCompact, formatDate, formatDuration } from "@/lib/utils/format";
import { levelLabel } from "@/config/courses";

export const revalidate = 300;

// cache() dedupes the lookup between generateMetadata and the page
const getCourse = cache((slug) => courseService.getCourseBySlug(slug));
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const course = await safe(getCourse(slug), null);
  if (!course) return { title: "Course not found", robots: { index: false } };
  const url = `/courses/${course.slug}`;
  const images = course.thumbnail ? [{ url: course.thumbnail }] : undefined;
  return {
    title: course.seoTitle || course.title,
    description: course.seoDescription || course.shortDescription,
    keywords: course.seoKeywords?.length ? course.seoKeywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: course.title,
      description: course.shortDescription,
      url,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description: course.shortDescription,
      images: images?.map((i) => i.url),
    },
  };
}

// Shared section styling: hairline between sections, consistent heading scale
const sectionClass = "border-t pt-10 first:border-t-0 first:pt-0";
const headingClass = "mb-5 text-balance text-2xl sm:text-3xl";

export default async function CoursePage({ params }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const [curriculum, instructor, reviews, related] = await Promise.all([
    safe(lessonService.getPublicCurriculum(course.id), []),
    course.instructorId
      ? safe(instructorService.getInstructorById(course.instructorId), null)
      : null,
    safe(reviewService.getCourseReviews(course.id, 6), []),
    safe(courseService.getRelatedCourses(course, 4), []),
  ]);

  const lessonCount =
    curriculum.reduce((n, s) => n + s.lessons.length, 0) ||
    course.lessonsCount ||
    0;
  const pageUrl = `${siteUrl}/courses/${course.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.shortDescription,
    url: pageUrl,
    provider: {
      "@type": "Organization",
      name: "Apni University",
      sameAs: siteUrl,
    },
    offers: {
      "@type": "Offer",
      price: course.isFree ? 0 : (course.salePrice ?? course.price),
      priceCurrency: course.currency,
      category: course.isFree ? "Free" : "Paid",
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Course header */}
      <div className="border-b bg-secondary/40">
        <Container className="py-8 sm:py-12 lg:py-14">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Courses", href: "/courses" },
              ...(course.categorySlug
                ? [
                    {
                      label: course.category,
                      href: `/categories/${course.categorySlug}`,
                    },
                  ]
                : []),
              { label: course.title },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {course.category && (
                <Badge variant="secondary">{course.category}</Badge>
              )}
              {course.isFree && (
                <Badge className="bg-highlight text-highlight-foreground">
                  Free
                </Badge>
              )}
            </div>

            <h1 className="text-balance text-3xl tracking-tight sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {course.shortDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/80">
              <Rating value={course.rating} count={course.reviewCount} />
              <span className="inline-flex items-center gap-1.5">
                <FiUsers aria-hidden="true" className="text-primary" />
                {formatCompact(course.studentsCount ?? 0)} students
              </span>
              <span>{levelLabel(course.level)}</span>
              <span>{course.language}</span>
              <span>{formatDuration(course.duration)}</span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {course.instructor && (
                <>
                  Created by{" "}
                  {course.instructorSlug ? (
                    <Link
                      href={`/instructors/${course.instructorSlug}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {course.instructor}
                    </Link>
                  ) : (
                    course.instructor
                  )}
                </>
              )}
              {course.updatedAt && (
                <> · Last updated {formatDate(course.updatedAt)}</>
              )}
            </p>
          </div>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* order-first lifts the purchase card above the long content on mobile; it's sticky on desktop */}
        <aside className="order-first lg:order-last">
          <div className="lg:sticky lg:top-24">
            <EnrollmentCard
              course={course}
              lessonCount={lessonCount}
              shareUrl={pageUrl}
            />
          </div>
        </aside>

        <div className="min-w-0 space-y-10">
          {course.outcomes?.length > 0 && (
            <section aria-labelledby="learn-title" className={sectionClass}>
              <h2 id="learn-title" className={headingClass}>
                What you&apos;ll learn
              </h2>
              <ul className="grid gap-x-8 gap-y-3.5 rounded-2xl border bg-card p-5 sm:grid-cols-2 sm:p-6">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-3 text-sm sm:text-base">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                    >
                      <FiCheck className="size-3" />
                    </span>
                    <span className="text-foreground/90">{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="about-title" className={sectionClass}>
            <h2 id="about-title" className={headingClass}>
              About this course
            </h2>
            <div className="max-w-3xl">
              <Paragraphs text={course.description} />
            </div>
          </section>

          <section aria-labelledby="curriculum-title" className={sectionClass}>
            <h2 id="curriculum-title" className={headingClass}>
              Curriculum
            </h2>
            <Curriculum sections={curriculum} courseTitle={course.title} />
          </section>

          {course.requirements?.length > 0 && (
            <section aria-labelledby="req-title" className={sectionClass}>
              <h2 id="req-title" className={headingClass}>
                Requirements
              </h2>
              <ul className="max-w-3xl space-y-2.5 text-sm text-muted-foreground sm:text-base">
                {course.requirements.map((r) => (
                  <li key={r} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {instructor && (
            <section
              aria-labelledby="instructor-title"
              className={sectionClass}
            >
              <h2 id="instructor-title" className={headingClass}>
                Your instructor
              </h2>
              <Card className="flex-row items-start gap-4 p-5 sm:gap-5 sm:p-6">
                <Avatar className="size-16 sm:size-20">
                  <AvatarImage src={instructor.avatar} alt="" />
                  <AvatarFallback className="font-serif text-xl">
                    {instructor.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link
                    href={`/instructors/${instructor.slug}`}
                    className="font-serif text-lg font-semibold underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {instructor.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {instructor.designation}
                  </p>
                  {instructor.shortBio && (
                    <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                      {instructor.shortBio}
                    </p>
                  )}
                </div>
              </Card>
            </section>
          )}

          <section aria-labelledby="reviews-title" className={sectionClass}>
            <h2 id="reviews-title" className={headingClass}>
              Student reviews
            </h2>
            {reviews.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No reviews yet"
                description="Enrolled students can review this course from their dashboard. Approved reviews appear here."
              />
            )}
          </section>

          {course.faqs?.length > 0 && (
            <section aria-labelledby="cfaq-title" className={sectionClass}>
              <h2 id="cfaq-title" className={headingClass}>
                Frequently asked questions
              </h2>
              <Accordion type="single" collapsible>
                {course.faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`f-${i}`}>
                    <AccordionTrigger className="min-h-12 text-left text-base">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground sm:text-base">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}
        </div>
      </Container>

      {related.length > 0 && (
        <Section
          labelledBy="related-title"
          className="border-t bg-secondary/40"
        >
          <SectionHeader
            id="related-title"
            title="Related courses"
            href={
              course.categorySlug
                ? `/categories/${course.categorySlug}`
                : "/courses"
            }
            hrefLabel="See more"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
