"use client";

import {
  useCallback,
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
  FiChevronDown,
  FiCopy,
  FiHelpCircle,
  FiLifeBuoy,
  FiLogOut,
  FiUser,
  FiZap,
} from "react-icons/fi";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Clean, solid-color design — no gradients.
const ACCENT = "#7c3aed";
const XP_PER_LEVEL = 500;

const PROFILE_HREF = "/student/profile";
const ACHIEVEMENTS_HREF = "/student/achievements";
const SUPPORT_HREF = "/student/support";
const HELP_HREF = "/faq";

const QUICK_LINKS = [
  {
    href: PROFILE_HREF,
    label: "My Profile",
    icon: FiUser,
  },
  {
    href: ACHIEVEMENTS_HREF,
    label: "Achievements",
    icon: FiAward,
  },
  {
    href: SUPPORT_HREF,
    label: "Support",
    icon: FiLifeBuoy,
  },
  {
    href: HELP_HREF,
    label: "Help Center",
    icon: FiHelpCircle,
  },
];

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
    String(name)
      .trim()
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function getGreeting(hour) {
  if (hour === null) return "Welcome back";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function TiltWrap({ children, disabled }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={
        reduce || disabled
          ? undefined
          : {
              y: -1,
            }
      }
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function IconAction({ children, label, onClick, disabled }) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      className="grid size-9 shrink-0 place-items-center rounded-lg
        text-muted-foreground transition-colors
        hover:bg-background hover:text-foreground
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-ring disabled:cursor-not-allowed
        disabled:opacity-50"
    >
      {children}
    </motion.button>
  );
}

