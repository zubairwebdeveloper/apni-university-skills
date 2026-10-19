// app/(public)/courses/[slug]/page.jsx

import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiArrowRight,
  FiBarChart2,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiGlobe,
  FiHelpCircle,
  FiInfo,
  FiList,
  FiRefreshCw,
  FiStar,
  FiTarget,
  FiUser,
  FiUsers,
} from "react-icons/fi";
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
import { Reveal } from "@/components/public/PricingMotion";
import { Curriculum } from "@/components/public/courses/Curriculum";
import { EnrollmentCard } from "@/components/public/courses/EnrollmentCard";
import { courseService } from "@/services/courseService";
import { lessonService } from "@/services/lessonService";
import { instructorService } from "@/services/instructorService";
import { reviewService } from "@/services/reviewService";
import { safe } from "@/lib/utils/safe";
import { formatCompact, formatDate, formatDuration } from "@/lib/utils/format";
import { levelLabel } from "@/config/courses";
import { cn } from "@/lib/utils";

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
const sectionClass =
  "scroll-mt-24 border-t border-border pt-10 first:border-t-0 first:pt-0";

// Section heading with an icon tile that reinforces what the block is about.
const SectionTitle = ({ id, icon: Icon, children }) => (
  <div className="mb-6 flex items-center gap-3">
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
      <Icon aria-hidden="true" className="size-[18px]" />
    </span>
    <h2
      id={id}
      className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
    >
      {children}
    </h2>
  </div>
);

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

  // Only facts that exist on the course record are shown.
  const facts = [
    { icon: FiBarChart2, label: levelLabel(course.level) },
    { icon: FiGlobe, label: course.language },
    { icon: FiClock, label: formatDuration(course.duration) },
  ].filter((f) => Boolean(f.label));

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Course header */}
      <div className="relative overflow-hidden border-b border-border bg-secondary/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />
        <Container className="relative py-8 sm:py-12 lg:py-16">
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
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                >
                  {course.category}
                </Badge>
              )}
              {course.isFree && (
                <Badge className="rounded-full bg-highlight px-3 py-1 text-xs font-semibold uppercase tracking-wider text-highlight-foreground">
                  Free
                </Badge>
              )}
            </div>

            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {course.shortDescription}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-foreground/80">
              <Rating value={course.rating} count={course.reviewCount} />
              <span className="inline-flex items-center gap-1.5">
                <FiUsers aria-hidden="true" className="size-4 text-primary" />
                <span className="font-semibold tabular-nums text-foreground">
                  {formatCompact(course.studentsCount ?? 0)}
                </span>{" "}
                students
              </span>
            </div>

            {facts.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {facts.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-sm font-medium text-foreground shadow-sm backdrop-blur"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-3.5 text-primary"
                    />
                    {label}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {course.instructor && (
                <span>
                  Created by{" "}
                  {course.instructorSlug ? (
                    <Link
                      href={`/instructors/${course.instructorSlug}`}
                      className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {course.instructor}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">
                      {course.instructor}
                    </span>
                  )}
                </span>
              )}
              {course.instructor && course.updatedAt && (
                <span aria-hidden="true">·</span>
              )}
              {course.updatedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <FiRefreshCw aria-hidden="true" className="size-3.5" />
                  Last updated {formatDate(course.updatedAt)}
                </span>
              )}
            </p>
          </div>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_24rem]">
        {/* order-first lifts the purchase card above the long content on mobile; it's sticky on desktop */}
        <aside aria-label="Enrollment" className="order-first lg:order-last">
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
            <Reveal>
              <section aria-labelledby="learn-title" className={sectionClass}>
                <SectionTitle id="learn-title" icon={FiCheckCircle}>
                  What you&apos;ll learn
                </SectionTitle>
                <ul className="grid gap-x-8 gap-y-3.5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:grid-cols-2 sm:p-6">
                  {course.outcomes.map((o) => (
                    <li key={o} className="flex gap-3 text-sm sm:text-base">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                      >
                        <FiCheck className="size-3" />
                      </span>
                      <span className="leading-relaxed text-foreground/90">
                        {o}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          <Reveal>
            <section aria-labelledby="about-title" className={sectionClass}>
              <SectionTitle id="about-title" icon={FiInfo}>
                About this course
              </SectionTitle>
              <div className="max-w-3xl leading-relaxed text-muted-foreground">
                <Paragraphs text={course.description} />
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section
              aria-labelledby="curriculum-title"
              className={sectionClass}
            >
              <SectionTitle id="curriculum-title" icon={FiList}>
                Curriculum
              </SectionTitle>
              <Curriculum sections={curriculum} courseTitle={course.title} />
            </section>
          </Reveal>

          {course.requirements?.length > 0 && (
            <Reveal>
              <section aria-labelledby="req-title" className={sectionClass}>
                <SectionTitle id="req-title" icon={FiTarget}>
                  Requirements
                </SectionTitle>
                <ul className="max-w-3xl space-y-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
            </Reveal>
          )}

          {instructor && (
            <Reveal>
              <section
                aria-labelledby="instructor-title"
                className={sectionClass}
              >
                <SectionTitle id="instructor-title" icon={FiUser}>
                  Your instructor
                </SectionTitle>
                <Card className="flex-row items-start gap-4 p-5 shadow-sm sm:gap-5 sm:p-6">
                  <Avatar className="size-16 ring-2 ring-primary/15 sm:size-20">
                    <AvatarImage src={instructor.avatar} alt="" />
                    <AvatarFallback className="font-serif text-xl">
                      {instructor.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      href={`/instructors/${instructor.slug}`}
                      className="font-serif text-lg font-semibold underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xl"
                    >
                      {instructor.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {instructor.designation}
                    </p>
                    {instructor.shortBio && (
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {instructor.shortBio}
                      </p>
                    )}
                    <Link
                      href={`/instructors/${instructor.slug}`}
                      className="group mt-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View profile
                      <FiArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </Link>
                  </div>
                </Card>
              </section>
            </Reveal>
          )}

          <section aria-labelledby="reviews-title" className={sectionClass}>
            <SectionTitle id="reviews-title" icon={FiStar}>
              Student reviews
            </SectionTitle>
            {reviews.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((r, i) => (
                  <Reveal
                    key={r.id}
                    delay={Math.min(i * 0.05, 0.25)}
                    className="h-full min-w-0"
                  >
                    <ReviewCard review={r} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FiFileText}
                title="No reviews yet"
                description="Enrolled students can review this course from their dashboard. Approved reviews appear here."
              />
            )}
          </section>

          {course.faqs?.length > 0 && (
            <Reveal>
              <section aria-labelledby="cfaq-title" className={sectionClass}>
                <SectionTitle id="cfaq-title" icon={FiHelpCircle}>
                  Frequently asked questions
                </SectionTitle>
                <Accordion type="single" collapsible>
                  {course.faqs.map((f, i) => (
                    <AccordionItem key={f.q} value={`f-${i}`}>
                      <AccordionTrigger className="min-h-12 text-left text-base transition-colors hover:text-primary">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="leading-relaxed text-muted-foreground sm:text-base">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            </Reveal>
          )}
        </div>
      </Container>

      {related.length > 0 && (
        <Section
          labelledBy="related-title"
          className="border-t border-border bg-secondary/40"
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
            {related.map((c, i) => (
              <Reveal
                key={c.id}
                delay={Math.min(i * 0.06, 0.24)}
                className="h-full min-w-0"
              >
                <CourseCard course={c} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
