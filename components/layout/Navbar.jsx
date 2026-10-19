"use client";

import { memo, useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { ArrowUpRight, Sparkles } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";

import { MobileNav } from "./MobileNav";
import { AuthNav } from "@/components/auth/AuthNav";
import { primaryNav, moreNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "./AnimatedLogo";
import { ModeToggle } from "./ModeToggle";
import { CommandTrigger } from "./CommandPalette";

/* -------------------------------------------------------
   Brand colors:
   Yellow = energy / learning
   Purple = innovation / technology
------------------------------------------------------- */

const BRAND = {
  yellow: "bg-yellow-400",
  purple: "text-purple-600 dark:text-purple-400",
};

/* -------------------------------------------------------
   Route helpers
------------------------------------------------------- */

function normalizePath(path) {
  if (!path) return "/";
  if (path === "/") return "/";
  return path.replace(/\/+$/, "");
}

function isActive(pathname, href) {
  const current = normalizePath(pathname);
  const target = normalizePath(href);

  if (!target) return false;
  if (target === "/") return current === "/";

  return current === target || current.startsWith(`${target}/`);
}

/* -------------------------------------------------------
   Motion presets
------------------------------------------------------- */

const menuListVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.025,
    },
  },
};

const menuItemVariants = {
  hidden: {
    opacity: 0,
    y: 7,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 28,
    },
  },
};

const hoverIconVariants = {
  idle: {
    rotate: 0,
    scale: 1,
  },
  hover: {
    rotate: -8,
    scale: 1.06,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 15,
    },
  },
};

/* -------------------------------------------------------
   Scroll progress
------------------------------------------------------- */

const ScrollProgress = memo(function ScrollProgress({ reduce }) {
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[2px]",
        "origin-left bg-yellow-400",
        "after:absolute after:inset-y-0 after:right-0 after:w-1/3",
        "after:bg-purple-500",
      )}
      style={{
        scaleX: reduce ? scrollYProgress : smoothProgress,
      }}
    />
  );
});

ScrollProgress.displayName = "ScrollProgress";

/* -------------------------------------------------------
   Navigation badge
------------------------------------------------------- */

function NavBadge({ children }) {
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center gap-1.5 rounded-full",
        "border border-purple-500/20 bg-purple-500/[0.08]",
        "px-2 py-0.5 text-[10px] font-bold leading-none",
        "text-purple-700 dark:text-purple-300",
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-yellow-400"
      />
      {children}
    </span>
  );
}

/* -------------------------------------------------------
   Hover underline
------------------------------------------------------- */

function HoverUnderline() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-3 bottom-1",
        "h-[2px] origin-right scale-x-0 rounded-full",
        "bg-purple-500/70 transition-transform duration-300",
        "group-hover:origin-left group-hover:scale-x-100",
        "group-focus-visible:origin-left group-focus-visible:scale-x-100",
        "motion-reduce:transition-none",
      )}
    />
  );
}

/* -------------------------------------------------------
   Active underline
------------------------------------------------------- */

function ActiveUnderline({ transition }) {
  return (
    <motion.span
      layoutId="apni-navbar-active-underline"
      aria-hidden="true"
      transition={transition}
      className={cn(
        "pointer-events-none absolute inset-x-3 bottom-1",
        "h-[2px] rounded-full bg-purple-600",
        "dark:bg-purple-400",
      )}
    />
  );
}

/* -------------------------------------------------------
   Dropdown link
------------------------------------------------------- */

