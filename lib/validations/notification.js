// lib/validations/notification.js
import { z } from "zod";
import { lines } from "./shared";

export const NOTIFICATION_TYPES = [
  "announcement",
  "course",
  "payment",
  "certificate",
  "system",
  "career",
  "job",
];
export const AUDIENCES = [
  { value: "all_students", label: "All students" },
  { value: "course", label: "Students of a course" },
  { value: "users", label: "Specific users" },
  { value: "instructors", label: "Instructors" },
  { value: "admins", label: "Admins" },
];
export const SEND_MODES = [
  { value: "draft", label: "Save as draft" },
  { value: "now", label: "Send now" },
  { value: "schedule", label: "Schedule" },
];
const internalPath = (v) =>
  !v ||
  (v.startsWith("/") && !v.startsWith("//") && /^[\w\-./?=&%#]*$/.test(v));

export const notificationSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a title").max(100),
    body: z.string().trim().min(5, "Write at least 5 characters").max(1000),
    type: z.enum(NOTIFICATION_TYPES, { message: "Choose a type" }),
    link: z
      .string()
      .trim()
      .max(200)
      .refine(internalPath, "Use a site path such as /courses/my-course."),
    audience: z.enum(
      AUDIENCES.map((a) => a.value),
      { message: "Choose an audience" },
    ),
    courseSlug: z.string().max(120),
    userEmails: lines(50, 120).transform((a) => [
      ...new Set(a.map((e) => e.toLowerCase())),
    ]),
    mode: z.enum(SEND_MODES.map((m) => m.value)),
    scheduledFor: z.string(), // ISO, set when scheduling
  })
  .superRefine((d, ctx) => {
    if (d.audience === "course" && !d.courseSlug)
      ctx.addIssue({
        code: "custom",
        path: ["courseSlug"],
        message: "Choose a course.",
      });
    if (d.audience === "users") {
      if (!d.userEmails.length)
        ctx.addIssue({
          code: "custom",
          path: ["userEmails"],
          message: "Enter at least one email address.",
        });
      else if (
        d.userEmails.some((e) => !z.string().email().safeParse(e).success)
      )
        ctx.addIssue({
          code: "custom",
          path: ["userEmails"],
          message: "One of the lines isn't a valid email address.",
        });
    }
    if (d.mode === "schedule") {
      const t = Date.parse(d.scheduledFor);
      if (!(t > Date.now() + 2 * 60e3 && t < Date.now() + 366 * 864e5))
        ctx.addIssue({
          code: "custom",
          path: ["scheduledFor"],
          message: "Choose a time between 2 minutes and a year from now.",
        });
    }
  });

