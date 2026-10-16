"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
// TODO: point this at the file that exports your initialised Firestore instance.
import { db } from "@/lib/firebase/client/auth";

/* ------------------------------------------------------------------ */
/* Category link: change ONLY this line to switch the link style.      */
/*   "/courses?category="  ->  /courses?category=ui-ux-design          */
/*   "/categories/"        ->  /categories/ui-ux-design                */
/* ------------------------------------------------------------------ */
const CATEGORY_LINK_BASE = "/courses?category=";

/* ------------------------------------------------------------------ */
/* Fallback content: shown instantly, and kept if Firestore is empty    */
/* or unreachable, so the page is never blank.                          */
/*                                                                      */
/* NOTE: fallbacks have NO slug. The slug always comes from Firestore.  */
/*                                                                      */
/* `key`     = internal id used by the page to pick categories          */
/* `aliases` = words that identify this category in Firebase. When a    */
/*             Firebase category matches, its REAL slug is used for     */
/*             links, and any empty fields are filled from here.        */
/* ------------------------------------------------------------------ */
export const FALLBACK_CATEGORIES = [
  {
    id: "fallback-web",
    key: "web",
    slug: "",
    href: "",
    aliases: ["web", "fullstack", "frontend", "backend", "nextjs", "react"],
    label: "Full-Stack Web",
    icon: "web",
    accent: "",
    featured: false,
    tagline: "Build full-stack apps with React, Next.js and real databases.",
    description: "",
    study:
      "React, Next.js, APIs and databases, from the interface to deployment.",
    why: "Most digital products, from SaaS dashboards to marketplaces, start as web applications.",
    build: "A deployed full-stack app with authentication and real data.",
    background: "Basic HTML and JavaScript help, but beginners can start here.",
    tools: ["React", "Next.js", "Node.js", "Tailwind"],
    courseCount: 0,
  },
  {
    id: "fallback-ai",
    key: "ai",
    slug: "",
    href: "",
    aliases: [
      "ai",
      "ml",
      "genai",
      "llm",
      "automation",
      "artificial",
      "intelligence",
      "machine",
    ],
    label: "AI & Automation",
    icon: "ai",
    accent: "",
    featured: false,
    tagline: "Create LLM-powered apps and agents that automate real work.",
    description: "",
    study:
      "Generative AI, LLM-powered apps, AI agents, workflow automation and machine learning fundamentals.",
    why: "AI features and automation are becoming a standard layer of modern software.",
    build: "An LLM-powered app or an agent that automates a real workflow.",
    background: "Some Python or JavaScript is useful.",
    tools: ["Python", "TensorFlow", "LangChain", "Prompting"],
    courseCount: 0,
  },
  {
    id: "fallback-cloud",
    key: "cloud",
    slug: "",
    href: "",
    aliases: ["cloud", "serverless", "aws", "azure", "gcp"],
    label: "Cloud",
    icon: "cloud",
    accent: "",
    featured: false,
    tagline: "Ship serverless backends with storage and public APIs.",
    description: "",
    study:
      "Cloud computing and serverless systems: functions, storage, managed databases and APIs.",
    why: "It lets small teams ship and scale without running their own servers.",
    build: "A serverless backend with storage and a public API.",
    background: "Basic programming knowledge is enough to begin.",
    tools: ["Firebase", "Serverless", "Storage", "APIs"],
    courseCount: 0,
  },
  {
    id: "fallback-security",
    key: "security",
    slug: "",
    href: "",
    aliases: ["security", "cybersecurity", "cyber", "infosec", "privacy"],
    label: "Cybersecurity",
    icon: "security",
    accent: "",
    featured: false,
    tagline: "Find and fix real vulnerabilities in live applications.",
    description: "",
    study:
      "Cybersecurity and digital privacy: OWASP risks, secure coding, networking and Linux.",
    why: "Every application that handles user data needs to be defended.",
    build: "An application where common vulnerabilities are found and fixed.",
    background: "Comfort with the command line and web basics.",
    tools: ["OWASP", "Linux", "Networking", "Pen testing"],
    courseCount: 0,
  },
  {
    id: "fallback-devops",
    key: "devops",
    slug: "",
    href: "",
    aliases: ["devops", "cicd", "docker", "kubernetes", "platform"],
    label: "DevOps",
    icon: "devops",
    accent: "",
    featured: false,
    tagline: "Automate testing and deploys with CI/CD and containers.",
    description: "",
    study:
      "DevOps and platform engineering: Git, CI/CD, containers, testing and infrastructure as code.",
    why: "Reliable testing and releases keep teams shipping without breaking things.",
    build: "A CI/CD pipeline that tests and deploys a containerised app.",
    background: "Git and basic Linux skills help.",
    tools: ["Docker", "Kubernetes", "CI/CD", "Git"],
    courseCount: 0,
  },
];

