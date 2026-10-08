// components/student/StudentNavList.jsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiStar } from "react-icons/fi";

import { studentNav } from "@/config/student";
import { cn } from "@/lib/utils";

// Rang yahan se badlein: ACCENT = default text, ACCENT_2 = hover par gradient ka doosra rang
const ACCENT = "#ef07a2";
const ACCENT_2 = "#7c3aed";
const PIN_KEY = "student-nav-pinned";

// Config mein `description` na ho to ye short lines dikhengi (active item ke neeche).
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

// studentNav ke items mein ye optional fields de sakte hain:
//   group: "Learn"        -> items group ke saath dikhte hain
//   badge: "New"          -> chhota pill
//   description: "..."    -> active item ke neeche line
export function StudentNavList({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const uid = useId();
  const navRef = useRef(null);
  const [hasSettled, setHasSettled] = useState(false);

  const [hovered, setHovered] = useState(null);
  const [pinned, setPinned] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PIN_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [ripples, setRipples] = useState([]);

  const spring = reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 420, damping: 34 };

  // Entrance stagger sirf pehli dafa
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
      } catch {}
      return next;
    });
  }

  // Alt + 1..9 se seedha page par jao
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

  // Click par ripple
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

  // Groups: Pinned (upar) + baqi config groups
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

  // Arrow keys se links ke beech move karna
  function onKeyDown(e) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    const links = [...navRef.current.querySelectorAll("a")];
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
            <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-medium text-muted-foreground">
              {group.pinned && (
                <FiStar
                  aria-hidden="true"
                  className="size-3 fill-current"
                  style={{ color: ACCENT }}
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
                icon: Icon,
                exact,
                badge,
                description,
              } = item;
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
                      "group relative flex items-center gap-3 overflow-hidden rounded-lg px-2.5 py-2 text-sm font-medium text-[#ef07a2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      active && "text-primary",
                    )}
                  >
                    {/* Click ripple */}
                    {ripples
                      .filter((r) => r.href === href)
                      .map((r) => (
                        <motion.span
                          key={r.id}
                          aria-hidden="true"
                          className="pointer-events-none absolute z-0 size-10 rounded-full"
                          style={{
                            left: r.x - 20,
                            top: r.y - 20,
                            backgroundColor: `${ACCENT}4D`,
                          }}
                          initial={{ scale: 0, opacity: 0.7 }}
                          animate={{ scale: 6, opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          onAnimationComplete={() =>
                            setRipples((p) => p.filter((x) => x.id !== r.id))
                          }
                        />
                      ))}

                    {/* Hover highlight: items ke beech slide karta hai */}
                    {hovered === href && !active && (
                      <motion.span
                        layoutId={`${uid}-hover`}
                        transition={spring}
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: `linear-gradient(90deg, ${ACCENT}1A, ${ACCENT_2}14)`,
                        }}
                      />
                    )}

                    {/* Active highlight + left bar */}
                    {active && (
                      <>
                        <motion.span
                          layoutId={`${uid}-active`}
                          transition={spring}
                          className="absolute inset-0 rounded-lg bg-primary/10"
                        />
                        <motion.span
                          layoutId={`${uid}-bar`}
                          transition={spring}
                          className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-primary"
                        />
                      </>
                    )}

                    {/* Icon tile: hover par rang bhar jata hai */}
                    <span
                      className={cn(
                        "relative z-10 grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-300",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/70 group-hover:-translate-y-0.5 group-hover:bg-[#ef07a2] group-hover:text-white group-hover:shadow-[0_6px_16px_-6px_#ef07a2]",
                      )}
                    >
                      <Icon
                        className="size-4 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                        aria-hidden="true"
                      />
                    </span>

                    {/* Label (hover par gradient text) + active description */}
                    <span className="relative z-10 min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate transition-[background-position,transform] duration-500 ease-out group-hover:translate-x-0.5",
                          active
                            ? "font-semibold text-primary"
                            : "bg-linear-to-r from-[#ef07a2] via-[#ef07a2] to-[#7c3aed] bg-clip-text text-transparent bg-position-[0%_0] bg-size-[200%_100%] group-hover:bg-position-[100%_0]",
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
                      <span
                        className="relative z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none text-white"
                        style={{
                          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
                        }}
                      >
                        {badge}
                      </span>
                    )}

                    {/* Arrow: hover par andar aata hai, active par halka nudge karta hai */}
                    {active && !reduce ? (
                      <motion.span
                        aria-hidden="true"
                        className="relative z-10 text-primary"
                        animate={{ x: [0, 4, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatDelay: 2.5,
                          ease: "easeInOut",
                        }}
                      >
                        <FiArrowRight className="size-4" />
                      </motion.span>
                    ) : (
                      <FiArrowRight
                        aria-hidden="true"
                        className={cn(
                          "relative z-10 size-4 shrink-0 transition-all duration-300",
                          active
                            ? "text-primary"
                            : "-translate-x-2 text-[#ef07a2] opacity-0 group-hover:translate-x-0 group-hover:text-[#7c3aed] group-hover:opacity-100",
                        )}
                      />
                    )}
                  </Link>

                  {/* Pin button (link ke bahar, taake valid HTML rahe) */}
                  <button
                    type="button"
                    onClick={() => togglePin(href)}
                    aria-pressed={isPinned}
                    aria-label={`${isPinned ? "Unpin" : "Pin"} ${label}`}
                    className={cn(
                      "absolute right-9 top-1/2 z-20 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-background hover:text-[#ef07a2] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-90 group-hover/row:opacity-100 [@media(hover:none)]:opacity-60",
                      isPinned && "text-[#ef07a2] opacity-100",
                    )}
                  >
                    <FiStar
                      aria-hidden="true"
                      className={cn("size-3.5", isPinned && "fill-current")}
                    />
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* Features ka hint: pin ke baad chhup jata hai */}
      <AnimatePresence initial={false}>
        {!pinned.length && (
          <motion.p
            key="hint"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 text-[11px] leading-relaxed text-muted-foreground"
          >
            Tip: hover a link and tap the star to pin it. Press Alt + 1 to 9 to
            jump to a page.
          </motion.p>
        )}
      </AnimatePresence>
    </nav>
  );
}
