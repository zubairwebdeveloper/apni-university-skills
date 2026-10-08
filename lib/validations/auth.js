// lib/validations/auth.js
import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use at most 128 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");
const match = (d) => d.password === d.confirmPassword;
const matchMsg = {
  path: ["confirmPassword"],
  message: "Passwords do not match",
};

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});
export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, "Please enter your name").max(60),
    email,
    password,
    confirmPassword: z.string(),
    acceptTerms: z
      .boolean()
      .refine((v) => v, { message: "You must accept the terms to continue" }),
  })
  .refine(match, matchMsg);
export const forgotSchema = z.object({ email });
export const resetSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine(match, matchMsg);
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password,
    confirmPassword: z.string(),
  })
  .refine(match, matchMsg)
  .refine((d) => d.password !== d.currentPassword, {
    path: ["password"],
    message: "Choose a different password",
  });

