"use server";

import { requireUser } from "@/lib/auth/session";
import { userService } from "@/services/userService";

const KEYS = ["courseUpdates", "paymentReceipts", "jobAlerts", "newsletter"];

export async function updateNotificationPrefs(prefs) {
  const user = await requireUser();
  // Only accept known boolean keys.
  const clean = Object.fromEntries(KEYS.map((k) => [k, Boolean(prefs?.[k])]));
  await userService.updateNotificationPrefs(user.uid, clean);
  return { ok: true };
}