export function UserChip({ person }) {
  const reduce = useReducedMotion();
  const uid = useId();
  const rootRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hour = useSyncExternalStore(
    subscribeToClock,
    getCurrentHour,
    getServerHour,
  );

  const name = person?.name?.trim() || "Student";
  const email = person?.email || "";
  const photoURL = person?.photoURL || "";
  const hasPhoto = Boolean(photoURL);

  const hasXp =
    typeof person?.xp === "number" &&
    Number.isFinite(person.xp) &&
    person.xp >= 0;

  const hasStreak =
    typeof person?.streak === "number" &&
    Number.isFinite(person.streak) &&
    person.streak > 0;

  const xp = hasXp ? Math.floor(person.xp) : 0;
  const level = hasXp ? Math.floor(xp / XP_PER_LEVEL) + 1 : null;

  const currentLevelXp = xp % XP_PER_LEVEL;
  const progress = (currentLevelXp / XP_PER_LEVEL) * 100;
  const remainingXp = XP_PER_LEVEL - currentLevelXp;

  const greeting = getGreeting(hour);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const copyEmail = useCallback(async () => {
    if (!email || !navigator.clipboard?.writeText) return;

    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }, [email]);

  return (
    <motion.div
      ref={rootRef}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group/chip relative rounded-xl border bg-card p-1",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-primary/25",
        open && "border-primary/30 shadow-sm",
      )}
    >
      {/* Main student chip */}
      <TiltWrap disabled={open}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={uid}
          aria-label={`${name}, student account menu`}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg",
            "px-2 py-2 text-left",
            "transition-colors duration-200",
            "hover:bg-muted/60",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-ring",
          )}
        >
          {/* Avatar */}
          <motion.span
            whileHover={reduce ? undefined : { scale: 1.04 }}
            transition={{ duration: 0.2 }}
            className="relative grid size-11 shrink-0 place-items-center"
          >
            <span
              className={cn(
                "absolute inset-0 rounded-full border-2",
                "border-border transition-colors duration-200",
                "group-hover:border-primary/60",
                open && "border-primary/60",
              )}
            />

            <Avatar className="size-9">
              <AvatarImage
                src={photoURL || undefined}
                alt={`${name}'s profile`}
                referrerPolicy="no-referrer"
              />

              <AvatarFallback
                className="bg-muted text-xs font-semibold"
                style={{ color: ACCENT }}
              >
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            {/* Level badge */}
            {hasXp && (
              <span
                title={`Level ${level}`}
                className="absolute -right-1 -top-1 grid h-[18px]
                  min-w-[18px] place-items-center rounded-full
                  border-2 border-card bg-primary px-1
                  text-[9px] font-bold text-primary-foreground"
              >
                {level}
              </span>
            )}

            {/* Online status */}
            <span
              className="absolute bottom-0 right-0 size-3
                rounded-full border-2 border-card bg-emerald-500"
            >
              <span className="sr-only">Signed in</span>
            </span>
          </motion.span>

          {/* Student information */}
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] text-muted-foreground">
              {greeting}
            </span>

            <span
              className="block truncate text-sm font-semibold
                tracking-tight text-foreground"
            >
              {name}
            </span>

            <span className="block truncate text-xs text-muted-foreground">
              {email || "Student account"}
            </span>
          </span>

          {/* Chevron */}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{
              duration: reduce ? 0 : 0.2,
            }}
            className="grid size-7 shrink-0 place-items-center
              rounded-md text-muted-foreground
              transition-colors group-hover:text-foreground"
          >
            <FiChevronDown aria-hidden="true" className="size-4" />
          </motion.span>
        </button>
      </TiltWrap>

      {/* Expandable account panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={uid}
            key="student-details"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0, y: -4 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0, y: -4 }}
            transition={{
              duration: reduce ? 0.12 : 0.22,
              ease: "easeOut",
            }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-2 pb-2 pt-3">
              <div className="h-px bg-border" />

              {/* Account badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full
                    border border-primary/20 bg-primary/5
                    px-2.5 py-1 text-[11px] font-semibold text-primary"
                >
                  <FiAward aria-hidden="true" className="size-3.5" />
                  Student
                </span>

                <span
                  className="inline-flex items-center rounded-full
                    border bg-muted/50 px-2.5 py-1
                    text-[11px] font-medium text-muted-foreground"
                >
                  Apni University
                </span>

                {hasStreak && (
                  <motion.span
                    initial={reduce ? false : { scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-1 rounded-full
                      border border-amber-500/20 bg-amber-500/10
                      px-2.5 py-1 text-[11px] font-semibold
                      text-amber-700 dark:text-amber-300"
                  >
                    <FiZap aria-hidden="true" className="size-3.5" />
                    {person.streak}-day streak
                  </motion.span>
                )}
              </div>

              {/* XP and level progress */}
              {hasXp && (
                <div className="rounded-lg border bg-background p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="grid size-8 place-items-center
                          rounded-lg bg-primary/10 text-primary"
                      >
                        <FiAward aria-hidden="true" className="size-4" />
                      </span>

                      <div>
                        <p className="text-xs font-semibold">Level {level}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Learning progress
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold tabular-nums">
                      {xp.toLocaleString()} XP
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label="Progress to next level"
                    aria-valuemin={0}
                    aria-valuemax={XP_PER_LEVEL}
                    aria-valuenow={currentLevelXp}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <motion.div
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{
                        duration: reduce ? 0 : 0.6,
                        ease: "easeOut",
                      }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {remainingXp} XP to Level {level + 1}
                  </p>
                </div>
              )}

              {/* Email and copy action */}
              {email && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 py-1.5 pl-3 pr-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground">
                      Signed in as
                    </p>
                    <p className="truncate text-xs font-medium">{email}</p>
                  </div>

                  <IconAction
                    label={copied ? "Email copied" : "Copy email"}
                    onClick={copyEmail}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={copied ? "copied" : "copy"}
                        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
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
                  </IconAction>
                </div>
              )}

              <p className="sr-only" aria-live="polite">
                {copied ? "Email copied to clipboard" : ""}
              </p>

              {/* Profile photo reminder */}
              {!hasPhoto && (
                <Link
                  href={PROFILE_HREF}
                  onClick={closeMenu}
                  className="group/photo flex items-start gap-2.5
                    rounded-lg border border-dashed p-2.5
                    transition-colors duration-200
                    hover:border-primary/40 hover:bg-primary/5
                    focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-ring"
                >
                  <motion.span
                    whileHover={reduce ? undefined : { scale: 1.08 }}
                    className="grid size-8 shrink-0 place-items-center
                      rounded-lg bg-primary/10 text-primary"
                  >
                    <FiCamera aria-hidden="true" className="size-4" />
                  </motion.span>

                  <span className="min-w-0 text-xs leading-relaxed">
                    <span className="block font-semibold">
                      Add a profile photo
                    </span>
                    <span className="text-muted-foreground">
                      Personalize your account and certificates.
                    </span>
                  </span>
                </Link>
              )}

              {/* Quick navigation */}
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMenu}
                    className="group/link flex min-w-0 items-center gap-2
                      rounded-lg border bg-background px-2.5 py-2.5
                      text-xs font-medium transition-all duration-200
                      hover:-translate-y-0.5 hover:border-primary/30
                      hover:bg-primary/5 hover:text-primary
                      hover:shadow-sm
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-ring"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 transition-transform
                        duration-200 group-hover/link:scale-110"
                    />

                    <span className="truncate">{label}</span>
                  </Link>
                ))}
              </div>

              {/* Account footer */}
              <div className="flex items-center justify-between gap-2 border-t pt-2">
                <span className="text-[10px] text-muted-foreground">
                  Apni University
                </span>

                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Account active
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
