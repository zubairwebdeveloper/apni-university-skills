"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

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

const PROFILE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/profile", label: "Profile", icon: FiUser },
  { href: "/settings", label: "Settings", icon: FiSettings },
];

const SUGGESTIONS = ["courses", "jobs", "pricing", "contact"];

const RECENT_KEY = "mobilenav:recent";
const MAX_RECENT = 4;

const EXTERNAL_PROTOCOLS = new Set(["https:", "http:"]);

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.035,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

const sectionLabel =
  "mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground";

const quickCard =
  "group flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl border border-border/80 bg-card px-3 py-2.5 text-sm font-medium text-card-foreground outline-none transition-colors duration-200 hover:border-amber-500/50 hover:bg-amber-500/5 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none";

const chip =
  "max-w-[10rem] truncate rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none transition-colors hover:border-violet-500/50 hover:bg-violet-500/5 focus-visible:ring-2 focus-visible:ring-ring";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getIcon(link) {
  return link.icon || ICONS[link.href] || FiChevronRight;
}

function getSafeExternalUrl(href) {
  if (typeof href !== "string") return null;

  try {
    const url = new URL(href);

    if (!EXTERNAL_PROTOCOLS.has(url.protocol)) return null;

    return url.href;
  } catch {
    return null;
  }
}

function isExternal(link) {
  return Boolean(link?.external || /^https?:\/\//i.test(link?.href || ""));
}

function isActive(pathname, href) {
  if (!pathname || !href) return false;

  if (href === "/") return pathname === "/";

  return pathname === href || pathname.startsWith(`${href}/`);
}

function matches(link, query) {
  const label = typeof link?.label === "string" ? link.label : "";

  if (label.toLowerCase().includes(query)) return true;

  return (Array.isArray(link?.keywords) ? link.keywords : []).some(
    (keyword) =>
      typeof keyword === "string" && keyword.toLowerCase().includes(query),
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return "U";

  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

function readRecent() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => typeof item === "string" && item.trim())
      .map((item) => item.trim())
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function writeRecent(items) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  } catch {
    // Storage may be unavailable in private browsing or restricted contexts.
  }
}

/* -------------------------------------------------------------------------- */
/* Search highlighting                                                        */
/* -------------------------------------------------------------------------- */

const Highlight = memo(function Highlight({ text, query }) {
  if (!query || typeof text !== "string") return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "ig"));

  return parts.map((part, index) => {
    const matched = part.toLowerCase() === query.toLowerCase();

    return matched ? (
      <mark
        key={`${index}-${part}`}
        className="rounded bg-amber-400/25 px-0.5 text-inherit"
      >
        {part}
      </mark>
    ) : (
      part
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Navigation list                                                            */
/* -------------------------------------------------------------------------- */

const NavList = memo(function NavList({
  links,
  pathname,
  onNavigate,
  reduce,
  query,
}) {
  return (
    <motion.ul
      className="min-w-0 space-y-1"
      variants={listVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {links.map((link, index) => {
        const Icon = getIcon(link);
        const external = isExternal(link);
        const externalHref = external ? getSafeExternalUrl(link.href) : null;

        // Invalid external destinations are not rendered as links.
        if (external && !externalHref) return null;

        const active = !external && isActive(pathname, link.href);

        const linkClass = cn(
          "group relative flex min-h-12 min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
          "transition-colors duration-200 motion-reduce:transition-none",
          focusRing,
          active
            ? "bg-primary/10 text-foreground"
            : "text-foreground/85 hover:bg-accent hover:text-foreground",
        );

        const content = (
          <>
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary"
              />
            )}

            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                "motion-reduce:transition-none",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-violet-500/10 group-hover:text-violet-700 dark:group-hover:text-violet-300",
              )}
            >
              <Icon className="size-[17px]" aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1 truncate">
              <Highlight text={link.label} query={query} />
            </span>

            {link.badge && (
              <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                {link.badge}
              </span>
            )}

            {external ? (
              <FiArrowUpRight
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <FiChevronRight
                className={cn(
                  "size-4 shrink-0 transition-all duration-200 motion-reduce:transition-none",
                  active
                    ? "translate-x-0 text-primary opacity-100"
                    : "text-muted-foreground opacity-50 group-hover:translate-x-0.5 group-hover:opacity-100",
                )}
                aria-hidden="true"
              />
            )}
          </>
        );

        return (
          <motion.li
            key={`${link.href}-${link.label || index}`}
            variants={reduce ? undefined : itemVariants}
            className="min-w-0"
          >
            {external ? (
              <a
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onNavigate(link)}
                className={linkClass}
              >
                {content}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <Link
                href={link.href}
                onClick={() => onNavigate(link)}
                aria-current={active ? "page" : undefined}
                className={linkClass}
              >
                {content}
              </Link>
            )}
          </motion.li>
        );
      })}
    </motion.ul>
  );
});

