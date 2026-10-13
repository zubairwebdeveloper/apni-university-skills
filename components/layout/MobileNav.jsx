// components/layout/MobileNav.jsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
  FiChevronRight,
  FiClock,
  FiCompass,
  FiCpu,
  FiCreditCard,
  FiFileText,
  FiGift,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiLogOut,
  FiMail,
  FiMenu,
  FiSearch,
  FiSettings,
  FiUser,
  FiUsers,
  FiX,
  FiGrid,
} from "react-icons/fi";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthNav } from "@/components/auth/AuthNav";
import { AnimatedLogo } from "./AnimatedLogo";
import { primaryNav, moreNav } from "@/config/site";
import { cn } from "@/lib/utils";

/* ----------------------------- config ----------------------------- */

// Route -> icon. If a link in config has its own `icon`, that wins.
// Config links can also carry: `badge` ("New"), `external` (true), `keywords` (["learn"]).
const ICONS = {
  "/": FiHome,
  "/courses": FiBookOpen,
  "/careers": FiCompass,
  "/jobs": FiBriefcase,
  "/blog": FiFileText,
  "/instructors": FiUsers,
  "/pricing": FiCreditCard,
  "/about": FiInfo,
  "/faq": FiHelpCircle,
  "/contact": FiMail,
  "/technology": FiCpu,
  "/ai": FiCpu,
};

// Profile card links (shown only when a `user` is passed in).
const PROFILE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/profile", label: "Profile", icon: FiUser },
  { href: "/settings", label: "Settings", icon: FiSettings },
];

// Shown when there are no recent searches yet.
const SUGGESTIONS = ["courses", "jobs", "pricing", "contact"];

const RECENT_KEY = "mobilenav:recent";
const MAX_RECENT = 4;

/* ----------------------------- helpers ---------------------------- */

function getIcon(link) {
  return link.icon || ICONS[link.href] || FiChevronRight;
}

function isExternal(link) {
  return link.external || /^https?:\/\//.test(link.href);
}

function isActive(pathname, href) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function matches(link, q) {
  if (link.label.toLowerCase().includes(q)) return true;
  return (link.keywords || []).some((k) => k.toLowerCase().includes(q));
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

// Wrap the matched part of a label in <mark> so users see why it matched.
function Highlight({ text, q }) {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "i"));
  return parts.map((part, i) =>
    part.toLowerCase() === q ? (
      <mark key={i} className="rounded-sm bg-primary/15 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function readRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function writeRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode etc.) */
  }
}

/* ---------------------------- animations -------------------------- */

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.26, ease: "easeOut" } },
};

const sectionLabel =
  "mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const quickCard =
  "group flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-card-foreground outline-none transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

const chip =
  "max-w-[10rem] truncate rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-card-foreground outline-none transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring";

/* ------------------------------ NavList --------------------------- */

function NavList({ links, pathname, onNavigate, reduce, q }) {
  return (
    <motion.ul
      className="min-w-0 space-y-1"
      variants={listVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {links.map((l) => {
        const Icon = getIcon(l);
        const external = isExternal(l);
        const active = !external && isActive(pathname, l.href);

        const className = cn(
          "group relative flex min-h-11 min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-base font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          active
            ? "bg-accent font-semibold text-foreground"
            : "text-foreground/90 hover:bg-accent hover:text-foreground",
        );

        const content = (
          <>
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary"
              />
            )}
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-200 motion-reduce:transition-none",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>

            {/* min-w-0 + truncate stops long labels from pushing the row wider */}
            <span className="min-w-0 flex-1 truncate">
              <Highlight text={l.label} q={q} />
            </span>

            {l.badge && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {l.badge}
              </span>
            )}

            {external ? (
              <FiArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground"
              />
            ) : (
              <FiChevronRight
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-all duration-200 motion-reduce:transition-none",
                  active
                    ? "opacity-100"
                    : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100",
                )}
              />
            )}
          </>
        );

        return (
          <motion.li
            key={l.href}
            variants={reduce ? undefined : itemVariants}
            className="min-w-0"
          >
            {external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onNavigate(l)}
                className={className}
              >
                {content}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Link
                href={l.href}
                onClick={() => onNavigate(l)}
                aria-current={active ? "page" : undefined}
                className={className}
              >
                {content}
              </Link>
            )}
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

/* ---------------------------- ProfileCard ------------------------- */

