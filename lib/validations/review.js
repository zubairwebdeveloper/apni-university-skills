// lib/validations/review.js
import { z } from "zod";
export const reviewSchema = z.object({
  courseSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,120}$/),
  rating: z.coerce
    .number({ message: "Choose a rating" })
    .int()
    .min(1, "Choose a rating")
    .max(5),
  title: z.string().trim().max(80),
  comment: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(1000, "Keep it under 1000 characters"),
});

