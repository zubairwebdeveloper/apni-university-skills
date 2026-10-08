export class AppError extends Error {
  constructor(message, status = 400) {
    super(message);

    this.name = "AppError";
    this.status = status;
  }
}

export const toActionError = (e) => {
  if (e instanceof AppError) return e.message;
  if (e?.name === "ZodError") return "Please check your input and try again.";
  console.error("[action]", e);
  return "Something went wrong. Please try again.";
};