export const FALLBACK_FAQS = [
  {
    id: "f1",
    q: "I have never coded. Can I start?",
    a: "Yes. Full-Stack Web and Cloud are built for beginners. If you want a gentler start, begin with web basics and move into other paths later.",
  },
  {
    id: "f2",
    q: "How do I choose the right path?",
    a: "Open the learning paths and read what each one covers, what you will build and what background helps. If you are unsure, start with Full-Stack Web: its skills carry into every other path.",
  },
  {
    id: "f3",
    q: "Do I get a certificate?",
    a: "Yes. You earn certificates you can share on LinkedIn and add to your CV, backed by projects you can show.",
  },
  {
    id: "f4",
    q: "Can I learn at my own pace?",
    a: "Yes. Lessons are self-paced, and mentor Q&A sessions and code reviews are there when you need help.",
  },
  {
    id: "f5",
    q: "What does career support include?",
    a: "CV reviews, mock interviews and guidance on presenting your projects. It helps you prepare and apply with confidence; it is guidance, not a job guarantee.",
  },
];

/* ------------------------------------------------------------------ */
/* Normalisers: tolerate slightly different field names in Firestore   */
/* ------------------------------------------------------------------ */
const asArray = (value) => (Array.isArray(value) ? value : []);
const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999);

// "web-development" -> ["web", "development"]; "Cyber Security" -> ["cyber", "security"]
const tokenize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// The category slug as stored in Firestore (doc `slug`, or the doc id).
const slugOf = (d, id) =>
  String(d.slug || id || "")
    .trim()
    .toLowerCase();

// Finds the built-in fallback that describes a Firebase category (by slug,
// doc id or name). It is only used to borrow text/tools/key, never the slug.
// Each fallback is used at most once (tracked in `used`).
function findFallback(d, id, used) {
  const tokens = new Set([
    ...tokenize(d.slug),
    ...tokenize(id),
    ...tokenize(d.name || d.title || d.label),
  ]);

  return (
    FALLBACK_CATEGORIES.find(
      (fb) =>
        !used.has(fb.key) && fb.aliases.some((alias) => tokens.has(alias)),
    ) ?? null
  );
}

// A category is visible when it is published, not archived and not disabled.
function isCategoryVisible(d) {
  if (d.archivedAt) return false;
  if (d.active === false) return false;
  if (d.status && d.status !== "published") return false;
  return true;
}

// Firebase data wins; empty fields are filled from the matching fallback.
// The slug ALWAYS comes from Firestore (d.slug, or the doc id if missing).
function normalizeCategory(id, d, used) {
  const slug = slugOf(d, id);
  const base = findFallback(d, id, used);
  if (base) used.add(base.key);

  const tools = asArray(d.tools);

  return {
    id,
    slug,
    // Internal key used by the page (e.g. "web", "ai", "cloud").
    key: base?.key || slug,
    // Marks real Firebase categories (built-in fallback ones do not have this).
    fromDb: true,
    label: d.name || d.title || d.label || base?.label || slug,
    icon: d.icon || base?.icon || slug,
    accent: d.accent || base?.accent || "",
    image: d.image || "",
    featured: d.featured === true,
    tagline:
      d.tagline || d.description || d.seoDescription || base?.tagline || "",
    description: d.description || "",
    study: d.study || d.description || base?.study || "",
    why: d.why || base?.why || "",
    build: d.build || base?.build || "",
    background: d.background || base?.background || "",
    tools: tools.length ? tools : (base?.tools ?? []),
    // Link: the Firestore `href`/`link` field if present, otherwise built from
    // the Firestore slug (see CATEGORY_LINK_BASE at the top of this file).
    href:
      d.href ||
      d.link ||
      (slug ? `${CATEGORY_LINK_BASE}${encodeURIComponent(slug)}` : ""),
    order: d.order,
    courseCount: typeof d.coursesCount === "number" ? d.coursesCount : 0,
  };
}

function normalizeCourse(id, d) {
  return {
    id,
    slug: d.slug || id,
    title: d.title || d.name || "Untitled course",
    category: d.categorySlug || d.categoryId || d.category || "",
    level: d.level || "",
    duration: d.duration || "",
    lessons: d.lessonsCount ?? d.lessons ?? null,
    rating: typeof d.rating === "number" ? d.rating : null,
    students: d.studentsCount ?? d.enrolled ?? d.students ?? null,
    thumbnail: d.thumbnail || d.thumbnailUrl || d.image || "",
    instructor: d.instructorName || d.instructor?.name || "",
    price: d.price ?? null,
    currency: d.currency || "",
    isFree: d.isFree === true || d.price === 0,
    href: d.href || d.link || "",
    featured: d.featured === true,
    createdAt: d.publishedAt?.seconds ?? d.createdAt?.seconds ?? 0,
  };
}

function normalizeTestimonial(id, d) {
  return {
    id,
    quote: d.quote || d.text || "",
    name: d.name || "",
    role: d.role || d.title || "",
    avatar: d.avatar || d.photo || "",
    approved: d.approved !== false,
    order: d.order,
  };
}