function ProfileCard({ user, onSignOut, onNavigate, pathname }) {
  // Collapsed by default: only the avatar row shows. Tap it to show/hide the rest.
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="mobilenav-profile"
        className="flex w-full min-w-0 items-center gap-3 rounded-xl p-1 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <Avatar className="size-11 shrink-0 border border-border">
          {user.photoURL ? (
            <AvatarImage src={user.photoURL} alt={user.name || "Profile"} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(user.name || user.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {user.name || "Student"}
          </p>
          {user.email && (
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          )}
        </div>
        <FiChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
            expanded ? "rotate-0" : "rotate-180",
          )}
        />
      </button>

      <div
        id="mobilenav-profile"
        className={cn(
          "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden" inert={!expanded}>
          <div className="space-y-3 pt-3">
            <div className="grid grid-cols-3 gap-2">
              {PROFILE_LINKS.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-card text-card-foreground hover:border-primary/40 hover:bg-accent",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span className="max-w-full truncate">{label}</span>
                  </Link>
                );
              })}
            </div>

            {onSignOut && (
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-center gap-2"
                onClick={() => {
                  onNavigate?.();
                  onSignOut();
                }}
              >
                <FiLogOut aria-hidden="true" className="size-4" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- MobileNav -------------------------- */

/**
 * Props (both optional):
 *  - user: { name, email, photoURL } -> shows the profile card in the footer.
 *          Without it the footer falls back to <AuthNav stacked /> (sign in / sign up).
 *  - onSignOut: () => void -> shows a "Sign out" button inside the profile card.
 */
export function MobileNav({ user = null, onSignOut }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();
  const [previousPathname, setPreviousPathname] = useState(pathname);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(true);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);

  const close = () => setOpen(false);

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) setQuery("");
  }

  // Reset the menu when the route changes.
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setOpen(false);
    setQuery("");
  }

  // Load recent searches each time the menu opens.
  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  // Close automatically if the screen grows to desktop (lg) while open.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e) => e.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  const q = query.trim().toLowerCase();

  const primary = useMemo(
    () => (q ? primaryNav.filter((l) => matches(l, q)) : primaryNav),
    [q],
  );
  const more = useMemo(
    () => (q ? moreNav.filter((l) => matches(l, q)) : moreNav),
    [q],
  );
  const total = primary.length + more.length;
  const noResults = q && total === 0;
  const showMore = q ? true : moreOpen; // always expand while searching

  function remember(term) {
    const t = term.trim();
    if (!t) return;
    const next = [
      t,
      ...readRecent().filter((r) => r.toLowerCase() !== t.toLowerCase()),
    ].slice(0, MAX_RECENT);
    writeRecent(next);
    setRecent(next);
  }

  // Called by every nav link.
  function handleNavigate() {
    if (q) remember(query);
    close();
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Escape" && query) {
      e.preventDefault();
      e.stopPropagation(); // clear the search first, don't close the sheet
      setQuery("");
    }
    if (e.key === "Enter") {
      const first = [...primary, ...more][0];
      if (!first) return;
      e.preventDefault();
      remember(query);
      close();
      if (isExternal(first)) window.open(first.href, "_blank", "noopener");
      else router.push(first.href);
    }
  }

  function clearRecent() {
    writeRecent([]);
    setRecent([]);
  }

  function pickTerm(term) {
    setQuery(term);
    inputRef.current?.focus();
  }

  const chips = recent.length > 0 ? recent : SUGGESTIONS;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "group lg:hidden",
        )}
        aria-label="Open menu"
      >
        <FiMenu
          className="size-5 transition-transform duration-200 group-active:scale-90 motion-reduce:transition-none motion-reduce:group-active:scale-100"
          aria-hidden="true"
        />
      </SheetTrigger>

      {/*
        Height is split into 4 zones (flex column, h-dvh):
          1. Header  (shrink-0)  logo + close button
          2. Search  (shrink-0)  search box + chips
          3. Body    (flex-1)    the ONLY part that scrolls
          4. Footer  (shrink-0)  profile card / auth buttons
        `[&>button.absolute]:hidden` hides the default built-in X so only our own
        Close button shows (no duplicate).
      */}
      <SheetContent
        side="right"
        className="flex h-dvh w-full max-w-full flex-col gap-0  border-border bg-background p-0 pt-[env(safe-area-inset-top)] text-foreground min-[420px]:w-[88vw] min-[420px]:max-w-sm sm:max-w-md [&>button.absolute]:hidden"
      >
        {/* 1. Header */}
        <SheetHeader className="flex shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border p-4">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
          {/* Clicks bubble up from the logo link so the sheet closes, even on "/" */}
          <div onClick={close} className="min-w-0 max-w-full overflow-hidden">
            <AnimatedLogo size="sm" />
          </div>
          <SheetClose
            aria-label="Close menu"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "shrink-0",
            )}
          >
            <FiX className="size-5" aria-hidden="true" />
          </SheetClose>
        </SheetHeader>

        {/* 2. Search (pinned, does not scroll) */}
        <div className="shrink-0 space-y-2 border-b border-border p-4">
          <div className="relative">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              enterKeyHint="go"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search the menu"
              aria-label="Search the menu"
              className="h-11 w-full min-w-0 rounded-xl border border-input bg-background pl-9 pr-10 text-base text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FiX aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>

          {/* Result count */}
          {q && (
            <p
              role="status"
              aria-live="polite"
              className="px-1 text-xs text-muted-foreground"
            >
              {total === 0
                ? "No results"
                : `${total} ${total === 1 ? "result" : "results"} · press Enter to open the first`}
            </p>
          )}

          {/* Recent searches (or suggestions the first time) */}
          {!q && (
            <div className="flex min-w-0 items-start gap-2 [@media(max-height:560px)]:hidden">
              <FiClock
                aria-hidden="true"
                className="mt-1.5 size-3.5 shrink-0 text-muted-foreground"
              />
              <ul
                className="flex min-w-0 flex-1 flex-wrap gap-1.5"
                aria-label={recent.length ? "Recent searches" : "Suggestions"}
              >
                {chips.map((r) => (
                  <li key={r} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => pickTerm(r)}
                      className={chip}
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
              {recent.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecent}
                  className="mt-1 shrink-0 rounded text-xs text-muted-foreground underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3. Body (the only scrolling zone).
            min-h-0 lets the flex child shrink so ScrollArea actually scrolls;
            overscroll-contain stops the page behind from scrolling. */}
        <ScrollArea className="min-h-0 flex-1 overscroll-contain [&>div>div]:!block">
          <nav
            aria-label="Mobile"
            className="min-w-0 max-w-full space-y-5 overflow-x-hidden p-4"
          >
            {/* Quick actions (hidden while searching and on very short screens) */}
            {!q && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.04 }}
                className="space-y-2.5 [@media(max-height:560px)]:hidden"
              >
                <Link
                  href="/courses"
                  onClick={close}
                  className={buttonVariants({
                    className: "group h-11 w-full min-w-0 justify-between",
                  })}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 truncate">
                    <FiBookOpen aria-hidden="true" className="shrink-0" />
                    <span className="truncate">Browse courses</span>
                  </span>
                  <FiArrowRight
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>
                {/* Two columns on normal phones, one column on very narrow screens */}
                <div className="grid grid-cols-1 gap-2.5 min-[340px]:grid-cols-2">
                  <Link
                    href="/courses?price=free"
                    onClick={close}
                    className={quickCard}
                  >
                    <FiGift
                      aria-hidden="true"
                      className="size-4 shrink-0 text-primary"
                    />
                    <span className="truncate">Free courses</span>
                  </Link>
                  <Link href="/careers" onClick={close} className={quickCard}>
                    <FiCompass
                      aria-hidden="true"
                      className="size-4 shrink-0 text-primary"
                    />
                    <span className="truncate">Careers</span>
                  </Link>
                </div>
              </motion.div>
            )}

            {primary.length > 0 && (
              <div className="min-w-0">
                <p className={sectionLabel}>Explore</p>
                <NavList
                  links={primary}
                  pathname={pathname}
                  onNavigate={handleNavigate}
                  reduce={reduce}
                  q={q}
                />
              </div>
            )}

            {primary.length > 0 && more.length > 0 && <Separator />}

            {more.length > 0 && (
              <div className="min-w-0">
                {/* Collapsible "More" section (always open while searching) */}
                <button
                  type="button"
                  onClick={() => !q && setMoreOpen((v) => !v)}
                  aria-expanded={showMore}
                  aria-controls="mobilenav-more"
                  disabled={!!q}
                  className="mb-2 flex w-full items-center justify-between rounded px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
                >
                  <span>More</span>
                  {!q && (
                    <FiChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4 transition-transform duration-200 motion-reduce:transition-none",
                        showMore ? "rotate-180" : "rotate-0",
                      )}
                    />
                  )}
                </button>
                <div
                  id="mobilenav-more"
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
                    showMore ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 overflow-hidden" inert={!showMore}>
                    <NavList
                      links={more}
                      pathname={pathname}
                      onNavigate={handleNavigate}
                      reduce={reduce}
                      q={q}
                    />
                  </div>
                </div>
              </div>
            )}

            {noResults && (
              <div
                role="status"
                className="rounded-xl border border-dashed border-border p-6 text-center"
              >
                <span className="mx-auto grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FiSearch aria-hidden="true" className="size-4" />
                </span>
                <p className="mt-3 break-words text-sm font-medium">
                  No matches for “{query.trim()}”
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try another word, or browse all courses.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                    })}
                  >
                    Clear search
                  </button>
                  <Link
                    href="/courses"
                    onClick={close}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Browse courses
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* 4. Footer: profile card (signed in) or auth buttons (signed out) */}
        <div className="max-h-[45dvh] shrink-0 overflow-y-auto overscroll-contain border-t border-border bg-muted/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {user ? (
            <ProfileCard
              user={user}
              onSignOut={onSignOut}
              onNavigate={close}
              pathname={pathname}
            />
          ) : (
            <div onClick={close} className="min-w-0">
              <AuthNav stacked />
            </div>
          )}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Apni University
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
