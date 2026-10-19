"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Code2,
  Copy,
  Layers3,
  Search,
  X,
} from "lucide-react";
import {
  SiDocker,
  SiFirebase,
  SiNextdotjs,
  SiNodedotjs,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTensorflow,
} from "react-icons/si";
import Container from "@/components/layout/Container";
import { techStrip } from "@/config/content";

const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/* Design tokens (same set as HeroSection)                             */
/* ------------------------------------------------------------------ */
// Scoped to this section so the rest of the app keeps its own theme.
// Tip: move THEME_CSS into one shared file and import it in both sections.
const THEME_CSS = `
.apni-landing{
  --background:#F8FAFC;--foreground:#111827;
  --card:#FFFFFF;--card-foreground:#111827;
  --muted:#EEF2F7;--muted-foreground:#55637A;
  --border:#DCE3EC;--ring:#A16207;
  --primary:#A16207;--primary-foreground:#FFFFFF;
  --violet:#7C3AED;
  font-family:var(--font-inter),var(--font-geist-sans),Inter,"DM Sans",ui-sans-serif,system-ui,sans-serif;
  font-feature-settings:"cv11","ss01";
  -webkit-font-smoothing:antialiased;
}
.dark .apni-landing{
  --background:#111318;--foreground:#F8FAFC;
  --card:#171A21;--card-foreground:#F8FAFC;
  --muted:#1D212A;--muted-foreground:#94A3B8;
  --border:#2A2F3A;--ring:#FACC15;
  --primary:#FACC15;--primary-foreground:#111318;
  --violet:#A78BFA;
}
`;

const BORDER = "border-border";
const TEXT_MUTED = "text-muted-foreground";
const VIOLET = "text-[color:var(--violet)]";
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const EYEBROW =
  "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80";
const BTN =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none";
const BTN_PRIMARY = `${BTN} bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:brightness-110 active:translate-y-0 motion-reduce:hover:transform-none ${FOCUS}`;
const BTN_SECONDARY = `${BTN} border ${BORDER} bg-card text-foreground hover:border-primary/60 hover:bg-muted ${FOCUS}`;
const ICON_BTN = `grid size-10 place-items-center rounded-full border ${BORDER} bg-card transition-colors duration-200 hover:border-primary/60 hover:bg-muted disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none ${FOCUS}`;

const DEFAULT_BRAND = "var(--primary)";
// Technology brand colour; falls back to the theme primary when none is set.