const MoreMenuItem = memo(function MoreMenuItem({
  item,
  pathname,
  reduce,
  onNavigate,
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <motion.li
      variants={menuItemVariants}
      whileHover="hover"
      whileTap={reduce ? undefined : { scale: 0.99 }}
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group/item relative flex min-w-0 items-center gap-3",
          "overflow-hidden rounded-xl px-3 py-3",
          "outline-none transition-colors duration-200",
          "hover:bg-purple-500/[0.07]",
          "focus-visible:bg-purple-500/[0.07]",
          "focus-visible:ring-2 focus-visible:ring-purple-500/50",
          active && "bg-purple-500/[0.08]",
        )}
      >
        {/* Active indicator */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-2 left-0 w-[3px] rounded-full",
            "bg-purple-600 transition-transform duration-200",
            "dark:bg-purple-400",
            active ? "scale-y-100" : "scale-y-0 group-hover/item:scale-y-100",
          )}
        />

        {Icon ? (
          <motion.span
            variants={reduce ? undefined : hoverIconVariants}
            initial="idle"
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl",
              "border border-border/80 bg-background",
              "text-muted-foreground shadow-sm",
              "transition-colors duration-200",
              "group-hover/item:border-purple-500/30",
              "group-hover/item:bg-purple-500/[0.07]",
              "group-hover/item:text-purple-600",
              "dark:group-hover/item:text-purple-300",
              active &&
                "border-purple-500/25 bg-purple-500/[0.08] text-purple-600 dark:text-purple-300",
            )}
          >
            <Icon aria-hidden="true" className="size-[18px]" />
          </motion.span>
        ) : (
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background"
          >
            <Sparkles className="size-4 text-purple-500" />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center">
            <span className="truncate text-sm font-semibold">{item.label}</span>

            {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
          </span>

          {item.description ? (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {item.description}
            </span>
          ) : null}
        </span>

        {active ? (
          <FiCheck
            aria-hidden="true"
            className="size-4 shrink-0 text-purple-600 dark:text-purple-300"
          />
        ) : (
          <ArrowUpRight
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              "opacity-0 -translate-x-1 translate-y-1",
              "transition-all duration-200",
              "group-hover/item:translate-x-0",
              "group-hover/item:translate-y-0",
              "group-hover/item:opacity-100",
              "group-focus-visible/item:opacity-100",
            )}
          />
        )}
      </Link>
    </motion.li>
  );
});

MoreMenuItem.displayName = "MoreMenuItem";

/* -------------------------------------------------------
   Navbar
------------------------------------------------------- */

