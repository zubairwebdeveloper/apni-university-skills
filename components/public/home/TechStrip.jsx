"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiCode,
  FiCopy,
  FiLayers,
  FiSearch,
  FiX,
} from "react-icons/fi";
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
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Container from "@/components/layout/Container";
import { techStrip } from "@/config/content";

// Extra info per technology. Names must match the entries in techStrip.
// color = hover accent (null uses the theme's primary color).
// level: 1 = beginner friendly, 2 = intermediate, 3 = advanced.
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
  icon: FiCode,
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

const LEVELS = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };

const getMeta = (name) => ({ ...fallback, ...(meta[name] ?? {}) });

// Types a string out one small step at a time (instant if motion is reduced).
function useTyping(text, reduce) {
  const [out, setOut] = useState(reduce ? text : "");
  useEffect(() => {
    if (reduce) {
      setOut(text);
      return;
    }
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [text, reduce]);
  return out;
}

// Counts up from 0 to `value` when the value changes.
function useCountUp(value, reduce) {
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    let cur = 0;
    const id = setInterval(() => {
      cur += 1;
      setN(cur);
      if (cur >= value) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [value, reduce]);
  return n;
}

function LevelBars({ level }) {
  return (
    <span
      className="flex items-center gap-1"
      role="img"
      aria-label={`Level: ${LEVELS[level]}`}
    >
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.1 * i, duration: 0.3 }}
          className={`h-1.5 w-6 origin-left rounded-full ${
            i <= level ? "bg-[color:var(--brand)]" : "bg-muted"
          }`}
        />
      ))}
    </span>
  );
}

function CodeWindow({ file, code, reduce }) {
  const typed = useTyping(code, reduce);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-muted/60">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs text-muted-foreground">{file}</span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? (
            <FiCheck aria-hidden="true" />
          ) : (
            <FiCopy aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      {/* Full code is hidden from screen readers while it types out. */}
      <pre
        className="min-h-[7.5rem] overflow-x-auto p-4 font-mono text-xs leading-relaxed"
        aria-hidden="true"
      >
        <code>
          {typed}
          {typed.length < code.length && (
            <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[color:var(--brand)]" />
          )}
        </code>
      </pre>
      <span className="sr-only">{code}</span>
    </div>
  );
}

