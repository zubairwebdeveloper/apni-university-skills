// components/layout/Navbar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { ArrowUpRight } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { AuthNav } from "@/components/auth/AuthNav";
import { primaryNav, moreNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { AnimatedLogo } from "./AnimatedLogo";
import { ModeToggle } from "./ModeToggle";
import { CommandTrigger } from "./CommandPalette";

const isActive = (pathname, href) =>
  pathname === href || pathname.startsWith(`${href}/`);

/* ------------------------------------------------------------------ */
/* Motion variants for the "More" menu                                 */
/* ------------------------------------------------------------------ */
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 380, damping: 30 },
  },
};

const iconVariants = {
  show: { rotate: 0, scale: 1 },
  hover: {
    rotate: [0, -10, 8, -4, 0],
    scale: 1.08,
    transition: { duration: 0.45 },
  },
};

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function ScrollProgress({ reduce }) {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-primary/50 via-primary to-primary/50"
    />
  );
}

// Underline that grows from the left on hover and shrinks out to the right.
function HoverUnderline({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-right scale-x-0 rounded-full bg-primary/60 transition-transform duration-300 ease-out",
        "group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100",
        "motion-reduce:transition-none",
        className,
      )}
    />
  );
}

// Active underline: one shared element that slides to the current link.
function ActiveUnderline({ transition }) {
  return (
    <motion.span
      layoutId="navbar-underline"
      aria-hidden="true"
      transition={transition}
      className="pointer-events-none absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary"
    />
  );
}