export function Navbar({ brand }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [hovered, setHovered] = useState(null);

  /* Scroll behavior */

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    const nextScrolled = latest > 8;
    const nextHidden = latest > previous && latest > 160;

    setScrolled((current) =>
      current === nextScrolled ? current : nextScrolled,
    );

    setHidden((current) => (current === nextHidden ? current : nextHidden));
  });

  /* Active routes */

  const moreActive = moreNav.some((item) => isActive(pathname, item.href));

  const springTransition = reduce
    ? { duration: 0 }
    : {
        type: "spring",
        stiffness: 380,
        damping: 32,
      };

  const handleNavigate = useCallback(() => {
    setMoreOpen(false);
    setHovered(null);
  }, []);

  const handleFocusCapture = useCallback(() => {
    setFocusWithin(true);
  }, []);

  const handleBlurCapture = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusWithin(false);
      setHovered(null);
    }
  }, []);

  const shouldHide = hidden && !moreOpen && !focusWithin;

  return (
    <motion.header
      initial={false}
      animate={{
        y: shouldHide ? "-100%" : "0%",
      }}
      transition={
        reduce
          ? { duration: 0 }
          : {
              duration: 0.26,
              ease: [0.22, 1, 0.36, 1],
            }
      }
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
      className={cn(
        "sticky top-0 z-40 w-full",
        "border-b bg-background/95 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/80",
        "transition-[border-color,box-shadow] duration-300",
        "motion-reduce:transition-none",
        scrolled
          ? "border-border/80 shadow-sm shadow-black/[0.04] dark:shadow-black/10"
          : "border-transparent",
      )}
    >
      {/* Skip navigation */}
      <a
        href="#main-content"
        className={cn(
          "sr-only rounded-lg bg-purple-600 px-4 py-2",
          "text-sm font-semibold text-white",
          "focus:not-sr-only focus:fixed focus:left-4 focus:top-3",
          "focus:z-[100] focus:outline-none focus:ring-2",
          "focus:ring-purple-400 focus:ring-offset-2",
        )}
      >
        Skip to content
      </a>

      {/* Main navigation container */}
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between",
          "gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8",
          "transition-[min-height] duration-300 motion-reduce:transition-none",
          scrolled ? "min-h-14" : "min-h-16",
        )}
      >
        {/* Brand */}
        <motion.div
          initial={false}
          animate={
            reduce
              ? undefined
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          whileHover={reduce ? undefined : { scale: 1.015 }}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          className="min-w-0 shrink-0"
        >
          <Link
            href="/"
            aria-label="Apni University home"
            onClick={handleNavigate}
            className={cn(
              "block rounded-lg outline-none",
              "focus-visible:ring-2 focus-visible:ring-purple-500",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            <AnimatedLogo tagline="Learn Skills. Build Your Future." />
          </Link>
        </motion.div>

        {/* Desktop primary navigation */}
        <nav
          aria-label="Primary navigation"
          onMouseLeave={() => setHovered(null)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setHovered(null);
            }
          }}
          className="hidden items-center gap-0.5 lg:flex xl:gap-1"
        >
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);

            return (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  onClick={handleNavigate}
                  onMouseEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative isolate inline-flex items-center",
                    "rounded-lg px-3 py-2.5",
                    "text-[13px] font-semibold tracking-tight",
                    "outline-none transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-purple-500/60",
                    active
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {/* Sliding hover surface */}
                  {hovered === item.href ? (
                    <motion.span
                      layoutId="apni-navbar-hover-surface"
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 -z-10 rounded-lg",
                        "border border-purple-500/10",
                        "bg-purple-500/[0.07]",
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={springTransition}
                    />
                  ) : null}

                  <span className="relative inline-flex items-center">
                    {item.label}
                    {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
                  </span>

                  {active ? (
                    <ActiveUnderline transition={springTransition} />
                  ) : (
                    <HoverUnderline />
                  )}
                </Link>
              </div>
            );
          })}

          {/* More menu */}
          <Popover open={moreOpen} onOpenChange={setMoreOpen}>
            <PopoverTrigger
              aria-label="Open more navigation links"
              aria-expanded={moreOpen}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "group relative h-10 gap-1.5 rounded-lg px-3",
                "text-[13px] font-semibold tracking-tight",
                "outline-none transition-colors duration-200",
                "focus-visible:ring-2 focus-visible:ring-purple-500/60",
                "hover:bg-purple-500/[0.07]",
                "active:scale-[0.98] motion-reduce:active:scale-100",
                moreActive
                  ? "text-purple-700 dark:text-purple-300"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              More
              <FiChevronDown
                aria-hidden="true"
                className={cn(
                  "size-4 transition-transform duration-200",
                  moreOpen && "rotate-180",
                  "motion-reduce:transition-none",
                )}
              />
              {moreActive ? (
                <ActiveUnderline transition={springTransition} />
              ) : (
                <HoverUnderline />
              )}
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              collisionPadding={12}
              className={cn(
                // Responsive width
                "relative w-[calc(100vw-1.5rem)] h-100 sm:w-[21rem]",

                // Height and scrolling
                "max-h-[min(70dvh,32rem)] overflow-x-hidden overflow-y-auto",

                // Appearance
                "rounded-2xl border border-border/80",
                "bg-popover p-2 text-popover-foreground",
                "shadow-xl shadow-black/[0.08] dark:shadow-black/30",

                // Smooth scrolling and scrollbar
                "overscroll-contain scroll-smooth",
                "[scrollbar-width:thin]",
                "[scrollbar-color:hsl(var(--border))_transparent]",
              )}
            >
              {/* Dropdown heading */}
              <div className="relative mb-1 flex items-center gap-3 rounded-xl px-3 py-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-xl",
                    "bg-yellow-400 text-purple-950",
                  )}
                >
                  <Sparkles className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold tracking-tight">
                    Explore Apni University
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Discover more learning opportunities
                  </p>
                </div>
              </div>

              <div className="mx-2 mb-2 h-px bg-border/80" />

              {/* Scrollable navigation */}
              <motion.ul
                className="relative space-y-1"
                variants={menuListVariants}
                initial={reduce ? false : "hidden"}
                animate="show"
              >
                {moreNav.map((item) => (
                  <MoreMenuItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    reduce={reduce}
                    onNavigate={handleNavigate}
                  />
                ))}
              </motion.ul>

              <div className="mx-2 mt-2 h-px bg-border/80" />

              <p className="px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                Learn practical skills. Build real-world projects. Shape your
                future.
              </p>
            </PopoverContent>
          </Popover>
        </nav>

        {/* Right-side actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <CommandTrigger className="cursor-pointer" />

          <ModeToggle />

          <div className="hidden lg:block">
            <AuthNav />
          </div>

          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>

      {/* Scroll progress indicator */}
      <ScrollProgress reduce={Boolean(reduce)} />
    </motion.header>
  );
}
