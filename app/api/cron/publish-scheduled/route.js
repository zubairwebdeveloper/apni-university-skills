import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { writeAuditTx } from "@/lib/audit/auditLog";
import { blogGuard } from "@/lib/admin/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const SYSTEM = { uid: "system", email: null, role: "system" };

function authorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null; // not configured
  const got = Buffer.from(req.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

async function publishDuePosts(now, touched) {
  const out = { published: 0, failed: 0 };
  const due = await db
    .collection("blogPosts")
    .where("status", "==", "scheduled")
    .where("scheduledFor", "<=", now)
    .orderBy("scheduledFor")
    .limit(50)
    .get();
  for (const d of due.docs) {
    try {
      await db.runTransaction(async (tx) => {
        const s = await tx.get(d.ref);
        if (
          s.get("status") !== "scheduled" ||
          s.get("scheduledFor")?.toMillis() > now.toMillis()
        )
          return; // changed since the query
        const problem = await blogGuard("publish", { id: s.id, ...s.data() });
        const at = FieldValue.serverTimestamp();
        if (problem) {
          tx.update(d.ref, {
            status: "draft",
            scheduledFor: null,
            updatedAt: at,
          });
          writeAuditTx(tx, SYSTEM, {
            action: "blog.schedule_failed",
            resource: "blog",
            resourceId: s.id,
            resourceSlug: s.get("slug"),
            metadata: { reason: problem },
          });
          out.failed++;
        } else {
          tx.update(d.ref, {
            status: "published",
            publishedAt: s.get("scheduledFor"),
            scheduledFor: null,
            updatedAt: at,
          });
          writeAuditTx(tx, SYSTEM, {
            action: "blog.published",
            resource: "blog",
            resourceId: s.id,
            resourceSlug: s.get("slug"),
            metadata: { scheduled: true },
          });
          out.published++;
        }
        touched.add(`/blog/${s.get("slug")}`);
      });
    } catch (e) {
      console.error("[cron] publish failed", d.id, e?.message ?? e);
    }
  }
  return out;
}

async function expireJobs(now, touched) {
  let expired = 0;
  const due = await db
    .collection("jobs")
    .where("status", "==", "published")
    .where("expiresAt", "<=", now)
    .orderBy("expiresAt")
    .limit(100)
    .get();
  for (const d of due.docs) {
    try {
      await db.runTransaction(async (tx) => {
        const s = await tx.get(d.ref);
        if (
          s.get("status") !== "published" ||
          !(s.get("expiresAt")?.toMillis() <= now.toMillis())
        )
          return;
        tx.update(d.ref, {
          status: "archived",
          archivedAt: FieldValue.serverTimestamp(),
          archivedBy: "system",
          updatedAt: FieldValue.serverTimestamp(),
        });
        writeAuditTx(tx, SYSTEM, {
          action: "job.expired",
          resource: "job",
          resourceId: s.id,
          resourceSlug: s.get("slug"),
        });
        expired++;
        touched.add(`/jobs/${s.get("slug")}`);
      });
    } catch (e) {
      console.error("[cron] expire failed", d.id, e?.message ?? e);
    }
  }
  return expired;
}

export async function GET(req) {
  const ok = authorized(req);
  if (ok === null)
    return NextResponse.json(
      { error: "Cron is not configured." },
      { status: 503 },
    );
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = Timestamp.now();
  const touched = new Set(["/", "/blog", "/jobs"]);
  try {
    const posts = await publishDuePosts(now, touched);
    const expired = await expireJobs(now, touched);
    if (posts.published || posts.failed || expired)
      touched.forEach((p) => revalidatePath(p));
    return NextResponse.json({ ...posts, expired });
  } catch (e) {
    console.error("[cron]", e);
    return NextResponse.json({ error: "Cron failed." }, { status: 500 });
  }
}

