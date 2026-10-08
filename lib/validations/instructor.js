// lib/validations/instructor.js
import { z } from "zod";
import { lines, optionalHttpsUrl, optionalSlug, storageImage } from "./shared";

export const instructorSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(80),
  slug: optionalSlug,
  email: z.union([
    z.literal(""),
    z.string().trim().toLowerCase().email("Enter a valid email"),
  ]),
  designation: z.string().trim().min(2, "Enter a designation").max(100),
  shortBio: z.string().trim().max(200, "Keep it under 200 characters"),
  bio: z.string().trim().max(3000, "Keep it under 3000 characters"),
  avatar: storageImage("instructors"),
  coverImage: storageImage("instructors"),
  expertise: lines(10, 60),
  skills: lines(20, 40),
  socialLinks: z.object({
    linkedin: optionalHttpsUrl,
    github: optionalHttpsUrl,
    x: optionalHttpsUrl,
    youtube: optionalHttpsUrl,
    website: optionalHttpsUrl,
  }),
  featured: z.boolean(),
});
 
