// components/public/blog/ArticleTools.jsx
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ChevronDown, List } from "lucide-react";
import { cn } from "@/lib/utils";

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "section";

const scrollBehavior = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * How far through the article element you are (0 to 1).
 * `step` rounds the value (e.g. step 1 = whole percents) so components that
 * render a lot of markup do not re-render on every scroll frame.
 */
function useReadingProgress(targetId, { step = 0, enabled = true } = {}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight * 0.6, 1);
      let value = Math.min(Math.max(-rect.top / total, 0), 1);
      if (step) value = Math.round((value * 100) / step) * (step / 100);
      setProgress(value);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId, step, enabled]);

  return progress;
}

/** Thin bar at the top of the screen showing how far through the article you are. */
export function ReadingProgress({ targetId }) {
  const progress = useReadingProgress(targetId);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-border/40"
    >
      <div
        className="h-full origin-left bg-primary shadow-[0_0_8px_var(--primary)]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

const RING_RADIUS = 20;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** Floating button that appears after scrolling down; the ring shows page progress. */
export function BackToTop() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [pageProgress, setPageProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value =
        max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      setPageProgress(Math.round(value * 100) / 100);
      setShow(window.scrollY > 700);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          key="back-to-top"
          type="button"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: scrollBehavior() })
          }
          aria-label="Back to top"
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={reduce ? undefined : { y: -2 }}
          whileTap={reduce ? undefined : { scale: 0.95 }}
          className={cn(
            "group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 grid size-12 place-items-center rounded-full border border-border bg-card text-foreground shadow-lg shadow-black/10",
            "transition-colors duration-200 hover:border-primary/60 hover:text-primary",
            FOCUS_RING,
          )}
        >
          <svg
            viewBox="0 0 48 48"
            aria-hidden="true"
            className="absolute inset-0 size-full -rotate-90"
          >
            <circle
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="2"
              className="stroke-border"
            />
            <circle
              cx="24"
              cy="24"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - pageProgress)}
              className="stroke-primary transition-[stroke-dashoffset] duration-150 motion-reduce:transition-none"
            />
          </svg>
          <ArrowUp
            aria-hidden="true"
            className="relative size-4 transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Builds a table of contents from the h2/h3 headings inside `targetId`,
 * gives each heading an id, and highlights the section being read.
 *
 * variant="mobile"  → collapsible list shown above the article (hidden on lg+)
 * variant="desktop" → sticky side column (hidden below lg); `children`
 *                     (e.g. a share button) render underneath the list.
 */
export function TableOfContents({ targetId, variant = "desktop", children }) {
  const reduce = useReducedMotion();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("");
  const progress = useReadingProgress(targetId, {
    step: 1,
    enabled: variant !== "mobile",
  });

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;

    const used = new Set();
    const found = [...root.querySelectorAll("h2, h3")]
      .filter((h) => h.textContent?.trim())
      .map((h) => {
        let id = h.id;
        if (!id) {
          const base = slugify(h.textContent);
          id = base;
          let n = 2;
          while (used.has(id) || document.getElementById(id)) {
            id = `${base}-${n++}`;
          }
          h.id = id;
        }
        used.add(id);
        h.classList.add("scroll-mt-24");
        return {
          id,
          text: h.textContent.trim(),
          level: h.tagName === "H3" ? 3 : 2,
        };
      });

    setItems(found);
    if (found.length < 2) return;

    // Start on the first section so the indicator is never missing.
    setActive((current) => current || found[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );
    found.forEach((f) => {
      const el = document.getElementById(f.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [targetId]);

  const go = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  const list = (
    <ol className="relative space-y-0.5 border-l border-border text-sm">
      {items.map((item) => {
        const isActive = active === item.id;

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => go(e, item.id)}
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "relative block rounded-r-md py-1.5 pr-2 leading-snug transition-colors duration-200 motion-reduce:transition-none",
                item.level === 3 ? "pl-7 text-[13px]" : "pl-4",
                "hover:bg-muted/60 hover:text-foreground",
                FOCUS_RING,
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`toc-indicator-${variant}`}
                  aria-hidden="true"
                  className="absolute -left-px top-0 h-full w-0.5 rounded-full bg-primary"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 500, damping: 38 }
                  }
                />
              )}
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  const hasToc = items.length >= 2;

  if (variant === "mobile") {
    if (!hasToc) return null;
    const activeItem = items.find((item) => item.id === active);

    return (
      <details className="group mt-8 overflow-hidden rounded-xl border border-border bg-card lg:hidden">
        <summary
          className={cn(
            "flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden",
            "transition-colors hover:bg-muted/40",
            FOCUS_RING,
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <List className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold tracking-tight text-foreground">
              In this article
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {activeItem ? activeItem.text : `${items.length} sections`}
            </span>
          </span>
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </summary>
        <nav
          aria-label="Table of contents"
          className="border-t border-border px-4 pb-4 pt-3"
        >
          {list}
        </nav>
      </details>
    );
  }

  const percent = Math.round(progress * 100);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {hasToc && (
          <nav aria-label="Table of contents">
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
                  <List className="size-4 text-primary" aria-hidden="true" />
                  In this article
                </p>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {percent}% read
                </span>
              </div>
              <div
                aria-hidden="true"
                className="mt-3 h-0.5 overflow-hidden rounded-full bg-border"
              >
                <div
                  className="h-full origin-left bg-primary"
                  style={{ transform: `scaleX(${progress})` }}
                />
              </div>
            </div>

            <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 [scrollbar-width:thin]">
              {list}
            </div>
          </nav>
        )}

        {children && (
          <div className={cn(hasToc && "border-t border-border pt-6")}>
            {children}
          </div>
        )}
      </div>
    </aside>
  );
}
