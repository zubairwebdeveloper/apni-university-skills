// app/actions/notificationInbox.js
"use server";

import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { notificationInboxRepository } from "@/repositories/notificationInboxRepository";
import { toActionError } from "@/lib/errors";
import { safeNext } from "@/lib/utils/url";

const ids = z.array(z.string().trim().min(1).max(200)).min(1).max(100);

const readSchema = z.object({ ids, read: z.boolean() });
const dismissSchema = z.object({ ids, dismissed: z.boolean() });

const UNAUTH = {
  ok: false,
  code: "UNAUTHENTICATED",
  error: "Please log in to continue.",
};

// Handles ms, ISO strings and Firestore Timestamps
const toMs = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  if (typeof v.toMillis === "function") return v.toMillis();
  const s = v.seconds ?? v._seconds;
  return s ? s * 1000 : 0;
};

/** Latest notifications + unread count for the header bell (real data from Firestore). */
export async function getHeaderNotifications() {
  const user = await getSessionUser();
  if (!user) return { ok: true, signedIn: false, items: [], unread: 0 };

  try {
    const raw = await notificationInboxRepository.listByUser(user.uid, 30);

    // Only plain, serializable fields go to the client
    const all = raw.map((n) => ({
      id: n.id,
      title: n.title ?? "",
      body: n.body ?? "",
      href: n.link && safeNext(n.link, "") ? n.link : null,
      read: Boolean(n.readAt),
      createdAt: toMs(n.createdAt),
    }));

    return {
      ok: true,
      signedIn: true,
      items: all.slice(0, 8),
      unread: all.filter((n) => !n.read).length,
    };
  } catch (error) {
    console.error("[getHeaderNotifications]", error);
    return { ok: false, error: toActionError(error), items: [], unread: 0 };
  }
}

/** Mark every unread notification of the current user as read. */
export async function markAllNotificationsRead() {
  const user = await getSessionUser();
  if (!user) return UNAUTH;

  try {
    await notificationInboxRepository.markAllRead(user.uid);
    return { ok: true };
  } catch (error) {
    console.error("[markAllNotificationsRead]", error);
    return { ok: false, error: toActionError(error) };
  }
}

/** Mark one or more of the current user's notifications as read or unread. */
export async function setNotificationsRead(raw) {
  const parsed = readSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const user = await getSessionUser();
  if (!user) return UNAUTH;

  try {
    await notificationInboxRepository.setRead(
      user.uid,
      parsed.data.ids,
      parsed.data.read,
    );
    return { ok: true };
  } catch (error) {
    console.error("[setNotificationsRead]", error);
    return { ok: false, error: toActionError(error) };
  }
}

/** Dismiss (soft-delete) or restore the current user's notifications. */
export async function setNotificationsDismissed(raw) {
  const parsed = dismissSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const user = await getSessionUser();
  if (!user) return UNAUTH;

  try {
    await notificationInboxRepository.setDismissed(
      user.uid,
      parsed.data.ids,
      parsed.data.dismissed,
    );
    return { ok: true };
  } catch (error) {
    console.error("[setNotificationsDismissed]", error);
    return { ok: false, error: toActionError(error) };
  }
}
