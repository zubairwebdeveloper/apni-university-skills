import {
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiInfo,
  FiMessageSquare,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Rating } from "@/components/shared/Rating";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReviewDialog } from "@/components/student/ReviewDialog";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";

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

function getStatusMessage(status) {
  switch (status) {
    case "approved":
      return "Your review is live and visible to other students.";

    case "pending":
      return "Your review is waiting for moderation.";

    case "rejected":
      return "Your review needs attention before it can be published.";

    case "draft":
      return "This review is currently saved as a draft.";

    default:
      return "Your review has been saved.";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "approved":
      return FiCheckCircle;

    case "pending":
      return FiClock;

    case "rejected":
      return FiInfo;

    default:
      return FiMessageSquare;
  }
}

function calculateStats(reviews) {
  if (!reviews.length) {
    return {
      average: 0,
      total: 0,
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  let total = 0;

  for (const review of reviews) {
    const rating = Math.min(5, Math.max(1, Number(review.rating) || 0));

    if (distribution[rating] !== undefined) {
      distribution[rating] += 1;
    }

    total += rating;
  }

  return {
    average: total / reviews.length,
    total: reviews.length,
    distribution,
  };
}

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

  return (
    <div className="space-y-8 pb-10">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <StudentPageHeader
        title="Reviews"
        description="Share your experience, help other learners, and keep track of your course feedback."
      />

      {/* ------------------------------------------------------------------ */}
      {/* Overview                                                            */}
      {/* ------------------------------------------------------------------ */}

      <section
        aria-labelledby="review-overview"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <h2 id="review-overview" className="sr-only">
          Review overview
        </h2>

        {/* Total reviews */}
        <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your reviews</p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {stats.total}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {stats.total === 1 ? "course reviewed" : "courses reviewed"}
              </p>
            </div>

            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              <FiMessageSquare aria-hidden="true" className="size-5" />
            </span>
          </div>
        </Card>

        {/* Average */}
        <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average rating</p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {stats.average ? stats.average.toFixed(1) : "—"}
              </p>

              <div className="mt-1 flex items-center gap-1">
                <FiStar
                  aria-hidden="true"
                  className="size-3.5 fill-current text-yellow-500"
                />

                <span className="text-xs text-muted-foreground">out of 5</span>
              </div>
            </div>

            <span className="grid size-10 place-items-center rounded-xl bg-yellow-500/10 text-yellow-600 transition-transform duration-300 group-hover:rotate-6">
              <FiStar aria-hidden="true" className="size-5" />
            </span>
          </div>
        </Card>

        {/* Courses to review */}
        <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Waiting for review
              </p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {toReview.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {toReview.length ? "ready for your feedback" : "all caught up"}
              </p>
            </div>

            <span className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600 transition-transform duration-300 group-hover:scale-110">
              <FiEdit3 aria-hidden="true" className="size-5" />
            </span>
          </div>
        </Card>

        {/* Completion */}
        <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Review progress</p>

              <p className="mt-2 text-3xl font-bold tabular-nums">
                {completion}%
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                of enrolled courses reviewed
              </p>
            </div>

            <span className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <FiTrendingUp aria-hidden="true" className="size-5" />
            </span>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{
                width: `${completion}%`,
              }}
            />
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Courses waiting for review                                         */}
      {/* ------------------------------------------------------------------ */}

      {toReview.length > 0 && (
        <section aria-labelledby="to-review" className="space-y-4">
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
                Your feedback helps us improve courses and helps other students
                choose what to learn.
              </p>
            </div>

            <span className="text-xs font-medium text-muted-foreground">
              {toReview.length} {toReview.length === 1 ? "course" : "courses"}{" "}
              waiting
            </span>
          </div>

          <ul className="grid gap-4 lg:grid-cols-2">
            {toReview.map((enrollment) => (
              <li key={enrollment.id}>
                <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <FiBookOpen aria-hidden="true" className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {enrollment.courseTitle}
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          You've completed this course.
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <FiStar
                            aria-hidden="true"
                            className="size-3.5 text-yellow-500"
                          />

                          <span>Share your experience with other learners</span>
                        </div>
                      </div>
                    </div>

                    <ReviewDialog
                      courseSlug={enrollment.courseSlug}
                      courseTitle={enrollment.courseTitle}
                    />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Rating distribution                                                 */}
      {/* ------------------------------------------------------------------ */}

      {reviews.length > 0 && (
        <section aria-labelledby="rating-summary">
          <Card className="overflow-hidden">
            <div className="border-b p-5">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-yellow-500/10 text-yellow-600">
                  <FiBarChart2 aria-hidden="true" className="size-4" />
                </span>

                <div>
                  <h2 id="rating-summary" className="font-semibold">
                    Your rating summary
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    A quick look at the ratings you've given.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-[180px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-xl bg-muted/40 p-5 text-center">
                <span className="text-4xl font-bold tabular-nums">
                  {stats.average.toFixed(1)}
                </span>

                <div className="mt-2">
                  <Rating value={stats.average} count={1} showCount={false} />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Based on {stats.total}{" "}
                  {stats.total === 1 ? "review" : "reviews"}
                </p>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating];

                  const percentage =
                    stats.total > 0
                      ? Math.round((count / stats.total) * 100)
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="flex w-8 items-center gap-1 text-xs font-medium">
                        {rating}

                        <FiStar
                          aria-hidden="true"
                          className="size-3 fill-current text-yellow-500"
                        />
                      </span>

                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-yellow-500 transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <span className="w-8 text-right text-xs text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Your reviews                                                        */}
      {/* ------------------------------------------------------------------ */}

      <section aria-labelledby="my-reviews" className="space-y-4">
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
              Manage the feedback you've shared with Apni University.
            </p>
          </div>

          {reviews.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>

        {reviews.length ? (
          <ul className="space-y-4">
            {reviews.map((review) => {
              const StatusIcon = getStatusIcon(review.status);

              return (
                <li key={review.id}>
                  <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg">
                    {/* Status accent */}
                    <div className="absolute inset-y-0 left-0 w-1 bg-primary/20 transition-colors group-hover:bg-primary" />

                    <div className="space-y-4 pl-2">
                      {/* Review header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <FiAward
                              aria-hidden="true"
                              className="size-4 shrink-0 text-primary"
                            />

                            <h3 className="truncate font-serif text-lg font-semibold">
                              {review.courseTitle}
                            </h3>
                          </div>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Course feedback
                          </p>
                        </div>

                        <StatusBadge status={review.status} />
                      </div>

                      {/* Rating */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Rating
                          value={review.rating}
                          count={1}
                          showCount={false}
                        />

                        <span className="text-xs font-medium text-muted-foreground">
                          {review.rating}/5
                        </span>
                      </div>

                      {/* Title */}
                      {review.title && (
                        <h4 className="text-base font-semibold">
                          {review.title}
                        </h4>
                      )}

                      {/* Comment */}
                      <div className="rounded-xl bg-muted/40 p-4">
                        <p className="text-sm leading-6 text-muted-foreground">
                          {review.comment}
                        </p>
                      </div>

                      {/* Status explanation */}
                      <div className="flex items-start gap-2 rounded-lg border bg-background/60 p-3">
                        <StatusIcon
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        />

                        <p className="text-xs leading-5 text-muted-foreground">
                          {getStatusMessage(review.status)}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>Updated {formatDate(review.updatedAt)}</span>

                          {review.createdAt &&
                            review.createdAt !== review.updatedAt && (
                              <span>
                                Created {formatDate(review.createdAt)}
                              </span>
                            )}
                        </div>

                        <ReviewDialog
                          courseSlug={review.courseSlug}
                          courseTitle={review.courseTitle}
                          existing={review}
                          label="Edit review"
                        />
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
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

      {/* ------------------------------------------------------------------ */}
      {/* Review tips                                                         */}
      {/* ------------------------------------------------------------------ */}

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
                <li className="flex items-start gap-2">
                  <FiCheckCircle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  />
                  Tell others what you learned.
                </li>

                <li className="flex items-start gap-2">
                  <FiCheckCircle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  />
                  Mention practical projects or lessons.
                </li>

                <li className="flex items-start gap-2">
                  <FiCheckCircle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  />
                  Keep your feedback honest and respectful.
                </li>

                <li className="flex items-start gap-2">
                  <FiCheckCircle
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-emerald-600"
                  />
                  Avoid sharing personal information.
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
