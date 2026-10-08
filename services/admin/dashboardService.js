// services/admin/dashboardService.js
import "server-only";
import { unstable_cache } from "next/cache";
import { AggregateField } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { can, PERMISSIONS as P } from "@/lib/constants/permissions";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";

const LIVE = ["draft", "pending", "published", "archived"]; // excludes soft-deleted
const col = (n) => db.collection(n);
const count = async (q) => (await q.count().get()).data().count;
const sum = async (q, field) =>
  (await q.aggregate({ total: AggregateField.sum(field) }).get()).data()
    .total ?? 0;
const once = (fn) => {
  let p;
  return () => (p ??= fn());
};

// Runs thunks in parallel. A failed one becomes null ("Unavailable"), never a misleading zero.
async function gather(tasks) {
  const keys = Object.keys(tasks);
  const settled = await Promise.allSettled(keys.map((k) => tasks[k]()));
  return Object.fromEntries(
    keys.map((k, i) => {
      if (settled[i].status === "rejected")
        console.error(
          `[dashboard] ${k}:`,
          settled[i].reason?.message ?? settled[i].reason,
        );
      return [k, settled[i].status === "fulfilled" ? settled[i].value : null];
    }),
  );
}

const monthStart = (offset) => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() + offset, 1));
};
const labelFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const months = (n) =>
  Array.from({ length: n }, (_, i) => {
    const from = monthStart(i - (n - 1));
    return {
      from,
      to: monthStart(i - (n - 1) + 1),
      label: labelFmt.format(from),
    };
  });
const series = (buckets, fn) =>
  Promise.all(
    buckets.map(async (b) => ({ label: b.label, value: await fn(b) })),
  );
const range = (q, field, b) =>
  q.where(field, ">=", b.from).where(field, "<", b.to);

const paid = () => col("payments").where("status", "==", "paid");
const revenueTotals = () =>
  Promise.all(
    SUPPORTED_CURRENCIES.map(async (currency) => ({
      currency,
      amount: await sum(paid().where("currency", "==", currency), "amount"),
    })),
  );

async function loadMetrics(role, totals) {
  const t = {};
  const add = (perm, key, fn) => {
    if (can(role, perm)) t[key] = fn;
  };
  const status = (c, s) => () => count(col(c).where("status", "==", s));

  add(P.STUDENTS_READ, "students", () =>
    count(col("users").where("role", "==", "student")),
  );
  add(P.COURSES_READ, "courses", () =>
    count(col("courses").where("status", "in", LIVE)),
  );
  add(P.COURSES_READ, "publishedCourses", status("courses", "published"));
  add(P.COURSES_READ, "draftCourses", status("courses", "draft"));
  add(P.ENROLLMENTS_READ, "enrollments", () => count(col("enrollments")));
  add(P.ENROLLMENTS_READ, "activeEnrollments", status("enrollments", "active"));
  add(
    P.ENROLLMENTS_READ,
    "completedEnrollments",
    status("enrollments", "completed"),
  );
  add(P.PAYMENTS_READ, "revenue", async () =>
    (await totals())
      .filter((x) => x.amount > 0)
      .sort((a, b) => b.amount - a.amount),
  );
  // Checkouts abandoned long ago stay "pending" forever, so only count recent ones
  add(P.PAYMENTS_READ, "pendingPayments", () =>
    count(
      col("payments")
        .where("status", "==", "pending")
        .where("createdAt", ">=", new Date(Date.now() - 864e5)),
    ),
  );
  add(P.REVIEWS_READ, "pendingReviews", status("reviews", "pending"));
  add(P.CERTIFICATES_READ, "certificates", () => count(col("certificates")));
  add(P.INSTRUCTORS_READ, "instructors", status("instructors", "published"));
  add(P.JOBS_READ, "jobs", status("jobs", "published"));
  add(P.BLOG_READ, "posts", status("blogPosts", "published"));
  return gather(t);
}

async function loadCharts(role, totals) {
  if (!can(role, P.ANALYTICS_READ)) return undefined;
  const m = months(12);
  const t = {};

  if (can(role, P.PAYMENTS_READ)) {
    t.revenue = async () => {
      const best = (await totals()).reduce(
        (a, b) => (b.amount > a.amount ? b : a),
        { currency: null, amount: 0 },
      );
      if (!best.currency) return { currency: null, points: [] };
      const q = paid().where("currency", "==", best.currency);
      return {
        currency: best.currency,
        points: await series(m, (b) => sum(range(q, "createdAt", b), "amount")),
      };
    };
    t.paymentStatus = async () =>
      Promise.all(
        ["pending", "paid", "failed", "refunded", "cancelled"].map(
          async (s) => ({
            name: s,
            value: await count(col("payments").where("status", "==", s)),
          }),
        ),
      );
  }
  if (can(role, P.ENROLLMENTS_READ)) {
    t.enrollments = () =>
      series(m, (b) => count(range(col("enrollments"), "enrolledAt", b)));
    t.enrollmentStatus = async () =>
      Promise.all(
        ["active", "completed", "cancelled", "refunded"].map(async (s) => ({
          name: s,
          value: await count(col("enrollments").where("status", "==", s)),
        })),
      );
  }
  if (can(role, P.STUDENTS_READ)) {
    t.students = async () => {
      // cumulative: everyone before the window + each month's signups
      const students = col("users").where("role", "==", "student");
      const base = await count(students.where("createdAt", "<", m[0].from));
      let running = base;
      return (
        await series(m, (b) => count(range(students, "createdAt", b)))
      ).map((p) => ({ label: p.label, value: (running += p.value) }));
    };
  }
  if (can(role, P.COURSES_READ)) {
    t.popular = async () =>
      (
        await col("courses")
          .where("status", "==", "published")
          .orderBy("studentsCount", "desc")
          .limit(5)
          .select("title", "slug", "studentsCount")
          .get()
      ).docs.map((d) => ({
        label: d.get("title"),
        slug: d.get("slug"),
        value: d.get("studentsCount") ?? 0,
      }));
    t.topRated = async () =>
      (
        await col("courses")
          .where("status", "==", "published")
          .orderBy("rating", "desc")
          .limit(10)
          .select("title", "slug", "rating", "reviewCount", "studentsCount")
          .get()
      ).docs
        .map((d) => ({
          title: d.get("title"),
          slug: d.get("slug"),
          rating: d.get("rating") ?? 0,
          reviewCount: d.get("reviewCount") ?? 0,
          students: d.get("studentsCount") ?? 0,
        }))
        .filter((c) => c.reviewCount > 0)
        .slice(0, 5); // an unreviewed course has no meaningful rating
    t.categories = async () => {
      const cats = await col("categories")
        .where("status", "==", "published")
        .orderBy("order", "asc")
        .limit(12)
        .select("name", "slug")
        .get();
      return Promise.all(
        cats.docs.map(async (d) => ({
          label: d.get("name"),
          value: await sum(
            col("courses")
              .where("status", "==", "published")
              .where("categorySlug", "==", d.get("slug")),
            "studentsCount",
          ),
        })),
      );
    };
  }
  return gather(t);
}

async function build(role) {
  const totals = once(revenueTotals);
  const [metrics, charts] = await Promise.all([
    loadMetrics(role, totals),
    loadCharts(role, totals),
  ]);
  return { metrics, charts, generatedAt: Date.now() };
}

// Cached per role (the arguments are part of the cache key)
export const getDashboardData = unstable_cache(build, ["admin-dashboard"], {
  revalidate: 120,
  tags: ["admin-dashboard"],
});

