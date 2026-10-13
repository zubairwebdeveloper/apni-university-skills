"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  FiArrowRight,
  FiAward,
  FiBell,
  FiBookOpen,
  FiChevronDown,
  FiClipboard,
  FiCommand,
  FiFolder,
  FiGift,
  FiHeart,
  FiHome,
  FiLifeBuoy,
  FiLogOut,
  FiPlay,
  FiSearch,
  FiSettings,
  FiStar,
  FiTarget,
  FiUser,
  FiUsers,
  FiVideo,
  FiX,
  FiZap,
} from "react-icons/fi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NAV_LINKS, USER_MENU } from "@/lib/student-header-data";
import { useSidebar } from "./SidebarContext";
import { UserChip } from "./UserChip";
import { SidebarProgress, SidebarPromo, SidebarTip } from "./SidebarExtras";

/* ================================================================
   DESIGN SYSTEM — solid colors, violet brand, amber accent
================================================================ */

const XP_PER_LEVEL = 500;

const NAV_ICONS = {
  dashboard: FiHome,
  book: FiBookOpen,
  video: FiVideo,
  users: FiUsers,
  library: FiFolder,
  user: FiUser,
  trophy: FiAward,
  settings: FiSettings,
  help: FiLifeBuoy,
};

const QUICK_TILES = [
  { label: "Progress", href: "/student/progress", icon: FiTarget },
  { label: "Wishlist", href: "/student/wishlist", icon: FiHeart },
  { label: "Reviews", href: "/student/reviews", icon: FiStar },
  { label: "Alerts", href: "/student/notifications", icon: FiBell },
  { label: "Achievements", href: "/student/achievements", icon: FiAward },
  { label: "Support", href: "/student/support", icon: FiLifeBuoy },
];

