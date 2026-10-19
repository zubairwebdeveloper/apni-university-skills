"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pause,
  Play,
  Sparkles,
  X,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const SLIDE_MS = 7000;
const DISMISS_KEY = "announcement-dismissed-at";
const DISMISS_HOURS = 24;

const BRAND_YELLOW = "#FACC15";
const BRAND_PURPLE = "#8B5CF6";

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "courses",
    status: "Explore",
    title: "Your next skill starts here.",
    description:
      "Learn practical technology skills and build real-world projects.",
    cta: "Explore courses",
    href: "/courses",
    accent: BRAND_YELLOW,
    icon: "sparkles",
  },
  {
    id: "ai",
    status: "Future ready",
    title: "Get ready for the AI era.",
    description: "Discover AI, automation and the tools shaping tomorrow.",
    cta: "Explore learning",
    href: "/courses",
    accent: BRAND_PURPLE,
    icon: "sparkles",
  },
  {
    id: "offer",
    status: "Special offer",
    title: "Your learning journey starts here.",
    description: "Use the code below on your first course.",
    code: "WELCOME10",
    endsAt: "2026-12-31T23:59:59+05:00",
    cta: "View courses",
    href: "/courses",
    accent: BRAND_YELLOW,
    icon: "sparkles",
  },
  {
    id: "signup",
    status: "Get started",
    title: "Make your next move count.",
    description:
      "Create your account and keep track of your learning progress.",
    cta: "Join Apni University",
    href: "/register",
    accent: BRAND_PURPLE,
    icon: "sparkles",
  },
];

function pad(value) {
  return String(value).padStart(2, "0");
}

