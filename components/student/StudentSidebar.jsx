// components/student/StudentSidebar.jsx
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  ChevronDown,
  ClipboardList,
  Folder,
  Gift,
  Heart,
  History,
  Home,
  Keyboard,
  LifeBuoy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Play,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  Target,
  UserRound,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NAV_LINKS, USER_MENU } from "@/lib/student-header-data";
import { useSidebar } from "./SidebarContext";
import { UserChip } from "./UserChip";
import { SidebarProgress, SidebarPromo, SidebarTip } from "./SidebarExtras";

/* ================================================================
   DESIGN TOKENS
   violet #8B5CF6 = selected / hover, yellow #FACC15 = progress / highlights
================================================================ */

const XP_PER_LEVEL = 500;
const RING_R = 20;
const RING_C = 2 * Math.PI * RING_R;
const MAX_PINS = 6;
const MAX_RECENTS = 5;

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const FOCUS_INSET =
  "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B5CF6]";
const SELECTED_TEXT = "text-violet-700 dark:text-violet-300";
const CARD =
  "group relative block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-[#8B5CF6]/40";

const STORAGE_KEYS = {
  pins: "apni:student-sidebar:pins",
  recents: "apni:student-sidebar:recents",
  closedGroups: "apni:student-sidebar:closed-groups",
  hiddenWidgets: "apni:student-sidebar:hidden-widgets",
  compact: "apni:student-sidebar:compact",
};

// Stable references so persistent state never re-initialises on every render
const NO_ITEMS = [];

const NAV_ICONS = {
  dashboard: Home,
  book: BookOpen,
  video: Video,
  users: Users,
  library: Folder,
  user: UserRound,
  trophy: Award,
  settings: Settings,
  help: LifeBuoy,
};

const QUICK_TILES = [
  { label: "Progress", href: "/student/progress", icon: Target },
  { label: "Wishlist", href: "/student/wishlist", icon: Heart },
  { label: "Reviews", href: "/student/reviews", icon: Star },
  { label: "Alerts", href: "/student/notifications", icon: Bell },
  { label: "Achievements", href: "/student/achievements", icon: Award },
  { label: "Support", href: "/student/support", icon: LifeBuoy },
];

const WIDGET_OPTIONS = [
  { id: "quick", label: "Quick access" },
  { id: "continue", label: "Continue learning", needs: "course" },
  { id: "progress", label: "Progress summary" },
  { id: "achievement", label: "Latest achievement", needs: "badge" },
  { id: "upnext", label: "Up next", needs: "upcoming" },
  { id: "donate", label: "Support a student", needs: "donate" },
  { id: "promo", label: "Announcements" },
  { id: "tip", label: "Study tip" },
  { id: "streak", label: "Study streak", needs: "streak" },
];

const UPCOMING_STYLE = {
  live: {
    icon: Video,
    tone: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  assignment: {
    icon: ClipboardList,
    tone: "bg-[#FACC15]/15 text-amber-700 dark:text-[#FACC15]",
  },
  quiz: {
    icon: Target,
    tone: "bg-[#8B5CF6]/10 text-violet-700 dark:text-violet-300",
  },
};

const isActivePath = (pathname, href) => {
  if (!pathname || !href) return false;
  return href === "/student"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
};

const withHref = (items) =>
  (Array.isArray(items) ? items : []).filter((item) => item?.href);

const courseHref = (course) =>
  course?.href ??
  (course?.slug ? `/student/learning/${course.slug}` : "/student/progress");

const getInitials = (name) =>
  String(name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "S";

/* ================================================================
   PERSISTENT STATE (hydration-safe, localStorage with try/catch)
   First render always uses `initial`, saved value is applied after mount.
================================================================ */

function usePersistentState(key, initial) {
  const [value, setValue] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw != null) {
          const parsed = JSON.parse(raw);
          const sameShape =
            Array.isArray(parsed) === Array.isArray(initial) &&
            typeof parsed === typeof initial;
          if (sameShape) setValue(parsed);
        }
      } catch {
        // storage unavailable or corrupted: keep defaults
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, [key, initial]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [key, value, ready]);

  return [value, setValue, ready];
}

/* ================================================================
   SMALL UI PRIMITIVES
================================================================ */

function Kbd({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-border bg-background px-1.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-[0_1px_0_0_var(--border)]">
      {children}
    </kbd>
  );
}

