// lib/validations/career.js
import { z } from "zod";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { canonicalSkill } from "@/config/skills";
import { lines, num, optNum, optionalSlug } from "./shared";

export const careerSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a title").max(80),
    slug: optionalSlug,
    summary: z
      .string()
      .trim()
      .min(20, "Write at least 20 characters")
      .max(250, "Keep it under 250 characters"),
    description: z
      .string()
      .trim()
      .min(30, "Write at least 30 characters")
      .max(4000),
    skills: lines(15, 40),
    roadmap: z
      .array(
        z.object({
          title: z.string().trim().min(2, "Enter a step title").max(80),
          text: z.string().trim().min(5, "Describe the step").max(400),
        }),
      )
      .max(10),
    interviewPrep: lines(10, 150),
    portfolioIdeas: lines(10, 150),
    jobRoles: lines(10, 60),
    freelanceNotes: z.string().trim().max(1500),
    categorySlug: z
      .string()
      .max(80)
      .transform((v) => (v === "none" ? "" : v)), // drives "related courses"
    jobSkill: z.string().trim().max(40).transform(canonicalSkill), // drives "related jobs"
    salaryMin: optNum,
    salaryMax: optNum,
    salaryCurrency: z.enum(SUPPORTED_CURRENCIES),
    salaryNote: z.string().trim().max(200),
    order: num(0, 9999).pipe(z.int("Use a whole number")),
    seoTitle: z.string().trim().max(70),
    seoDescription: z.string().trim().max(160),
  })
  .superRefine((d, ctx) => {
    const has = d.salaryMin != null || d.salaryMax != null;
    if (!has) return;
    if (d.salaryMin == null || d.salaryMax == null)
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "Enter both a minimum and a maximum, or neither.",
      });
    else if (d.salaryMin > d.salaryMax)
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "The maximum must be at least the minimum.",
      });
    if (d.salaryNote.length < 5)
      ctx.addIssue({
        code: "custom",
        path: ["salaryNote"],
        message: "Say where these figures come from (region, year, source).",
      });
  });

// Form fields -> stored shape
export function toCareerData({
  salaryMin,
  salaryMax,
  salaryCurrency,
  salaryNote,
  ...rest
}) {
  return {
    ...rest,
    salary:
      salaryMin != null && salaryMax != null
        ? {
            min: salaryMin,
            max: salaryMax,
            currency: salaryCurrency,
            note: salaryNote,
          }
        : null,
  };
}

