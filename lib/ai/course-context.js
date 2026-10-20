// lib/ai/course-context.js
import "server-only";
import { db } from "./db";

// ⚠️ Yeh field names apne `courses` documents se match karein.
const CFG = {
  collection: "courses",
  publishedField: "status",
  publishedValue: "published",
  titleField: "title",
  slugField: "slug",
  descriptionField: "description",
  levelField: "level",
  categoryField: "category",
  pathPrefix: "/courses", // course detail route; verify karein
  cacheMs: 5 * 60_000,
  maxItems: 100,
  maxResults: 5,
  fallbackResults: 8,
};

const COURSE_INTENT =
  /\b(course|courses|class|classes|enrol|enroll|learn|learning|roadmap|path|curriculum|bootcamp|instructor|certificate|start|sikh|seekh|parh)\b/i;

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "how",
  "what",
  "can",
  "you",
  "want",
  "about",
  "from",
  "that",
  "this",
  "have",
  "need",
  "please",
  "help",
  "me",
  "my",
  "are",
]);

let cache = { at: 0, items: [] };

const text = (value, max = 300) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, max)
    : "";

async function loadPublished() {
  if (cache.items.length && Date.now() - cache.at < CFG.cacheMs) {
    return cache.items;
  }
  const snap = await db
    .collection(CFG.collection)
    .where(CFG.publishedField, "==", CFG.publishedValue)
    .limit(CFG.maxItems)
    .get();

  const items = snap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        title: text(d[CFG.titleField], 120),
        slug: text(d[CFG.slugField], 120),
        description: text(d[CFG.descriptionField]),
        level: text(d[CFG.levelField], 40),
        category: text(d[CFG.categoryField], 60),
      };
    })
    .filter((item) => item.title);

  cache = { at: Date.now(), items };
  return items;
}

function keywords(message) {
  const words = message.toLowerCase().match(/[a-z0-9+#.]{3,}/g) ?? [];
  return [...new Set(words)].filter((w) => !STOP.has(w)).slice(0, 12);
}

const formatItem = (c) =>
  [
    `- title: ${c.title}`,
    c.slug && CFG.pathPrefix ? `path: ${CFG.pathPrefix}/${c.slug}` : "",
    c.level ? `level: ${c.level}` : "",
    c.category ? `category: ${c.category}` : "",
    c.description ? `summary: ${c.description}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

// Retrieval failure must never block the chat, so errors just return ""
export async function retrieveCourseContext(message) {
  if (!COURSE_INTENT.test(message)) return "";
  try {
    const items = await loadPublished();
    if (!items.length) return "";

    const words = keywords(message);
    const scored = items
      .map((item) => {
        let score = 0;
        for (const w of words) {
          if (item.title.toLowerCase().includes(w)) score += 3;
          if (item.category.toLowerCase().includes(w)) score += 2;
          if (item.description.toLowerCase().includes(w)) score += 1;
        }
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, CFG.maxResults)
      .map((entry) => entry.item);

    const chosen = scored.length ? scored : items.slice(0, CFG.fallbackResults);
    return chosen.map(formatItem).join("\n");
  } catch (error) {
    console.error("[ai] course retrieval failed:", error?.name);
    return "";
  }
}
