// services/admin/analyticsService.js
import "server-only";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/firebase/admin/firestore";
import { count, gather, sum } from "@/lib/admin/aggregates";
import { SUPPORTED_CURRENCIES } from "@/config/currencies";

const col = (n) => db.collection(n);
const DAYS = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };
const win = (q, field, from, to) => {
  q = q.where(field, ">=", from);
  return to ? q.where(field, "<", to) : q;
};

async function build(rangeKey) {
  const days = DAYS[rangeKey] ?? 30,
    now = Date.now();
  const cur = new Date(now - days * 864e5),
    prev = new Date(now - 2 * days * 864e5);
  const both = (fn) => async () => {
    const [current, previous] = await Promise.all([
      fn(cur, null),
      fn(prev, cur),
    ]);
    return { current, previous };
  };
  const approved = () => col("reviews").where("status", "==", "approved");
  const paid = (currency) =>
    col("payments")
      .where("status", "==", "paid")
      .where("currency", "==", currency);
  const countBy =
    (name, field, values, extra = (q) => q) =>
    () =>
      Promise.all(
        values.map(async (v) => ({
          name: String(v),
          value: await count(extra(col(name).where(field, "==", v))),
        })),
      );

  const tasks = {
    students: both((f, t) =>
      count(
        win(col("users").where("role", "==", "student"), "createdAt", f, t),
      ),
    ),
    enrollments: both((f, t) =>
      count(win(col("enrollments"), "enrolledAt", f, t)),
    ),
    reviews: both((f, t) => count(win(approved(), "createdAt", f, t))),
    certificates: both((f, t) =>
      count(win(col("certificates"), "issuedAt", f, t)),
    ),
    posts: both((f, t) =>
      count(
        win(
          col("blogPosts").where("status", "==", "published"),
          "publishedAt",
          f,
          t,
        ),
      ),
    ),
    revenue: async () =>
      (
        await Promise.all(
          SUPPORTED_CURRENCIES.map(async (currency) => {
            const [current, previous] = await Promise.all([
              sum(win(paid(currency), "createdAt", cur, null), "amount"),
              sum(win(paid(currency), "createdAt", prev, cur), "amount"),
            ]);
            return { currency, current, previous };
          }),
        )
      ).filter((r) => r.current || r.previous),
    completion: async () => {
      const [enrolled, completed] = await Promise.all([
        count(win(col("enrollments"), "enrolledAt", cur, null)),
        count(
          win(
            col("enrollments").where("status", "==", "completed"),
            "enrolledAt",
            cur,
            null,
          ),
        ),
      ]);
      return { enrolled, completed };
    },
    paymentStatus: async () =>
      Promise.all(
        ["pending", "paid", "failed", "refunded", "cancelled"].map(
          async (s) => ({
            name: s,
            value: await count(
              win(
                col("payments").where("status", "==", s),
                "createdAt",
                cur,
                null,
              ),
            ),
          }),
        ),
      ),
    ratings: async () =>
      Promise.all(
        [5, 4, 3, 2, 1].map(async (n) => ({
          label: `${n} ${n === 1 ? "star" : "stars"}`,
          value: await count(approved().where("rating", "==", n)),
        })),
      ),
    topRevenue: async () =>
      (
        await col("courses")
          .where("status", "==", "published")
          .orderBy("revenue", "desc")
          .limit(5)
          .select("title", "slug", "revenue", "currency", "studentsCount")
          .get()
      ).docs
        .map((d) => ({
          title: d.get("title"),
          slug: d.get("slug"),
          revenue: d.get("revenue") ?? 0,
          currency: d.get("currency"),
          students: d.get("studentsCount") ?? 0,
        }))
        .filter((c) => c.revenue > 0),
    categories: async () => {
      const cats = await col("categories")
        .where("status", "==", "published")
        .orderBy("order", "asc")
        .limit(12)
        .select("name", "slug", "coursesCount")
        .get();
      return Promise.all(
        cats.docs.map(async (d) => ({
          name: d.get("name"),
          courses: d.get("coursesCount") ?? 0,
          students: await sum(
            col("courses")
              .where("status", "==", "published")
              .where("categorySlug", "==", d.get("slug")),
            "studentsCount",
          ),
        })),
      );
    },
    content: async () => {
      const [jobs, posts, valid, revoked] = await Promise.all([
        countBy("jobs", "status", ["published", "draft", "archived"])(),
        countBy("blogPosts", "status", ["published", "draft", "scheduled"])(),
        count(col("certificates").where("status", "==", "valid")),
        count(col("certificates").where("status", "==", "revoked")),
      ]);
      return { jobs, posts, certificates: { valid, revoked } };
    },
  };
  return { ...(await gather(tasks)), range: rangeKey, generatedAt: Date.now() };
}
export const getAnalytics = unstable_cache(build, ["admin-analytics"], {
  revalidate: 300,
});