export function TechStrip() {
  const reduce = useReducedMotion();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const categories = useMemo(
    () => ["All", ...new Set(techStrip.map((t) => getMeta(t).category))],
    [],
  );

  const countFor = (c) =>
    c === "All"
      ? techStrip.length
      : techStrip.filter((t) => getMeta(t).category === c).length;

  const q = query.trim().toLowerCase();
  const matches = (t) => {
    const m = getMeta(t);
    const inCategory = category === "All" || m.category === category;
    const inSearch =
      !q ||
      t.toLowerCase().includes(q) ||
      m.topics.some((topic) => topic.toLowerCase().includes(q));
    return inCategory && inSearch;
  };

  const visible = techStrip.filter(matches);
  // The detail panel shows the picked tech, or the first match.
  const current = selected && matches(selected) ? selected : visible[0];
  const cm = current ? getMeta(current) : null;
  const index = current ? visible.indexOf(current) : -1;

  const step = (dir) => {
    if (!visible.length) return;
    setSelected(visible[(index + dir + visible.length) % visible.length]);
  };

  const totalWeeks = techStrip.reduce((sum, t) => sum + getMeta(t).weeks, 0);
  const totalProjects = techStrip.reduce(
    (sum, t) => sum + getMeta(t).projects,
    0,
  );
  const techCount = useCountUp(techStrip.length, reduce);
  const weekCount = useCountUp(totalWeeks, reduce);
  const projectCount = useCountUp(totalProjects, reduce);

  return (
    <div className="border-b bg-secondary/40 py-12">
      <Container>
        {/* Heading + summary numbers */}
        <div className="mb-8 flex flex-col items-center gap-5 text-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Learn the stack companies actually use
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Pick a technology to see what you&apos;ll learn, the project you
              will build, and a first look at the code.
            </p>
          </div>

          <dl className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {[
              [techCount, "technologies"],
              [weekCount, "weeks of lessons"],
              [projectCount, "hands-on projects"],
            ].map(([value, label]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
                <span
                  className="text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  {label}
                </span>
              </div>
            ))}
          </dl>

          {/* Search */}
          <div className="relative w-full max-w-sm">
            <FiSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a technology or topic, e.g. hooks"
              aria-label="Search technologies and topics"
              className="h-10 w-full rounded-full border bg-card pl-9 pr-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FiX aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Category filter with a sliding highlight */}
          <ul
            className="flex flex-wrap justify-center gap-2"
            aria-label="Filter technologies by category"
          >
            {categories.map((c) => {
              const active = category === c;
              return (
                <li key={c}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(c)}
                    className="relative rounded-full border bg-card px-4 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {active && (
                      <motion.span
                        layoutId="tech-filter-pill"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 380, damping: 30 }
                        }
                      />
                    )}
                    <span
                      className={`relative flex items-center gap-2 ${
                        active ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {c}
                      <span
                        className={`text-xs tabular-nums ${
                          active
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {countFor(c)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Technology grid */}
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {techStrip.map((t) => {
            const m = getMeta(t);
            const Icon = m.icon;
            const on = matches(t);
            return (
              <li key={t}>
                <motion.button
                  type="button"
                  aria-pressed={current === t}
                  aria-label={`${t}, ${m.category}, ${LEVELS[m.level]}`}
                  onClick={() => setSelected(t)}
                  whileHover={reduce || !on ? undefined : { y: -4 }}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  animate={{ opacity: on ? 1 : 0.3 }}
                  transition={{ duration: 0.25 }}
                  style={{ "--brand": m.color ?? "var(--primary)" }}
                  className="group relative flex w-full flex-col items-center gap-2 overflow-hidden rounded-xl border bg-card px-3 py-4 text-muted-foreground outline-none transition-colors hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-[color:var(--brand)] aria-pressed:text-[color:var(--brand)]"
                >
                  <span
                    className="pointer-events-none absolute inset-x-4 -top-6 h-12 rounded-full bg-[color:var(--brand)] opacity-0 blur-2xl transition-opacity group-hover:opacity-25 group-aria-pressed:opacity-25"
                    aria-hidden="true"
                  />
                  <Icon className="relative size-7" aria-hidden="true" />
                  <span className="relative text-xs font-medium text-foreground">
                    {t}
                  </span>
                  <span className="relative flex gap-0.5" aria-hidden="true">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`size-1 rounded-full ${
                          i <= m.level
                            ? "bg-[color:var(--brand)]"
                            : "bg-muted-foreground/25"
                        }`}
                      />
                    ))}
                  </span>
                </motion.button>
              </li>
            );
          })}
        </ul>

        {/* Empty state */}
        {!current && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border bg-card p-8 text-center">
            <p className="font-medium">
              No technology matches &quot;{query}&quot;
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a shorter word, or show all categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
              className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-4`}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Detail panel */}
        {current && (
          <div
            className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border bg-card"
            aria-live="polite"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                style={{ "--brand": cm.color ?? "var(--primary)" }}
                className="relative p-5 sm:p-6"
              >
                <span
                  className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[color:var(--brand)] opacity-10 blur-3xl"
                  aria-hidden="true"
                />

                <div className="relative grid gap-6 md:grid-cols-2">
                  {/* Left: what and why */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <motion.span
                        className="grid size-14 shrink-0 place-items-center rounded-xl bg-muted text-[color:var(--brand)]"
                        animate={reduce ? undefined : { y: [0, -4, 0] }}
                        transition={{
                          duration: 3.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <cm.icon className="size-8" aria-hidden="true" />
                      </motion.span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{current}</h3>
                          <Badge variant="secondary">{cm.category}</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <LevelBars level={cm.level} />
                          <span>{LEVELS[cm.level]}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{cm.blurb}</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1.5">
                        <FiClock
                          className="text-[color:var(--brand)]"
                          aria-hidden="true"
                        />
                        {cm.weeks} weeks
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiLayers
                          className="text-[color:var(--brand)]"
                          aria-hidden="true"
                        />
                        {cm.projects} projects
                      </span>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-medium">
                        What you&apos;ll learn
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {cm.learn.map((item, i) => (
                          <motion.li
                            key={item}
                            initial={reduce ? false : { opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 * i + 0.1 }}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <FiCheck
                              className="mt-0.5 shrink-0 text-[color:var(--brand)]"
                              aria-hidden="true"
                            />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {cm.topics.map((topic, i) => (
                        <motion.span
                          key={topic}
                          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.04 * i + 0.15 }}
                          className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {topic}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Right: code + project */}
                  <div className="flex flex-col gap-4">
                    <CodeWindow
                      key={current}
                      file={cm.lang}
                      code={cm.code}
                      reduce={reduce}
                    />
                    <p className="rounded-xl bg-muted/60 p-3 text-sm">
                      <span className="text-muted-foreground">
                        You&apos;ll build:{" "}
                      </span>
                      <span className="font-medium">{cm.project}</span>
                    </p>
                  </div>
                </div>

                {/* Footer: navigation + CTA */}
                <div className="relative mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous technology"
                      disabled={visible.length < 2}
                      className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                        className: "rounded-full",
                      })}
                    >
                      <FiArrowLeft aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next technology"
                      disabled={visible.length < 2}
                      className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                        className: "rounded-full",
                      })}
                    >
                      <FiArrowRight aria-hidden="true" />
                    </button>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {index + 1} of {visible.length}
                    </span>
                  </div>
                  <Link
                    href={`/courses?q=${encodeURIComponent(current)}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    Browse {current} courses
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </Container>
    </div>
  );
}
