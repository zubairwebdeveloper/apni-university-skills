// lib/validations/settings.js
import { z } from "zod";
import { optionalHttpsUrl, storageImage } from "./shared";

const emailOrBlank = z.union([
  z.literal(""),
  z.string().trim().toLowerCase().email("Enter a valid email"),
]);

export const generalSchema = z.object({
  siteName: z.string().trim().min(2, "Enter a site name").max(60),
  tagline: z.string().trim().max(100),
  description: z.string().trim().max(300, "Keep it under 300 characters"),
  logo: storageImage("settings"),
  contactEmail: emailOrBlank,
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s()-]*$/, "Use digits, spaces, + ( ) -"),
  address: z.string().trim().max(200),
  social: z.object({
    linkedin: optionalHttpsUrl,
    x: optionalHttpsUrl,
    youtube: optionalHttpsUrl,
    github: optionalHttpsUrl,
  }),
  seoTitle: z.string().trim().max(70, "Keep it under 70 characters"),
  seoDescription: z.string().trim().max(160, "Keep it under 160 characters"),
  ogImage: storageImage("settings"),
});
export const securitySchema = z.object({
  sessionDays: z.coerce.number().int("Use whole days").min(1).max(14),
  staffSessionDays: z.coerce.number().int("Use whole days").min(1).max(14),
});
export const notificationsSettingsSchema = z
  .object({
    emailsEnabled: z.boolean(),
    welcome: z.boolean(),
    enrollment: z.boolean(),
    payment: z.boolean(),
    completion: z.boolean(),
    certificate: z.boolean(),
    notifyOnContact: z.boolean(),
    adminAlertEmail: emailOrBlank,
  })
  .refine((d) => !d.notifyOnContact || d.adminAlertEmail, {
    path: ["adminAlertEmail"],
    message: "Enter the address that should receive contact alerts.",
  });

