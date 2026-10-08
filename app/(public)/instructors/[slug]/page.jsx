// app/(public)/instructors/[slug]/page.jsx
import { cache } from "react";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Container, Section } from "@/components/layout/Container";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { Rating } from "@/components/shared/Rating";
import { CourseCard } from "@/components/public/CourseCard";
import { ReviewCard } from "@/components/public/ReviewCard";
import { SocialLinks } from "@/components/public/SocialLinks";
import { instructorService } from "@/services/instructorService";
import { courseService } from "@/services/courseService";
import { reviewService } from "@/services/reviewService";
import { safe } from "@/lib/utils/safe";
import { formatCompact } from "@/lib/utils/format";

export const revalidate = 300;
const getInstructor = cache((slug) =>
  instructorService.getInstructorBySlug(slug),
);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const i = await safe(getInstructor(slug), null);
  if (!i) return { title: "Instructor not found", robots: { index: false } };
  if (!instructor) {
    await redirectIfRenamed("instructors", slug, "/instructors");
    notFound();
  }
  const description =
    i.shortBio || `${i.name}, ${i.designation}, teaches at Apni University.`;
  return {
    title: i.name,
    description,
    alternates: { canonical: `/instructors/${i.slug}` },
    openGraph: {
      title: i.name,
      description,
      url: `/instructors/${i.slug}`,
      type: "profile",
      images: i.avatar ? [{ url: i.avatar }] : undefined,
    },
    twitter: { card: "summary", title: i.name, description },
  };
}

export default async function InstructorPage({ params }) {
  const { slug } = await params;
  const instructor = await getInstructor(slug);
  if (!instructor) notFound();

  const [courses, reviews] = await Promise.all([
    safe(courseService.getCoursesByInstructor(instructor.id, 12), []),
    safe(reviewService.getInstructorReviews(instructor.id, 6), []),
  ]);
  const skills = [
    ...new Set([...(instructor.expertise ?? []), ...(instructor.skills ?? [])]),
  ];
  const stats = [
    { label: "Courses", value: instructor.coursesCount ?? courses.length },
    { label: "Students", value: formatCompact(instructor.studentsCount ?? 0) },
  ];

  return (
    <>
      <div className="border-b bg-secondary/40">
        <Container className="py-10 sm:py-14">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Instructors", href: "/instructors" },
              { label: instructor.name },
            ]}
          />
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar className="size-28">
              <AvatarImage src={instructor.avatar} alt={instructor.name} />
              <AvatarFallback className="font-serif text-3xl">
                {instructor.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl">{instructor.name}</h1>
              <p className="mt-1 text-muted-foreground">
                {instructor.designation}
              </p>
              {instructor.shortBio && (
                <p className="mt-3 max-w-2xl">{instructor.shortBio}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <SocialLinks
                  links={instructor.socialLinks}
                  name={instructor.name}
                />
                <dl className="flex gap-6">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <dt className="text-xs text-muted-foreground">
                        {s.label}
                      </dt>
                      <dd className="font-serif text-xl font-semibold">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                  <div>
                    <dt className="text-xs text-muted-foreground">Rating</dt>
                    <dd>
                      <Rating
                        value={instructor.rating}
                        count={instructor.reviewCount ?? 0}
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="grid gap-12 py-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-12 lg:order-first">
          {instructor.bio && (
            <section aria-labelledby="about-i">
              <h2 id="about-i" className="mb-4 text-2xl">
                About
              </h2>
              <Paragraphs text={instructor.bio} />
            </section>
          )}
          <section aria-labelledby="courses-i">
            <h2 id="courses-i" className="mb-4 text-2xl">
              Courses by {instructor.name}
            </h2>
            {courses.length ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No published courses yet"
                description="Check back soon."
              />
            )}
          </section>
          {reviews.length > 0 && (
            <section aria-labelledby="reviews-i">
              <h2 id="reviews-i" className="mb-4 text-2xl">
                Student reviews
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </section>
          )}
        </div>
        {skills.length > 0 && (
          <aside aria-labelledby="skills-i">
            <h2 id="skills-i" className="mb-4 text-lg">
              Skills & expertise
            </h2>
            <ul className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <li key={s}>
                  <Badge variant="secondary">{s}</Badge>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </Container>
    </>
  );
}
