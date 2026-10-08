import { z } from "zod";

export const optionalSlug = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(
    /^([a-z0-9]+(?:-[a-z0-9]+)*)?$/,
    "Use lowercase letters, numbers and single hyphens.",
  );

// Accepts a textarea string (one item per line) or an array; always outputs a cleaned array
export const lines = (max, itemMax = 200) =>
  z
    .union([z.string(), z.array(z.string())])
    .transform((v) =>
      (Array.isArray(v) ? v : v.split("\n"))
        .map((s) => s.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(
          z
            .string()
            .max(itemMax, `Each line must be under ${itemMax} characters.`),
        )
        .max(max, `Use at most ${max} lines.`),
    );

export const num = (min, max, msg = "Enter a number") =>
  z.coerce
    .number({ message: msg })
    .min(min, `Must be at least ${min}.`)
    .max(max, `Must be at most ${max}.`);
export const optNum = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.coerce
    .number({ message: "Enter a number" })
    .min(0)
    .max(1_000_000)
    .nullable(),
);

export const optionalHttpsUrl = z
  .string()
  .trim()
  .max(300)
  .refine(
    (v) => !v || (/^https:\/\//i.test(v) && URL.canParse(v)),
    "Use a full https:// link.",
  );

// Only images uploaded to OUR bucket under public/{kind}/ are accepted (or empty)
export const storageImage = (kind) =>
  z
    .string()
    .trim()
    .max(1000)
    .refine((v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return (
          u.protocol === "https:" &&
          u.hostname === "firebasestorage.googleapis.com" &&
          u.pathname.startsWith(
            `/v0/b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/public%2F${kind}%2F`,
          )
        );
      } catch {
        return false;
      }
    }, "Use the uploader to add an image.");

