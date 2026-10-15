// components/public/blog/ArticleTools.jsx
"use client";

import { useEffect, useState } from "react";
import { FiArrowUp, FiList } from "react-icons/fi";
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

/** Thin bar at the top of the screen showing how far through the article you are. */
export function ReadingProgress({ targetId }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight * 0.6, 1);
      setProgress(Math.min(Math.max(-rect.top / total, 0), 1));
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
  }, [targetId]);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1"
    >
      <div
        className="h-full origin-left bg-primary"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

/** Floating button that appears after scrolling down. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={cn(
        "fixed bottom-5 right-5 z-40 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-md transition-opacity",
        "hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        show ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <FiArrowUp aria-hidden />
    </button>
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
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("");

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
    <ol className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
          <a
            href={`#${item.id}`}
            onClick={(e) => go(e, item.id)}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "block border-l-2 py-1 pl-3 leading-snug transition-colors",
              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active === item.id
                ? "border-primary font-medium text-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  const hasToc = items.length >= 2;

  if (variant === "mobile") {
    if (!hasToc) return null;
    return (
      <details className="mt-8 rounded-xl border border-border bg-card px-4 py-3 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-foreground">
          <FiList aria-hidden />
          In this article
        </summary>
        <nav aria-label="Table of contents" className="mt-3">
          {list}
        </nav>
      </details>
    );
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-8">
        {hasToc && (
          <nav aria-label="Table of contents">
            <p className="mb-3 text-sm font-medium text-foreground">
              In this article
            </p>
            {list}
          </nav>
        )}
        {children}
      </div>
    </aside>
  );
}
