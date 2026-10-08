// components/auth/AuthNav.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  LayoutDashboard,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "./AuthProvider";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/student/profile", label: "Profile", icon: User },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  {
    href: "/student/notifications",
    label: "Notifications",
    icon: Bell,
    bell: true,
  },
  { href: "/student/settings", label: "Settings", icon: Settings },
];
const guestList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const guestItem = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 26 },
  },
};
const isActive = (pathname, { href, exact }) =>
  exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

function initialsOf(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function greetingFor(hour) {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

// Computed after mount so server and client HTML always match.
function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setGreeting(greetingFor(new Date().getHours()));
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);
  return greeting;
}

/* ------------------------------------------------------------------ */
/* Shared motion presets                                               */
/* ------------------------------------------------------------------ */

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
};

const popSpring = { type: "spring", stiffness: 420, damping: 22 };

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// Pops in when it appears and bounces whenever the number changes.
function CountPill({ count, className }) {
  const reduce = useReducedMotion();
  if (!count) return null;

  return (
    <motion.span
      key={count}
      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={popSpring}
      className={cn(
        "relative grid min-w-5 place-items-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-destructive/60 motion-safe:animate-ping [animation-iteration-count:2]"
      />
      <span className="relative">{count > 99 ? "99+" : count}</span>
    </motion.span>
  );
}

// Green dot with a soft pulse, used for "online".
function OnlineDot({ className, ring = "ring-background" }) {
  return (
    <span
      aria-hidden="true"
      className={cn("absolute bottom-0 right-0 size-2.5", className)}
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500/70 motion-safe:animate-ping" />
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-emerald-500 ring-2",
          ring,
        )}
      />
    </span>
  );
}

// Avatar with a gradient ring that spins in on hover.
function GlowAvatar({
  user,
  alt = "",
  initials,
  size = "size-8",
  fallbackClass,
}) {
  return (
    <span className="relative cursor-pointer isolate inline-flex">
      <span
        aria-hidden="true"
        className="absolute -inset-[3px] -z-10 rounded-full bg-gradient-to-tr from-primary via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[state=open]:opacity-100 group-data-[popup-open]:opacity-100 motion-safe:group-hover:animate-[spin_3s_linear_infinite] motion-reduce:transition-none"
      />
      <Avatar
        className={cn(
          size,
          "ring-2 ring-background transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100",
        )}
      >
        <AvatarImage src={user.photoURL ?? undefined} alt={alt} />
        <AvatarFallback
          className={cn(
            "bg-primary/10 font-semibold text-primary",
            fallbackClass,
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    </span>
  );
}

// Greeting + name + email, shared by the card and the dropdown header.
function Identity({ displayName, email, greeting }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
        <Sparkles aria-hidden="true" className="size-3 shrink-0 text-primary" />
        <span className="truncate">{greeting}</span>
      </p>
      <p className="truncate text-sm font-semibold">{displayName}</p>
      <p className="truncate text-xs text-muted-foreground">{email}</p>
    </div>
  );
}

// Soft animated glow used behind the user cards.
function CardGlow() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/15 blur-2xl motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-6 size-20 rounded-full bg-primary/10 blur-2xl"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Logged-out buttons                                                  */
/* ------------------------------------------------------------------ */

function GuestButtons({ stacked, onNavigate }) {
  const reduce = useReducedMotion();

  // Spring hover / press, skipped for reduced motion
  const hover = reduce ? undefined : { y: -2, scale: 1.03 };
  const tap = reduce ? undefined : { scale: 0.95 };
  const spring = { type: "spring", stiffness: 400, damping: 22 };

  return (
    <motion.div
      variants={guestList}
      initial={reduce ? false : "hidden"}
      animate="show"
      className={cn(
        "flex items-center gap-2",
        stacked && "flex-col items-stretch",
      )}
    >
      {/* Log in */}
      <motion.div
        variants={guestItem}
        whileHover={hover}
        whileTap={tap}
        transition={spring}
        className={cn("group relative", stacked && "w-full")}
      >
        <Link
          href="/login"
          onClick={onNavigate}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "relative cursor-pointer gap-0 overflow-hidden transition-colors duration-200 hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
            stacked && "w-full",
          )}
        >
          {/* Icon slides in from the left on hover */}

          <span>Log in</span>

          {/* Underline grows from the centre */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 bottom-1 h-px origin-center scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100 motion-reduce:transition-none"
          />
        </Link>
      </motion.div>

      {/* Get started */}
      <motion.div
        variants={guestItem}
        whileHover={hover}
        whileTap={tap}
        transition={spring}
        className={cn("group relative", stacked && "w-full")}
      >
        {/* Glow behind the button */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 -z-10 rounded-xl bg-primary/40 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 motion-safe:animate-pulse motion-reduce:transition-none"
        />

        <Link
          href="/register"
          onClick={onNavigate}
          className={cn(
            buttonVariants(),
            "relative cursor-pointer gap-1.5 overflow-hidden bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%] shadow-sm shadow-primary/20 transition-[background-position,box-shadow] duration-500 hover:bg-[position:100%_0] hover:shadow-lg hover:shadow-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
            stacked && "w-full",
          )}
        >
          {/* Shine sweep */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] motion-reduce:hidden"
          />

          {/* Sparkle wiggles on hover */}
          <Sparkles
            aria-hidden="true"
            className="relative size-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
          />
          <span className="relative">Get started</span>
          <span className="relative inline-flex transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
            {/* Asli arrow: aage jata hai, wapas aata hai, thodi der rukta hai, phir dohrata hai */}
            <motion.span
              className="inline-flex"
              animate={reduce ? undefined : { x: [0, 5, 0] }}
              transition={{
                duration: 0.9,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 1.1,
              }}
            >
              <ArrowRight aria-hidden="true" className="size-4" />
            </motion.span>

            {/* Halka sa ghost arrow jo peeche trail chhodta hai */}
            {!reduce && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 inline-flex"
                animate={{ x: [0, 12], opacity: [0.5, 0] }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: 1.1,
                }}
              >
                <ArrowRight className="size-4" />
              </motion.span>
            )}
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile / stacked layout                                             */
/* ------------------------------------------------------------------ */

function StackedMenu({
  user,
  displayName,
  email,
  initials,
  pathname,
  notificationCount,
  onNavigate,
}) {
  const reduce = useReducedMotion();
  const greeting = useGreeting();

  return (
    <motion.div
      className="space-y-3"
      variants={listVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {/* User card */}
      <motion.div
        variants={rowVariants}
        className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-card to-card p-3 transition-shadow duration-300 hover:shadow-md motion-reduce:transition-none"
      >
        <CardGlow />
        <div className="relative flex items-center gap-3">
          <span className="relative shrink-0">
            <GlowAvatar
              user={user}
              alt={displayName}
              initials={initials}
              size="size-11"
            />
            <OnlineDot ring="ring-card" />
          </span>
          <Identity
            displayName={displayName}
            email={email}
            greeting={greeting}
          />
        </div>
      </motion.div>

      {/* Navigation */}
      <nav aria-label="Account" className="grid gap-1">
        {MENU.map((item) => {
          const { href, label, icon: Icon, bell } = item;
          const active = isActive(pathname, item);

          return (
            <motion.div key={href} variants={rowVariants}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "group relative w-full justify-start gap-3 overflow-hidden transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
                  active && "bg-accent font-medium text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-200 motion-reduce:transition-none",
                    active
                      ? "scale-y-100"
                      : "scale-y-0 group-hover:scale-y-100",
                  )}
                />
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 transition-all duration-200 group-hover:-rotate-6 group-hover:scale-110 group-hover:text-primary motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100",
                    active && "text-primary",
                  )}
                />
                <span className="flex-1 text-left transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
                  {label}
                </span>
                {bell ? <CountPill count={notificationCount} /> : null}
              </Link>
            </motion.div>
          );
        })}

        <div className="my-1 border-t" role="separator" />

        <motion.div variants={rowVariants}>
          <LogoutButton />
        </motion.div>
      </nav>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop dropdown                                                    */
