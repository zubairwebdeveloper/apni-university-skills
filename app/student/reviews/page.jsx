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

        <div className="space-y-8 pb-10">
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
              className="scroll-mt-24 space-y-4"
            >
              <Reveal>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        <FiEdit3 aria-hidden="true" className="size-4" />
                      </span>
                      <h2
                        id="to-review"
                        className="text-xl font-semibold tracking-tight"
                      >
                        Courses you can review
                      </h2>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your feedback helps us improve courses and helps other
                      students choose what to learn.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {toReview.length}{" "}
                    {toReview.length === 1 ? "course" : "courses"} waiting
                  </span>
                </div>
              </Reveal>

              <ul className="grid gap-4 lg:grid-cols-2">
                {toReview.map((enrollment, i) => (
                  <li key={enrollment.id} className="min-w-0">
                    <Reveal delay={Math.min(i, 5) * 0.05}>
                      <TiltCard>
                        <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                                <FiBookOpen
                                  aria-hidden="true"
                                  className="size-5"
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className="truncate font-semibold">
                                  {enrollment.courseTitle}
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  You&apos;ve completed this course.
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                  <FiStar
                                    aria-hidden="true"
                                    className="size-3.5 text-amber-500"
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
                ))}
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
            className="scroll-mt-24 space-y-4"
          >
            <Reveal>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <FiMessageSquare aria-hidden="true" className="size-4" />
                    </span>
                    <h2
                      id="my-reviews"
                      className="text-xl font-semibold tracking-tight"
                    >
                      Your reviews
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage the feedback you&apos;ve shared with Apni University.
                  </p>
                </div>
                {reviews.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                )}
              </div>
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
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FiInfo aria-hidden="true" className="size-5" />
                  </div>
                  <div>
                    <h2 id="review-tips" className="font-semibold">
                      Tips for a helpful review
                    </h2>
                    <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      {TIPS.map((tip) => (
                        <li key={tip} className="flex items-start gap-2">
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
