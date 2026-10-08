// lib/validations/common.js

import { z } from "zod";

// Letters allowed because certificate numbers are the slug for certificates
export const adminSlug = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9-]{1,120}$/, "Invalid record.");

// Backward-compatible alias used by public/server actions
export const slugSchema = adminSlug;

// Firestore auto-ids
export const docIds = z
  .array(z.string().regex(/^[A-Za-z0-9]{10,40}$/))
  .min(1, "Select at least one record.")
  .max(100, "Select at most 100 records.");