/* ------------------------------------------------------------------ */

function AccountItem({ item, active, notificationCount }) {
  const router = useRouter();
  const { href, label, icon: Icon, bell } = item;

  return (
    <motion.div variants={rowVariants}>
      <DropdownMenuItem
        onClick={() => router.push(href)}
        onMouseEnter={() => router.prefetch(href)}
        onFocus={() => router.prefetch(href)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative gap-2.5 py-2  transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-primary/10 data-[highlighted]:to-transparent motion-reduce:transition-none",
          active && "bg-accent",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-transform duration-200 motion-reduce:transition-none",
            active
              ? "scale-y-100"
              : "scale-y-0 group-hover:scale-y-100 group-data-[highlighted]:scale-y-100",
          )}
        />

        <Icon
          aria-hidden="true"
          className={cn(
            "size-4 text-muted-foreground transition-all duration-200 group-hover:-rotate-6 group-hover:scale-110 group-hover:text-primary group-data-[highlighted]:-rotate-6 group-data-[highlighted]:scale-110 group-data-[highlighted]:text-primary motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100",
            active && "text-primary",
          )}
        />

        <span className="flex-1 transition-transform duration-200 group-hover:translate-x-0.5 group-data-[highlighted]:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
          {label}
        </span>

        {bell ? <CountPill count={notificationCount} /> : null}

        {item.href === "/student" ? (
          <Badge variant="secondary" className="text-[10px]">
            Home
          </Badge>
        ) : null}
      </DropdownMenuItem>
    </motion.div>
  );
}

