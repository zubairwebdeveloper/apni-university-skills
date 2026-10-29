// app/(public)/instructors/[slug]/page.jsx
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiStar,
  FiUser,
  FiZap,
} from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { EmptyState } from "@/components/shared/EmptyState";
import { JsonLd } from "@/components/shared/JsonLd";
import { Paragraphs } from "@/components/shared/Paragraphs";
import { Rating } from "@/components/shared/Rating";
import { CourseCard } from "@/components/public/CourseCard";
import { ReviewCard } from "@/components/public/ReviewCard";
import { SocialLinks } from "@/components/public/SocialLinks";
import { TiltCard } from "@/components/public/TiltCard";
import { Reveal } from "@/components/public/PricingMotion";
import { instructorService } from "@/services/instructorService";
import { courseService } from "@/services/courseService";
import { reviewService } from "@/services/reviewService";
import { safe } from "@/lib/utils/safe";
import { formatCompact } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export const revalidate = 300;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://apni-university-skills-lurc.vercel.app/";
const getInstructor = cache((slug) =>
  instructorService.getInstructorBySlug(slug),
);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const i = await safe(getInstructor(slug), null);
  if (!i) return { title: "Instructor not found", robots: { index: false } };
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

const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15";

// Section heading with an icon tile that reinforces what the block is about.
const SectionTitle = ({ id, icon: Icon, children }) => (
  <div className="mb-6 flex items-center gap-3">
    <span className={cn(iconTile, "size-10")}>
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

  // In-page navigation only lists sections that actually render
  const sections = [
    ...(instructor.bio ? [{ id: "about-i", label: "About" }] : []),
    { id: "courses-i", label: "Courses" },
    ...(reviews.length > 0 ? [{ id: "reviews-i", label: "Reviews" }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: instructor.name,
    jobTitle: instructor.designation || undefined,
    description: instructor.shortBio || undefined,
    image: instructor.avatar || undefined,
    url: `${siteUrl}/instructors/${instructor.slug}`,
    worksFor: { "@type": "Organization", name: "Apni University" },
  };

  const hasSidebar = skills.length > 0;

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Profile header */}
      <div className="relative overflow-x-clip border-b border-border bg-secondary/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 size-[28rem] rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />
        <Container className="relative py-10 sm:py-14 lg:py-16">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Instructors", href: "/instructors" },
              { label: instructor.name },
            ]}
          />

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
            <div className="min-w-0 lg:order-first">
              <Badge
                variant="secondary"
                className="mb-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              >
                Instructor
              </Badge>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {instructor.name}
              </h1>
              {instructor.designation && (
                <p className="mt-2 text-lg font-medium text-primary">
                  {instructor.designation}
                </p>
              )}
              {instructor.shortBio && (
                <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-foreground/90 sm:text-lg">
                  {instructor.shortBio}
                </p>
              )}

              <dl className="mt-6 grid w-full grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm backdrop-blur sm:inline-grid sm:w-auto sm:grid-flow-col sm:grid-cols-none">
                {stats.map((s) => (
                  <div key={s.label} className="px-4 py-3.5 sm:px-7">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {s.label}
                    </dt>
                    <dd className="font-serif text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
                      {s.value}
                    </dd>
                  </div>
                ))}
                <div className="px-4 py-3.5 sm:px-7">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Rating
                  </dt>
                  <dd className="mt-1.5">
                    <Rating
                      value={instructor.rating}
                      count={instructor.reviewCount ?? 0}
                    />
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                <SocialLinks
                  links={instructor.socialLinks}
                  name={instructor.name}
                />
              </div>

              <nav aria-label="On this page" className="mt-8">
                <ul className="flex flex-wrap gap-2">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="inline-flex min-h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-colors duration-200 hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* 3D avatar scene: depth layers + orbit ring, pointer-responsive on desktop */}
            <TiltCard className="mx-auto size-48 sm:size-56 lg:size-64">
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-highlight/40 [transform:translateZ(-36px)_translate(12px,12px)]"
              />
              <div
                aria-hidden="true"
                className="absolute -inset-7 [transform-style:preserve-3d] [transform:translateZ(-8px)_rotateX(68deg)]"
              >
                <div className="size-full animate-spin rounded-full border border-dashed border-primary/50 [animation-duration:28s] motion-reduce:animate-none">
                  <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-highlight shadow-md" />
                </div>
              </div>
              <Avatar className="size-full border-4 border-background shadow-xl [transform:translateZ(36px)]">
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
                <AvatarFallback className="font-serif text-5xl">
                  {instructor.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TiltCard>
          </div>
        </Container>
      </div>

      <Container
        className={cn(
          "grid gap-12 py-10 sm:py-14",
          hasSidebar && "lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14",
        )}
      >
        <div className="min-w-0 space-y-12">
          {instructor.bio && (
            <section
              id="about-i"
              aria-labelledby="about-title"
              className="scroll-mt-24"
            >
              <SectionTitle id="about-title" icon={FiUser}>
                About
              </SectionTitle>
              <div className="max-w-3xl leading-relaxed text-muted-foreground">
                <Paragraphs text={instructor.bio} />
              </div>
            </section>
          )}

          <section
            id="courses-i"
            aria-labelledby="courses-title"
            className={cn(
              "scroll-mt-24",
              instructor.bio && "border-t border-border pt-12",
            )}
          >
            <SectionTitle id="courses-title" icon={FiBookOpen}>
              Courses by {instructor.name}
              {courses.length > 0 && (
                <span className="ml-2 align-middle font-sans text-base font-medium tabular-nums text-muted-foreground">
                  ({courses.length})
                </span>
              )}
            </SectionTitle>
            {courses.length ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {courses.map((c, i) => (
                  <Reveal
                    key={c.id}
                    delay={Math.min(i * 0.05, 0.25)}
                    className="h-full min-w-0"
                  >
                    <CourseCard course={c} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FiBookOpen}
                title="No published courses yet"
                description="Check back soon."
              />
            )}
          </section>

          {reviews.length > 0 && (
            <section
              id="reviews-i"
              aria-labelledby="reviews-title"
              className="scroll-mt-24 border-t border-border pt-12"
            >
              <SectionTitle id="reviews-title" icon={FiStar}>
                Student reviews
              </SectionTitle>
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
            </section>
          )}

          <div className="border-t border-border pt-8">
            <Link
              href="/instructors"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "group",
              )}
            >
              Meet more instructors
              <FiArrowRight
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </Link>
          </div>
        </div>

        {hasSidebar && (
          <aside
            aria-labelledby="skills-i"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <Reveal>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className={cn(iconTile, "size-8 rounded-lg")}>
                    {skills.length > 6 ? (
                      <FiAward aria-hidden="true" className="size-4" />
                    ) : (
                      <FiZap aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <h2
                    id="skills-i"
                    className="text-lg font-semibold tracking-tight text-foreground"
                  >
                    Skills &amp; expertise
                  </h2>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <li key={s}>
                      <Badge variant="secondary">{s}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>
        )}
      </Container>
    </>
  );
}
