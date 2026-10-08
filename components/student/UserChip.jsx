// components/student/UserChip.jsx
"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiAward,
  FiCamera,
  FiCheck,
  FiChevronUp,
  FiCopy,
  FiHelpCircle,
  FiUser,
} from "react-icons/fi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Sidebar ke accent rang ke saath match
const ACCENT = "#ef07a2";
const ACCENT_2 = "#7c3aed";

// Apne asal routes ke mutabiq badal lein
const PROFILE_HREF = "/student/profile"; // ASSUMED
const HELP_HREF = "/faq";

function subscribeToClock(callback) {
  const interval = setInterval(callback, 60_000);
  return () => clearInterval(interval);
}

function getCurrentHour() {
  return new Date().getHours();
}

function getServerHour() {
  return null;
}

function getInitials(name = "") {
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function UserChip({ person }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const hour = useSyncExternalStore(
    subscribeToClock,
    getCurrentHour,
    getServerHour,
  );
  const greeting =
    hour === null
      ? "Welcome back"
      : hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";

  // Bahar click ya Esc par band
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  const hasPhoto = Boolean(person.photoURL);

  return (
    <motion.div
      ref={rootRef}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "rounded-xl border bg-card/60 p-1 transition-shadow duration-200",
        open && "shadow-md",
      )}
    >
      {/* Chip (click karne par details khulti hain) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={uid}
        className="group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Avatar + ghoomti hui gradient ring + status dot */}
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-105">
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${ACCENT}, ${ACCENT_2}, ${ACCENT})`,
            }}
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <Avatar className="relative size-9 ring-2 ring-background">
            <AvatarImage
              src={person.photoURL ?? undefined}
              alt=""
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(person.name)}
            </AvatarFallback>
          </Avatar>

          <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-background">
            {!reduce && (
              <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-emerald-500/60" />
            )}
            <span className="relative size-2.5 rounded-full bg-emerald-500" />
            <span className="sr-only">Signed in</span>
          </span>
        </span>

        <span className="min-w-0 flex-1 text-sm">
          <span className="block text-[11px] text-muted-foreground">
            {greeting}
          </span>
          <span className="block truncate font-medium">{person.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {person.email}
          </span>
        </span>

        <FiChevronUp
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:text-foreground",
            !open && "rotate-180",
          )}
        />
      </button>

      {/* Details panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={uid}
            key="details"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-2 pb-2 pt-2">
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                  style={{
                    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_2})`,
                  }}
                >
                  <FiAward aria-hidden="true" className="size-3" />
                  Student
                </span>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Apni University
                </span>
              </div>

              {/* Email + copy */}
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 py-1.5 pl-3 pr-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="truncate text-xs font-medium">{person.email}</p>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label="Copy email"
                  className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "done" : "copy"}
                      initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      {copied ? (
                        <FiCheck
                          aria-hidden="true"
                          className="size-4 text-emerald-600"
                        />
                      ) : (
                        <FiCopy aria-hidden="true" className="size-4" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
              <p className="sr-only" aria-live="polite">
                {copied ? "Email copied" : ""}
              </p>

              {/* Photo nudge: sirf jab photo na ho */}
              {!hasPhoto && (
                <Link
                  href={PROFILE_HREF}
                  className="group/nudge flex items-start gap-2.5 rounded-lg border border-dashed p-2.5 transition-colors hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <FiCamera aria-hidden="true" className="size-3.5" />
                  </span>
                  <span className="text-xs leading-snug">
                    <span className="block font-medium">
                      Add a profile photo
                    </span>
                    <span className="text-muted-foreground">
                      Make your account and certificates feel like yours.
                    </span>
                  </span>
                </Link>
              )}

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: PROFILE_HREF, label: "Profile", icon: FiUser },
                  { href: HELP_HREF, label: "Help", icon: FiHelpCircle },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group/link flex items-center justify-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover/link:scale-110"
                    />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
