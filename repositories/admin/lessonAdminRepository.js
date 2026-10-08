import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "@/repositories/baseRepository";
import { LIFECYCLE } from "./createAdminRepository";
import { slugify } from "@/lib/utils/slugify";
import { publishRules } from "@/config/courses";
import { AppError } from "@/lib/errors";

const col = () => db.collection("lessons");
const LIVE = ["draft", "pending", "published", "archived"];
const POS = ["slug", "sectionTitle", "sectionOrder", "order", "status"];
const LIST_FIELDS = [
  "title",
  "slug",
  "sectionTitle",
  "sectionOrder",
  "order",
  "duration",
  "isPreview",
  "isPublished",
  "status",
  "videoUrl",
  "updatedAt",
];
const EDITABLE = [
  "title",
  "description",
  "videoUrl",
  "duration",
  "isPreview",
  "transcript",
  "resources",
  "attachments",
];
const key = (t = "") => t.trim().toLowerCase();
const pick = (o, keys) =>
  Object.fromEntries(
    keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]),
  );

// Position at the end of an existing section (matched case-insensitively) or a brand-new section at the end
function place(live, title) {
  const same = live.filter((l) => key(l.sectionTitle) === key(title));
  if (same.length)
    return {
      sectionTitle: same[0].sectionTitle,
      sectionOrder: same[0].sectionOrder ?? 0,
      order: Math.max(...same.map((l) => l.order ?? 0)) + 1,
    };
  return {
    sectionTitle: title.trim(),
    sectionOrder: live.length
      ? Math.max(...live.map((l) => l.sectionOrder ?? 0)) + 1
      : 0,
    order: 0,
  };
}
const rowsOf = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

