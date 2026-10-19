// app/student/reviews/page.jsx
import {
  FiBookOpen,
  FiCheckCircle,
  FiEdit3,
  FiInfo,
  FiMessageSquare,
  FiStar,
} from "react-icons/fi";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReviewDialog } from "@/components/student/ReviewDialog";
import { Reveal } from "@/components/student/Reveal";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { ReviewsList } from "@/components/student/ReviewsList";
import {
  MotionRoot,
  RatingSummary,
  ReviewsBackdrop,
  ReviewsHero,
  StatCards,
  TiltCard,
} from "@/components/student/ReviewsMotion";

import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils/format";

import { enrollmentService } from "@/services/enrollmentService";
import { reviewService } from "@/services/reviewService";

export const metadata = {
  title: "Reviews",
  description: "Share your course experience and manage your reviews.",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function calculateStats(reviews) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!reviews.length) return { average: 0, total: 0, distribution };

  let total = 0;
  for (const review of reviews) {
    const rating = Math.min(5, Math.max(1, Number(review.rating) || 0));
    if (distribution[rating] !== undefined) distribution[rating] += 1;
    total += rating;
  }

  return {
    average: total / reviews.length,
    total: reviews.length,
    distribution,
  };
}

const TIPS = [
  "Tell others what you learned.",
  "Mention practical projects or lessons.",
  "Keep your feedback honest and respectful.",
  "Avoid sharing personal information.",
];

// Section heading with an icon tile; keeps the three sections consistent.
function SectionHeader({ id, icon: Icon, title, description, count, tone }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <span
            className={`grid size-9 place-items-center rounded-lg ring-1 ring-inset ${tone}`}
          >
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <h2
            id={id}
            className="text-balance text-xl font-semibold tracking-tight sm:text-2xl"
          >
            {title}
          </h2>
        </div>
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {count ? (
        <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium tabular-nums text-muted-foreground">
          {count}
        </span>
      ) : null}
    </div>
  );
}

const TONE_PRIMARY = "bg-primary/10 text-primary ring-primary/20";
const TONE_VIOLET =
  "bg-violet-500/10 text-violet-600 ring-violet-500/25 dark:text-violet-400";
