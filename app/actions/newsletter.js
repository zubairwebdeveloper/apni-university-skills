"use server";
import { newsletterSchema } from "@/lib/validations/newsletter";
import { newsletterService } from "@/services/newsletterService";

export async function subscribeToNewsletter(input) {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  try {
    await newsletterService.subscribe(parsed.data.email);
    return { ok: true };
  } catch (e) {
    console.error("[newsletter]", e);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