function AccountDropdown({
  user,
  displayName,
  email,
  initials,
  pathname,
  notificationCount,
}) {
  const reduce = useReducedMotion();
  const greeting = useGreeting();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset the "Copied" state after a moment.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function copyEmail(e) {
    // Keep the menu open so the "Copied" feedback is visible.
    e.preventDefault();
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (insecure context); fail quietly.
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label="Open account menu"
        className={cn(
          "group flex h-10 items-center gap-2 rounded-full border bg-background px-1.5 pr-3 outline-none",
          "transition-all duration-200 hover:bg-accent hover:shadow-md active:scale-95",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "motion-reduce:transition-none motion-reduce:active:scale-100",
          open && "bg-accent shadow-md",
        )}
      >
        <span className="relative">
          <GlowAvatar user={user} initials={initials} fallbackClass="text-xs" />

          {/* Online dot */}
          <OnlineDot className="size-2" />

          {/* Unread dot (shown when the menu is closed) */}
          <AnimatePresence>
            {notificationCount > 0 && !open ? (
              <motion.span
                aria-hidden="true"
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={popSpring}
                className="absolute -right-0.5 -top-0.5 size-2.5"
              >
                <span className="absolute inset-0 rounded-full bg-destructive/70 motion-safe:animate-ping" />
                <span className="absolute inset-0 rounded-full bg-destructive ring-2 ring-background" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 text-muted-foreground transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-foreground motion-reduce:transition-none",
            // Works with both Radix (data-state) and Base UI (data-popup-open).
            "group-data-[state=open]:rotate-180 group-data-[popup-open]:rotate-180",
            "group-data-[state=open]:group-hover:translate-y-0 group-data-[popup-open]:group-hover:translate-y-0",
          )}
        />
        {notificationCount > 0 ? (
          <span className="sr-only">
            {notificationCount} unread notifications
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden bg-popover/90 p-0 shadow-xl backdrop-blur-xl"
      >
        {/* Account header */}
        <div className="group relative border-b bg-gradient-to-br from-primary/10 via-background to-background p-4">
          <CardGlow />

          <div className="relative flex items-center gap-3">
            <motion.span
              initial={reduce ? false : { scale: 0.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={popSpring}
              className="relative shrink-0"
            >
              <GlowAvatar
                user={user}
                alt={displayName}
                initials={initials}
                size="size-12"
                fallbackClass="text-base"
              />
              <OnlineDot />
            </motion.span>

            <Identity
              displayName={displayName}
              email={email}
              greeting={greeting}
            />
          </div>
        </div>

        <motion.div
          className="p-1"
          variants={listVariants}
          initial={reduce ? false : "hidden"}
          animate="show"
        >
          <DropdownMenuGroup>
            {MENU.slice(0, 4).map((item) => (
              <AccountItem
                key={item.href}
                item={item}
                active={isActive(pathname, item)}
                notificationCount={notificationCount}
              />
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <AccountItem
              item={MENU[4]}
              active={isActive(pathname, MENU[4])}
              notificationCount={notificationCount}
            />

            {email ? (
              <motion.div variants={rowVariants}>
                <DropdownMenuItem
                  onClick={copyEmail}
                  className="group gap-2.5 py-2 transition-colors duration-200 motion-reduce:transition-none"
                >
                  {/* Copy <-> check icon swap */}
                  <span className="relative grid size-4 place-items-center">
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={reduce ? false : { scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={popSpring}
                          className="absolute"
                        >
                          <Check
                            aria-hidden="true"
                            className="size-4 text-emerald-600 dark:text-emerald-400"
                          />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={reduce ? false : { scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={popSpring}
                          className="absolute"
                        >
                          <Copy
                            aria-hidden="true"
                            className="size-4 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-primary group-data-[highlighted]:text-primary motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>

                  <span
                    className={cn(
                      "flex-1 transition-colors duration-200 motion-reduce:transition-none",
                      copied && "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {copied ? "Email copied" : "Copy email"}
                  </span>
                  <span role="status" className="sr-only">
                    {copied ? "Email copied to clipboard" : ""}
                  </span>
                </DropdownMenuItem>
              </motion.div>
            ) : null}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Logout */}
          <motion.div variants={rowVariants} className="p-0.5">
            <Button variant="default" className="w-full justify-center text-white">
              <LogoutButton />
            </Button>
          </motion.div>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export function AuthNav({
  stacked = false,
  notificationCount = 0,
  onNavigate,
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        className={cn("flex items-center gap-2", stacked && "flex-col")}
      >
        <span className="sr-only">Loading account…</span>
        {stacked ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </>
        ) : (
          <>
            <Skeleton className="size-9 rounded-full" />
            <Skeleton className="hidden h-9 w-24 rounded-md sm:block" />
          </>
        )}
      </div>
    );
  }

  if (!user) return <GuestButtons stacked={stacked} onNavigate={onNavigate} />;

  const displayName = user.displayName || user.email?.split("@")[0] || "User";
  const email = user.email || "";
  const initials = initialsOf(displayName);

  const shared = {
    user,
    displayName,
    email,
    initials,
    pathname,
    notificationCount,
  };

  return stacked ? (
    <StackedMenu {...shared} onNavigate={onNavigate} />
  ) : (
    <AccountDropdown {...shared} />
  );
}
