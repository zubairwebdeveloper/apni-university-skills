// lib/validations/adminUser.js
import { z } from "zod";

export const ADMIN_ROLES = [
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
  { value: "instructor", label: "Instructor" },
];

/** Only real web links. Blocks javascript:, data:, file: and similar. */
function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

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
  // Optional: empty means "no photo". Filled by upload (https URL) or a pasted link.
  image: z
    .string()
    .trim()
    .max(500, "The image link is too long.")
    .refine(
      (value) => value === "" || isHttpUrl(value),
      "Enter a valid image link that starts with https://",
    )
    .default(""),
  role: z.enum(["admin", "editor", "instructor"], {
    message: "Please choose a role.",
  }),
});
