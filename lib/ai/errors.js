// lib/ai/errors.js
import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(code, status, message, options = {}) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.retryAfter = options.retryAfter;
  }
}

// Turns provider/SDK failures into safe, user-facing errors (no internals leak)
export function normalizeProviderError(error) {
  if (error instanceof AppError) return error;
  const status = Number(error?.status);
  if (status === 429) {
    return new AppError(
      "provider_busy",
      429,
      "The assistant is busy right now. Please try again in a moment.",
    );
  }
  if (status === 401 || status === 403) {
    return new AppError(
      "provider_auth",
      502,
      "The assistant isn't set up correctly. Please contact support.",
    );
  }
  if (status >= 500) {
    return new AppError(
      "provider_unavailable",
      503,
      "The assistant is temporarily unavailable. Please try again soon.",
    );
  }
  return new AppError(
    "provider_error",
    502,
    "The assistant couldn't finish that reply. Please try again.",
  );
}

export function errorResponse(error) {
  const known = error instanceof AppError;
  if (!known) console.error("[ai] unexpected error:", error?.name);
  const e = known
    ? error
    : new AppError(
        "internal_error",
        500,
        "Something went wrong. Please try again.",
      );

  return NextResponse.json(
    { error: { code: e.code, message: e.message } },
    {
      status: e.status,
      headers: {
        "Cache-Control": "no-store",
        ...(e.retryAfter ? { "Retry-After": String(e.retryAfter) } : {}),
      },
    },
  );
}
