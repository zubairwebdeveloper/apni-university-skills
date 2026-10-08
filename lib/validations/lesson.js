import { z } from "zod";
import { num, optionalHttpsUrl, optionalSlug } from "./shared";

export const resourceSchema = z.object({
  title: z.string().trim().min(2, "Enter a title").max(100),
  url: z
    .string()
    .trim()
    .max(300)
    .refine(
      (v) => /^https:\/\//i.test(v) && URL.canParse(v),
      "Use a full https:// link.",
    ),
});
export const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(150),
  path: z.string().max(300),
  size: z.number().int().min(0).max(10_000_000),
  contentType: z.string().max(120),
});

export const lessonSchema = z
  .object({
    title: z.string().trim().min(2, "Enter a title").max(120),
    slug: optionalSlug,
    description: z.string().trim().max(3000, "Keep it under 3000 characters"),
    videoUrl: optionalHttpsUrl,
    duration: num(0, 10000).pipe(z.int("Use whole minutes")),
    sectionTitle: z.string().trim().min(1, "Enter a section name").max(80),
    isPreview: z.boolean(),
    transcript: z.string().trim().max(50000, "Keep it under 50,000 characters"),
    resources: z.array(resourceSchema).max(10),
    attachments: z.array(attachmentSchema).max(10),
  })
  .superRefine((d, ctx) => {
    if (d.isPreview && !d.videoUrl)
      ctx.addIssue({
        code: "custom",
        path: ["videoUrl"],
        message: "A free preview needs a video link.",
      });
  });

export const curriculumSchema = z.object({
  sections: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Every section needs a name").max(80),
        lessonIds: z
          .array(z.string().regex(/^[A-Za-z0-9]{10,40}$/))
          .min(1)
          .max(500),
      }),
    )
    .min(1)
    .max(100),
});