function SectionLabel({ children, className }) {
  return (
    <p
      className={cn(
        "text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

function Highlight({ text, query }) {
  const value = String(text ?? "");
  if (!query) return value;
  const index = value.toLowerCase().indexOf(query);
  if (index < 0) return value;
  return (
    <>
      {value.slice(0, index)}
      <mark className="rounded-sm bg-[#FACC15]/40 px-0.5 text-inherit">
        {value.slice(index, index + query.length)}
      </mark>
      {value.slice(index + query.length)}
    </>
  );
}

function Switch({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/70",
        FOCUS_INSET,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-foreground/90">
          {label}
        </span>
        {description && (
          <span className="block truncate text-[11px] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
          checked ? "border-[#8B5CF6] bg-[#8B5CF6]" : "border-border bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white shadow transition-all motion-reduce:transition-none",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

/* ================================================================
   3D TILT PANEL (mouse only, subtle)
================================================================ */

function TiltPanel({ children, className, max = 3 }) {
  const reduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, {
    stiffness: 180,
    damping: 22,
    mass: 0.6,
  });
  const springY = useSpring(rotateY, {
    stiffness: 180,
    damping: 22,
    mass: 0.6,
  });

  const handlePointerMove = (event) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    rotateY.set((x - 0.5) * max * 2);
    rotateX.set((0.5 - y) * max * 2);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ================================================================
   BRAND LOGO (orbit spins only while hovered)
================================================================ */

function LogoOrb() {
  const reduceMotion = useReducedMotion();

  const spin = (direction, duration) =>
    reduceMotion
      ? undefined
      : {
          rest: { rotate: 0 },
          hover: {
            rotate: 360 * direction,
            transition: { duration, repeat: Infinity, ease: "linear" },
          },
        };

  return (
    <motion.span
      aria-hidden="true"
      className="relative grid size-11 shrink-0 place-items-center"
      style={{ perspective: 400 }}
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={
        reduceMotion
          ? undefined
          : { rest: { scale: 1 }, hover: { scale: 1.06 } }
      }
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border border-[#8B5CF6]/50"
        style={{ rotateX: 65 }}
        variants={spin(1, 8)}
      />
      <motion.span
        className="absolute inset-1 rounded-full border border-[#FACC15]/70"
        style={{ rotateX: 65, rotateZ: 55 }}
        variants={spin(-1, 11)}
      />
      <span className="absolute right-0 top-1 size-2 rounded-full bg-[#8B5CF6]" />
      <span className="relative grid size-9 place-items-center rounded-xl bg-[#FACC15] text-[#111318] shadow-md">
        <BookOpen className="size-[18px]" />
      </span>
    </motion.span>
  );
}

/* ================================================================
   COLLAPSED RAIL TOOLTIP (portal, so the rail never clips it)
================================================================ */

function RailTip({ label, hint, enabled, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  const show = () => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
  };
  const hide = () => setPos(null);

  useEffect(() => {
    if (!pos) return;
    const dismiss = () => setPos(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [pos]);

  return (
    <div
      ref={ref}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {enabled &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, x: -5, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translateY(-50%)",
            }}
            className="pointer-events-none z-[100] rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-xl"
          >
            <p className="whitespace-nowrap text-xs font-semibold">{label}</p>
            {hint && (
              <p className="mt-0.5 whitespace-nowrap text-[11px] text-muted-foreground">
                {hint}
              </p>
            )}
          </motion.div>,
          document.body,
        )}
    </div>
  );
}

/* ================================================================
   PIN BUTTON
================================================================ */

function PinButton({ pinned, label, limitReached, onToggle }) {
  const blocked = !pinned && limitReached;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pinned}
      aria-disabled={blocked || undefined}
      aria-label={pinned ? `Unpin ${label}` : `Pin ${label}`}
      title={
        pinned
          ? "Unpin"
          : blocked
            ? `Pin limit reached (${MAX_PINS})`
            : "Pin to top"
      }
      className={cn(
        "absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg transition-all",
        blocked ? "cursor-not-allowed" : "cursor-pointer",
        FOCUS,
        pinned
          ? "text-amber-700 opacity-100 hover:bg-[#FACC15]/15 dark:text-[#FACC15]"
          : "text-muted-foreground opacity-0 hover:bg-[#8B5CF6]/10 hover:text-violet-700 focus-visible:opacity-100 group-focus-within/row:opacity-100 group-hover/row:opacity-100 dark:hover:text-violet-300",
      )}
    >
      <Pin
        aria-hidden="true"
        className={cn("size-3.5", pinned && "fill-current")}
      />
    </button>
  );
}

/* ================================================================
   NAVIGATION ITEM
================================================================ */

function NavItem({
  item,
  active,
  collapsed,
  liveNow,
  barId,
  compact,
  query,
  highlighted,
  pinned,
  limitReached,
  onTogglePin,
}) {
  const Icon = NAV_ICONS[item.icon] ?? Star;
  const isLive = liveNow && item.icon === "video";
  const canPin = !collapsed && typeof onTogglePin === "function";

  return (
    <RailTip label={item.label} hint={item.description} enabled={collapsed}>
      <div className="group/row relative">
        <Link
          href={item.href}
          aria-label={collapsed ? item.label : undefined}
          aria-current={active ? "page" : undefined}
          data-highlighted={highlighted ? "true" : undefined}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-2 transition-colors",
            compact ? "min-h-9 py-1" : "min-h-11 py-1.5",
            FOCUS_INSET,
            collapsed && "justify-center px-1",
            canPin && "pr-10",
            active ? SELECTED_TEXT : "text-foreground/75 hover:text-foreground",
          )}
        >
          {/* Background */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 rounded-xl transition-colors duration-200",
              active
                ? "border border-[#8B5CF6]/25 bg-[#8B5CF6]/10"
                : "group-hover:bg-muted/70",
              highlighted && "bg-muted ring-1 ring-[#8B5CF6]/60",
            )}
          />

          {/* Active indicator */}
          {active && (
            <motion.span
              layoutId={barId}
              className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-r-full bg-[#FACC15]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}

          {/* Icon tile */}
          <motion.span
            className={cn(
              "relative grid shrink-0 place-items-center rounded-lg border transition-colors duration-200",
              compact ? "size-7" : "size-9",
              active
                ? "border-[#8B5CF6] bg-[#8B5CF6] text-white shadow-sm"
                : "border-border bg-muted/60 text-muted-foreground group-hover:border-[#8B5CF6]/40 group-hover:bg-[#8B5CF6]/10 group-hover:text-violet-700 dark:group-hover:text-violet-300",
            )}
            whileHover={{ y: -2, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
          >
            <Icon
              className={compact ? "size-[15px]" : "size-[17px]"}
              aria-hidden="true"
            />

            {isLive && (
              <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-70 motion-reduce:animate-none" />
                <span className="relative size-2.5 rounded-full border-2 border-background bg-red-500" />
              </span>
            )}
          </motion.span>

          {!collapsed && (
            <>
              <span
                className={cn(
                  "relative min-w-0 flex-1 truncate text-[13px] tracking-[-0.01em] transition-colors duration-200",
                  active ? "font-bold" : "font-medium",
                )}
              >
                <Highlight text={item.label} query={query} />
              </span>

              {isLive && (
                <span className="relative rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                  Live
                </span>
              )}

              {item.badge && !isLive && (
                <span className="relative rounded-full bg-[#FACC15] px-2 py-0.5 text-[10px] font-bold leading-none tabular-nums text-[#111318]">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </Link>

        {canPin && (
          <PinButton
            pinned={pinned}
            label={item.label}
            limitReached={limitReached}
            onToggle={() => onTogglePin(item.href)}
          />
        )}
      </div>
    </RailTip>
  );
}

/* ================================================================
   COLLAPSIBLE NAVIGATION GROUP
================================================================ */

function NavGroup({
  groupId,
  title,
  items,
  pathname,
  collapsed,
  searching,
  open,
  onToggle,
  liveNow,
  first,
  compact,
  query,
  highlightHref,
  pins,
  onTogglePin,
}) {
  const listId = useId();
  const hasActiveItem = items.some((item) => isActivePath(pathname, item.href));
  // Rail and active search always show items so nothing is hidden from the user
  const expanded = collapsed || searching || open;
  const limitReached = pins.length >= MAX_PINS;

  return (
    <section className="relative min-w-0" aria-label={`${title} navigation`}>
      {!collapsed ? (
        <button
          type="button"
          onClick={() => !searching && onToggle(groupId)}
          aria-expanded={expanded}
          aria-controls={listId}
          className={cn(
            "group/heading mb-1.5 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/70",
            FOCUS,
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-4 w-[3px] shrink-0 rounded-full transition-colors duration-200",
              hasActiveItem
                ? "bg-[#FACC15]"
                : "bg-border group-hover/heading:bg-[#8B5CF6]",
            )}
          />

          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[10px] font-bold uppercase tracking-[0.16em] transition-colors duration-200",
              hasActiveItem
                ? SELECTED_TEXT
                : "text-muted-foreground group-hover/heading:text-foreground",
            )}
          >
            {title}
          </span>

          <span
            className={cn(
              "grid min-w-6 shrink-0 place-items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors duration-200",
              hasActiveItem
                ? "border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-violet-700 dark:text-violet-300"
                : "border-border bg-muted/60 text-muted-foreground",
            )}
          >
            {items.length}
          </span>

          <motion.span
            aria-hidden="true"
            animate={{ rotate: expanded ? 0 : -90 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground"
          >
            <ChevronDown className="size-3.5" />
          </motion.span>
        </button>
      ) : (
        !first && (
          <div
            aria-hidden="true"
            className="mx-auto mb-2 mt-1 h-px w-8 bg-border"
          />
        )
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            id={listId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.22, ease: "easeInOut" },
              opacity: { duration: 0.16 },
            }}
            className="space-y-1 overflow-hidden"
          >
            {items.map((item, index) => (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{
                  delay: index * 0.025,
                  duration: 0.18,
                  ease: "easeOut",
                }}
              >
                <NavItem
                  item={item}
                  active={isActivePath(pathname, item.href)}
                  collapsed={collapsed}
                  liveNow={liveNow}
                  barId={`sidebar-active-bar-${groupId}`}
                  compact={compact}
                  query={query}
                  highlighted={highlightHref === item.href}
                  pinned={pins.includes(item.href)}
                  limitReached={limitReached}
                  onTogglePin={onTogglePin}
                />
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ================================================================
   RECENT PAGES
================================================================ */

function RecentList({ items, pathname }) {
  if (!items.length) return null;

  return (
    <section aria-label="Recently visited pages">
      <div className="mb-1.5 flex items-center gap-2 px-2">
        <History
          aria-hidden="true"
          className="size-3.5 text-muted-foreground"
        />
        <SectionLabel>Recent</SectionLabel>
      </div>
      <ul className="space-y-0.5">
        {items.map((item, index) => {
          const Icon = NAV_ICONS[item.icon] ?? Star;
          return (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.18 }}
            >
              <Link
                href={item.href}
                aria-current={
                  isActivePath(pathname, item.href) ? "page" : undefined
                }
                className={cn(
                  "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs font-medium text-foreground/75 transition-colors hover:bg-muted/70 hover:text-foreground",
                  FOCUS_INSET,
                )}
              >
                <Icon
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300"
                />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-3 shrink-0 -translate-x-1 text-[#8B5CF6] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                />
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================
   QUICK ACCESS TILES
================================================================ */

function QuickTiles({ unreadCount = 0 }) {
  return (
    <section aria-label="Quick access" className="space-y-2.5">
      <SectionLabel className="px-2">Quick access</SectionLabel>

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
        {QUICK_TILES.map((tile, index) => {
          const TileIcon = tile.icon;
          const isAlerts = tile.href === "/student/notifications";

          return (
            <motion.div
              key={tile.href}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.04,
                duration: 0.25,
                ease: "easeOut",
              }}
              whileTap={{ scale: 0.98 }}
              className="min-w-0"
            >
              <TiltPanel max={3}>
                <Link
                  href={tile.href}
                  className={cn(
                    "group relative flex min-h-[52px] items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-card px-2.5 py-2.5 transition-colors hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/[0.05]",
                    FOCUS,
                  )}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-muted/60 text-muted-foreground transition-colors duration-200 group-hover:border-[#8B5CF6]/30 group-hover:bg-[#8B5CF6]/10 group-hover:text-violet-700 dark:group-hover:text-violet-300">
                    <TileIcon
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:scale-110"
                    />
                  </span>

                  <span className="min-w-0 flex-1 truncate text-xs font-semibold tracking-tight text-foreground/85 transition-colors group-hover:text-foreground">
                    {tile.label}
                  </span>

                  {isAlerts && unreadCount > 0 ? (
                    <span
                      aria-label={`${unreadCount} unread notifications`}
                      className="grid min-w-[18px] place-items-center rounded-full bg-[#FACC15] px-1 text-[10px] font-extrabold leading-[18px] text-[#111318]"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : (
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 -translate-x-1 text-[#8B5CF6] opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                    />
                  )}
                </Link>
              </TiltPanel>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ================================================================
   CONTINUE LEARNING CARD
================================================================ */

function ContinueCard({ course }) {
  const pct = Math.max(
    0,
    Math.min(100, Math.round(Number(course.progress) || 0)),
  );

  return (
    <TiltPanel>
      <Link href={courseHref(course)} className={cn(CARD, FOCUS)}>
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#8B5CF6] text-white shadow-sm">
            <Play className="size-4 translate-x-px" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <SectionLabel className={SELECTED_TEXT}>
              Continue learning
            </SectionLabel>
            <p className="mt-0.5 truncate text-[13px] font-bold tracking-tight text-foreground">
              {course.title}
            </p>
            {course.lesson && (
              <p className="truncate text-xs text-muted-foreground">
                {course.lesson}
              </p>
            )}
          </div>
          <ArrowRight
            aria-hidden="true"
            className="mt-1 size-4 shrink-0 text-[#8B5CF6] transition-transform group-hover:translate-x-1"
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Course progress"
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-border"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-[#FACC15]"
            />
          </div>
          <span className="text-xs font-bold tabular-nums text-foreground">
            {pct}%
          </span>
        </div>
      </Link>
    </TiltPanel>
  );
}

/* ================================================================
   LATEST ACHIEVEMENT
================================================================ */

function AchievementPreview({ badge }) {
  if (!badge) return null;

  return (
    <TiltPanel>
      <Link href="/student/achievements" className={cn(CARD, FOCUS)}>
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FACC15] text-[#111318]">
            <Award className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <SectionLabel>Latest achievement</SectionLabel>
            <p className="mt-0.5 truncate text-[13px] font-bold tracking-tight">
              {badge.title}
            </p>
          </div>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 text-[#8B5CF6] transition-transform group-hover:translate-x-1"
          />
        </div>
      </Link>
    </TiltPanel>
  );
}

/* ================================================================
   SUPPORT BANNER
================================================================ */

function DonateBanner() {
  return (
    <TiltPanel>
      <Link href="/student/donate" className={cn(CARD, FOCUS)}>
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-[#8B5CF6]/10 text-violet-700 dark:text-violet-300">
            <Gift className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold tracking-tight">
              Support a student
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Fund scholarships and devices
            </p>
          </div>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 text-[#8B5CF6] transition-transform group-hover:translate-x-1"
          />
        </div>
      </Link>
    </TiltPanel>
  );
}

/* ================================================================
   UPCOMING ACTIVITIES
================================================================ */

function UpNext({ items }) {
  if (!items?.length) return null;

  return (
    <section aria-label="Upcoming activities">
      <div className="mb-2 flex items-center justify-between px-2">
        <SectionLabel>Up next</SectionLabel>
        <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {items.length}
        </span>
      </div>
      <ul className="space-y-1">
        {items.map((item, index) => {
          const style = UPCOMING_STYLE[item.type] ?? UPCOMING_STYLE.quiz;
          const Icon = style.icon;
          return (
            <motion.li
              key={item.id ?? `${item.href}-${index}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
            >
              <Link
                href={item.href ?? "/student"}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/70",
                  FOCUS_INSET,
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    style.tone,
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold tracking-tight text-foreground/90">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 -translate-x-1 text-[#8B5CF6] opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                />
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

/* ================================================================
   STUDY STREAK
================================================================ */

function StudyStreak({ streak }) {
  if (streak == null) return null;

  return (
    <Link
      href="/student/progress"
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-[#FACC15]/30 bg-[#FACC15]/[0.06] p-3 transition-colors hover:border-[#FACC15]/60 hover:bg-[#FACC15]/10",
        FOCUS,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#FACC15]/20 text-amber-700 dark:text-[#FACC15]">
        <Zap className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-[#FACC15]">
          Study streak
        </span>
        <span className="block truncate text-[13px] font-bold text-foreground">
          {streak} {streak === 1 ? "day" : "days"} in a row
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 text-amber-700 transition-transform group-hover:translate-x-1 dark:text-[#FACC15]"
      />
    </Link>
  );
}

/* ================================================================
   COLLAPSED RAIL WIDGETS
================================================================ */

function RailWidgets({ streak, course }) {
  if (streak == null && !course) return null;

  return (
    <div className="flex flex-col items-center gap-2 pt-3">
      <div className="mb-1 h-px w-8 bg-border" />

      {streak != null && (
        <RailTip
          label={`${streak} day streak`}
          hint="Keep it going today"
          enabled
        >
          <Link
            href="/student/progress"
            aria-label={`${streak} day streak`}
            className={cn(
              "relative grid size-10 place-items-center rounded-xl border border-border bg-muted/40 text-amber-700 transition-colors hover:border-[#FACC15]/60 hover:bg-[#FACC15]/10 dark:text-[#FACC15]",
              FOCUS,
            )}
          >
            <Zap className="size-[18px]" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-[#FACC15] px-1 text-[10px] font-bold tabular-nums text-[#111318]">
              {streak > 99 ? "99+" : streak}
            </span>
          </Link>
        </RailTip>
      )}

      {course && (
        <RailTip
          label="Continue learning"
          hint={`${course.title}, ${Math.round(Number(course.progress) || 0)}% complete`}
          enabled
        >
          <Link
            href={courseHref(course)}
            aria-label={`Continue ${course.title}`}
            className={cn(
              "grid size-10 place-items-center rounded-xl bg-[#8B5CF6] text-white shadow-sm transition-colors hover:bg-violet-600",
              FOCUS,
            )}
          >
            <Play className="size-4 translate-x-px" aria-hidden="true" />
          </Link>
        </RailTip>
      )}
    </div>
  );
}

/* ================================================================
   CUSTOMIZE PANEL (widgets, density, reset)
================================================================ */

function CustomizePanel({
  id,
  options,
  hidden,
  onToggleWidget,
  compact,
  onCompact,
  onReset,
}) {
  return (
    <motion.div
      id={id}
      role="group"
      aria-label="Customize sidebar"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="rounded-2xl border border-border bg-card p-2">
        <Switch
          checked={compact}
          onChange={onCompact}
          label="Compact navigation"
          description="Tighter rows for more pages on screen"
        />

        <div className="my-1.5 h-px bg-border" />
        <SectionLabel className="px-2 pb-1 pt-1">Show widgets</SectionLabel>

        {options.map((option) => (
          <Switch
            key={option.id}
            checked={!hidden.includes(option.id)}
            onChange={(next) => onToggleWidget(option.id, next)}
            label={option.label}
          />
        ))}

        <div className="my-1.5 h-px bg-border" />
        <p className="px-2 pb-2 text-[11px] leading-relaxed text-muted-foreground">
          Hover a page and use the pin icon to keep it at the top.
        </p>
        <button
          type="button"
          onClick={onReset}
          className={cn(
            "group/reset flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/10 hover:text-violet-700 dark:hover:text-violet-300",
            FOCUS,
          )}
        >
          <RotateCcw
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover/reset:-rotate-90 motion-reduce:transition-none"
          />
          Reset sidebar
        </button>
      </div>
    </motion.div>
  );
}

/* ================================================================
   KEYBOARD SHORTCUTS PANEL
================================================================ */

function ShortcutsPanel({ id, modKey, onClose }) {
  const rows = [
    ["Toggle sidebar", [modKey, "B"]],
    ["Find a page", [modKey, "⇧", "F"]],
    ["Move through results", ["↑", "↓"]],
    ["Open selected page", ["Enter"]],
    ["Clear search or close panels", ["Esc"]],
    ["Show shortcuts", ["?"]],
  ];

  return (
    <motion.div
      id={id}
      role="region"
      aria-label="Keyboard shortcuts"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="absolute inset-x-3 bottom-full z-30 mb-2 rounded-2xl border border-border bg-popover p-3 text-popover-foreground shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <SectionLabel>Keyboard shortcuts</SectionLabel>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close shortcuts"
          className={cn(
            "grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            FOCUS,
          )}
        >
          <X className="size-3.5" />
        </button>
      </div>
      <dl className="space-y-1.5">
        {rows.map(([label, keys]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <dt className="min-w-0 truncate text-xs text-foreground/80">
              {label}
            </dt>
            <dd className="flex shrink-0 items-center gap-1">
              {keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

/* ================================================================
   PROFILE AVATAR + XP RING
================================================================ */

function LevelAvatar({ person, xp }) {
  const name = person?.name || person?.displayName || "Student";
  const hasXp = typeof xp === "number" && Number.isFinite(xp);
  const safeXp = hasXp ? Math.max(0, xp) : 0;
  const level = hasXp ? Math.floor(safeXp / XP_PER_LEVEL) + 1 : null;
  const progress = hasXp ? ((safeXp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100 : 0;

  return (
    <span className="relative inline-flex size-11 items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 44 44"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="22"
          cy="22"
          r={RING_R}
          fill="none"
          strokeWidth="2.5"
          className="stroke-border"
        />
        {hasXp && (
          <motion.circle
            cx="22"
            cy="22"
            r={RING_R}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-[#FACC15]"
            strokeDasharray={RING_C}
            initial={{ strokeDashoffset: RING_C }}
            animate={{ strokeDashoffset: RING_C * (1 - progress / 100) }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}
      </svg>

      <Avatar className="size-8">
        <AvatarImage
          src={person?.photoURL || person?.avatar || undefined}
          alt={name}
        />
        <AvatarFallback className="bg-[#8B5CF6]/10 text-[11px] font-bold text-violet-700 dark:text-violet-300">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {hasXp && (
        <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-background bg-[#8B5CF6] px-1 text-[10px] font-bold leading-none text-white">
          {level}
        </span>
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500"
      />
    </span>
  );
}

/* ================================================================
   STUDENT SIDEBAR
================================================================ */

export function StudentSidebar({
  person,
  stats,
  liveNow = false,
  upcoming = [],
  unreadCount = 0,
  latestBadge = null,
  showDonate = true,
}) {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef(null);
  const logoutRef = useRef(null);
  const scrollRef = useRef(null);
  const searchTimerRef = useRef(null);
  const customizeId = useId();
  const shortcutsId = useId();
  const { open, setOpen } = useSidebar();
  const collapsed = !open;

  const [filter, setFilter] = useState("");
  const [cursor, setCursor] = useState(0);
  const [isMac, setIsMac] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const [pins, setPins] = usePersistentState(STORAGE_KEYS.pins, NO_ITEMS);
  const [recents, setRecents, recentsReady] = usePersistentState(
    STORAGE_KEYS.recents,
    NO_ITEMS,
  );
  const [closedGroups, setClosedGroups] = usePersistentState(
    STORAGE_KEYS.closedGroups,
    NO_ITEMS,
  );
  const [hiddenWidgets, setHiddenWidgets] = usePersistentState(
    STORAGE_KEYS.hiddenWidgets,
    NO_ITEMS,
  );
  const [compact, setCompact] = usePersistentState(STORAGE_KEYS.compact, false);

  const name = person?.name || person?.displayName || "Student";
  const streak = typeof person?.streak === "number" ? person.streak : null;
  const xp = typeof person?.xp === "number" ? person.xp : null;
  const course = person?.currentCourse ?? null;
  const modKey = isMac ? "⌘" : "Ctrl";

  /* All navigable pages, de-duplicated by href */
  const allItems = useMemo(() => {
    const seen = new Set();
    return [...withHref(NAV_LINKS), ...withHref(USER_MENU)].filter((item) => {
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
  }, []);

  const currentItem = allItems.reduce(
    (best, item) =>
      isActivePath(pathname, item.href) &&
      (!best || item.href.length > best.href.length)
        ? item
        : best,
    null,
  );
  const currentHref = currentItem?.href ?? null;

  // Client-only: keeps the first render identical on server and client
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || ""));
      } catch {
        // ignore
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  /* Track recently visited pages */
  useEffect(() => {
    if (!recentsReady || !currentHref) return;
    setRecents((previous) =>
      previous[0] === currentHref
        ? previous
        : [
            currentHref,
            ...previous.filter((href) => href !== currentHref),
          ].slice(0, MAX_RECENTS),
    );
  }, [currentHref, recentsReady, setRecents]);

  /* Keep the active page visible inside the scroll area */
  useEffect(() => {
    const id = window.setTimeout(() => {
      scrollRef.current
        ?.querySelector('[aria-current="page"]')
        ?.scrollIntoView({ block: "nearest" });
    }, 200);
    return () => window.clearTimeout(id);
  }, [pathname, collapsed]);

  const openSearch = useCallback(() => {
    setOpen(true);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => searchRef.current?.focus(), 120);
  }, [setOpen]);

  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    [],
  );

  /* Shortcuts
     Ctrl/Cmd + B          -> collapse / expand the sidebar
     Ctrl/Cmd + Shift + F  -> focus the page filter
     ?                     -> show keyboard shortcuts
     Esc                   -> close panels / clear the filter
     (Ctrl/Cmd + K belongs to the header's global search.) */
  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable;

      if (event.key === "Escape") {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
        } else if (customizeOpen) {
          setCustomizeOpen(false);
        } else if (filter) {
          setFilter("");
          setCursor(0);
        }
        return;
      }

      if (
        event.key === "?" &&
        !isTyping &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        if (!open) setOpen(true);
        setShortcutsOpen((value) => !value);
        return;
      }

      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();

      if (key === "b" && !event.shiftKey) {
        if (isTyping) return;
        event.preventDefault();
        setOpen(!open);
      } else if (key === "f" && event.shiftKey) {
        event.preventDefault();
        openSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [customizeOpen, filter, open, openSearch, setOpen, shortcutsOpen]);

  const triggerLogout = () =>
    logoutRef.current?.querySelector("button")?.click();

  /* Search + groups */
  const q = filter.trim().toLowerCase();
  const matches = (items) =>
    q
      ? items.filter((item) =>
          [item.label, item.description, item.href]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q)),
        )
      : items;

  const groups = [
    { id: "learn", title: "Learn", items: matches(withHref(NAV_LINKS)) },
    { id: "account", title: "Account", items: matches(withHref(USER_MENU)) },
  ].filter((group) => group.items.length > 0);

  const flatMatches = groups.flatMap((group) => group.items);
  const matchCount = flatMatches.length;
  const highlightHref =
    q && matchCount
      ? flatMatches[Math.min(cursor, matchCount - 1)]?.href
      : null;

  const pinnedItems = pins
    .map((href) => allItems.find((item) => item.href === href))
    .filter(Boolean);
  const showPinned = !collapsed && !q && pinnedItems.length > 0;

  const recentItems = recents
    .map((href) => allItems.find((item) => item.href === href))
    .filter((item) => item && item.href !== currentHref)
    .slice(0, 3);

  const renderedGroups = showPinned
    ? [{ id: "pinned", title: "Pinned", items: pinnedItems }, ...groups]
    : groups;

  /* Bring the keyboard-selected result into view */
  useEffect(() => {
    if (!highlightHref) return;
    scrollRef.current
      ?.querySelector('[data-highlighted="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightHref]);

  const onSearchKey = (event) => {
    if (!matchCount) return;
    const safeCursor = Math.min(cursor, matchCount - 1);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((safeCursor + 1) % matchCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((safeCursor - 1 + matchCount) % matchCount);
    } else if (event.key === "Enter" && q) {
      const target = flatMatches[safeCursor];
      if (target?.href) {
        event.preventDefault();
        router.push(target.href);
        setFilter("");
        setCursor(0);
        searchRef.current?.blur();
      }
    }
  };

  const clearFilter = () => {
    setFilter("");
    setCursor(0);
    searchRef.current?.focus();
  };

  /* Preference handlers */
  const togglePin = (href) =>
    setPins((previous) => {
      if (previous.includes(href)) return previous.filter((h) => h !== href);
      if (previous.length >= MAX_PINS) return previous;
      return [...previous, href];
    });

  const toggleGroup = (groupId) =>
    setClosedGroups((previous) =>
      previous.includes(groupId)
        ? previous.filter((id) => id !== groupId)
        : [...previous, groupId],
    );

  const toggleWidget = (widgetId, visible) =>
    setHiddenWidgets((previous) =>
      visible
        ? previous.filter((id) => id !== widgetId)
        : previous.includes(widgetId)
          ? previous
          : [...previous, widgetId],
    );

  const resetSidebar = () => {
    setPins(NO_ITEMS);
    setRecents(NO_ITEMS);
    setClosedGroups(NO_ITEMS);
    setHiddenWidgets(NO_ITEMS);
    setCompact(false);
  };

  /* Widgets */
  const available = {
    course: Boolean(course),
    badge: Boolean(latestBadge),
    upcoming: Array.isArray(upcoming) && upcoming.length > 0,
    donate: Boolean(showDonate),
    streak: streak != null,
  };
  const widgetOptions = WIDGET_OPTIONS.filter(
    (option) => !option.needs || available[option.needs],
  );
  const showWidget = (id) => !hiddenWidgets.includes(id);
  const visibleWidgetCount = widgetOptions.filter((option) =>
    showWidget(option.id),
  ).length;

  const collapseButton = (
    <RailTip label="Expand sidebar" hint={`${modKey} + B`} enabled={collapsed}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        aria-keyshortcuts="Control+B Meta+B"
        title={`${collapsed ? "Expand" : "Collapse"} sidebar (${modKey}+B)`}
        className={cn(
          "group/collapse grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-border bg-muted/40 text-muted-foreground transition-colors hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/10 hover:text-violet-700 dark:hover:text-violet-300",
          FOCUS,
        )}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4 transition-transform group-hover/collapse:translate-x-0.5 motion-reduce:transition-none" />
        ) : (
          <PanelLeftClose className="size-4 transition-transform group-hover/collapse:-translate-x-0.5 motion-reduce:transition-none" />
        )}
      </button>
    </RailTip>
  );

  return (
    <MotionConfig reducedMotion="user">
      <aside
        aria-label="Student sidebar"
        data-state={collapsed ? "collapsed" : "open"}
        className="sticky top-0 z-40 hidden h-dvh w-full min-w-0 flex-col border-r border-border bg-background lg:flex"
      >
        {/* HEADER */}
        <div
          className={cn(
            "relative z-10 flex min-h-16 shrink-0 items-center border-b border-border bg-background",
            collapsed ? "justify-center px-3" : "gap-3 px-4",
          )}
        >
          <Link
            href="/student"
            aria-label="Apni University dashboard"
            className={cn(
              "group/brand flex min-w-0 items-center gap-3 rounded-xl",
              FOCUS,
            )}
          >
            <LogoOrb />
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <h2 className="truncate text-[13px] font-extrabold tracking-[-0.025em] text-foreground">
                  Apni <span className={SELECTED_TEXT}>University</span>
                </h2>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-emerald-500"
                  />
                  <p className="truncate text-[10px] font-bold tracking-[0.14em] text-muted-foreground">
                    STUDENT WORKSPACE
                  </p>
                </div>
              </motion.div>
            )}
          </Link>

          {!collapsed && (
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Find a page"
                title={`Find a page (${modKey}+Shift+F)`}
                className={cn(
                  "group/action grid size-9 cursor-pointer place-items-center rounded-xl border border-transparent bg-muted/60 text-muted-foreground transition-colors hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10 hover:text-violet-700 dark:hover:text-violet-300",
                  FOCUS,
                )}
              >
                <Search className="size-4 transition-transform group-hover/action:scale-110" />
              </button>

              <Link
                href="/student/notifications"
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
                title="Notifications"
                className={cn(
                  "group/action relative grid size-9 place-items-center rounded-xl border border-transparent bg-muted/60 text-muted-foreground transition-colors hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/10 hover:text-violet-700 dark:hover:text-violet-300",
                  FOCUS,
                )}
              >
                <Bell className="size-4 transition-transform group-hover/action:-rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-background bg-[#FACC15] px-1 text-[10px] font-extrabold leading-none text-[#111318]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </div>
          )}
        </div>

        {/* SEARCH + NAVIGATION + WIDGETS */}
        <div
          ref={scrollRef}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="space-y-5 p-3">
            {collapsed ? (
              <RailTip
                label="Find a page"
                hint={`${modKey} + Shift + F`}
                enabled
              >
                <button
                  type="button"
                  onClick={openSearch}
                  aria-label="Find a page"
                  className={cn(
                    "mx-auto grid size-10 cursor-pointer place-items-center rounded-xl border border-border bg-muted/40 text-muted-foreground transition-colors hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/10 hover:text-violet-700 dark:hover:text-violet-300",
                    FOCUS,
                  )}
                >
                  <Search className="size-4" />
                </button>
              </RailTip>
            ) : (
              <div>
                <div className="group/search relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/search:text-[#8B5CF6]" />
                  <input
                    ref={searchRef}
                    value={filter}
                    onChange={(event) => {
                      setFilter(event.target.value);
                      setCursor(0);
                    }}
                    onKeyDown={onSearchKey}
                    placeholder="Find a page…"
                    aria-label="Find a page"
                    aria-keyshortcuts="Control+Shift+F Meta+Shift+F"
                    autoComplete="off"
                    className={cn(
                      "h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-9 xl:pr-[5.5rem]",
                      "text-[13px] font-medium tracking-[-0.01em] text-foreground outline-none transition-all duration-200",
                      "placeholder:font-normal placeholder:text-muted-foreground",
                      "hover:border-[#8B5CF6]/40 hover:bg-[#8B5CF6]/[0.03]",
                      "focus:border-[#8B5CF6] focus:bg-background focus:ring-4 focus:ring-[#8B5CF6]/15",
                    )}
                  />
                  <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                    <AnimatePresence>
                      {filter && (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          onClick={clearFilter}
                          aria-label="Clear search"
                          className={cn(
                            "grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-[#8B5CF6]/10 hover:text-violet-700 dark:hover:text-violet-300",
                            FOCUS,
                          )}
                        >
                          <X className="size-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                    {!filter && (
                      <span
                        aria-hidden="true"
                        className="hidden items-center gap-1 xl:flex"
                      >
                        <Kbd>{modKey}</Kbd>
                        <Kbd>⇧</Kbd>
                        <Kbd>F</Kbd>
                      </span>
                    )}
                  </div>
                </div>

                {q && (
                  <p
                    className="mt-1.5 px-1 text-[11px] text-muted-foreground"
                    aria-live="polite"
                  >
                    {matchCount} {matchCount === 1 ? "match" : "matches"}
                    {matchCount > 1 && " · ↑ ↓ to move"}
                    {matchCount > 0 && " · Enter to open"}
                  </p>
                )}
              </div>
            )}

            {/* NAVIGATION GROUPS */}
            <nav aria-label="Student menu" className="space-y-4">
              {renderedGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: index * 0.03 }}
                >
                  <NavGroup
                    groupId={group.id}
                    title={group.title}
                    items={group.items}
                    pathname={pathname}
                    collapsed={collapsed}
                    searching={Boolean(q)}
                    open={!closedGroups.includes(group.id)}
                    onToggle={toggleGroup}
                    liveNow={liveNow}
                    first={index === 0}
                    compact={compact}
                    query={q}
                    highlightHref={highlightHref}
                    pins={pins}
                    onTogglePin={togglePin}
                  />
                </motion.div>
              ))}

              {!groups.length && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-dashed border-border bg-muted/30 px-3 py-6 text-center"
                >
                  <span className="mx-auto mb-3 grid size-10 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
                    <Search className="size-5" />
                  </span>
                  <p className="text-[13px] font-bold text-foreground">
                    No pages found
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Try another search term.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilter}
                    className={cn(
                      "group/clear mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors hover:bg-[#8B5CF6]/10",
                      SELECTED_TEXT,
                      FOCUS,
                    )}
                  >
                    Clear search
                    <ArrowRight className="size-3.5 transition-transform group-hover/clear:translate-x-1" />
                  </button>
                </motion.div>
              )}
            </nav>

            {/* RECENT PAGES */}
            {!collapsed && !q && (
              <RecentList items={recentItems} pathname={pathname} />
            )}

            {/* EXPANDED DASHBOARD WIDGETS */}
            {!collapsed && !q && (
              <div className="space-y-5 border-t border-border pt-4">
                <div className="flex items-center justify-between px-2">
                  <SectionLabel>Dashboard</SectionLabel>
                  <button
                    type="button"
                    onClick={() => setCustomizeOpen((value) => !value)}
                    aria-expanded={customizeOpen}
                    aria-controls={customizeId}
                    className={cn(
                      "group/customize inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors hover:bg-[#8B5CF6]/10",
                      customizeOpen
                        ? SELECTED_TEXT
                        : "text-muted-foreground hover:text-violet-700 dark:hover:text-violet-300",
                      FOCUS,
                    )}
                  >
                    <SlidersHorizontal
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover/customize:rotate-6 motion-reduce:transition-none"
                    />
                    Customize
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {customizeOpen && (
                    <CustomizePanel
                      id={customizeId}
                      options={widgetOptions}
                      hidden={hiddenWidgets}
                      onToggleWidget={toggleWidget}
                      compact={compact}
                      onCompact={setCompact}
                      onReset={resetSidebar}
                    />
                  )}
                </AnimatePresence>

                {showWidget("quick") && (
                  <QuickTiles unreadCount={unreadCount} />
                )}
                {course && showWidget("continue") && (
                  <ContinueCard course={course} />
                )}
                {showWidget("progress") && <SidebarProgress stats={stats} />}
                {showWidget("achievement") && (
                  <AchievementPreview badge={latestBadge} />
                )}
                {available.upcoming && showWidget("upnext") && (
                  <UpNext items={upcoming} />
                )}
                {showDonate && showWidget("donate") && <DonateBanner />}
                {showWidget("promo") && <SidebarPromo />}
                {showWidget("tip") && <SidebarTip />}
                {showWidget("streak") && <StudyStreak streak={streak} />}

                {visibleWidgetCount === 0 && (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-3 py-5 text-center">
                    <p className="text-[13px] font-bold text-foreground">
                      All widgets are hidden
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      Open Customize to bring them back.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* COLLAPSED DASHBOARD WIDGETS */}
            {collapsed && !q && <RailWidgets streak={streak} course={course} />}
          </div>
        </div>

        {/* FOOTER */}
        <div
          className={cn(
            "relative shrink-0 border-t border-border bg-background",
            collapsed
              ? "flex flex-col items-center gap-2 p-3"
              : "space-y-2 p-3",
          )}
        >
          <AnimatePresence>
            {shortcutsOpen && !collapsed && (
              <ShortcutsPanel
                id={shortcutsId}
                modKey={modKey}
                onClose={() => setShortcutsOpen(false)}
              />
            )}
          </AnimatePresence>

          {collapsed && collapseButton}

          {collapsed && (
            <RailTip label={name} hint="Your profile" enabled>
              <Link
                href="/student/profile"
                aria-label="Your profile"
                className={cn(
                  "block rounded-full transition-transform hover:scale-105 motion-reduce:hover:scale-100",
                  FOCUS,
                )}
              >
                <LevelAvatar person={person} xp={xp} />
              </Link>
            </RailTip>
          )}

          {!collapsed && <UserChip person={person} />}

          <div className={cn(!collapsed && "flex items-center gap-2")}>
            <div
              ref={logoutRef}
              className={collapsed ? "hidden" : "min-w-0 flex-1"}
            >
              <LogoutButton className="w-full" />
            </div>
            {!collapsed && collapseButton}
          </div>

          {collapsed && (
            <RailTip label="Log out" enabled>
              <button
                type="button"
                onClick={triggerLogout}
                aria-label="Log out"
                className="grid size-10 cursor-pointer place-items-center rounded-xl border border-border text-muted-foreground outline-none transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-400/60 dark:hover:text-red-400"
              >
                <LogOut className="size-4" />
              </button>
            </RailTip>
          )}

          {!collapsed && (
            <div className="flex items-center justify-between gap-2 px-1 pt-1 text-[11px] font-medium text-muted-foreground [@media(max-height:720px)]:hidden">
              <Link
                href="/faq"
                className={cn(
                  "rounded transition-colors hover:text-foreground",
                  FOCUS,
                )}
              >
                Help
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "rounded transition-colors hover:text-foreground",
                  FOCUS,
                )}
              >
                Contact
              </Link>
              <button
                type="button"
                onClick={() => setShortcutsOpen((value) => !value)}
                aria-expanded={shortcutsOpen}
                aria-controls={shortcutsId}
                aria-keyshortcuts="?"
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded transition-colors hover:text-foreground",
                  FOCUS,
                )}
              >
                <Keyboard aria-hidden="true" className="size-3.5" />
                Keys
              </button>
              <span className="tabular-nums" suppressHydrationWarning>
                &copy; {year}
              </span>
            </div>
          )}
        </div>
      </aside>
    </MotionConfig>
  );
}

export default StudentSidebar;
