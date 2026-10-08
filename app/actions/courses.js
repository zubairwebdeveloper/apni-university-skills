"use server";

import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { couponService } from "@/services/couponService";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { wishlistService } from "@/services/wishlistService";
import { paymentService } from "@/services/paymentService";

import { toActionError } from "@/lib/errors";
import { rateLimit } from "@/lib/security/rateLimit";

const UNVERIFIED = {
  ok: false,
  code: "UNVERIFIED",
  error: "Please verify your email first.",
};

const UNAUTH = {
  ok: false,
  code: "UNAUTHENTICATED",
  error: "Please log in to continue.",
};

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]{1,120}$/);

/**
 * Preview/validate a coupon for a course.
 */
export async function previewCoupon({ code, courseId }) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return UNAUTH;
    }

    if (!user.emailVerified) {
      return UNVERIFIED;
    }

    const normalizedCode = String(code ?? "").trim();

    if (!normalizedCode) {
      return {
        ok: false,
        error: "Please enter a coupon code.",
      };
    }

    if (!courseId) {
      return {
        ok: false,
        error: "Course is required.",
      };
    }

    const result = await couponService.preview({
      code: normalizedCode,
      courseId,
      studentId: user.uid,
    });

    return {
      ok: true,
      data: result,
    };
  } catch (error) {
    console.error("[previewCoupon]", error);

    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

/**
 * Get the current user's access state for a course.
 */
export async function getCourseAccess(rawSlug) {
  const slug = slugSchema.safeParse(rawSlug);
  const user = await getSessionUser();

  if (!slug.success || !user) {
    return {
      state: "anonymous",
      wishlisted: false,
    };
  }

  try {
    const course = await courseService.getCourseBySlug(slug.data);

    if (!course) {
      return {
        state: "none",
        wishlisted: false,
      };
    }

    const [enrollment, wishlisted] = await Promise.all([
      enrollmentService.getActiveEnrollment(user.uid, course.id),
      wishlistService.isWishlisted(user.uid, course.id),
    ]);

    return {
      state: enrollment
        ? enrollment.status === "completed"
          ? "completed"
          : "active"
        : "none",
      wishlisted,
    };
  } catch (error) {
    console.error("[getCourseAccess]", error);

    return {
      state: "anonymous",
      wishlisted: false,
    };
  }
}

/**
 * Enroll the authenticated user in a free course.
 */
export async function enrollInFreeCourse(rawSlug) {
  const slug = slugSchema.safeParse(rawSlug);

  if (!slug.success) {
    return {
      ok: false,
      error: "Invalid course.",
    };
  }

  const user = await getSessionUser();

  if (!user) {
    return UNAUTH;
  }

  if (!user.emailVerified) {
    return UNVERIFIED;
  }

  try {
    await enrollmentService.enrollInFreeCourse({
      user,
      courseSlug: slug.data,
    });

    return {
      ok: true,
    };
  } catch (error) {
    console.error("[enrollInFreeCourse]", error);

    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

/**
 * Start Stripe Checkout for a paid course.
 */
export async function startCheckout(rawSlug) {
  const slug = slugSchema.safeParse(rawSlug);

  if (!slug.success) {
    return {
      ok: false,
      error: "Invalid course.",
    };
  }

  const user = await getSessionUser();

  if (!user) {
    return UNAUTH;
  }

  if (!user.emailVerified) {
    return UNVERIFIED;
  }

  const limit = await rateLimit("checkout", {
    key: user.uid,
    limit: 10,
    windowSec: 600,
  });

  if (!limit.ok) {
    return {
      ok: false,
      error: "Too many attempts. Please wait a few minutes.",
    };
  }

  try {
    const url = await paymentService.createCheckoutSession({
      user,
      courseSlug: slug.data,
    });

    return {
      ok: true,
      url,
    };
  } catch (error) {
    console.error("[startCheckout]", error);

    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

/**
 * Toggle the authenticated user's course wishlist.
 */
export async function toggleWishlist(rawSlug) {
  const slug = slugSchema.safeParse(rawSlug);

  if (!slug.success) {
    return {
      ok: false,
      error: "Invalid course.",
    };
  }

  const user = await getSessionUser();

  if (!user) {
    return UNAUTH;
  }

  try {
    const result = await wishlistService.toggle({
      user,
      courseSlug: slug.data,
    });

    return {
      ok: true,
      ...result,
    };
  } catch (error) {
    console.error("[toggleWishlist]", error);

    return {
      ok: false,
      error: toActionError(error),
    };
  }
}
