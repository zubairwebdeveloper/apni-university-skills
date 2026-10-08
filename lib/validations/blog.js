import { z } from "zod";
import { BLOG_TOPICS } from "@/config/blog";
import { slugify } from "@/lib/utils/slugify";
import { adminSlug } from "./common";
import { lines, optionalSlug, storageImage } from "./shared";

export const blogSchema = z.object({
  title: z.string().trim().min(3, "Enter a title").max(140),
  slug: optionalSlug,
  excerpt: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters")
    .max(300, "Keep it under 300 characters"),
  content: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters")
    .max(60000, "Keep it under 60,000 characters"),
  category: z.enum(
    BLOG_TOPICS.map((t) => t.label),
    { message: "Choose a topic" },
  ), // public filters match on the label
  tags: lines(10, 40).transform((a) => [
    ...new Set(
      a
        .map(slugify)
        .filter(Boolean)
        .map((t) => t.slice(0, 40)),
    ),
  ]),
  authorName: z.string().trim().min(2, "Enter an author name").max(80),
  coverImage: storageImage("blog"),
  seoTitle: z.string().trim().max(70, "Keep it under 70 characters"),
  seoDescription: z.string().trim().max(160, "Keep it under 160 characters"),
  featured: z.boolean(),
});

export const scheduleSchema = z
  .object({ slug: adminSlug, scheduledFor: z.iso.datetime() })
  .refine(
    (d) => {
      const t = Date.parse(d.scheduledFor);
      return t > Date.now() + 2 * 60e3 && t < Date.now() + 366 * 864e5;
    },
    {
      path: ["scheduledFor"],
      message: "Choose a time between 2 minutes and a year from now.",
    },
  );

