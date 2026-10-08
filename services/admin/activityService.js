// services/admin/activityService.js
import "server-only";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";

const col = (n) => db.collection(n);
const LIVE = ["draft", "pending", "published", "archived", "scheduled"];

async function recent(name, { select, orderBy, where = [], limit = 5 }) {
  let q = col(name);
  for (const w of where) q = q.where(...w);
  const snap = await q
    .orderBy(orderBy, "desc")
    .limit(limit)
    .select(...select)
    .get();
  return snap.docs.map((d) => serializeDoc(d));
}

async function namesFor(ids) {
  const unique = [...new Set(ids)];
  if (!unique.length) return {};
  const snaps = await db.getAll(...unique.map((id) => col("users").doc(id)), {
    fieldMask: ["displayName"],
  });
  return Object.fromEntries(
    snaps.map((s) => [s.id, s.get("displayName") || "Student"]),
  );
}

export async function getRecentActivity(role) {
  const t = {};
  const add = (perm, key, fn) => {
    if (can(role, perm)) t[key] = fn;
  };

  add(P.ENROLLMENTS_READ, "enrollments", async () => {
    const rows = await recent("enrollments", {
      orderBy: "enrolledAt",
      select: ["studentId", "courseTitle", "status", "enrolledAt"],
    });
    const names = await namesFor(rows.map((r) => r.studentId));
    return rows.map((r) => ({
      ...r,
      studentName: names[r.studentId] ?? "Student",
    }));
  });
  add(P.PAYMENTS_READ, "payments", () =>
    recent("payments", {
      orderBy: "createdAt",
      select: ["courseTitle", "amount", "currency", "status", "createdAt"],
    }),
  );
  add(P.REVIEWS_READ, "reviews", () =>
    recent("reviews", {
      orderBy: "createdAt",
      select: ["courseTitle", "studentName", "rating", "status", "createdAt"],
    }),
  );
  add(P.USERS_READ, "users", () =>
    recent("users", {
      orderBy: "createdAt",
      select: ["displayName", "email", "role", "createdAt"],
    }),
  );
  add(P.COURSES_READ, "courses", () =>
    recent("courses", {
      orderBy: "createdAt",
      where: [["status", "in", LIVE]],
      select: ["title", "category", "status", "createdAt"],
    }),
  );
  add(P.BLOG_READ, "blog", () =>
    recent("blogPosts", {
      orderBy: "createdAt",
      where: [["status", "in", LIVE]],
      select: ["title", "authorName", "status", "createdAt"],
    }),
  );
  add(P.AUDIT_READ, "audit", () =>
    recent("auditLogs", {
      orderBy: "createdAt",
      limit: 8,
      select: [
        "action",
        "actorEmail",
        "actorRole",
        "resourceSlug",
        "createdAt",
      ],
    }),
  );

  const keys = Object.keys(t);
  const settled = await Promise.allSettled(keys.map((k) => t[k]()));
  return Object.fromEntries(
    keys.map((k, i) => {
      if (settled[i].status === "rejected")
        console.error(
          `[activity] ${k}:`,
          settled[i].reason?.message ?? settled[i].reason,
        );
      return [k, settled[i].status === "fulfilled" ? settled[i].value : null]; // null = couldn't load
    }),
  );
}

