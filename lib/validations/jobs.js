// lib/validations/job.js
import { z } from "zod";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "@/config/jobs";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";
import { canonicalSkill } from "@/config/skills";
import { lines, optNum, optionalSlug, storageImage } from "./shared";

export const jobSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a title").max(120),
    slug: optionalSlug,
    company: z.string().trim().min(2, "Enter the company").max(100),
    companyLogo: storageImage("jobs"),
    location: z.string().trim().min(2, "Enter a location").max(100),
    remote: z.boolean(),
    employmentType: z.enum(
      EMPLOYMENT_TYPES.map((t) => t.value),
      { message: "Choose a job type" },
    ),
    experienceLevel: z.enum(
      EXPERIENCE_LEVELS.map((l) => l.value),
      { message: "Choose an experience level" },
    ),
    salaryMin: optNum,
    salaryMax: optNum,
    currency: z.enum(SUPPORTED_CURRENCIES),
    skills: lines(20, 40).transform((a) => [...new Set(a.map(canonicalSkill))]),
    description: z
      .string()
      .trim()
      .min(30, "Write at least 30 characters")
      .max(8000),
    requirements: lines(20, 250),
    responsibilities: lines(20, 250),
    applyUrl: z
      .string()
      .trim()
      .max(300)
      .refine(
        (v) => /^https:\/\//i.test(v) && URL.canParse(v),
        "Use a full https:// link to the application page.",
      ),
    featured: z.boolean(),
    expiresAt: z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use a valid date"), // "YYYY-MM-DD" or empty; converted to Date on the server
  })
  .superRefine((d, ctx) => {
    if ((d.salaryMin == null) !== (d.salaryMax == null))
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "Enter both a minimum and a maximum, or neither.",
      });
    else if (d.salaryMin != null && d.salaryMin > d.salaryMax)
      ctx.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "The maximum must be at least the minimum.",
      });
    if (d.expiresAt && !(Date.parse(`${d.expiresAt}T23:59:59Z`) > Date.now()))
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Choose a date in the future, or leave it blank.",
      });
  });