// Names here should match the entries in techStrip.
const meta = {
  "Next.js": {
    icon: SiNextdotjs,
    category: "Frontend",
    color: null,
    level: 2,
    weeks: 6,
    projects: 4,
    blurb:
      "Pages, routing and APIs in one framework, server-rendered for speed.",
    project: "A full-stack course platform",
    topics: ["App Router", "Server Components", "API routes", "SEO", "Caching"],
    learn: [
      "Route pages with layouts and dynamic segments",
      "Fetch data on the server and stream it to the page",
      "Ship to production with image and font optimization",
    ],
    lang: "app/page.jsx",
    code: `export default async function Page() {
  const courses = await getCourses();
  return <CourseGrid items={courses} />;
}`,
  },
  React: {
    icon: SiReact,
    category: "Frontend",
    color: "#149ECA",
    level: 1,
    weeks: 5,
    projects: 5,
    blurb: "Build interactive interfaces from small, reusable components.",
    project: "A dashboard with live data",
    topics: ["Components", "Hooks", "State", "Context", "Forms"],
    learn: [
      "Split a design into small, reusable components",
      "Manage state and side effects with hooks",
      "Handle forms, lists and user events cleanly",
    ],
    lang: "Counter.jsx",
    code: `function Counter() {
  const [n, setN] = useState(0);
  return (
    <button onClick={() => setN(n + 1)}>
      Clicked {n} times
    </button>
  );
}`,
  },
  "Tailwind CSS": {
    icon: SiTailwindcss,
    category: "Frontend",
    color: "#06B6D4",
    level: 1,
    weeks: 2,
    projects: 3,
    blurb: "Style responsive, accessible designs without leaving your markup.",
    project: "A responsive portfolio site",
    topics: ["Utility classes", "Responsive design", "Dark mode", "Theming"],
    learn: [
      "Build layouts with flex and grid utilities",
      "Make one design work from phone to desktop",
      "Add dark mode and a reusable theme",
    ],
    lang: "Card.jsx",
    code: `<div className="rounded-xl border p-4
  transition hover:-translate-y-1
  dark:bg-zinc-900">
  Hello, Tailwind
</div>`,
  },
  "Node.js": {
    icon: SiNodedotjs,
    category: "Backend",
    color: "#5FA04E",
    level: 2,
    weeks: 5,
    projects: 3,
    blurb: "Run JavaScript on the server to build fast, scalable APIs.",
    project: "A REST API with authentication",
    topics: ["Express", "REST APIs", "JWT auth", "Databases", "Middleware"],
    learn: [
      "Design clear REST endpoints for real data",
      "Protect routes with login and tokens",
      "Validate input and handle errors properly",
    ],
    lang: "server.js",
    code: `app.get("/api/courses", async (req, res) => {
  const courses = await db.courses.find();
  res.json(courses);
});`,
  },
  Firebase: {
    icon: SiFirebase,
    category: "Backend",
    color: "#F5A100",
    level: 1,
    weeks: 3,
    projects: 3,
    blurb: "Auth, database and hosting without managing your own servers.",
    project: "A real-time chat app",
    topics: [
      "Authentication",
      "Firestore",
      "Storage",
      "Hosting",
      "Security rules",
    ],
    learn: [
      "Add sign-in with email and Google",
      "Store and sync data in real time",
      "Lock down data with security rules",
    ],
    lang: "chat.js",
    code: `onSnapshot(collection(db, "messages"), (snap) => {
  setMessages(snap.docs.map((d) => d.data()));
});`,
  },
  Python: {
    icon: SiPython,
    category: "AI & Data",
    color: "#3776AB",
    level: 1,
    weeks: 4,
    projects: 5,
    blurb: "The go-to language for automation, data analysis and AI.",
    project: "A script that automates a daily task",
    topics: ["Syntax", "Automation", "Pandas", "APIs", "Scripting"],
    learn: [
      "Write clean scripts that save you time",
      "Clean and analyze data with pandas",
      "Call web APIs and process the results",
    ],
    lang: "report.py",
    code: `import pandas as pd

df = pd.read_csv("sales.csv")
print(df.groupby("month").sum())`,
  },
  TensorFlow: {
    icon: SiTensorflow,
    category: "AI & Data",
    color: "#FF6F00",
    level: 3,
    weeks: 6,
    projects: 3,
    blurb:
      "Train and deploy machine learning models, from basics to neural networks.",
    project: "An image classifier",
    topics: ["Neural networks", "Keras", "CNNs", "Training", "Deployment"],
    learn: [
      "Build and train your first neural network",
      "Classify images with convolutional layers",
      "Export a model and use it in an app",
    ],
    lang: "model.py",
    code: `model = tf.keras.Sequential([
  tf.keras.layers.Dense(64, activation="relu"),
  tf.keras.layers.Dense(10, activation="softmax"),
])
model.fit(x_train, y_train, epochs=5)`,
  },
  Docker: {
    icon: SiDocker,
    category: "DevOps",
    color: "#2496ED",
    level: 2,
    weeks: 3,
    projects: 2,
    blurb: "Package your app so it runs the same on every machine and server.",
    project: "A containerized app, ready to deploy",
    topics: ["Images", "Containers", "Compose", "Volumes", "Deployment"],
    learn: [
      "Write a Dockerfile for a real app",
      "Run an app and its database together with Compose",
      "Deploy the same container anywhere",
    ],
    lang: "Dockerfile",
    code: `FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
CMD ["npm", "start"]`,
  },
};

const fallback = {
  icon: Code2,
  category: "Other",
  color: null,
  level: 1,
  weeks: 2,
  projects: 1,
  blurb: "A practical skill you'll use in real projects.",
  project: "A hands-on project",
  topics: ["Fundamentals", "Practice"],
  learn: ["Learn the basics", "Build something real"],
  lang: "example.js",
  code: `// Your first project starts here`,
};

const LEVELS = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced",
};

const getMeta = (name) => ({
  ...fallback,
  ...(meta[name] ?? {}),
});

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */
function useTyping(text, reduce) {
  const [typing, setTyping] = useState({
    text,
    reduce,
    output: reduce ? text : "",
  });

  useEffect(() => {
    if (reduce) return;

    let position = 0;

    const intervalId = setInterval(() => {
      position += 2;
      setTyping({ text, reduce, output: text.slice(0, position) });

      if (position >= text.length) {
        clearInterval(intervalId);
      }
    }, 16);

    return () => clearInterval(intervalId);
  }, [text, reduce]);

  return reduce
    ? text
    : typing.text === text && typing.reduce === reduce
      ? typing.output
      : "";
}

