// lib/validations/adminUser.js
import { z } from "zod";

export const ADMIN_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "instructor", label: "Instructor" },
];

export const adminUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name must be 60 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  image: z
    .string()
    .trim()
    .url("Enter a valid image URL (https://...).")
    .or(z.literal("")),
  role: z.enum(["admin", "editor", "instructor"], {
    message: "Please choose a role.",
  }),
});