function normalizeFaq(id, d) {
  return {
    id,
    q: d.question || d.q || "",
    a: d.answer || d.a || "",
    order: d.order,
  };
}

// Does a course belong to a category? Matches slug, doc id or name.
// Fallback categories have no slug, so empty values never match.
export function matchesCategory(course, category) {
  const value = String(course.category ?? "").toLowerCase();
  if (!value) return false;
  return [category.slug, category.id, category.label]
    .filter(Boolean)
    .some((candidate) => String(candidate).toLowerCase() === value);
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */
// Reads only published docs. Tries `status == "published"` first (the shape
// your categories use), then `published == true`. With `allowUnfiltered`
// (used for categories) it finally tries a plain read; the page still hides
// archived / unpublished docs with isCategoryVisible. Rejects when nothing
// is found, so the caller keeps its fallback content.
async function getPublishedDocs(name, max = 100, allowUnfiltered = false) {
  const attempts = [
    query(collection(db, name), where("status", "==", "published"), limit(max)),
    query(collection(db, name), where("published", "==", true), limit(max)),
  ];

  if (allowUnfiltered) {
    attempts.push(query(collection(db, name), limit(max)));
  }

  for (const attempt of attempts) {
    try {
      const snap = await getDocs(attempt);
      if (!snap.empty) return snap;
    } catch {
      // Try the next shape.
    }
  }

  throw new Error(`No published ${name} found`);
}

// Firestore layout it reads:
//   categories/{id}      name, slug, icon, accent, featured, description,
//                        status ("published"), archivedAt, coursesCount, order,
//                        (optional) href, tagline, study, why, build, background, tools[]
//   courses/{id}         title, slug, categorySlug, level, duration,
//                        lessonsCount, rating, studentsCount, thumbnail,
//                        instructorName, price, currency, featured, published
//   testimonials/{id}    quote, name, role, avatar, approved, order
//   faqs/{id}            question, answer, order
//   settings/landing     stats[{label,value}], announcement{text,href},
//                        heroGif, links{login,register,courses,contact,dashboard}
export function useLandingData() {
  const [state, setState] = useState({
    categories: FALLBACK_CATEGORIES,
    courses: [],
    testimonials: [],
    faqs: FALLBACK_FAQS,
    settings: {},
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [catsRes, coursesRes, testRes, faqRes, settingsRes] =
        await Promise.allSettled([
          // Published-only reads (also works with strict Firestore rules).
          // No orderBy here on purpose: avoids needing a composite index.
          getPublishedDocs("categories", 100, true),
          getPublishedDocs("courses", 60),
          getDocs(collection(db, "testimonials")),
          getDocs(collection(db, "faqs")),
          getDoc(doc(db, "settings", "landing")),
        ]);

      if (cancelled) return;

      const courses =
        coursesRes.status === "fulfilled"
          ? coursesRes.value.docs
              .filter((s) => !s.data().archivedAt)
              .map((s) => normalizeCourse(s.id, s.data()))
              .sort((a, b) => b.createdAt - a.createdAt)
          : [];

      let categories = FALLBACK_CATEGORIES;
      if (catsRes.status === "fulfilled" && !catsRes.value.empty) {
        // Tracks which fallbacks were already matched to a Firebase category.
        const used = new Set();
        const fromDb = catsRes.value.docs
          .filter((s) => isCategoryVisible(s.data()))
          .map((s) => normalizeCategory(s.id, s.data(), used))
          .sort(byOrder);
        if (fromDb.length) categories = fromDb;
      }
      categories = categories.map((cat) => ({
        ...cat,
        // Live count from published courses; falls back to the stored coursesCount.
        courseCount: Math.max(
          courses.filter((c) => matchesCategory(c, cat)).length,
          cat.courseCount || 0,
        ),
      }));

      const testimonials =
        testRes.status === "fulfilled"
          ? testRes.value.docs
              .map((s) => normalizeTestimonial(s.id, s.data()))
              .filter((t) => t.approved && t.quote)
              .sort(byOrder)
          : [];

      let faqs = FALLBACK_FAQS;
      if (faqRes.status === "fulfilled" && !faqRes.value.empty) {
        const fromDb = faqRes.value.docs
          .map((s) => normalizeFaq(s.id, s.data()))
          .filter((f) => f.q && f.a)
          .sort(byOrder);
        if (fromDb.length) faqs = fromDb;
      }

      const settings =
        settingsRes.status === "fulfilled" && settingsRes.value.exists()
          ? settingsRes.value.data()
          : {};

      const allFailed = [
        catsRes,
        coursesRes,
        testRes,
        faqRes,
        settingsRes,
      ].every((r) => r.status === "rejected");

      setState({
        categories,
        courses,
        testimonials,
        faqs,
        settings,
        loading: false,
        error: allFailed ? "Could not load live data." : null,
      });
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
