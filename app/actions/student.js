"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { adminAuth } from "@/lib/firebase/admin/auth";
import { rateLimit } from "@/lib/security/rateLimit";
import { AppError, toActionError } from "@/lib/errors";
import { learningService } from "@/services/learningService";
import { wishlistService } from "@/services/wishlistService";
import { reviewService } from "@/services/reviewService";
import { userService } from "@/services/userService";
import { profileSchema } from "@/lib/validations/profile";
import { reviewSchema } from "@/lib/validations/review";

const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]{1,120}$/);

async function authed() {
  const user = await getSessionUser();
  if (!user) throw new AppError("Please log in to continue.", 401);
  if (!user.emailVerified)
    throw new AppError("Please verify your email first.", 403);
  return user;
}
async function limit(scope, user, max, windowSec) {
  if (!(await rateLimit(scope, { key: user.uid, limit: max, windowSec })).ok)
    throw new AppError(
      "You're doing that too quickly. Please wait a moment.",
      429,
    );
}
async function run(fn) {
  try {
    return { ok: true, ...(await fn()) };
  } catch (e) {
    return { ok: false, error: toActionError(e) };
  }
}

export async function setLessonCompleted(input) {
  return run(async () => {
    const d = z
      .object({ courseSlug: slug, lessonSlug: slug, completed: z.boolean() })
      .parse(input);
    const user = await authed();
    await limit("lesson", user, 120, 60);
    return learningService.setLessonCompleted({ user, ...d });
  });
}

export async function removeFromWishlist(courseId) {
  return run(async () => {
    const id = z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,100}$/)
      .parse(courseId);
    const user = await authed();
    await wishlistService.remove({ user, courseId: id }); // the doc id embeds the session uid, so only your own entry can match
    return {};
  });
}

export async function submitReview(input) {
  return run(async () => {
    const d = reviewSchema.parse(input);
    const user = await authed();
    await limit("review", user, 10, 3600);
    await reviewService.submitReview({ user, ...d });
    return {};
  });
}

export async function updateProfile(input) {
  return run(async () => {
    const d = profileSchema.parse(input);
    const user = await authed();
    await userService.updateProfile(user.uid, d);
    revalidatePath("/student", "layout");
    return {};
  });
}

export async function updateAvatar(url) {
  return run(async () => {
    const u = z.string().url().max(1000).parse(url);
    const user = await authed();
    await userService.updateAvatar(user.uid, u);
    return {};
  });
}

export async function signOutEverywhere() {
  return run(async () => {
    const user = await getSessionUser();
    if (!user) throw new AppError("Please log in to continue.", 401);
    await adminAuth.revokeRefreshTokens(user.uid); // every device's session cookie stops verifying
    return {};
  });
}
export async function markNotificationsRead() {
  return run(async () => {
    const user = await authed();
    await notificationInboxRepository.markAllRead(user.uid);
    revalidatePath("/student/notifications");
    return {};
  });
}
