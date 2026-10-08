// lib/validations/category.js
import { z } from "zod";
import { ACCENTS, CATEGORY_ICONS } from "@/config/categories";
import { num, optionalSlug, storageImage } from "./shared";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(60),
  slug: optionalSlug,
  description: z.string().trim().max(500, "Keep it under 500 characters"),
  icon: z.enum(CATEGORY_ICONS, { message: "Choose an icon" }),
  accent: z.enum(
    ACCENTS.map((a) => a.value),
    { message: "Choose a color" },
  ),
  image: storageImage("categories"),
  order: num(0, 9999).pipe(z.int("Use a whole number")),
  featured: z.boolean(),
  seoTitle: z.string().trim().max(70, "Keep it under 70 characters"),
  seoDescription: z.string().trim().max(160, "Keep it under 160 characters"),
});