// Optional label for a nav item, e.g. { badge: "New" } in config/site.
function Badge({ children }) {
  return (
    <span className="relative ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary ring-1 ring-primary/20">
      <span
        aria-hidden="true"
        className="absolute -left-0.5 -top-0.5 size-1.5 rounded-full bg-primary motion-safe:animate-ping"
      />
      <span
        aria-hidden="true"
        className="absolute -left-0.5 -top-0.5 size-1.5 rounded-full bg-primary"
      />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */
export function Navbar({ brand }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [hovered, setHovered] = useState(null); // href of the hovered primary link

  // Shrink + shadow after a small scroll. Hide on scroll down, show on scroll up.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 8);
    setHidden(latest > prev && latest > 160);
  });

  const moreActive = moreNav.some((l) => isActive(pathname, l.href));
  const spring = reduce
    ? { duration: 0 }
    : { type: "spring", stiffness: 380, damping: 32 };

  const enter = (i) => ({
    initial: reduce ? false : { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: 0.05 * i },
  });

  // Never slide the bar away while a menu is open or keyboard focus is inside it.
  const shouldHide = hidden && !moreOpen && !focusWithin;

  return (
    <motion.header
      initial={false}
      animate={{ y: shouldHide ? "-100%" : "0%" }}
      transition={
        reduce ? { duration: 0 } : { duration: 0.3, ease: "easeInOut" }
      }
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false);
      }}
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur transition-[box-shadow,border-color] duration-300 supports-[backdrop-filter]:bg-background/70 motion-reduce:transition-none",
        scrolled
          ? "border-border shadow-sm shadow-foreground/5"
          : "border-transparent",
      )}
    >
      {/* Keyboard users can jump past the navigation */}
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to content
      </a>

      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center  justify-between gap-4 px-2 transition-[height] duration-300 sm:px-6 lg:px-8 motion-reduce:transition-none",
          scrolled ? "h-14" : "h-16",
        )}
      >
        {/* Logo */}
        <motion.div
          {...enter(0)}
          whileHover={reduce ? undefined : { scale: 1.02 }}
          whileTap={reduce ? undefined : { scale: 0.98 }}
          className="shrink-0 "
        >
          {/* <Logo {...brand} /> */}
          <AnimatedLogo tagline="Learn Skills. Build Your Future." />
        </motion.div>

        {/* Primary links */}
        <nav
          aria-label="Primary"
          onMouseLeave={() => setHovered(null)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setHovered(null);
          }}
          className="hidden items-center gap-1 lg:flex"
        >
          {primaryNav.map((l, i) => {
            const active = isActive(pathname, l.href);

            return (
              <motion.div key={l.href} {...enter(i + 1)}>
                <Link
                  href={l.href}
                  onClick={() => setMoreOpen(false)}
                  onMouseEnter={() => setHovered(l.href)}
                  onFocus={() => setHovered(l.href)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative isolate block rounded-md px-3 py-2 text-sm font-medium tracking-tight outline-none transition-colors duration-200",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    "active:scale-95 motion-reduce:active:scale-100",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {/* Highlight pill that glides from link to link */}
                  {hovered === l.href && (
                    <motion.span
                      layoutId="navbar-hover-pill"
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-md bg-accent ring-1 ring-border"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={spring}
                    />
                  )}

                  <span className="relative inline-block transition-transform duration-200 group-hover:-translate-y-px motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                    {l.label}
                    {l.badge ? <Badge>{l.badge}</Badge> : null}
                  </span>

                  {active ? (
                    <ActiveUnderline transition={spring} />
                  ) : (
                    <HoverUnderline />
                  )}
                </Link>
              </motion.div>
            );
          })}

          {/* More menu */}
          <motion.div {...enter(primaryNav.length + 1)}>
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
              <PopoverTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "group relative gap-1 overflow-hidden tracking-tight transition-all duration-200 hover:bg-accent active:scale-95 data-[state=open]:bg-accent data-[state=open]:text-foreground motion-reduce:transition-none motion-reduce:active:scale-100",
                  moreActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                More
                <FiChevronDown
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-y-0.5 group-data-[state=open]:rotate-180 group-data-[state=open]:group-hover:translate-y-0 motion-reduce:transition-none"
                />
                {/* Active underline slides here when the current page is inside More */}
                {moreActive ? (
                  <ActiveUnderline transition={spring} />
                ) : (
                  <HoverUnderline />
                )}
              </PopoverTrigger>

              <PopoverContent
                align="end"
                sideOffset={12}
                className="relative w-80 overflow-hidden border-border bg-popover p-1.5 text-popover-foreground shadow-xl shadow-foreground/10"
              >
                {/* Soft glow in the corner */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl"
                />

                <motion.ul
                  className="relative space-y-0.5"
                  variants={listVariants}
                  initial={reduce ? false : "hidden"}
                  animate="show"
                >
                  {moreNav.map((l) => {
                    const active = isActive(pathname, l.href);
                    const Icon = l.icon;

                    return (
                      <motion.li
                        key={l.href}
                        variants={itemVariants}
                        whileHover="hover"
                        whileTap={reduce ? undefined : { scale: 0.98 }}
                      >
                        <Link
                          href={l.href}
                          onClick={() => setMoreOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group/item relative flex items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200",
                            "hover:bg-accent hover:pl-4",
                            "focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                            "motion-reduce:transition-none motion-reduce:hover:pl-3",
                            active && "bg-accent font-medium",
                          )}
                        >
                          {/* Left accent bar grows on hover / active */}
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute inset-y-2 left-0 w-0.5 origin-center rounded-full bg-primary transition-transform duration-300 motion-reduce:transition-none",
                              active
                                ? "scale-y-100"
                                : "scale-y-0 group-hover/item:scale-y-100 group-focus-visible/item:scale-y-100",
                            )}
                          />

                          {Icon ? (
                            <motion.span
                              variants={reduce ? undefined : iconVariants}
                              className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground ring-1 ring-border transition-colors duration-200 group-hover/item:bg-primary/10 group-hover/item:text-primary group-hover/item:ring-primary/20"
                            >
                              <Icon aria-hidden="true" className="size-4" />
                            </motion.span>
                          ) : null}

                          <span className="min-w-0 flex-1">
                            <span className="relative inline-flex max-w-full items-center align-top">
                              <span className="truncate">{l.label}</span>
                              {l.badge ? <Badge>{l.badge}</Badge> : null}
                            </span>
                            {l.description ? (
                              <span className="block truncate text-xs font-normal text-muted-foreground">
                                {l.description}
                              </span>
                            ) : null}
                          </span>

                          <ArrowUpRight
                            aria-hidden="true"
                            className={cn(
                              "size-4 shrink-0 transition-all duration-300 motion-reduce:transition-none",
                              active
                                ? "text-primary opacity-100"
                                : "-translate-x-1 translate-y-1 text-muted-foreground opacity-0 group-hover/item:translate-x-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:translate-y-0 group-focus-visible/item:opacity-100",
                            )}
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </PopoverContent>
            </Popover>
          </motion.div>
        </nav>

        {/* Theme toggle + auth + mobile menu */}
        <motion.div
          {...enter(primaryNav.length + 2)}
          className="flex items-center gap-2"
        >
          <CommandTrigger className=" cursor-pointer  " />
          <ModeToggle />
          <div className="hidden lg:block ">
            <AuthNav />
          </div>
          <MobileNav />
        </motion.div>
      </div>

      <ScrollProgress reduce={reduce} />
    </motion.header>
  );
}