export const lessonAdminRepository = {
  async listByCourse(courseId) {
    const snap = await col()
      .where("courseId", "==", courseId)
      .select(...LIST_FIELDS)
      .limit(500)
      .get();
    return snap.docs
      .map((d) => serializeDoc(d))
      .sort(
        (a, b) =>
          (a.sectionOrder ?? 0) - (b.sectionOrder ?? 0) ||
          (a.order ?? 0) - (b.order ?? 0),
      );
  },

  async findBySlug(courseId, slug) {
    const snap = await col()
      .where("courseId", "==", courseId)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    return snap.empty ? null : serializeDoc(snap.docs[0]);
  },

  async create({ course, data, actor }) {
    const ref = col().doc();
    return db.runTransaction(async (tx) => {
      const rows = rowsOf(
        await tx.get(
          col()
            .where("courseId", "==", course.id)
            .select(...POS),
        ),
      );
      const taken = new Set(rows.map((r) => r.slug)); // trashed lessons keep their slug reserved
      const base = slugify(data.slug || data.title);
      if (!base) throw new AppError("A title or slug is required.", 400);
      let slug = base;
      if (data.slug && taken.has(slug))
        throw new AppError(
          "A lesson with that slug already exists in this course.",
          409,
        );
      for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
      const now = FieldValue.serverTimestamp();
      tx.create(ref, {
        ...pick(data, EDITABLE),
        ...place(
          rows.filter((r) => r.status !== "deleted"),
          data.sectionTitle,
        ),
        courseId: course.id,
        courseSlug: course.slug,
        slug,
        isPublished: false,
        status: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: actor.uid,
        updatedBy: actor.uid,
      });
      return { id: ref.id, slug };
    });
  },

  async update(courseId, slug, patch, actor, { ifUpdatedAt } = {}) {
    const found = await col()
      .where("courseId", "==", courseId)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (found.empty) throw new AppError("Lesson not found.", 404);
    const ref = found.docs[0].ref;
    const wantSlug = patch.slug ? slugify(patch.slug) : null;
    return db.runTransaction(async (tx) => {
      const [snap, all] = await Promise.all([
        tx.get(ref),
        tx.get(
          col()
            .where("courseId", "==", courseId)
            .select(...POS),
        ),
      ]);
      if (ifUpdatedAt && snap.get("updatedAt")?.toMillis?.() !== ifUpdatedAt)
        throw new AppError(
          "This lesson was changed by someone else. Reload the page and try again.",
          409,
        );
      const rows = rowsOf(all);
      const renaming = wantSlug && wantSlug !== snap.get("slug");
      if (renaming && rows.some((r) => r.id !== ref.id && r.slug === wantSlug))
        throw new AppError(
          "A lesson with that slug already exists in this course.",
          409,
        );
      const moved = key(patch.sectionTitle) !== key(snap.get("sectionTitle"));
      const position = moved
        ? place(
            rows.filter((r) => r.id !== ref.id && r.status !== "deleted"),
            patch.sectionTitle,
          )
        : {};
      const data = pick(patch, EDITABLE);
      tx.update(ref, {
        ...data,
        ...position,
        ...(renaming ? { slug: wantSlug } : {}),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid,
      });
      return {
        id: ref.id,
        slug: renaming ? wantSlug : snap.get("slug"),
        changed: Object.keys(data),
      };
    });
  },

  /** publish | unpublish | archive | delete (soft) | restore. Keeps isPublished in sync with status. */
  async runAction(course, slug, action, actor) {
    const rule = LIFECYCLE[action];
    if (!rule) throw new AppError("Unknown action.", 400);
    const found = await col()
      .where("courseId", "==", course.id)
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (found.empty) throw new AppError("Lesson not found.", 404);
    const ref = found.docs[0].ref;
    return db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const status = snap.get("status");
      if (!rule.from.includes(status))
        throw new AppError(`A ${status} lesson can't be ${action}d.`, 409);
      if (action === "publish" && !snap.get("videoUrl"))
        throw new AppError(
          "Add a video link before publishing this lesson.",
          409,
        );
      if (
        ["unpublish", "archive", "delete"].includes(action) &&
        status === "published" &&
        course.status === "published" &&
        publishRules.minLessons > 0
      ) {
        const pub = await tx.get(
          col()
            .where("courseId", "==", course.id)
            .where("isPublished", "==", true)
            .select(),
        );
        if (pub.size <= publishRules.minLessons)
          throw new AppError(
            "This is the only published lesson in a published course. Unpublish the course first, or publish another lesson.",
            409,
          );
      }
      tx.update(ref, {
        ...rule.patch(actor.uid, snap.data()),
        isPublished: action === "publish",
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid,
      });
      return { id: ref.id, slug: snap.get("slug"), from: status };
    });
  },

  /** sections: [{ title, lessonIds[] }] in the new order. Must cover exactly the course's current non-trashed lessons. */
  async saveCurriculum(courseId, sections, actor) {
    const snap = await col()
      .where("courseId", "==", courseId)
      .where("status", "in", LIVE)
      .select("slug")
      .get();
    const current = new Set(snap.docs.map((d) => d.id));
    const ids = sections.flatMap((s) => s.lessonIds);
    if (
      new Set(ids).size !== ids.length ||
      ids.length !== current.size ||
      ids.some((id) => !current.has(id))
    )
      throw new AppError(
        "The curriculum changed while you were editing. Reload the page and try again.",
        409,
      );
    const titles = sections.map((s) => key(s.title));
    if (new Set(titles).size !== titles.length)
      throw new AppError(
        "Section names must be different from each other.",
        400,
      );
    if (ids.length > 500)
      throw new AppError("Too many lessons to reorder at once.", 400);

    const batch = db.batch();
    const now = FieldValue.serverTimestamp();
    sections.forEach((s, si) =>
      s.lessonIds.forEach((id, li) =>
        batch.update(col().doc(id), {
          sectionTitle: s.title.trim(),
          sectionOrder: si,
          order: li,
          updatedAt: now,
          updatedBy: actor.uid,
        }),
      ),
    );
    await batch.commit();
    return { lessons: ids.length, sections: sections.length };
  },

  /** Duplicate-course support: copies live lessons as drafts. Attachment files are shared by path. */
  async copyAll({ from, to, actor }) {
    const snap = await col()
      .where("courseId", "==", from.id)
      .where("status", "in", LIVE)
      .limit(400)
      .get();
    if (snap.empty) return 0;
    const batch = db.batch();
    const now = FieldValue.serverTimestamp();
    for (const d of snap.docs) {
      batch.create(col().doc(), {
        ...pick(d.data(), [
          ...EDITABLE,
          "slug",
          "sectionTitle",
          "sectionOrder",
          "order",
        ]),
        courseId: to.id,
        courseSlug: to.slug,
        isPublished: false,
        status: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: actor.uid,
        updatedBy: actor.uid,
      });
    }
    await batch.commit();
    return snap.size;
  },
};

