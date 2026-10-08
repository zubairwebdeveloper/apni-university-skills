// components/public/courses/CourseActions.jsx

"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { FiHeart } from "react-icons/fi";
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

import { formatPrice } from "@/lib/utils/format";

export function CourseActions({ course }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [access, setAccess] = useState(null);
  const [busy, setBusy] = useState(false);

  const [code, setCode] = useState("");
  const [quote, setQuote] = useState(null);
  const [checking, setChecking] = useState(false);

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
    router.push(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);

  async function applyCoupon() {
    const trimmed = code.trim();

    if (!trimmed) return;

    setChecking(true);

    try {
      const res = await previewCoupon(course.slug, trimmed);

      if (!res.ok) {
        setQuote(null);

        return res.code === "UNAUTHENTICATED"
          ? goLogin()
          : toast.error(res.error);
      }

      setQuote(res);
      toast.success("Coupon applied.");
    } finally {
      setChecking(false);
    }
  }

  async function handlePrimary() {
    if (access?.state === "anonymous") {
      return goLogin();
    }

    setBusy(true);

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
  }

  async function handleWishlist() {
    if (access?.state === "anonymous") {
      return goLogin();
    }

    const prev = access.wishlisted;

    setAccess({
      ...access,
      wishlisted: !prev,
    });

    const res = await toggleWishlist(course.slug);

    if (!res.ok) {
      setAccess({
        ...access,
        wishlisted: prev,
      });

      return res.code === "UNAUTHENTICATED"
        ? goLogin()
        : toast.error(res.error);
    }

    setAccess((current) => ({
      ...current,
      wishlisted: res.wishlisted,
    }));

    toast.success(
      res.wishlisted ? "Saved to your wishlist" : "Removed from your wishlist",
    );
  }

  if (!access) {
    return <Skeleton className="h-11 w-full" />;
  }

  if (access.state === "active") {
    return (
      <Link
        href={`/student/learning/${course.slug}`}
        className={buttonVariants({
          size: "lg",
          className: "w-full",
        })}
      >
        Continue Learning
      </Link>
    );
  }

  if (access.state === "completed") {
    return (
      <div className="space-y-2">
        <Link
          href="/student/certificates"
          className={buttonVariants({
            size: "lg",
            className: "w-full",
          })}
        >
          View Certificate
        </Link>

        <Link
          href={`/student/learning/${course.slug}`}
          className={buttonVariants({
            variant: "outline",
            className: "w-full",
          })}
        >
          Review lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!course.isFree && access.state === "none" && (
        <Field>
          <FieldLabel
            htmlFor="coupon"
            className="text-xs text-muted-foreground"
          >
            Coupon code
          </FieldLabel>

          <div className="flex gap-2">
            <Input
              id="coupon"
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setQuote(null);
              }}
              maxLength={24}
              autoComplete="off"
              placeholder="Optional"
            />

            <Button
              type="button"
              variant="outline"
              onClick={applyCoupon}
              disabled={!code.trim() || checking}
            >
              {checking ? "Checking…" : "Apply"}
            </Button>
          </div>

          {quote && (
            <FieldDescription>
              −{formatPrice(quote.discount, course.currency)}. You&apos;ll pay{" "}
              {formatPrice(quote.final, course.currency)}.
            </FieldDescription>
          )}
        </Field>
      )}

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handlePrimary}
        disabled={busy}
      >
        {busy ? "Please wait…" : course.isFree ? "Enroll Free" : "Buy Now"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleWishlist}
        aria-pressed={!!access.wishlisted}
      >
        <FiHeart
          className={access.wishlisted ? "fill-current text-destructive" : ""}
          aria-hidden="true"
        />
        {access.wishlisted ? "Saved to wishlist" : "Add to wishlist"}
      </Button>
    </div>
  );
}

