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
  if (!course) {
    await redirectIfRenamed("courses", slug, "/courses");
    notFound();
  }
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
      <div className="border-b bg-secondary/40">
        <Container className="py-8 sm:py-12">
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
          <div className="mt-5 max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {course.category && (
                <Badge variant="secondary">{course.category}</Badge>
              )}
              {course.isFree && (
                <Badge className="bg-highlight text-highlight-foreground">
                  Free
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl">{course.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {course.shortDescription}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <Rating value={course.rating} count={course.reviewCount} />
              <span className="inline-flex items-center gap-1.5">
                <FiUsers aria-hidden="true" />
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
                      className="font-medium text-foreground underline-offset-4 hover:underline"
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

      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
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

        <div className="min-w-0 space-y-12">
          {course.outcomes?.length > 0 && (
            <section aria-labelledby="learn-title">
              <h2 id="learn-title" className="mb-4 text-2xl">
                What you&apos;ll learn
              </h2>
              <ul className="grid gap-3 rounded-xl border bg-card p-5 sm:grid-cols-2">
                {course.outcomes.map((o) => (
                  <li key={o} className="flex gap-2.5 text-sm">
                    <FiCheck
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="about-title">
            <h2 id="about-title" className="mb-4 text-2xl">
              About this course
            </h2>
            <Paragraphs text={course.description} />
          </section>

          <section aria-labelledby="curriculum-title">
            <h2 id="curriculum-title" className="mb-4 text-2xl">
              Curriculum
            </h2>
            <Curriculum sections={curriculum} courseTitle={course.title} />
          </section>

          {course.requirements?.length > 0 && (
            <section aria-labelledby="req-title">
              <h2 id="req-title" className="mb-4 text-2xl">
                Requirements
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {course.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {instructor && (
            <section aria-labelledby="instructor-title">
              <h2 id="instructor-title" className="mb-4 text-2xl">
                Your instructor
              </h2>
              <Card className="flex-row items-start gap-4 p-5">
                <Avatar className="size-16">
                  <AvatarImage src={instructor.avatar} alt="" />
                  <AvatarFallback className="font-serif text-xl">
                    {instructor.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <Link
                    href={`/instructors/${instructor.slug}`}
                    className="font-serif text-lg font-semibold underline-offset-4 hover:underline"
                  >
                    {instructor.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {instructor.designation}
                  </p>
                  {instructor.shortBio && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {instructor.shortBio}
                    </p>
                  )}
                </div>
              </Card>
            </section>
          )}

          <section aria-labelledby="reviews-title">
            <h2 id="reviews-title" className="mb-4 text-2xl">
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
            <section aria-labelledby="cfaq-title">
              <h2 id="cfaq-title" className="mb-4 text-2xl">
                Frequently asked questions
              </h2>
              <Accordion type="single" collapsible>
                {course.faqs.map((f, i) => (
                  <AccordionItem key={f.q} value={`f-${i}`}>
                    <AccordionTrigger className="text-left">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
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
