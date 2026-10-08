// app/actions/admin/notifications.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { notificationSchema } from "@/lib/validations/notification";
import { adminSlug } from "@/lib/validations/common";
import { db } from "@/lib/firebase/admin/firestore";
import { notificationAdminRepository as repo } from "@/repositories/admin/notificationAdminRepository";
import { courseAdminRepository } from "@/repositories/admin/courseAdminRepository";
import { deliver } from "@/services/admin/notificationDelivery";

async function resolveAudience(i) {
  if (i.audience === "course") {
    const c = await courseAdminRepository.findBySlug(i.courseSlug);
    if (!c || c.status === "deleted")
      throw new AppError("Choose a valid course.", 400);
    return {
      kind: "course",
      courseId: c.id,
      courseSlug: c.slug,
      courseTitle: c.title,
    };
  }
  if (i.audience === "users") {
    const found = new Map();
    for (let k = 0; k < i.userEmails.length; k += 30) {
      const snap = await db
        .collection("users")
        .where("email", "in", i.userEmails.slice(k, k + 30))
        .select("email")
        .get();
      snap.docs.forEach((d) => found.set(d.get("email"), d.id));
    }
    const missing = i.userEmails.filter((e) => !found.has(e));
    if (missing.length)
      throw new AppError(
        `No account found for: ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`,
        400,
      );
    return { kind: "users", targetIds: [...found.values()] };
  }
  return { kind: i.audience };
}

export const createNotification = adminAction({
  permission: P.NOTIFICATIONS_CREATE,
  schema: notificationSchema,
  fresh: true,
  limit: { limit: 10, windowSec: 60 },
  handler: async ({ input, actor }) => {
    const audience = await resolveAudience(input);
    const status =
      input.mode === "now"
        ? "sending"
        : input.mode === "schedule"
          ? "scheduled"
          : "draft";
    const { id, slug } = await repo.create({
      data: {
        title: input.title,
        body: input.body,
        type: input.type,
        link: input.link || null,
        audience,
      },
      status,
      scheduledFor:
        input.mode === "schedule" ? new Date(input.scheduledFor) : null,
      actor,
    });
    let delivered = 0;
    if (input.mode === "now") delivered = (await deliver(id)).delivered; // the cron continues bigger audiences
    return {
      data: { slug, delivered },
      audit: {
        action: "notification.created",
        resource: "notification",
        resourceId: id,
        resourceSlug: slug,
        metadata: {
          mode: input.mode,
          audience: audience.kind,
          type: input.type,
        },
      },
    };
  },
});

const move = (to, action) =>
  adminAction({
    permission: P.NOTIFICATIONS_CREATE,
    fresh: to === "sending",
    schema: z.object({ slug: adminSlug }),
    handler: async ({ input, actor }) => {
      const r = await repo.transition(input.slug, to, actor);
      if (to === "sending") await deliver(r.id);
      return {
        audit: {
          action,
          resource: "notification",
          resourceId: r.id,
          resourceSlug: r.slug,
          metadata: { title: r.title },
        },
      };
    },
  });
export const sendNotification = move("sending", "notification.sent");
export const cancelNotification = move("cancelled", "notification.cancelled");

