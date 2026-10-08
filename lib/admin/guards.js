// lib/admin/guards.js

import "server-only";

import { db } from "@/lib/firebase/admin/firestore";
import { publishRules } from "@/config/courses";

const IN_USE = ["draft", "pending", "published"];

const ms = (value) => value?.toMillis?.() ?? value ?? null;

const count = async (query) => (await query.count().get()).data().count;

const usedBy = (field, id) =>
  count(
    db
      .collection("courses")
      .where(field, "==", id)
      .where("status", "in", IN_USE),
  );

const msg = (count, what) =>
  `${count} ${
    count === 1 ? "course uses" : "courses use"
  } this ${what}. Move or archive ${count === 1 ? "it" : "them"} first.`;

export async function categoryGuard(action, doc) {
  if (!["unpublish", "archive", "delete"].includes(action)) {
    return null;
  }

  const count = await usedBy("categoryId", doc.id);

  return count ? msg(count, "category") : null;
}

export async function instructorGuard(action, doc) {
  if (action === "publish") {
    return doc.designation && (doc.shortBio || doc.bio)
      ? null
      : "Add a designation and a short bio before publishing.";
  }

  if (!["unpublish", "archive", "delete"].includes(action)) {
    return null;
  }

  const count = await usedBy("instructorId", doc.id);

  return count ? msg(count, "instructor") : null;
}

export async function courseGuard(action, doc) {
  if (action !== "publish") return null;

  const missing = [];

  if (!doc.shortDescription) {
    missing.push("a short description");
  }

  if (!doc.description) {
    missing.push("a description");
  }

  if (!doc.thumbnail) {
    missing.push("a thumbnail");
  }

  if (!doc.isFree && !(doc.price >= 0.5)) {
    missing.push("a valid price");
  }

  const [category, instructor] = await Promise.all([
    doc.categoryId
      ? db.collection("categories").doc(doc.categoryId).get()
      : null,
    doc.instructorId
      ? db.collection("instructors").doc(doc.instructorId).get()
      : null,
  ]);

  if (category?.get("status") !== "published") {
    missing.push("a published category");
  }

  if (instructor?.get("status") !== "published") {
    missing.push("a published instructor");
  }

  if (publishRules.minLessons > 0) {
    const lessonCount = await count(
      db
        .collection("lessons")
        .where("courseId", "==", doc.id)
        .where("isPublished", "==", true),
    );

    if (lessonCount < publishRules.minLessons) {
      missing.push(
        `at least ${publishRules.minLessons} published lesson${
          publishRules.minLessons > 1 ? "s" : ""
        }`,
      );
    }
  }

  return missing.length
    ? `Can't publish yet. It needs ${missing.join(", ")}.`
    : null;
}

export async function blogGuard(action, doc) {
  if (action !== "publish") return null;

  const missing = [];

  if (!doc.excerpt) {
    missing.push("an excerpt");
  }

  if (!doc.content || doc.content.length < 200) {
    missing.push("at least 200 characters of content");
  }

  if (!doc.category) {
    missing.push("a topic");
  }

  if (!doc.coverImage) {
    missing.push("a cover image");
  }

  return missing.length
    ? `Can't publish yet. It needs ${missing.join(", ")}.`
    : null;
}

export async function careerGuard(action, doc) {
  if (action !== "publish") return null;

  const missing = [];

  if (!doc.summary) {
    missing.push("a summary");
  }

  if (!doc.description) {
    missing.push("a description");
  }

  if (!doc.roadmap?.length) {
    missing.push("at least one roadmap step");
  }

  if (!doc.skills?.length) {
    missing.push("at least one skill");
  }

  return missing.length
    ? `Can't publish yet. It needs ${missing.join(", ")}.`
    : null;
}

export async function jobGuard(action, doc) {
  if (action !== "publish") return null;

  const missing = [];

  if (!doc.company) {
    missing.push("a company");
  }

  if (!doc.location) {
    missing.push("a location");
  }

  if (!doc.description) {
    missing.push("a description");
  }

  if (!doc.applyUrl) {
    missing.push("an application link");
  }

  const expiresAt = ms(doc.expiresAt);

  if (expiresAt && expiresAt < Date.now()) {
    missing.push("an expiry date in the future");
  }

  return missing.length
    ? `Can't publish yet. It needs ${missing.join(", ")}.`
    : null;
}
export async function couponGuard(action, doc) {
  if (action !== "publish") return null;
  return ms(doc.expiresAt) && ms(doc.expiresAt) < Date.now()
    ? "Its expiry date has passed. Extend it before activating."
    : null;
}
