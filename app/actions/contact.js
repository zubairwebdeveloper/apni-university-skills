"use server";

import { contactSchema } from "@/lib/validations/contact";
import { getSessionUser } from "@/lib/auth/session";
import { rateLimit } from "@/lib/security/rateLimit";
import { toActionError } from "@/lib/errors";
import { contactService } from "@/services/contactService";

const UNAUTH = {
  ok: false,
  error: "Please sign in to continue.",
};

const UNVERIFIED = {
  ok: false,
  error: "Please verify your email before continuing.",
};

export async function submitContact(rawData) {
  const parsed = contactSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message;

    return {
      ok: false,
      error: firstError || "Please check your information and try again.",
    };
  }

  const user = await getSessionUser();

  if (!user) {
    return UNAUTH;
  }

  if (!user.emailVerified) {
    return UNVERIFIED;
  }

  const limited = await rateLimit("contact", {
    key: user.uid,
    limit: 5,
    windowSec: 600,
  });

  if (!limited.ok) {
    return {
      ok: false,
      error: "Too many messages. Please wait a few minutes and try again.",
    };
  }

  try {
    const result = await contactService.create({
      ...parsed.data,
      userId: user.uid,
      userEmail: user.email ?? null,
    });

    return {
      ok: true,
      message: result?.message || "Your message has been sent successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      error: toActionError(error),
    };
  }
}

