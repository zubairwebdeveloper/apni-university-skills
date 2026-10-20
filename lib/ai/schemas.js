// lib/ai/schemas.js  (shared by client forms and API routes)
import { z } from "zod";
import { AI_LIMITS, CONVERSATION_ID_PATTERN } from "./constants";

export const conversationIdSchema = z.string().regex(CONVERSATION_ID_PATTERN);

export const chatRequestSchema = z
  .object({
    conversationId: conversationIdSchema.optional(),
    message: z.string().trim().min(1).max(AI_LIMITS.messageMaxChars).optional(),
    regenerate: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.regenerate) {
      if (!value.conversationId) {
        ctx.addIssue({
          code: "custom",
          path: ["conversationId"],
          message: "A conversation is required to regenerate a reply.",
        });
      }
    } else if (!value.message) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Write a message first.",
      });
    }
  });

export const renameSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Enter a title.")
    .max(
      AI_LIMITS.titleMaxChars,
      `Use ${AI_LIMITS.titleMaxChars} characters or fewer.`,
    ),
});
