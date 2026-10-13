"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Pause,
  Play,
  X,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const SLIDE_MS = 7000;
const DISMISS_KEY = "announcement-dismissed-at";
const DISMISS_HOURS = 24; // dismiss ke baad 24 ghante bar nahi aayegi

// Colours (yahin se badlein)
const BG = "bg-[#0F172A]"; // deep slate
const BRAND = "#ef07a2";

const announcements = [
  {
    id: "courses",
    status: "New",
    title: "Your next skill starts here.",
    description: "Practical technology courses with real projects.",
    cta: "Explore courses",
    href: "/courses",
    accent: "#38bdf8",
  },
  {
    id: "ai",
    status: "Trending",
    title: "Get ready for the AI era.",
    description: "Generative AI, agents and automation, step by step.",
    cta: "Discover AI",
    href: "/ai",
    accent: "#a78bfa",
  },
  {
    id: "offer",
    status: "Limited offer",
    title: "Start free, upgrade when you're ready.",
    description: "Use this code on your first course.",
    code: "WELCOME10", // copy button dikhata hai
    endsAt: "2026-12-31T23:59:59+05:00", // countdown dikhata hai (apni date likhein)
    cta: "Claim offer",
    href: "/courses",
    accent: "#fbbf24",
  },
  {
    id: "signup",
    status: "Free",
    title: "Make your next move count.",
    description: "Create an account and track your progress.",
    cta: "Get started",
    href: "/register",
    accent: "#34d399",
  },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

// Countdown: server/client mismatch na ho, isliye effect ke andar start hota hai
function useCountdown(endsAt) {
  const [left, setLeft] = useState(null);

  useEffect(() => {
    if (!endsAt) {
      setLeft(null);
      return undefined;
    }
    const end = new Date(endsAt).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (left === null || left <= 0) return null;

  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d > 0 ? `${d}d ` : ""}${pad(h)}h ${pad(m)}m ${pad(s % 60)}s`;
}

function IconButton({ label, onClick, pressed, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="grid size-8 cursor-pointer place-items-center rounded-lg text-slate-400 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
    >
      {children}
    </button>
  );
}

export function AnnouncementBar() {
  const reduce = useReducedMotion();

  const [open, setOpen] = useState(false); // mount ke baad decide hota hai
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const paused = hovered || userPaused;

  const cfg = siteConfig?.announcement;
  const slides = [
    ...(cfg?.text && cfg?.cta && cfg?.href
      ? [
          {
            id: "configured",
            status: "Update",
            title: cfg.text,
            description: "Discover opportunities to learn, build and grow.",
            cta: cfg.cta,
            href: cfg.href,
            accent: BRAND,
          },
        ]
      : []),
    ...announcements,
  ];

  const current = index % slides.length;
  const slide = slides[current];
  const countdown = useCountdown(slide.endsAt);

  // Dismiss yaad rakho (24h)
  useEffect(() => {
    try {
      const at = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
      const expired = !at || Date.now() - at > DISMISS_HOURS * 3600 * 1000;
      setOpen(expired);
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage unavailable */
    }
  };

  const go = useCallback(
    (dir) => setIndex((c) => (c + dir + slides.length) % slides.length),
    [slides.length],
  );

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(slide.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside
          initial={reduce ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          aria-label="Announcements"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setHovered(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
          className={cn(
            "relative z-50 overflow-hidden border-b border-white/10 font-sans text-slate-100",
            BG,
          )}
        >
          <style>{`
            @keyframes ab-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
          `}</style>

          <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 lg:px-8 bg-indigo-600 text-white">
            {/* Content (swipe on touch) */}
            <motion.div
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) go(1);
                else if (info.offset.x > 50) go(-1);
              }}
              className="min-w-0 flex-1 touch-pan-y "
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={slide.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 "
                >
                  {/* Status */}
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide"
                    style={{
                      color: slide.accent,
                      backgroundColor: `${slide.accent}1f`,
                    }}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: slide.accent }}
                    />
                    {slide.status}
                  </span>

                  {/* Title */}
                  <h2 className="text-[13px] font-semibold tracking-tight text-white sm:text-sm">
                    {slide.title}
                  </h2>

                  {/* Description */}
                  <p className="hidden text-[13px]  lg:block">
                    {slide.description}
                  </p>

                  {/* Promo code (copy) */}
                  {slide.code && (
                    <button
                      type="button"
                      onClick={copyCode}
                      aria-label={`Copy promo code ${slide.code}`}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-white/25 bg-white/5 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-200 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      {slide.code}
                      {copied ? (
                        <Check
                          aria-hidden="true"
                          className="size-3 text-emerald-400"
                        />
                      ) : (
                        <Copy
                          aria-hidden="true"
                          className="size-3 text-slate-400"
                        />
                      )}
                      <span className="sr-only" role="status">
                        {copied ? "Copied" : ""}
                      </span>
                    </button>
                  )}

                  {/* Countdown */}
                  {countdown && (
                    <span className="font-mono text-[11px] tabular-nums text-amber-300">
                      Ends in {countdown}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* CTA: Link styled as a button */}
            <Link
              href={slide.href}
              className={cn(
                buttonVariants({ size: "sm" }),
                "group hidden shrink-0 rounded-full px-4 text-xs font-semibold text-white shadow-none transition-all duration-200 hover:brightness-110 sm:inline-flex",
              )}
              style={{ backgroundColor: BRAND }}
            >
              {slide.cta}
              <ArrowUpRight
                aria-hidden="true"
                className="ml-1 size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-0.5">
              <div className="hidden items-center gap-0.5 md:flex">
                <IconButton
                  label="Previous announcement"
                  onClick={() => go(-1)}
                >
                  <ChevronLeft size={16} />
                </IconButton>

                <span className="min-w-9 text-center font-mono text-[11px] tabular-nums text-slate-500">
                  {current + 1}/{slides.length}
                </span>

                <IconButton label="Next announcement" onClick={() => go(1)}>
                  <ChevronRight size={16} />
                </IconButton>

                {!reduce && (
                  <IconButton
                    label={userPaused ? "Play rotation" : "Pause rotation"}
                    onClick={() => setUserPaused((p) => !p)}
                    pressed={userPaused}
                  >
                    {userPaused ? <Play size={14} /> : <Pause size={14} />}
                  </IconButton>
                )}
              </div>

              <IconButton label="Dismiss announcements" onClick={dismiss}>
                <X size={16} />
              </IconButton>
            </div>
          </div>

          {/* Mobile: CTA row */}
          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2 sm:hidden">
            <span className="min-w-0 truncate text-xs text-slate-400">
              {slide.description}
            </span>
            <Link
              href={slide.href}
              className="shrink-0 text-xs font-semibold"
              style={{ color: BRAND }}
            >
              {slide.cta} →
            </Link>
          </div>

          {/* Thin progress line (auto-advance isi se hota hai) */}
          {!reduce && (
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5">
              <span
                key={`${slide.id}-${index}`}
                onAnimationEnd={() => go(1)}
                className="block h-full origin-left"
                style={{
                  backgroundColor: slide.accent,
                  animation: `ab-fill ${SLIDE_MS}ms linear forwards`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            </div>
          )}

          <p className="sr-only" aria-live="polite">
            {slide.title} {slide.description}
          </p>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default AnnouncementBar;
