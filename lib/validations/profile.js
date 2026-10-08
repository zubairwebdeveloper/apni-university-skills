// lib/validations/profile.js
import { z } from "zod";
export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Please enter your name").max(60),
  phone: z
    .string()
    .trim()
    .max(24)
    .regex(/^[+\d\s()-]*$/, "Use digits, spaces, + ( ) -"),
  bio: z.string().trim().max(500, "Keep it under 500 characters"),
  country: z.string().trim().max(60),
  city: z.string().trim().max(60),
});

