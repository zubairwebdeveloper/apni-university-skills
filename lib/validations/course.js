// lib/validations/course.js
import { z } from "zod";
import { LANGUAGES, LEVELS } from "@/config/courses";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { lines, num, optNum, optionalSlug, storageImage } from "./shared";

export const courseSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a title").max(120),
    slug: optionalSlug,
    shortDescription: z
      .string()
      .trim()
      .min(10, "Write at least 10 characters")
      .max(200, "Keep it under 200 characters"),
    description: z
      .string()
      .trim()
      .min(30, "Write at least 30 characters")
      .max(10000),
    categoryId: z.string().min(1, "Choose a category"),
    instructorId: z.string().min(1, "Choose an instructor"),
    thumbnail: storageImage("courses"),
    level: z.enum(
      LEVELS.map((l) => l.value),
      { message: "Choose a level" },
    ),
    language: z.enum(LANGUAGES, { message: "Choose a language" }),
    isFree: z.boolean(),
    price: num(0, 100000),
    salePrice: optNum,
    currency: z.enum(SUPPORTED_CURRENCIES),
    duration: num(0, 100000).pipe(z.int("Use whole minutes")),
    featured: z.boolean(),
    seoTitle: z.string().trim().max(70, "Keep it under 70 characters"),
    seoDescription: z.string().trim().max(160, "Keep it under 160 characters"),
    seoKeywords: lines(10, 40),
    requirements: lines(15),
    outcomes: lines(20),
    tags: lines(15, 30),
    faqs: z
      .array(
        z.object({
          q: z.string().trim().min(3, "Enter a question").max(200),
          a: z.string().trim().min(3, "Enter an answer").max(1000),
        }),
      )
      .max(10),
  })
  .superRefine((d, ctx) => {
    if (d.isFree) return;
    if (d.price < 0.5)
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message:
          "Paid courses must cost at least 0.50. Some currencies need more at Stripe.",
      });
    if (d.salePrice != null && d.salePrice >= d.price)
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "The sale price must be lower than the price.",
      });
  })
  .transform((d) => (d.isFree ? { ...d, price: 0, salePrice: null } : d));