const UPCOMING_STYLE = {
  live: { icon: FiVideo, tone: "bg-red-500/10 text-red-600 dark:text-red-400" },
  assignment: {
    icon: FiClipboard,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  quiz: {
    icon: FiTarget,
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
};

const isActivePath = (pathname, href) =>
  href === "/student" ? pathname === href : pathname?.startsWith(href);

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
   3D TILT PANEL
================================================================ */

function TiltPanel({ children, className, max = 4 }) {
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
   ANIMATED BRAND LOGO
================================================================ */

function LogoOrb() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="relative grid size-11 shrink-0 place-items-center"
      style={{ perspective: 400 }}
      whileHover={reduceMotion ? undefined : { scale: 1.06 }}
      transition={{ type: "spring", stiffness: 300, damping: 18 }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border border-violet-500/50"
        style={{ rotateX: 65 }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute inset-1 rounded-full border border-amber-400/70"
        style={{ rotateX: 65, rotateZ: 55 }}
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      />
      <motion.span
        className="absolute right-0 top-1 size-2 rounded-full bg-amber-400"
        animate={
          reduceMotion ? undefined : { y: [0, 3, 0], scale: [1, 1.2, 1] }
        }
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="relative grid size-9 place-items-center rounded-xl bg-violet-700 text-white shadow-lg shadow-violet-900/20"
        style={{ transformStyle: "preserve-3d" }}
        whileHover={
          reduceMotion ? undefined : { rotateY: 12, rotateX: -8, z: 10 }
        }
        transition={{ type: "spring", stiffness: 250, damping: 16 }}
      >
        <FiBookOpen className="size-[18px]" />
      </motion.span>
    </motion.span>
  );
}

/* ================================================================
   COLLAPSED RAIL TOOLTIP
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
            exit={{ opacity: 0 }}
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
   NAVIGATION ITEM — purple type + animated arrow
================================================================ */

function NavItem({ item, active, collapsed, liveNow }) {
  const Icon = NAV_ICONS[item.icon] ?? FiStar;
  const isLive = liveNow && item.icon === "video";

  return (
    <RailTip label={item.label} hint={item.description} enabled={collapsed}>
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex min-h-11 items-center gap-3 rounded-xl px-2 py-1.5",
          "outline-none transition-all duration-200 ease-out",
          "hover:translate-x-0.5 motion-reduce:transform-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef07a2]",
          collapsed && "justify-center px-1",
          active
            ? "font-semibold text-[#ef07a2]"
            : "font-medium text-muted-foreground hover:text-[#ef07a2]",
        )}
      >
        {/* Hover background */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-xl transition-all duration-200",
            active
              ? "bg-[#ef07a2]/10 ring-1 ring-[#ef07a2]/25"
              : "bg-transparent group-hover:bg-[#ef07a2]/[0.07]",
          )}
        />

        {/* Active indicator */}
        {active && (
          <motion.span
            layoutId="sidebar-active-bar"
            className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-[#ef07a2]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}

        {/* Animated icon */}
        <motion.span
          className={cn(
            "relative grid size-9 shrink-0 place-items-center rounded-lg",
            "transition-colors duration-200",
            active
              ? "bg-[#ef07a2] text-white shadow-md shadow-[#ef07a2]/20"
              : "bg-muted/60 text-muted-foreground group-hover:bg-[#ef07a2]/10 group-hover:text-[#ef07a2]",
          )}
          whileHover={{ y: -2, rotateY: 5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 350, damping: 18 }}
        >
          <Icon className="size-[17px]" />

          {isLive && (
            <span className="absolute -right-0.5 -top-0.5 flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-70 motion-reduce:animate-none" />
              <span className="relative size-2.5 rounded-full border-2 border-background bg-red-500" />
            </span>
          )}
        </motion.span>

        {!collapsed && (
          <>
            {/* Pink navigation typography */}
            <span
              className={cn(
                "relative min-w-0 flex-1 truncate text-[13px]",
                "tracking-[-0.015em] transition-colors duration-200",
                active
                  ? "font-bold text-[#ef07a2]"
                  : "font-medium text-foreground/75 group-hover:font-semibold group-hover:text-[#ef07a2]",
              )}
            >
              {item.label}
            </span>

            {/* Live badge */}
            {isLive && (
              <span className="relative rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                Live
              </span>
            )}

            {/* Item badge */}
            {item.badge && !isLive && (
              <span className="relative rounded-md border border-[#ef07a2]/20 bg-[#ef07a2]/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#ef07a2]">
                {item.badge}
              </span>
            )}

            {/* Animated pink arrow */}

            <motion.span
              aria-hidden="true"
              initial={false}
              animate={{
                x: active ? 0 : -4,
                opacity: active ? 1 : 0,
                scale: active ? 1 : 0.85,
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 20,
              }}
              className={cn(
                "relative grid size-6 shrink-0 place-items-center rounded-md",
                "text-[#ef07a2]",
                "group-hover:!translate-x-1 group-hover:!opacity-100",
                "group-focus-visible:!opacity-100",
                active && "bg-[#ef07a2]/10",
              )}
            >
              <motion.span
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <FiArrowRight className="size-3.5" />
              </motion.span>
            </motion.span>
          </>
        )}
      </Link>
    </RailTip>
  );
}

/* ================================================================
   COLLAPSIBLE NAVIGATION GROUP
================================================================ */

function NavGroup({ title, items, pathname, collapsed, liveNow, first }) {
  const hasActiveItem = items.some((item) => isActivePath(pathname, item.href));
  const [open, setOpen] = useState(true);
  const expanded = collapsed ? false : open;
  return (
    <section
      className="relative min-w-0"
      aria-label={`${title} navigation group`}
    >
      {/* Group heading */}
      {!collapsed ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={expanded}
          className={cn(
            "group/heading mb-2 flex w-full items-center gap-2.5",
            "rounded-lg px-2 py-2 text-left",
            "transition-colors duration-200",
            "hover:bg-[#ef07a2]/[0.06]",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-[#ef07a2] focus-visible:ring-offset-1",
            "focus-visible:ring-offset-background",
          )}
        >
          {/* Active indicator */}
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              scaleY: hasActiveItem ? 1 : 0.55,
              opacity: hasActiveItem ? 1 : 0.65,
            }}
            transition={{ duration: 0.2 }}
            className={cn(
              "h-4 w-[3px] shrink-0 origin-center rounded-full",
              "bg-border transition-colors duration-200",
              "group-hover/heading:bg-[#ef07a2]",
              hasActiveItem && "bg-[#ef07a2]",
            )}
          />

          {/* Group title */}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[10px]",
              "font-bold uppercase tracking-[0.15em]",
              "transition-colors duration-200",
              "text-muted-foreground",
              "group-hover/heading:text-[#ef07a2]",
              hasActiveItem && "text-[#ef07a2]",
            )}
          >
            {title}
          </span>

          {/* Item count */}
          <span
            className={cn(
              "grid min-w-6 shrink-0 place-items-center rounded-md",
              "border border-border bg-muted/60 px-1.5 py-0.5",
              "text-[9px] font-bold tabular-nums text-muted-foreground",
              "transition-all duration-200",
              "group-hover/heading:border-[#ef07a2]/30",
              "group-hover/heading:bg-[#ef07a2]/[0.08]",
              "group-hover/heading:text-[#ef07a2]",
              hasActiveItem &&
                "border-[#ef07a2]/25 bg-[#ef07a2]/[0.07] text-[#ef07a2]",
            )}
          >
            {items.length}
          </span>

          {/* Animated collapse arrow */}
          <motion.span
            aria-hidden="true"
            animate={{
              rotate: expanded ? 0 : -90,
              x: expanded ? 0 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 24,
            }}
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-md",
              "text-muted-foreground transition-colors duration-200",
              "group-hover/heading:bg-[#ef07a2]/10",
              "group-hover/heading:text-[#ef07a2]",
              hasActiveItem && "text-[#ef07a2]",
            )}
          >
            <FiChevronDown className="size-3.5" />
          </motion.span>
        </button>
      ) : (
        /* Divider in collapsed sidebar */
        !first && (
          <div
            aria-hidden="true"
            className="mx-auto mb-2 mt-1 h-px w-8 bg-border"
          />
        )
      )}

      {/* Navigation items */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.22, ease: "easeInOut" },
              opacity: { duration: 0.16 },
            }}
            className="space-y-1 overflow-hidden"
          >
            {items.map((item, index) => {
              const active = isActivePath(pathname, item.href);

              return (
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
                    active={active}
                    collapsed={collapsed}
                    liveNow={liveNow}
                  />
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ================================================================
   QUICK ACCESS TILES
================================================================ */

function QuickTiles({ unreadCount = 0 }) {
  return (
    <section aria-label="Quick access" className="space-y-3">
      {/* Section heading */}
      <div className="flex items-center flex-wrap justify-between px-2">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#ef07a2]">
          Quick access
        </p>

        <span className="rounded-md border border-[#ef07a2]/20 bg-[#ef07a2]/[0.06] px-1.5 py-0.5 text-[9px] font-bold text-[#ef07a2]">
          SHORTCUTS
        </span>
      </div>

      {/* Quick access tiles */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
        {QUICK_TILES.map((tile, index) => (
          <motion.div
            key={tile.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.04,
              duration: 0.25,
              ease: "easeOut",
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="min-w-0"
          >
            <TiltPanel max={4}>
              <Link
                href={tile.href}
                aria-label={tile.label}
                className={cn(
                  "group relative flex min-h-[58px] items-center gap-2 overflow-hidden",
                  "rounded-xl border border-border bg-card px-2.5 py-3",
                  "transition-colors duration-200",
                  "hover:border-[#ef07a2]/50 hover:bg-[#ef07a2]/[0.045]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[#ef07a2] focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-background",
                  "motion-reduce:transform-none",
                )}
              >
                {/* Hover accent line */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-2 left-0 w-[3px] rounded-r-full",
                    "origin-center scale-y-0 bg-[#ef07a2]",
                    "transition-transform duration-200",
                    "group-hover:scale-y-100 group-focus-visible:scale-y-100",
                  )}
                />

                {/* Icon container */}
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    "border border-border bg-muted/60",
                    "transition-all duration-200",
                    "group-hover:border-[#ef07a2]/25",
                    "group-hover:bg-[#ef07a2]/10",
                    "group-hover:shadow-sm group-hover:shadow-[#ef07a2]/10",
                  )}
                >
                  <tile.icon
                    aria-hidden="true"
                    className={cn(
                      "size-4 text-muted-foreground",
                      "transition-all duration-200",
                      "group-hover:scale-110 group-hover:text-[#ef07a2]",
                      "group-focus-visible:text-[#ef07a2]",
                    )}
                  />
                </span>

                {/* Label and optional subtitle */}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cn(
                      "truncate text-[11px] font-semibold tracking-tight",
                      "text-foreground/80 transition-colors duration-200",
                      "group-hover:text-[#ef07a2]",
                      "group-focus-visible:text-[#ef07a2]",
                    )}
                  >
                    {tile.label}
                  </span>

                  <span className="text-[9px] font-medium text-muted-foreground/70">
                    Open page
                  </span>
                </span>

                {/* Animated right arrow */}
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 22,
                  }}
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md",
                    "text-[#ef07a2] opacity-0",
                    "transition-all duration-200",
                    "group-hover:bg-[#ef07a2]/10 group-hover:opacity-100",
                    "group-focus-visible:bg-[#ef07a2]/10",
                    "group-focus-visible:opacity-100",
                  )}
                >
                  <motion.span
                    className="grid place-items-center"
                    whileHover={{ x: 2 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 15,
                    }}
                  >
                    <FiArrowRight className="size-3.5" />
                  </motion.span>
                </motion.span>

                {/* Unread notification count */}
                {tile.href === "/student/notifications" && unreadCount > 0 && (
                  <span
                    aria-label={`${unreadCount} unread notifications`}
                    className={cn(
                      "absolute right-1.5 top-1.5 grid min-w-4",
                      "place-items-center rounded-full",
                      "border border-card bg-[#ef07a2] px-1",
                      "text-[9px] font-extrabold leading-4 text-white",
                      "shadow-sm shadow-[#ef07a2]/20",
                    )}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            </TiltPanel>
          </motion.div>
        ))}
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
      <Link
        href={courseHref(course)}
        className={cn(
          "group relative block overflow-hidden rounded-2xl border border-border bg-card p-3 transition-colors hover:border-violet-500/40",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
        )}
      >
        <div className="relative flex items-start gap-3">
          <motion.span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-700 text-white shadow-md shadow-violet-900/15"
            style={{ transform: "translateZ(18px)" }}
            whileHover={{ rotateY: 12, rotateX: -8 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
          >
            <FiPlay className="size-4 translate-x-px" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700 dark:text-violet-300">
              Continue learning
            </p>
            <p className="truncate text-[13px] font-bold tracking-tight text-foreground">
              {course.title}
            </p>
            {course.lesson && (
              <p className="truncate text-xs text-muted-foreground">
                {course.lesson}
              </p>
            )}
          </div>
          <FiArrowRight className="mt-1 size-4 shrink-0 text-violet-600 transition-transform group-hover:translate-x-1 dark:text-violet-300" />
        </div>
        <div className="relative mt-3 flex items-center gap-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-label="Course progress"
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-violet-600"
            />
          </div>
          <span className="text-xs font-bold tabular-nums text-violet-700 dark:text-violet-300">
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
      <Link
        href="/student/achievements"
        className="group block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-violet-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <div className="flex items-center gap-3">
          <motion.span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-700 text-white"
            style={{ transform: "translateZ(16px)" }}
            whileHover={{ rotateY: 12, rotateX: -8 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
          >
            <FiAward className="size-4" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700 dark:text-violet-300">
              Latest achievement
            </p>
            <p className="truncate text-[13px] font-bold tracking-tight">
              {badge.title}
            </p>
          </div>
          <FiArrowRight className="size-4 text-violet-600 transition-transform group-hover:translate-x-1 dark:text-violet-300" />
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
      <Link
        href="/student/donate"
        className="group block rounded-2xl border border-border bg-card p-3 transition-colors hover:border-amber-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <div className="flex items-center gap-3">
          <motion.span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500 text-white"
            style={{ transform: "translateZ(16px)" }}
            whileHover={{ rotateY: 10, scale: 1.04 }}
          >
            <FiGift className="size-4" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold tracking-tight">
              Support a student
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Fund scholarships and devices
            </p>
          </div>
          <FiArrowRight className="size-4 text-amber-600 transition-transform group-hover:translate-x-1 dark:text-amber-300" />
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
        <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-violet-700 dark:text-violet-300">
          Up next
        </p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
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
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-2 py-2 outline-none transition-colors hover:bg-violet-500/[0.05] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    style.tone,
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-violet-700 dark:group-hover:text-violet-300">
                    {item.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.time}
                  </span>
                </span>
                <FiArrowRight className="size-3.5 text-violet-600 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-violet-300" />
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
      className="group flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-3 outline-none transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300">
        <FiZap className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">
          Study streak
        </span>
        <span className="block truncate text-[13px] font-bold text-foreground">
          {streak} {streak === 1 ? "day" : "days"} in a row
        </span>
      </span>
      <FiArrowRight className="size-4 shrink-0 text-amber-600 transition-transform group-hover:translate-x-1 dark:text-amber-300" />
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
            className="relative grid size-10 place-items-center rounded-xl border border-border bg-muted/40 text-amber-600 outline-none transition-colors hover:border-amber-400/50 hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-amber-300"
          >
            <FiZap className="size-[18px]" />
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[9px] font-bold tabular-nums text-white">
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
            className="grid size-10 place-items-center rounded-xl bg-violet-700 text-white shadow-md shadow-violet-900/15 outline-none transition-colors hover:bg-violet-800 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <FiPlay className="size-4 translate-x-px" />
          </Link>
        </RailTip>
      )}
    </div>
  );
}

/* ================================================================
   PROFILE AVATAR + XP LEVEL — solid border, no gradient
================================================================ */

function LevelAvatar({ person, xp }) {
  const name = person?.name || person?.displayName || "Student";
  const hasXp = typeof xp === "number" && Number.isFinite(xp);
  const safeXp = hasXp ? Math.max(0, xp) : 0;
  const level = hasXp ? Math.floor(safeXp / XP_PER_LEVEL) + 1 : null;

  return (
    <div className="relative">
      <span
        className={cn(
          "grid size-11 place-items-center rounded-full border-2 p-[2px]",
          hasXp ? "border-violet-600" : "border-muted",
        )}
      >
        <Avatar className="size-full border-2 border-background">
          <AvatarImage src={person?.photoURL || undefined} alt={name} />
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
      </span>
      {hasXp && (
        <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-background bg-violet-700 px-1 text-[9px] font-bold text-white">
          {level}
        </span>
      )}
      <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
    </div>
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
  const searchTimerRef = useRef(null);
  const { open, setOpen } = useSidebar();
  const collapsed = !open;
  const [filter, setFilter] = useState("");
  const name = person?.name || person?.displayName || "Student";
  const streak = typeof person?.streak === "number" ? person.streak : null;
  const xp = typeof person?.xp === "number" ? person.xp : null;
  const course = person?.currentCourse ?? null;

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

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || target?.isContentEditable;

      if (event.key === "Escape" && filter) {
        setFilter("");
        return;
      }
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === "b") {
        if (isTyping) return;
        event.preventDefault();
        setOpen((previous) => !previous);
      } else if (key === "k") {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filter, openSearch, setOpen]);

  const triggerLogout = () =>
    logoutRef.current?.querySelector("button")?.click();
  const q = filter.trim().toLowerCase();
  const matches = (items) =>
    q
      ? items.filter((item) =>
          [item.label, item.description, item.href]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(q)),
        )
      : items;
  const groups = [
    { title: "Learn", items: matches(NAV_LINKS) },
    { title: "Account", items: matches(USER_MENU) },
  ].filter((group) => group.items.length > 0);
  const matchCount = groups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  const onSearchKey = (event) => {
    if (event.key === "Enter" && q) {
      const firstMatch = groups[0]?.items[0];
      if (firstMatch?.href) {
        event.preventDefault();
        router.push(firstMatch.href);
        setFilter("");
        searchRef.current?.blur();
      }
    }
  };

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
            className="group/brand flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
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
                  Apni{" "}
                  <span className="text-violet-700 dark:text-violet-300">
                    University
                  </span>
                </h2>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-emerald-500"
                  />
                  <p className="truncate text-[9px] font-bold tracking-[0.15em] text-muted-foreground">
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
                aria-label="Search student pages"
                title="Search pages (Ctrl/Cmd + K)"
                className="group/action grid size-9 place-items-center rounded-xl border border-transparent bg-muted/60 text-muted-foreground transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:text-violet-300"
              >
                <FiSearch className="size-4 transition-transform group-hover/action:scale-110" />
              </button>
              <Link
                href="/student/notifications"
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
                title="Notifications"
                className="group/action relative grid size-9 place-items-center rounded-xl border border-transparent bg-muted/60 text-muted-foreground transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:text-violet-300"
              >
                <FiBell className="size-4 transition-transform group-hover/action:-rotate-12" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid min-w-[17px] place-items-center rounded-full border-2 border-background bg-red-600 px-1 text-[9px] font-bold leading-[13px] text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <div
                title="Search shortcut"
                className="ml-1 hidden items-center gap-1 rounded-lg border border-border bg-background px-2 py-1.5 xl:flex"
              >
                <FiCommand className="size-3 text-violet-600 dark:text-violet-300" />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  K
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH + NAVIGATION + WIDGETS */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="space-y-5 p-3">
            {collapsed ? (
              <RailTip label="Find a page" hint="Ctrl/Cmd + K" enabled>
                <button
                  type="button"
                  onClick={openSearch}
                  aria-label="Find a page"
                  className="mx-auto grid size-10 place-items-center rounded-xl border border-border bg-muted/40 text-muted-foreground outline-none transition-colors hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-700 focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <FiSearch className="size-4" />
                </button>
              </RailTip>
            ) : (
              <div>
                <div className="group/search relative">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/search:text-violet-600 dark:group-focus-within/search:text-violet-300" />
                  <input
                    ref={searchRef}
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    onKeyDown={onSearchKey}
                    placeholder="Find a page..."
                    aria-label="Find a page"
                    aria-keyshortcuts="Control+K Meta+K"
                    autoComplete="off"
                    className={cn(
                      "h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-16",
                      "text-[13px] font-medium tracking-[-0.01em] text-foreground outline-none transition-all duration-200",
                      "placeholder:font-normal placeholder:text-muted-foreground",
                      "hover:border-violet-500/30 hover:bg-violet-500/[0.03]",
                      "focus:border-violet-500/60 focus:bg-background focus:ring-4 focus:ring-violet-500/10",
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
                          onClick={() => {
                            setFilter("");
                            searchRef.current?.focus();
                          }}
                          aria-label="Clear search"
                          className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300"
                        >
                          <FiX className="size-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                    {!filter && (
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Ctrl K
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
                    {matchCount > 0 && " · Press Enter to open"}
                  </p>
                )}
              </div>
            )}

            {/* NAVIGATION GROUPS */}
            <nav aria-label="Student menu" className="space-y-4">
              {groups.map((group, index) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: index * 0.03 }}
                >
                  <NavGroup
                    title={group.title}
                    items={group.items}
                    pathname={pathname}
                    collapsed={collapsed}
                    liveNow={liveNow}
                    first={index === 0}
                  />
                </motion.div>
              ))}
              {!groups.length && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/[0.03] px-3 py-6 text-center"
                >
                  <span className="mx-auto mb-3 grid size-10 place-items-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
                    <FiSearch className="size-5" />
                  </span>
                  <p className="text-[13px] font-bold text-foreground">
                    No pages found
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Try another search term.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFilter("");
                      searchRef.current?.focus();
                    }}
                    className="group/clear mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-violet-700 transition-colors hover:bg-violet-500/10 dark:text-violet-300"
                  >
                    Clear search{" "}
                    <FiArrowRight className="size-3.5 transition-transform group-hover/clear:translate-x-1" />
                  </button>
                </motion.div>
              )}
            </nav>

            {/* EXPANDED DASHBOARD WIDGETS */}
            {!collapsed && !q && (
              <div className="space-y-5 border-t border-border pt-4">
                <QuickTiles unreadCount={unreadCount} />
                {course && <ContinueCard course={course} />}
                <SidebarProgress stats={stats} />
                <AchievementPreview badge={latestBadge} />
                {upcoming.length > 0 && <UpNext items={upcoming} />}
                {showDonate && <DonateBanner />}
                <SidebarPromo />
                <SidebarTip />
                <StudyStreak streak={streak} />
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
          {collapsed && (
            <RailTip label={name} hint="Your profile" enabled>
              <Link
                href="/student/profile"
                aria-label="Your profile"
                className="block rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-violet-500 motion-reduce:hover:scale-100"
              >
                <LevelAvatar person={person} xp={xp} />
              </Link>
            </RailTip>
          )}
          {!collapsed && <UserChip person={person} />}
          <div ref={logoutRef} className={cn(collapsed && "hidden")}>
            <LogoutButton className="w-full" />
          </div>
          {collapsed && (
            <RailTip label="Log out" enabled>
              <button
                type="button"
                onClick={triggerLogout}
                aria-label="Log out"
                className="grid size-10 place-items-center rounded-xl border border-border text-muted-foreground outline-none transition-colors hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-400/50 dark:hover:text-red-400"
              >
                <FiLogOut className="size-4" />
              </button>
            </RailTip>
          )}
          {!collapsed && (
            <div className="flex items-center justify-between px-1 pt-1 text-[11px] font-medium text-muted-foreground [@media(max-height:720px)]:hidden">
              <Link
                href="/faq"
                className="transition-colors hover:text-violet-700 dark:hover:text-violet-300"
              >
                Help
              </Link>
              <Link
                href="/contact"
                className="transition-colors hover:text-violet-700 dark:hover:text-violet-300"
              >
                Contact
              </Link>
              <span className="tabular-nums">&copy; {year}</span>
            </div>
          )}
        </div>
      </aside>
    </MotionConfig>
  );
}

export default StudentSidebar;
