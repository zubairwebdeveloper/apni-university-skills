// lib/errors.js
export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export function toActionError(e) {
  if (e instanceof AppError) return e.message;
  console.error("[action]", e);
  return "Something went wrong. Please try again.";
}