/* -------------------------------------------------------------------------- */
/* Profile card                                                               */
/* -------------------------------------------------------------------------- */

function ProfileCard({ user, onSignOut, onNavigate, pathname }) {
  const [expanded, setExpanded] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = user.name || user.displayName || "Student";
  const email = user.email || "";

  async function handleSignOut() {
    if (!onSignOut || signingOut) return;

    setSigningOut(true);

    try {
      await onSignOut();
      onNavigate?.();
    } catch (error) {
      console.error("[MobileNav] Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        aria-controls="mobilenav-profile"
        className={cn(
          "flex w-full min-w-0 items-center gap-3 rounded-2xl border border-transparent p-2 text-left transition-colors",
          "hover:border-border hover:bg-background/80",
          focusRing,
        )}
      >
        <Avatar className="size-11 shrink-0 border border-border shadow-sm">
          {user.photoURL || user.photoUrl ? (
            <AvatarImage
              src={user.photoURL || user.photoUrl}
              alt={displayName}
            />
          ) : null}

          <AvatarFallback className="bg-violet-500/10 font-semibold text-violet-800 dark:text-violet-300">
            {getInitials(displayName || email)}
          </AvatarFallback>
        </Avatar>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">
            {displayName}
          </span>

          {email && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {email}
            </span>
          )}
        </span>

        <FiChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
            expanded ? "rotate-180" : "rotate-0",
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
          <div className="space-y-3 px-1 pb-1 pt-3">
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
                      "flex min-h-[66px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-1 py-2 text-[11px] font-semibold",
                      "transition-colors motion-reduce:transition-none",
                      focusRing,
                      active
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-violet-500/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-[17px] shrink-0" aria-hidden="true" />
                    <span className="max-w-full truncate">{label}</span>
                  </Link>
                );
              })}
            </div>

            {onSignOut && (
              <Button
                type="button"
                variant="outline"
                disabled={signingOut}
                className="h-11 w-full justify-center gap-2 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                onClick={handleSignOut}
              >
                <FiLogOut className="size-4" aria-hidden="true" />
                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main mobile navigation                                                     */
/* -------------------------------------------------------------------------- */

export function MobileNav({ user = null, onSignOut, className }) {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [moreOpen, setMoreOpen] = useState(true);
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);

  const normalizedQuery = query.trim().toLowerCase();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  const handleOpenChange = useCallback((nextOpen) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
    }
  }, []);

  // Close and reset the menu when the active route changes.
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  // Read search history only in the browser.
  useEffect(() => {
    if (open) {
      setRecent(readRecent());
    }
  }, [open]);

  // Close the drawer if the viewport becomes desktop-sized.
  useEffect(() => {
    if (!open) return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = (event) => {
      if (event.matches) {
        setOpen(false);
        setQuery("");
      }
    };

    if (mediaQuery.matches) {
      setOpen(false);
      return;
    }

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, [open]);

  const primary = useMemo(() => {
    const links = Array.isArray(primaryNav) ? primaryNav : [];

    return normalizedQuery
      ? links.filter((link) => matches(link, normalizedQuery))
      : links;
  }, [normalizedQuery]);

  const more = useMemo(() => {
    const links = Array.isArray(moreNav) ? moreNav : [];

    return normalizedQuery
      ? links.filter((link) => matches(link, normalizedQuery))
      : links;
  }, [normalizedQuery]);

  const total = primary.length + more.length;
  const noResults = Boolean(normalizedQuery) && total === 0;
  const showMore = normalizedQuery ? true : moreOpen;
  const chips = recent.length > 0 ? recent : SUGGESTIONS;

  const remember = useCallback((term) => {
    const trimmed = term.trim();

    if (!trimmed) return;

    const next = [
      trimmed,
      ...readRecent().filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT);

    writeRecent(next);
    setRecent(next);
  }, []);

  const handleNavigate = useCallback(
    (link) => {
      if (normalizedQuery) remember(query);

      // A selected link closes the drawer. Route changes also close it.
      close();
    },
    [close, normalizedQuery, query, remember],
  );

  const handleSearchKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && query) {
        event.preventDefault();
        event.stopPropagation();
        setQuery("");
        return;
      }

      if (event.key !== "Enter") return;

      const first = [...primary, ...more].find((link) => {
        if (!link?.href) return false;

        return !isExternal(link) || Boolean(getSafeExternalUrl(link.href));
      });

      if (!first) return;

      event.preventDefault();
      remember(query);
      close();

      if (isExternal(first)) {
        const href = getSafeExternalUrl(first.href);

        if (href) {
          window.open(href, "_blank", "noopener,noreferrer");
        }
      } else {
        router.push(first.href);
      }
    },
    [close, more, primary, query, remember, router],
  );

  const clearRecent = useCallback(() => {
    writeRecent([]);
    setRecent([]);
  }, []);

  const pickTerm = useCallback((term) => {
    setQuery(term);

    // Focus is applied after React commits the new state.
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        aria-label="Open navigation menu"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "group size-10 rounded-xl lg:hidden",
          focusRing,
          className,
        )}
      >
        <FiMenu
          className="size-5 transition-transform duration-200 group-active:scale-90 motion-reduce:transition-none motion-reduce:group-active:scale-100"
          aria-hidden="true"
        />
      </SheetTrigger>

      <SheetContent
        side="right"
        className={cn(
          "flex h-dvh w-full max-w-full flex-col gap-0 overflow-hidden border-border bg-background p-0 pt-[env(safe-area-inset-top)] text-foreground",
          "min-[420px]:w-[88vw] min-[420px]:max-w-sm sm:max-w-md",
          "[&>button.absolute]:hidden",
        )}
      >
        {/* Header */}
        <SheetHeader className="flex shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border/80 px-4 py-3.5">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>

          <SheetDescription className="sr-only">
            Search and navigate the Apni University website.
          </SheetDescription>

          <div onClick={close} className="min-w-0 max-w-full overflow-hidden">
            <AnimatedLogo size="sm" />
          </div>

          <SheetClose
            aria-label="Close navigation menu"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-10 shrink-0 rounded-xl",
              focusRing,
            )}
          >
            <FiX className="size-5" aria-hidden="true" />
          </SheetClose>
        </SheetHeader>

        {/* Pinned search section */}
        <div className="shrink-0 space-y-3 border-b border-border/80 p-4">
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
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search courses, jobs, pages..."
              aria-label="Search website navigation"
              aria-controls="mobilenav-results"
              className={cn(
                "h-12 w-full min-w-0 rounded-xl border border-input bg-muted/30 pl-10 pr-10 text-base text-foreground",
                "outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground",
                "focus:border-violet-500/60 focus-visible:ring-2 focus-visible:ring-violet-500/20",
                "sm:text-sm [&::-webkit-search-cancel-button]:hidden",
              )}
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className={cn(
                  "absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground",
                  "transition-colors hover:bg-accent hover:text-foreground",
                  focusRing,
                )}
              >
                <FiX size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {normalizedQuery && (
            <p
              role="status"
              aria-live="polite"
              className="px-1 text-xs text-muted-foreground"
            >
              {total === 0
                ? "No matching pages found"
                : `${total} ${total === 1 ? "result" : "results"} · press Enter to open the first`}
            </p>
          )}

          {!normalizedQuery && (
            <div className="flex min-w-0 items-start gap-2 [@media(max-height:560px)]:hidden">
              <FiClock
                aria-hidden="true"
                className="mt-1.5 size-3.5 shrink-0 text-muted-foreground"
              />

              <ul
                className="flex min-w-0 flex-1 flex-wrap gap-1.5"
                aria-label={
                  recent.length ? "Recent searches" : "Suggested searches"
                }
              >
                {chips.map((term) => (
                  <li key={term} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => pickTerm(term)}
                      className={chip}
                    >
                      {term}
                    </button>
                  </li>
                ))}
              </ul>

              {recent.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecent}
                  className={cn(
                    "mt-1 shrink-0 rounded text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
                    focusRing,
                  )}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable navigation body */}
        <ScrollArea
          className="min-h-0 flex-1 overscroll-contain"
          id="mobilenav-results"
        >
          <nav
            aria-label="Mobile navigation"
            className="min-w-0 max-w-full space-y-5 overflow-x-hidden p-4"
          >
            {!normalizedQuery && (
              <motion.section
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.22 }}
                aria-label="Quick actions"
                className="space-y-2.5 [@media(max-height:560px)]:hidden"
              >
                <p className={sectionLabel}>Quick access</p>

                <Link
                  href="/courses"
                  onClick={handleNavigate}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "group h-12 w-full min-w-0 justify-between rounded-xl px-4",
                    "bg-primary font-semibold text-primary-foreground shadow-sm",
                    "transition-transform hover:translate-y-[-1px] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2.5 truncate">
                    <FiBookOpen
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                    <span className="truncate">Browse courses</span>
                  </span>

                  <FiArrowRight
                    aria-hidden="true"
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </Link>

                <div className="grid grid-cols-1 gap-2 min-[340px]:grid-cols-2">
                  <Link
                    href="/courses?price=free"
                    onClick={handleNavigate}
                    className={quickCard}
                  >
                    <FiGift
                      aria-hidden="true"
                      className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
                    />
                    <span className="truncate">Free courses</span>
                  </Link>

                  <Link
                    href="/careers"
                    onClick={handleNavigate}
                    className={quickCard}
                  >
                    <FiCompass
                      aria-hidden="true"
                      className="size-4 shrink-0 text-violet-600 dark:text-violet-400"
                    />
                    <span className="truncate">Explore careers</span>
                  </Link>
                </div>
              </motion.section>
            )}

            {primary.length > 0 && (
              <section className="min-w-0" aria-label="Explore pages">
                <p className={sectionLabel}>Explore</p>

                <NavList
                  links={primary}
                  pathname={pathname}
                  onNavigate={handleNavigate}
                  reduce={reduce}
                  query={normalizedQuery}
                />
              </section>
            )}

            {primary.length > 0 && more.length > 0 && (
              <Separator className="bg-border/80" />
            )}

            {more.length > 0 && (
              <section className="min-w-0" aria-label="Additional pages">
                <button
                  type="button"
                  onClick={() => {
                    if (!normalizedQuery) {
                      setMoreOpen((current) => !current);
                    }
                  }}
                  aria-expanded={showMore}
                  aria-controls="mobilenav-more"
                  disabled={Boolean(normalizedQuery)}
                  className={cn(
                    "mb-2 flex min-h-9 w-full items-center justify-between rounded-lg px-1 text-left",
                    sectionLabel.replace("mb-2 ", ""),
                    focusRing,
                    "disabled:cursor-default",
                  )}
                >
                  <span>More</span>

                  {!normalizedQuery && (
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
                      query={normalizedQuery}
                    />
                  </div>
                </div>
              </section>
            )}

            {noResults && (
              <div
                role="status"
                className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center"
              >
                <span className="mx-auto grid size-11 place-items-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  <FiSearch size={18} aria-hidden="true" />
                </span>

                <p className="mt-4 break-words text-sm font-semibold">
                  No matches for “{query.trim()}”
                </p>

                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  Try another keyword or browse all available courses.
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                  >
                    Clear search
                  </Button>

                  <Link
                    href="/courses"
                    onClick={handleNavigate}
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

        {/* Pinned account footer */}
        <div className="max-h-[45dvh] shrink-0 overflow-y-auto overscroll-contain border-t border-border/80 bg-muted/30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
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

          <p className="mt-3 text-center text-[10px] font-medium tracking-wide text-muted-foreground">
            © {new Date().getFullYear()} Apni University
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