function LevelBars({ level, reduce }) {
  return (
    <span
      className="flex items-center gap-1"
      role="img"
      aria-label={`Level: ${LEVELS[level]}`}
    >
      {[1, 2, 3].map((bar) => (
        <motion.span
          key={bar}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            delay: reduce ? 0 : 0.08 * bar,
            duration: reduce ? 0 : 0.28,
          }}
          className={`h-1.5 w-6 origin-left rounded-full ${
            bar <= level ? "bg-primary" : "bg-foreground/10"
          }`}
        />
      ))}
    </span>
  );
}

// Code stays dark in both themes, like an editor, so syntax reads the same everywhere.
function CodeWindow({ file, code, reduce }) {
  const typedCode = useTyping(code, reduce);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0B0D11] text-slate-100 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#14171D] px-3 py-2">
        <span className="flex min-w-0 items-center gap-2">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-white/15" />
            <span className="size-2 rounded-full bg-[#FACC15]" />
          </span>
          <span className="min-w-0 truncate font-mono text-xs text-slate-300">
            {file}
          </span>
        </span>

        <button
          type="button"
          onClick={copyCode}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-slate-300 outline-none transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FACC15] active:bg-white/15 motion-reduce:transition-none"
        >
          {copied ? (
            <Check className="size-3.5 text-[#FACC15]" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? "Copied" : "Copy code"}</span>
        </button>
      </div>

      <pre
        className="min-h-[7.5rem] overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-100"
        aria-hidden="true"
      >
        <code>
          {typedCode}
          {!reduce && typedCode.length < code.length && (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[#FACC15] motion-reduce:animate-none" />
          )}
        </code>
      </pre>

      <span className="sr-only">{code}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */
export function TechStrip() {
  const reduce = useReducedMotion();
  const panelId = useId();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const categories = useMemo(
    () => [
      "All",
      ...new Set(techStrip.map((technology) => getMeta(technology).category)),
    ],
    [],
  );

  const queryText = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      techStrip.filter((technology) => {
        const details = getMeta(technology);
        const matchesCategory =
          category === "All" || details.category === category;
        const searchableText = [
          technology,
          details.category,
          details.project,
          ...details.topics,
        ]
          .join(" ")
          .toLowerCase();
        const matchesQuery = !queryText || searchableText.includes(queryText);

        return matchesCategory && matchesQuery;
      }),
    [category, queryText],
  );

  const current =
    selected && visible.includes(selected) ? selected : (visible[0] ?? null);
  const currentMeta = current ? getMeta(current) : null;
  const currentIndex = current ? visible.indexOf(current) : -1;

  const countFor = (categoryName) =>
    categoryName === "All"
      ? techStrip.length
      : techStrip.filter(
          (technology) => getMeta(technology).category === categoryName,
        ).length;

  const step = (direction) => {
    if (visible.length < 2) return;

    const nextIndex =
      (currentIndex + direction + visible.length) % visible.length;
    setSelected(visible[nextIndex]);
  };

  // Names of the neighbours, so the arrow buttons say where they go.
  const prevName =
    visible.length > 1
      ? visible[(currentIndex - 1 + visible.length) % visible.length]
      : null;
  const nextName =
    visible.length > 1 ? visible[(currentIndex + 1) % visible.length] : null;

  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.55, delay, ease: EASE },
        };

  return (
    <section
      aria-labelledby="tech-strip-title"
      className={`apni-landing border-b ${BORDER} bg-muted/40 py-16 text-foreground sm:py-24`}
    >
      <style>{THEME_CSS}</style>
      <Container>
        <motion.div
          {...reveal()}
          className="mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <p className={EYEBROW}>
            <Code2 className="size-3.5 text-primary" aria-hidden="true" />
            Technology stack
          </p>

          <h2
            id="tech-strip-title"
            style={{ fontSize: "clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem)" }}
            className="mt-4 text-balance font-semibold leading-[1.1] tracking-[-0.025em]"
          >
            The tools behind modern software
          </h2>
          <p className={`mt-4 max-w-2xl text-base leading-7 ${TEXT_MUTED}`}>
            Pick a technology to see what you&apos;ll learn, the project you
            will build, and a first look at the code.
          </p>

          <div className="relative mt-8 w-full max-w-lg">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && query) {
                  event.preventDefault();
                  setQuery("");
                }
              }}
              placeholder="Search a technology or topic, e.g. hooks"
              aria-label="Search technologies and topics"
              className={`h-12 w-full rounded-xl border ${BORDER} bg-card pl-10 pr-11 text-sm text-foreground shadow-sm outline-none transition-colors duration-200 placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 motion-reduce:transition-none [&::-webkit-search-cancel-button]:hidden`}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className={`absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground motion-reduce:transition-none ${FOCUS}`}
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <ul
            className="mt-5 flex flex-wrap justify-center gap-2"
            aria-label="Filter technologies by category"
          >
            {categories.map((categoryName) => {
              const active = category === categoryName;

              return (
                <li key={categoryName}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(categoryName)}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${FOCUS} ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : `${BORDER} bg-card text-foreground/85 hover:border-primary/60 hover:text-foreground`
                    }`}
                  >
                    {categoryName}
                    <span
                      className={`text-xs tabular-nums ${
                        active
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {countFor(categoryName)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p
            className="mt-4 text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            Showing {visible.length} of {techStrip.length} technologies
          </p>
        </motion.div>

        {visible.length > 0 ? (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {visible.map((technology, index) => {
              const details = getMeta(technology);
              const Icon = details.icon;
              const isSelected = current === technology;

              return (
                <motion.li
                  key={technology}
                  {...reveal(Math.min(index, 7) * 0.04)}
                >
                  <motion.button
                    type="button"
                    aria-pressed={isSelected}
                    aria-controls={panelId}
                    aria-label={`${technology}, ${details.category}, ${LEVELS[details.level]}`}
                    onClick={() => setSelected(technology)}
                    whileHover={reduce ? undefined : { y: -3 }}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    style={{ "--brand": details.color ?? DEFAULT_BRAND }}
                    className={`group relative flex min-h-28 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-3 py-4 text-foreground transition-colors duration-200 motion-reduce:transition-none ${FOCUS} ${
                      isSelected
                        ? "border-primary bg-card shadow-md shadow-black/10"
                        : `${BORDER} bg-card hover:border-primary/50`
                    }`}
                  >
                    {/* Brand-coloured edge marks the open technology. */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[color:var(--brand)] transition-opacity duration-200 motion-reduce:transition-none ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-aria-pressed:opacity-100 motion-reduce:transition-none"
                      style={{
                        background:
                          "linear-gradient(180deg, color-mix(in srgb, var(--brand) 10%, transparent), transparent 70%)",
                      }}
                    />

                    <Icon
                      className="relative size-7 text-primary"
                      style={{ color: details.color ?? undefined }}
                      aria-hidden="true"
                    />
                    <span className="relative text-center text-xs font-semibold">
                      {technology}
                    </span>

                    <span
                      className={`relative flex items-center gap-1.5 text-[11px] ${TEXT_MUTED}`}
                      aria-hidden="true"
                    >
                      <span className="flex gap-0.5">
                        {[1, 2, 3].map((levelDot) => (
                          <span
                            key={levelDot}
                            className={`size-1.5 rounded-full ${
                              levelDot <= details.level
                                ? "bg-primary"
                                : "bg-foreground/15"
                            }`}
                          />
                        ))}
                      </span>
                      {LEVELS[details.level]}
                    </span>
                  </motion.button>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <div
            className={`mx-auto mt-8 max-w-3xl rounded-2xl border ${BORDER} bg-card p-7 text-center sm:p-10`}
          >
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold">
              No technology matches &quot;{query}&quot;
            </p>
            <p className={`mt-1 text-sm ${TEXT_MUTED}`}>
              Try another search or reset the filters to see every technology.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setSelected(null);
              }}
              className={`${BTN_SECONDARY} mt-5`}
            >
              Reset filters
            </button>
          </div>
        )}

        {current && currentMeta && (
          <motion.div
            {...reveal(0.05)}
            id={panelId}
            className={`relative mx-auto mt-6 max-w-5xl overflow-hidden rounded-3xl border ${BORDER} bg-card shadow-lg shadow-black/10`}
          >
            {/* Announces the change without re-reading the whole panel. */}
            <p className="sr-only" role="status" aria-live="polite">
              {current}: {currentMeta.category}, {LEVELS[currentMeta.level]},{" "}
              {currentMeta.weeks} weeks, {currentMeta.projects} projects.
            </p>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reduce ? 0 : 0.22 }}
                style={{ "--brand": currentMeta.color ?? DEFAULT_BRAND }}
                className="relative p-5 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-[color:var(--brand)]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full opacity-[0.10] blur-3xl"
                  style={{ backgroundColor: "var(--brand)" }}
                />

                <div className="relative grid gap-8 md:grid-cols-2 md:gap-10">
                  <div className="flex min-w-0 flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <motion.span
                        initial={reduce ? false : { scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: reduce ? 0 : 0.25 }}
                        className={`grid size-14 shrink-0 place-items-center rounded-2xl border ${BORDER} bg-muted text-primary`}
                        style={{ color: currentMeta.color ?? undefined }}
                      >
                        <currentMeta.icon
                          className="size-8"
                          aria-hidden="true"
                        />
                      </motion.span>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-semibold tracking-tight">
                            {current}
                          </h3>
                          <span
                            className={`rounded-full border ${BORDER} bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80`}
                          >
                            {currentMeta.category}
                          </span>
                        </div>

                        <div
                          className={`mt-2 flex flex-wrap items-center gap-2.5 text-xs ${TEXT_MUTED}`}
                        >
                          <LevelBars
                            level={currentMeta.level}
                            reduce={reduce}
                          />
                          <span>{LEVELS[currentMeta.level]}</span>
                        </div>
                      </div>
                    </div>

                    <p className={`text-base leading-7 ${TEXT_MUTED}`}>
                      {currentMeta.blurb}
                    </p>

                    <div
                      className={`flex flex-wrap gap-x-6 gap-y-2 border-y ${BORDER} py-3 text-sm font-medium`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3
                          className="size-4 text-primary"
                          style={{ color: currentMeta.color ?? undefined }}
                          aria-hidden="true"
                        />
                        {currentMeta.weeks} weeks
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Layers3
                          className="size-4 text-primary"
                          style={{ color: currentMeta.color ?? undefined }}
                          aria-hidden="true"
                        />
                        {currentMeta.projects} projects
                      </span>
                    </div>

                    <div>
                      <p className={`mb-2.5 text-sm font-semibold ${VIOLET}`}>
                        What you&apos;ll learn
                      </p>
                      <ul className="flex flex-col gap-2">
                        {currentMeta.learn.map((item, index) => (
                          <motion.li
                            key={item}
                            initial={reduce ? false : { opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: reduce ? 0 : 0.06 * index,
                              duration: reduce ? 0 : 0.2,
                            }}
                            className="flex items-start gap-2 text-sm leading-6 text-foreground/90"
                          >
                            <Check
                              className="mt-1 size-4 shrink-0 text-primary"
                              style={{ color: currentMeta.color ?? undefined }}
                              aria-hidden="true"
                            />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <ul
                      className="flex flex-wrap gap-1.5"
                      aria-label="Topics covered"
                    >
                      {currentMeta.topics.map((topic, index) => (
                        <motion.li
                          key={topic}
                          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: reduce ? 0 : 0.03 * index,
                            duration: reduce ? 0 : 0.18,
                          }}
                          className={`rounded-md border ${BORDER} bg-muted px-2 py-1 text-xs font-medium text-foreground/80`}
                        >
                          {topic}
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex min-w-0 flex-col gap-4">
                    <CodeWindow
                      key={current}
                      file={currentMeta.lang}
                      code={currentMeta.code}
                      reduce={reduce}
                    />

                    <p
                      className={`rounded-xl border ${BORDER} border-l-2 border-l-[color:var(--violet)] bg-muted p-4 text-sm leading-6`}
                    >
                      <span className={`block text-xs ${TEXT_MUTED}`}>
                        You&apos;ll build
                      </span>
                      <span className="font-semibold">
                        {currentMeta.project}
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className={`relative mt-7 flex flex-wrap items-center justify-between gap-3 border-t ${BORDER} pt-5`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label={
                        prevName
                          ? `Previous technology: ${prevName}`
                          : "Previous technology"
                      }
                      disabled={visible.length < 2}
                      className={ICON_BTN}
                    >
                      <ArrowLeft className="size-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label={
                        nextName
                          ? `Next technology: ${nextName}`
                          : "Next technology"
                      }
                      disabled={visible.length < 2}
                      className={ICON_BTN}
                    >
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </button>

                    <span className="ml-1 text-xs tabular-nums text-muted-foreground">
                      {currentIndex + 1} of {visible.length}
                    </span>
                  </div>

                  <Link
                    href={`/courses?q=${encodeURIComponent(current)}`}
                    className={`${BTN_PRIMARY} group w-full sm:w-auto`}
                  >
                    Browse {current} courses
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </Container>
    </section>
  );
}
