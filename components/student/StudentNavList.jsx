// components/student/StudentNavList.jsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight, Compass, Star } from "lucide-react";

import { studentNav } from "@/config/student";
import { cn } from "@/lib/utils";

const PIN_KEY = "student-nav-pinned";

/* Design tokens: violet = selected / hover, yellow = highlights (pins, bar, badges) */
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B5CF6]";
const SELECTED_TEXT = "text-violet-700 dark:text-violet-300";

// Shown under the active item when the config has no `description`.
const DEFAULT_DESCRIPTIONS = {
  dashboard: "Your learning overview",
  "my courses": "Courses you have joined",
  courses: "Courses you have joined",
  certificates: "View and download certificates",
  reviews: "Ratings you have shared",
  "my reviews": "Ratings you have shared",
  payments: "Invoices and receipts",
  profile: "Your name, photo and details",
  settings: "Account preferences",
  "browse courses": "Find your next course",
  "help center": "Answers to common questions",
};

function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-[0_1px_0_0_var(--border)]">
      {children}
    </kbd>
  );
}

// Optional fields each studentNav item can provide:
//   group: "Learn"        -> items are shown under a group heading
//   badge: "New"          -> small pill
//   description: "..."    -> line shown under the active item
//   exact: true           -> active only on an exact path match
export function StudentNavList({ onNavigate }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const reduce = useReducedMotion();
  const uid = useId();
  const navRef = useRef(null);

  const [hasSettled, setHasSettled] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState([]);
  const [ripples, setRipples] = useState([]);

  const spring = reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34 };

  // Load pins after mount (reading storage during render would cause a hydration mismatch)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(PIN_KEY) || "[]");
        if (Array.isArray(saved))
          setPinned(saved.filter((href) => typeof href === "string"));
      } catch {
        // ignore malformed or unavailable storage
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Entrance stagger only on the first render
  useEffect(() => {
    const t = setTimeout(() => setHasSettled(true), 900);
    return () => clearTimeout(t);
  }, []);

  function togglePin(href) {
    setPinned((prev) => {
      const next = prev.includes(href)
        ? prev.filter((h) => h !== href)
        : [...prev, href];
      try {
        localStorage.setItem(PIN_KEY, JSON.stringify(next));
      } catch {
        // pinning still works for this session
      }
      return next;
    });
  }

  // Alt + 1..9 jumps straight to a page
  useEffect(() => {
    function onKey(e) {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const m = /^Digit([1-9])$/.exec(e.code);
      if (!m) return;
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (t.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))
      )
        return;
      const item = studentNav[Number(m[1]) - 1];
      if (!item) return;
      e.preventDefault();
      router.push(item.href);
      onNavigate?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, onNavigate]);

  // Click ripple
  function addRipple(e, href) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    setRipples((p) => [
      ...p,
      {
        id: `${performance.now()}-${Math.random()}`,
        href,
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      },
    ]);
  }

  // Groups: Pinned on top, then the config groups
  const rest = studentNav.filter((i) => !pinned.includes(i.href));
  const groups = [];
  const pinnedItems = studentNav.filter((i) => pinned.includes(i.href));
  if (pinnedItems.length)
    groups.push({ name: "Pinned", items: pinnedItems, pinned: true });
  rest.forEach((item) => {
    const name = item.group ?? "";
    let g = groups.find((x) => x.name === name && !x.pinned);
    if (!g) groups.push((g = { name, items: [] }));
    g.items.push(item);
  });

  // Arrow keys / Home / End move focus between links
  function onKeyDown(e) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const links = [...(navRef.current?.querySelectorAll("a") ?? [])];
    const i = links.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    const n =
      e.key === "ArrowDown"
        ? (i + 1) % links.length
        : e.key === "ArrowUp"
          ? (i - 1 + links.length) % links.length
          : e.key === "Home"
            ? 0
            : links.length - 1;
    links[n].focus();
  }

  let order = 0;

  return (
    <nav
      ref={navRef}
      aria-label="Student"
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHovered(null)}
      className="space-y-5"
    >
      {groups.map((group) => (
        <div key={group.name || "all"}>
          {group.name && (
            <p className="mb-2 flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {group.pinned && (
                <Star
                  aria-hidden="true"
                  className="size-3 fill-[#FACC15] text-[#FACC15]"
                />
              )}
              {group.name}
            </p>
          )}

          <ul className="space-y-1">
            {group.items.map((item) => {
              const {
                label,
                href,
                icon: ItemIcon,
                exact,
                badge,
                description,
              } = item;
              const Icon = ItemIcon || Compass;
              const active = exact
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);
              const hint =
                description ?? DEFAULT_DESCRIPTIONS[label.toLowerCase()];
              const isPinned = pinned.includes(href);
              const shortcut = studentNav.indexOf(item) + 1;
              const i = order++;

              return (
                <motion.li
                  key={href}
                  initial={reduce ? false : { opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: hasSettled ? 0 : 0.04 * i,
                    duration: 0.3,
                  }}
                  className="group/row relative"
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    onPointerDown={(e) => addRipple(e, href)}
                    onMouseEnter={() => setHovered(href)}
                    onFocus={() => setHovered(href)}
                    aria-current={active ? "page" : undefined}
                    title={shortcut <= 9 ? `${label} (Alt+${shortcut})` : label}
                    className={cn(
                      "group relative flex items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2 pr-3 text-sm font-medium transition-colors",
                      FOCUS,
                      active
                        ? SELECTED_TEXT
                        : "text-foreground/80 hover:text-foreground",
                    )}
                  >
                    {/* Click ripple */}
                    {ripples
                      .filter((r) => r.href === href)
                      .map((r) => (
                        <motion.span
                          key={r.id}
                          aria-hidden="true"
                          className="pointer-events-none absolute z-0 size-10 rounded-full bg-[#8B5CF6]/25"
                          style={{ left: r.x - 20, top: r.y - 20 }}
                          initial={{ scale: 0, opacity: 0.7 }}
                          animate={{ scale: 6, opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          onAnimationComplete={() =>
                            setRipples((p) => p.filter((x) => x.id !== r.id))
                          }
                        />
                      ))}

                    {/* Hover highlight: slides between items */}
                    {hovered === href && !active && (
                      <motion.span
                        layoutId={`${uid}-hover`}
                        transition={spring}
                        className="absolute inset-0 rounded-xl bg-muted/80"
                      />
                    )}

                    {/* Active highlight + left bar */}
                    {active && (
                      <>
                        <motion.span
                          layoutId={`${uid}-active`}
                          transition={spring}
                          className="absolute inset-0 rounded-xl border border-[#8B5CF6]/25 bg-[#8B5CF6]/10"
                        />
                        <motion.span
                          layoutId={`${uid}-bar`}
                          transition={spring}
                          className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-[#FACC15]"
                        />
                      </>
                    )}

                    {/* Icon tile */}
                    <span
                      className={cn(
                        "relative z-10 grid size-8 shrink-0 place-items-center rounded-lg border transition-all duration-300",
                        active
                          ? "border-[#8B5CF6] bg-[#8B5CF6] text-white shadow-sm"
                          : "border-border bg-muted/60 text-muted-foreground group-hover:-translate-y-0.5 group-hover:border-[#8B5CF6]/40 group-hover:bg-[#8B5CF6]/10 group-hover:text-violet-700 dark:group-hover:text-violet-300",
                      )}
                    >
                      <Icon
                        className="size-4 transition-transform duration-300 group-hover:scale-110"
                        aria-hidden="true"
                      />
                    </span>

                    {/* Label + active description */}
                    <span className="relative z-10 min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate transition-transform duration-300 group-hover:translate-x-0.5",
                          active && "font-semibold",
                        )}
                      >
                        {label}
                      </span>
                      <AnimatePresence initial={false}>
                        {active && hint && (
                          <motion.span
                            key="hint"
                            initial={reduce ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={
                              reduce
                                ? { opacity: 0 }
                                : { height: 0, opacity: 0 }
                            }
                            transition={{ duration: 0.2 }}
                            className="block overflow-hidden truncate text-xs font-normal text-muted-foreground"
                          >
                            {hint}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>

                    {badge && (
                      <span className="relative z-10 rounded-full bg-[#FACC15] px-2 py-0.5 text-[10px] font-bold leading-none text-[#111318]">
                        {badge}
                      </span>
                    )}

                    {/* Active: static chevron. Hover: arrow slides in. */}
                    {active ? (
                      <ChevronRight
                        aria-hidden="true"
                        className="relative z-10 size-4 shrink-0"
                      />
                    ) : (
                      <ArrowRight
                        aria-hidden="true"
                        className="relative z-10 size-4 shrink-0 -translate-x-2 text-[#8B5CF6] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                      />
                    )}
                  </Link>

                  {/* Pin button (outside the link so the HTML stays valid) */}
                  <button
                    type="button"
                    onClick={() => togglePin(href)}
                    aria-pressed={isPinned}
                    aria-label={`${isPinned ? "Unpin" : "Pin"} ${label}`}
                    className={cn(
                      "absolute right-9 top-1/2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-background hover:text-amber-600 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] active:scale-90 group-hover/row:opacity-100 [@media(hover:none)]:opacity-60",
                      isPinned && "opacity-100",
                    )}
                  >
                    <Star
                      aria-hidden="true"
                      className={cn(
                        "size-3.5",
                        isPinned && "fill-[#FACC15] text-[#FACC15]",
                      )}
                    />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Feature hint: hides after the first pin */}
      <AnimatePresence initial={false}>
        {!pinned.length && (
          <motion.div
            key="tip"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2.5"
          >
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Tip:</span> hover
              a link and tap the{" "}
              <Star
                aria-hidden="true"
                className="inline size-3 -translate-y-px fill-[#FACC15] text-[#FACC15]"
              />{" "}
              to pin it. Press <Kbd>Alt</Kbd> + <Kbd>1</Kbd> to <Kbd>9</Kbd> to
              jump to a page.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
