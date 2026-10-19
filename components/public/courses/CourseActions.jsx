// components/public/courses/CourseActions.jsx

"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Heart,
  Loader2,
  Lock,
  Play,
  Tag,
  Ticket,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/components/auth/AuthProvider";

import {
  enrollInFreeCourse,
  getCourseAccess,
  previewCoupon,
  startCheckout,
  toggleWishlist,
} from "@/app/actions/courses";

import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/format";

// Where signed-out visitors are sent. Change here if your route differs.
const SIGN_IN_PATH = "/signin";

const EASE = [0.22, 1, 0.36, 1];

function Spinner() {
  return (
    <Loader2
      className="size-4 animate-spin motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}

// Small status line shown above the buttons for enrolled / completed users.
function StatusLine({ icon: Icon, children }) {
  return (
    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
      <span className="grid size-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      {children}
    </p>
  );
}

export function CourseActions({ course }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { user, loading } = useAuth();

  const [access, setAccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);

  const [code, setCode] = useState("");
  const [quote, setQuote] = useState(null);
  const [checking, setChecking] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    getCourseAccess(course.slug)
      .then((result) => !cancelled && setAccess(result))
      .catch(
        () =>
          !cancelled &&
          setAccess({
            state: "anonymous",
            wishlisted: false,
          }),
      );

    return () => {
      cancelled = true;
    };
  }, [course.slug, user?.uid, loading]);

  const goLogin = () =>
    router.push(
      `${SIGN_IN_PATH}?next=${encodeURIComponent(`/courses/${course.slug}`)}`,
    );

  function clearCoupon() {
    setCode("");
    setQuote(null);
    setCouponError("");
    setCouponOpen(false);
  }

  async function applyCoupon() {
    const trimmed = code.trim();

    if (!trimmed) return;

    // Coupons need a logged-in user
    if (access?.state === "anonymous") {
      return goLogin();
    }

    setChecking(true);
    setCouponError("");

    try {
      // Server action expects an object { code, courseId }
      const res = await previewCoupon({
        code: trimmed,
        courseId: course.id,
      });

      if (!res.ok) {
        setQuote(null);

        if (res.code === "UNAUTHENTICATED") return goLogin();

        setCouponError(res.error);
        return toast.error(res.error);
      }

      // The action returns { ok, data: {...} }
      setQuote(res.data);
      toast.success("Coupon applied.");
    } catch (error) {
      console.error(error);
      setQuote(null);
      setCouponError("Could not check the coupon. Please try again.");
      toast.error("Could not check the coupon. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handlePrimary() {
    if (access?.state === "anonymous") {
      return goLogin();
    }

    setBusy(true);

    try {
      const res = course.isFree
        ? await enrollInFreeCourse(course.slug)
        : await startCheckout(course.slug, quote?.code);

      if (!res.ok) {
        setBusy(false);

        return res.code === "UNAUTHENTICATED"
          ? goLogin()
          : toast.error(res.error);
      }

      if (course.isFree) {
        toast.success("You're enrolled. Happy learning!");

        router.push(`/student/learning/${course.slug}`);
      } else {
        // Stripe Checkout; stay busy during redirect.
        window.location.assign(res.url);
      }
    } catch (error) {
      console.error(error);
      setBusy(false);
      toast.error("Something went wrong. Please try again.");
    }
  }

  async function handleWishlist() {
    if (access?.state === "anonymous") {
      return goLogin();
    }

    const prev = access.wishlisted;

    // Optimistic update, rolled back if the server says no.
    setWishBusy(true);
    setAccess((current) => ({ ...current, wishlisted: !prev }));

    try {
      const res = await toggleWishlist(course.slug);

      if (!res.ok) {
        setAccess((current) => ({ ...current, wishlisted: prev }));

        return res.code === "UNAUTHENTICATED"
          ? goLogin()
          : toast.error(res.error);
      }

      setAccess((current) => ({
        ...current,
        wishlisted: res.wishlisted,
      }));

      toast.success(
        res.wishlisted
          ? "Saved to your wishlist"
          : "Removed from your wishlist",
      );
    } catch (error) {
      console.error(error);
      setAccess((current) => ({ ...current, wishlisted: prev }));
      toast.error("Could not update your wishlist. Please try again.");
    } finally {
      setWishBusy(false);
    }
  }

  /* ---------------------------- Loading state --------------------------- */
  if (!access) {
    return (
      <div
        className="space-y-3"
        aria-busy="true"
        aria-label="Loading enrollment options"
      >
        <Skeleton className="h-11 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="mx-auto h-3 w-2/3" />
      </div>
    );
  }

  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: EASE },
      };

  /* ------------------------------ Enrolled ------------------------------ */
  if (access.state === "active") {
    return (
      <motion.div {...fade} className="space-y-3">
        <StatusLine icon={CheckCircle2}>You&apos;re enrolled</StatusLine>

        <Link
          href={`/student/learning/${course.slug}`}
          className={buttonVariants({
            size: "lg",
            className: "group min-h-11 w-full",
          })}
        >
          <Play className="size-4" aria-hidden="true" />
          Continue Learning
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </motion.div>
    );
  }

  /* ------------------------------ Completed ----------------------------- */
  if (access.state === "completed") {
    return (
      <motion.div {...fade} className="space-y-3">
        <StatusLine icon={Award}>Course completed</StatusLine>

        <div className="space-y-2">
          <Link
            href="/student/certificates"
            className={buttonVariants({
              size: "lg",
              className: "min-h-11 w-full",
            })}
          >
            <Award className="size-4" aria-hidden="true" />
            View Certificate
          </Link>

          <Link
            href={`/student/learning/${course.slug}`}
            className={buttonVariants({
              variant: "outline",
              className: "min-h-10 w-full",
            })}
          >
            <BookOpen className="size-4" aria-hidden="true" />
            Review lessons
          </Link>
        </div>
      </motion.div>
    );
  }

  /* ------------------------- Not enrolled (buy/enroll) ------------------------- */
  const currency = quote?.currency ?? course.currency;
  const showCoupon = !course.isFree && access.state === "none";
  const couponVisible = couponOpen || !!quote;
  const wishlisted = !!access.wishlisted;
  const isAnonymous = access.state === "anonymous";

  const primaryLabel = busy
    ? "Please wait…"
    : course.isFree
      ? "Enroll Free"
      : quote
        ? `Pay ${formatPrice(quote.final, currency)}`
        : "Buy Now";

  return (
    <motion.div {...fade} className="space-y-4">
      {showCoupon && (
        <div>
          <AnimatePresence initial={false} mode="wait">
            {!couponVisible ? (
              <motion.button
                key="coupon-trigger"
                type="button"
                onClick={() => setCouponOpen(true)}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Ticket className="size-4" aria-hidden="true" />
                Have a coupon code?
              </motion.button>
            ) : (
              <motion.div
                key="coupon-panel"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <Field className="gap-2 p-px">
                  <div className="flex items-center justify-between gap-2">
                    <FieldLabel
                      htmlFor="coupon"
                      className="text-xs text-muted-foreground"
                    >
                      Coupon code
                    </FieldLabel>

                    {!quote && (
                      <button
                        type="button"
                        onClick={clearCoupon}
                        aria-label="Hide coupon field"
                        className="grid size-6 place-items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value.toUpperCase());
                        setQuote(null);
                        setCouponError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          applyCoupon();
                        }
                      }}
                      maxLength={24}
                      autoComplete="off"
                      autoFocus={!quote}
                      placeholder="Enter code"
                      aria-invalid={!!couponError}
                      aria-describedby={
                        couponError ? "coupon-error" : undefined
                      }
                      className="font-mono tracking-wide"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyCoupon}
                      disabled={!code.trim() || checking}
                    >
                      {checking ? (
                        <>
                          <Spinner />
                          Checking
                        </>
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>

                  {couponError && (
                    <p
                      id="coupon-error"
                      role="alert"
                      className="text-xs font-medium text-destructive"
                    >
                      {couponError}
                    </p>
                  )}

                  <div aria-live="polite">
                    {quote && (
                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                            <Tag
                              className="size-3.5 shrink-0 text-primary"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              Coupon{" "}
                              <span className="font-mono font-medium text-foreground">
                                {quote.code ?? code}
                              </span>
                            </span>
                          </p>

                          <span className="shrink-0 font-medium text-emerald-600 dark:text-emerald-400">
                            −{formatPrice(quote.discount, currency)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
                          <span className="font-medium text-foreground">
                            You&apos;ll pay
                          </span>
                          <span className="text-base font-semibold tabular-nums text-foreground">
                            {formatPrice(quote.final, currency)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={clearCoupon}
                          className="mt-2 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          Remove coupon
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {!quote && !couponError && (
                    <FieldDescription className="text-xs">
                      Optional. Discounts are applied before checkout.
                    </FieldDescription>
                  )}
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          size="lg"
          className="group min-h-11 w-full font-semibold"
          onClick={handlePrimary}
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? (
            <Spinner />
          ) : (
            <ArrowRight
              className="order-last size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          )}
          {primaryLabel}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3" aria-hidden="true" />
          {isAnonymous
            ? "You'll be asked to sign in first."
            : course.isFree
              ? "No payment required."
              : "Secure checkout with Stripe."}
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className={cn(
          "min-h-10 w-full transition-colors",
          wishlisted && "border-destructive/40 bg-destructive/5",
        )}
        onClick={handleWishlist}
        disabled={wishBusy}
        aria-pressed={wishlisted}
      >
        <motion.span
          key={String(wishlisted)}
          initial={reduce ? false : { scale: 0.6 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="inline-flex"
        >
          <Heart
            className={cn(
              "size-4",
              wishlisted && "fill-current text-destructive",
            )}
            aria-hidden="true"
          />
        </motion.span>
        {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
      </Button>
    </motion.div>
  );
}