const TONE_YELLOW =
  "bg-yellow-400/15 text-yellow-700 ring-yellow-400/35 dark:text-yellow-400";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default async function StudentReviewsPage() {
  const user = await requireUser();

  const [enrollments, reviews] = await Promise.all([
    enrollmentService.getStudentCourses(user.uid),
    reviewService.getStudentReviews(user.uid),
  ]);

  const reviewedCourses = new Set(reviews.map((review) => review.courseId));
  const toReview = enrollments.filter(
    (enrollment) => !reviewedCourses.has(enrollment.courseId),
  );

  const stats = calculateStats(reviews);
  const completion =
    enrollments.length > 0
      ? Math.round((reviews.length / enrollments.length) * 100)
      : 0;

  // Dates are formatted here on the server so the client list gets plain strings
  const rows = reviews.map((review) => ({
    review,
    updatedLabel: formatDate(review.updatedAt),
    createdLabel:
      review.createdAt && review.createdAt !== review.updatedAt
        ? formatDate(review.createdAt)
        : null,
  }));

  const first = toReview[0];

  return (
    <MotionRoot>
      <div className="relative isolate">
        <ReviewsBackdrop />

        <div className="space-y-10 pb-10">
          <StudentPageHeader
            title="Reviews"
            description="Share your experience, help other learners, and keep track of your course feedback."
          />

          <ReviewsHero
            reviewCount={reviews.length}
            toReviewCount={toReview.length}
            action={
              first ? (
                <ReviewDialog
                  courseSlug={first.courseSlug}
                  courseTitle={first.courseTitle}
                />
              ) : null
            }
          />

          <StatCards
            total={stats.total}
            average={stats.average}
            waiting={toReview.length}
            completion={completion}
          />

          {/* Courses waiting for review */}
          {toReview.length > 0 && (
            <section
              id="courses-to-review"
              aria-labelledby="to-review"
              className="scroll-mt-24 space-y-5"
            >
              <Reveal>
                <SectionHeader
                  id="to-review"
                  icon={FiEdit3}
                  tone={TONE_PRIMARY}
                  title="Courses you can review"
                  description="Your feedback helps us improve courses and helps other students choose what to learn."
                  count={`${toReview.length} ${
                    toReview.length === 1 ? "course" : "courses"
                  } waiting`}
                />
              </Reveal>

              <ul className="grid gap-4 lg:grid-cols-2">
                {toReview.map((enrollment, i) => {
                  const completed = enrollment.status === "completed";
                  return (
                    <li key={enrollment.id} className="min-w-0">
                      <Reveal delay={Math.min(i, 5) * 0.05}>
                        <TiltCard>
                          <Card className="group relative h-full overflow-hidden p-5 transition-[box-shadow,border-color] duration-300 hover:border-violet-500/30 hover:shadow-lg">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex min-w-0 items-start gap-4">
                                <div
                                  className={`grid size-12 shrink-0 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${TONE_VIOLET}`}
                                >
                                  <FiBookOpen
                                    aria-hidden="true"
                                    className="size-5"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="line-clamp-2 text-pretty font-semibold leading-snug tracking-tight">
                                    {enrollment.courseTitle}
                                  </h3>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {completed
                                      ? "You've completed this course."
                                      : "You're enrolled in this course."}
                                  </p>
                                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                    <FiStar
                                      aria-hidden="true"
                                      className="size-3.5 text-yellow-500"
                                    />
                                    <span>
                                      Share your experience with other learners
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <ReviewDialog
                                courseSlug={enrollment.courseSlug}
                                courseTitle={enrollment.courseTitle}
                              />
                            </div>
                          </Card>
                        </TiltCard>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Rating distribution */}
          {reviews.length > 0 && (
            <Reveal>
              <RatingSummary
                average={stats.average}
                total={stats.total}
                distribution={stats.distribution}
              />
            </Reveal>
          )}

          {/* Your reviews */}
          <section
            id="my-reviews-list"
            aria-labelledby="my-reviews"
            className="scroll-mt-24 space-y-5"
          >
            <Reveal>
              <SectionHeader
                id="my-reviews"
                icon={FiMessageSquare}
                tone={TONE_YELLOW}
                title="Your reviews"
                description="Manage the feedback you've shared with Apni University."
                count={
                  reviews.length > 0
                    ? `${reviews.length} ${
                        reviews.length === 1 ? "review" : "reviews"
                      }`
                    : null
                }
              />
            </Reveal>

            {reviews.length ? (
              <ReviewsList rows={rows} />
            ) : (
              <Card className="overflow-hidden">
                <EmptyState
                  icon={FiStar}
                  title="No reviews yet"
                  description="Once you've completed a course, you can share your experience here and help other students make better learning decisions."
                />
              </Card>
            )}
          </section>

          {/* Review tips */}
          <Reveal>
            <section aria-labelledby="review-tips">
              <Card className="overflow-hidden border-dashed">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
                  <div
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${TONE_VIOLET}`}
                  >
                    <FiInfo aria-hidden="true" className="size-5" />
                  </div>
                  <div>
                    <h2
                      id="review-tips"
                      className="text-base font-semibold tracking-tight"
                    >
                      Tips for a helpful review
                    </h2>
                    <ul className="mt-3 grid gap-x-6 gap-y-2.5 text-sm leading-snug text-muted-foreground sm:grid-cols-2">
                      {TIPS.map((tip) => (
                        <li key={tip} className="flex items-start gap-2.5">
                          <FiCheckCircle
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
                          />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </section>
          </Reveal>
        </div>
      </div>
    </MotionRoot>
  );
}