function useCountdown(endsAt) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!endsAt) {
      setRemaining(null);
      return undefined;
    }

    const endTime = new Date(endsAt).getTime();

    if (!Number.isFinite(endTime)) {
      setRemaining(null);
      return undefined;
    }

    const update = () => {
      setRemaining(Math.max(0, endTime - Date.now()));
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [endsAt]);

  if (remaining === null || remaining <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    days > 0 ? `${days}d` : null,
    `${pad(hours)}h`,
    `${pad(minutes)}m`,
    `${pad(seconds)}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

function IconButton({ label, onClick, pressed, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={cn(
        "inline-grid size-8 shrink-0 place-items-center rounded-lg",
        "text-white/60 transition-all duration-200",
        "hover:bg-white/10 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#FACC15]",
        "active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status, accent }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
      style={{
        color: accent,
        borderColor: `${accent}45`,
        backgroundColor: `${accent}12`,
      }}
    >
      <span className="relative flex size-1.5">
        <span
          className="absolute inline-flex size-full animate-ping rounded-full opacity-50"
          style={{ backgroundColor: accent }}
        />
        <span
          className="relative inline-flex size-1.5 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </span>
      {status}
    </span>
  );
}

export function AnnouncementBar() {
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = siteConfig?.announcement;

  const slides = useMemo(() => {
    const configuredSlide =
      cfg?.text && cfg?.cta && cfg?.href
        ? [
            {
              id: "configured",
              status: "Announcement",
              title: cfg.text,
              description: "Discover opportunities to learn, build and grow.",
              cta: cfg.cta,
              href: cfg.href,
              accent: BRAND_YELLOW,
            },
          ]
        : [];

    return [...configuredSlide, ...DEFAULT_ANNOUNCEMENTS];
  }, [cfg?.text, cfg?.cta, cfg?.href]);

  const current = index % slides.length;
  const slide = slides[current];
  const countdown = useCountdown(slide.endsAt);
  const paused = hovered || userPaused;

  const go = useCallback(
    (direction) => {
      setIndex((currentIndex) => {
        return (currentIndex + direction + slides.length) % slides.length;
      });
      setCopied(false);
    },
    [slides.length],
  );

  // Read dismissal state after mount to avoid hydration mismatch.
  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);

      const dismissalExpired =
        !dismissedAt ||
        Date.now() - dismissedAt >= DISMISS_HOURS * 60 * 60 * 1000;

      setOpen(dismissalExpired);
    } catch {
      setOpen(true);
    }
  }, []);

  // Auto-advance only when visible, unpaused and motion is allowed.
  useEffect(() => {
    if (!open || paused || reduceMotion || slides.length < 2) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      go(1);
    }, SLIDE_MS);

    return () => window.clearTimeout(timeout);
  }, [open, paused, reduceMotion, current, go, slides.length]);

  // Reset the copied state and clean up its timeout.
  useEffect(() => {
    if (!copied) return undefined;

    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  const dismiss = useCallback(() => {
    setOpen(false);

    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // The announcement can still be dismissed if storage is blocked.
    }
  }, []);

  const copyCode = useCallback(async () => {
    if (!slide.code) return;

    try {
      await navigator.clipboard.writeText(slide.code);
      setCopied(true);
    } catch {
      // Clipboard access may be unavailable in insecure contexts.
      setCopied(false);
    }
  }, [slide.code]);

  const handleKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }

    if (event.key === "Escape") {
      dismiss();
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          key="announcement-bar"
          initial={reduceMotion ? false : { opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={
            reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0, y: -8 }
          }
          transition={{ duration: 0.28, ease: "easeOut" }}
          aria-label="Site announcements"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setHovered(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setHovered(false);
            }
          }}
          onKeyDown={handleKeyDown}
          className="relative z-50 overflow-hidden border-b border-white/[0.08] bg-[#111318] font-sans text-white"
        >
          {/* Subtle brand accents, without a heavy gradient background. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-1"
            style={{ backgroundColor: slide.accent }}
          />

          <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8">
            <div className="flex min-h-[66px] items-center gap-2.5 py-3 sm:gap-4">
              {/* Brand mark */}
              <div
                aria-hidden="true"
                className="hidden size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] sm:grid"
              >
                <Sparkles
                  className="size-[17px]"
                  style={{ color: slide.accent }}
                />
              </div>

              {/* Announcement content */}
              <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={slide.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5"
                  >
                    <StatusBadge status={slide.status} accent={slide.accent} />

                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="text-[12px] font-bold leading-snug tracking-tight text-white sm:text-[13px] md:text-sm">
                        {slide.title}
                      </h2>

                      <span className="hidden text-white/30 lg:inline">/</span>

                      <p className="hidden text-xs leading-relaxed text-white/55 lg:block">
                        {slide.description}
                      </p>
                    </div>

                    {slide.code && (
                      <button
                        type="button"
                        onClick={copyCode}
                        aria-label={
                          copied
                            ? "Promo code copied"
                            : `Copy promo code ${slide.code}`
                        }
                        className={cn(
                          "inline-flex min-h-7 items-center gap-1.5 rounded-lg",
                          "border border-dashed px-2 py-1",
                          "font-mono text-[10px] font-bold tracking-wide",
                          "transition-colors duration-200",
                          "hover:bg-white/[0.08]",
                          "focus-visible:outline-none focus-visible:ring-2",
                          "focus-visible:ring-[#FACC15]",
                        )}
                        style={{
                          color: slide.accent,
                          borderColor: `${slide.accent}55`,
                          backgroundColor: `${slide.accent}0D`,
                        }}
                      >
                        <span>{slide.code}</span>
                        {copied ? (
                          <Check
                            aria-hidden="true"
                            className="size-3 text-emerald-400"
                          />
                        ) : (
                          <Copy aria-hidden="true" className="size-3" />
                        )}
                      </button>
                    )}

                    {countdown && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] tabular-nums text-white/50">
                        <span
                          className="size-1.5 rounded-full"
                          style={{
                            backgroundColor: slide.accent,
                          }}
                        />
                        Ends in {countdown}
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Desktop call to action */}
              <Link
                href={slide.href}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "group hidden h-9 shrink-0 gap-2 rounded-xl px-3.5",
                  "text-xs font-bold shadow-none sm:inline-flex",
                  "transition-all duration-200 hover:-translate-y-0.5",
                  "focus-visible:ring-2 focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-[#111318]",
                )}
                style={{
                  backgroundColor: slide.accent,
                  color: "#111318",
                }}
              >
                {slide.cta}
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              {/* Navigation controls */}
              <div className="flex shrink-0 items-center gap-0.5">
                <div className="hidden items-center gap-0.5 sm:flex">
                  <IconButton
                    label="Previous announcement"
                    onClick={() => go(-1)}
                  >
                    <ChevronLeft className="size-4" />
                  </IconButton>

                  <span
                    className="min-w-8 text-center font-mono text-[10px] tabular-nums text-white/40"
                    aria-label={`Announcement ${current + 1} of ${slides.length}`}
                  >
                    {current + 1}/{slides.length}
                  </span>

                  <IconButton label="Next announcement" onClick={() => go(1)}>
                    <ChevronRight className="size-4" />
                  </IconButton>

                  {!reduceMotion && (
                    <IconButton
                      label={
                        userPaused
                          ? "Resume announcement rotation"
                          : "Pause announcement rotation"
                      }
                      onClick={() => setUserPaused((value) => !value)}
                      pressed={userPaused}
                    >
                      {userPaused ? (
                        <Play className="size-3.5" />
                      ) : (
                        <Pause className="size-3.5" />
                      )}
                    </IconButton>
                  )}

                  <div className="mx-1 h-5 w-px bg-white/10" />
                </div>

                <IconButton
                  label="Dismiss announcements for 24 hours"
                  onClick={dismiss}
                  className="hover:bg-white/10"
                >
                  <X className="size-4" />
                </IconButton>
              </div>
            </div>

            {/* Mobile description and CTA */}
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] py-2.5 sm:hidden">
              <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-white/55">
                {slide.description}
              </p>

              <Link
                href={slide.href}
                className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold"
                style={{ color: slide.accent }}
              >
                {slide.cta}
                <ArrowRight aria-hidden="true" className="size-3" />
              </Link>
            </div>
          </div>

          {/* Progress indicator */}
          {!reduceMotion && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[2px] bg-white/[0.04]"
            >
              <motion.div
                key={`${slide.id}-${index}`}
                initial={{ scaleX: 0 }}
                animate={{
                  scaleX: paused ? undefined : 1,
                }}
                transition={{
                  duration: paused ? 0 : SLIDE_MS / 1000,
                  ease: "linear",
                }}
                style={{
                  backgroundColor: slide.accent,
                  transformOrigin: "left",
                  animationPlayState: paused ? "paused" : "running",
                }}
                className="h-full w-full"
              />
            </div>
          )}

          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Promo code copied to clipboard." : ""}
          </span>

          <span className="sr-only" aria-live="polite">
            {slide.title}. {slide.description}
          </span>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementBar;
