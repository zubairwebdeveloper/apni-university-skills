// lib/validations/contact.js
import { z } from "zod";

export const CONTACT_SUBJECTS = [
  { value: "general", label: "General question" },
  { value: "courses", label: "Courses" },
  { value: "payments", label: "Payments & billing" },
  { value: "careers", label: "Careers & jobs" },
  { value: "partnership", label: "Partnership" },
];

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  subject: z.enum(
    CONTACT_SUBJECTS.map((s) => s.value),
    { message: "Choose a subject" },
  ),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Keep it under 2000 characters"),
  website: z.string().max(200).optional().default(""), // honeypot: real people never fill this
});

