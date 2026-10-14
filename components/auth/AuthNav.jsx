"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  Settings,
  Sparkles,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "./AuthProvider";
import { LogoutButton } from "./LogoutButton";
import { useStaffAccess } from "./useStaffAccess";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

// Staff (admin, editor, instructor) can use every student page too,
// so this menu is the same for everyone who is signed in.
const MENU = [
  {
    href: "/student",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/student/profile",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/student/courses",
    label: "My Courses",
    icon: BookOpen,
  },
  {
    href: "/student/notifications",
    label: "Notifications",
    icon: Bell,
    bell: true,
  },
  {
    href: "/student/settings",
    label: "Settings",
    icon: Settings,
  },
];

const popSpring = {
  type: "spring",
  stiffness: 420,
  damping: 25,
};

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.04,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -7 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 28,
    },
  },
};

function isActive(pathname, { href, exact }) {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function initialsOf(name) {
  const parts = String(name || "User")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return "U";

  return (
    (parts[0]?.[0] || "") +
    (parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "")
  ).toUpperCase();
}

function greetingFor(hour) {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function useGreeting() {
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGreeting(greetingFor(new Date().getHours()));
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return greeting;
}

/**
 * Admin visibility from profile data and Firebase Auth custom claims.
 * Kept as a fallback; the server check (useStaffAccess) is the main source
 * because admins are stored in the `admins` collection.
 *
 * This controls navigation visibility only. It does not grant
 * access to protected admin routes.
 */
function useAdminRole(user, profile) {
  const [claimState, setClaimState] = useState({
    user: null,
    role: "",
    checked: false,
  });

  useEffect(() => {
    let cancelled = false;

    if (!user) return;

    async function readClaims() {
      try {
        if (typeof user.getIdTokenResult !== "function") return;

        const tokenResult = await user.getIdTokenResult();
        const claims = tokenResult?.claims || {};

        const role =
          claims.role ||
          claims.userRole ||
          (claims.admin === true ? "admin" : "") ||
          (claims.isAdmin === true ? "admin" : "");

        if (!cancelled) {
          setClaimState({
            user,
            role: String(role).toLowerCase(),
            checked: true,
          });
        }
      } catch {
        // Profile-based role detection can still work.
      } finally {
        if (!cancelled) {
          setClaimState((current) =>
            current.user === user
              ? { ...current, checked: true }
              : { user, role: "", checked: true },
          );
        }
      }
    }

    readClaims();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const claimRole = claimState.user === user ? claimState.role : "";
  const claimsChecked =
    !user || (claimState.user === user && claimState.checked);

  const roleCandidates = [
    profile?.role,
    profile?.userRole,
    profile?.permissions?.role,
    user?.role,
    user?.userRole,
    user?.profile?.role,
    user?.customClaims?.role,
    claimRole,
  ];

  const roles = roleCandidates
    .filter((role) => typeof role === "string")
    .map((role) => role.toLowerCase().trim());

  const isAdmin = roles.some((role) =>
    ["admin", "superadmin", "super_admin"].includes(role),
  );

  return { isAdmin, claimsChecked };
}

/* --------------------------------------------------------------- */
/* Small shared components                                         */
/* --------------------------------------------------------------- */

function CountPill({ count, className }) {
  const reduceMotion = useReducedMotion();

  if (!count || count < 1) return null;

  return (
    <motion.span
      key={count}
      initial={reduceMotion ? false : { scale: 0.65, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={popSpring}
      className={cn(
        "relative inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-1 text-[10px] font-bold leading-none text-white",
        className,
      )}
    >
      <span className="relative">{count > 99 ? "99+" : count}</span>
    </motion.span>
  );
}

function OnlineDot({ className, ring = "ring-background" }) {
  return (
    <span
      aria-label="Account available"
      className={cn(
        "absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2",
        ring,
        className,
      )}
    />
  );
}

function GlowAvatar({ user, initials, size = "size-9", className }) {
  return (
    <Avatar
      className={cn(
        size,
        "ring-2 ring-border transition-[box-shadow,transform] duration-300",
        "group-hover:ring-primary/50 group-data-[state=open]:ring-primary/60",
        "motion-reduce:transition-none",
        className,
      )}
    >
      <AvatarImage
        src={user?.photoURL || undefined}
        alt={user?.displayName || "Account avatar"}
      />
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function Identity({ displayName, email, greeting, roleLabel }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
        <Sparkles className="size-3 shrink-0 text-primary" />
        <span className="truncate">{greeting}</span>
      </p>

      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-1.5">
        <p className="truncate text-sm font-semibold text-foreground">
          {displayName}
        </p>

        {roleLabel && (
          <Badge
            variant="outline"
            className="h-5 gap-1 border-primary/25 bg-primary/5 px-1.5 text-[9px] font-semibold text-primary"
          >
            <ShieldCheck className="size-3" />
            {roleLabel}
          </Badge>
        )}
      </div>

      <p className="truncate text-xs text-muted-foreground">
        {email || "Signed in"}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* Admin panel button                                              */
/* --------------------------------------------------------------- */

function AdminPanelButton({ onNavigate }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015 }}
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      transition={popSpring}
    >
      {/* A single link styled as a button, so the whole area is clickable */}
      <Link
        href="/admin"
        onClick={onNavigate}
        className={buttonVariants({
          variant: "default",
          className: "group w-full gap-2",
        })}
      >
        <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />

        <span className="whitespace-nowrap">Admin Panel</span>

        <ArrowUpRight
          className="size-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  );
}

/* --------------------------------------------------------------- */
/* Logged-out navigation                                           */
/* --------------------------------------------------------------- */

function GuestButtons({ stacked, onNavigate }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={listVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      className={cn(
        "flex items-center gap-2",
        stacked && "w-full flex-col items-stretch",
      )}
    >
      <motion.div
        variants={rowVariants}
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <Link
          href="/login"
          onClick={onNavigate}
          className={buttonVariants({
            variant: "ghost",
            className: cn("font-medium", stacked && "w-full"),
          })}
        >
          Log in
        </Link>
      </motion.div>

      <motion.div
        variants={rowVariants}
        whileHover={reduceMotion ? undefined : { y: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <Link
          href="/register"
          onClick={onNavigate}
          className={buttonVariants({
            className: cn(
              "gap-2 shadow-sm shadow-primary/20 transition-shadow hover:shadow-md hover:shadow-primary/25",
              stacked && "w-full",
            ),
          })}
        >
          Get started
          <ArrowRight className="size-4" />
        </Link>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- */
/* Shared navigation links                                         */
/* --------------------------------------------------------------- */

function AccountNavigation({
  pathname,
  notificationCount,
  isAdmin,
  onNavigate,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={listVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="show"
      className="space-y-1"
    >
      {isAdmin && (
        <motion.div variants={rowVariants} className="mb-2">
          <AdminPanelButton onNavigate={onNavigate} />
        </motion.div>
      )}

      {MENU.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item);

        return (
          <motion.div key={item.href} variants={rowVariants}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-10 items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm",
                "text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "motion-reduce:transition-none",
                active && "bg-accent font-medium text-foreground",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute bottom-2 left-0 top-2 w-1 origin-center rounded-r-full bg-primary transition-transform duration-200",
                  active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100",
                  "motion-reduce:transition-none",
                )}
              />

              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors duration-200 group-hover:text-primary",
                  active && "text-primary",
                )}
                aria-hidden="true"
              />

              <span className="min-w-0 flex-1">{item.label}</span>

              {item.bell && notificationCount > 0 && (
                <CountPill count={notificationCount} />
              )}

              {active && (
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* --------------------------------------------------------------- */
/* Stacked / mobile navigation                                      */
/* --------------------------------------------------------------- */

function StackedMenu({
  user,
  displayName,
  email,
  initials,
  pathname,
  notificationCount,
  isAdmin,
  roleLabel,
  onNavigate,
}) {
  const greeting = useGreeting();

  return (
    <div className="w-full space-y-3">
      <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/[0.07] blur-2xl"
        />

        <div className="relative flex items-center gap-3">
          <span className="relative shrink-0">
            <GlowAvatar user={user} initials={initials} size="size-12" />
            <OnlineDot ring="ring-card" />
          </span>

          <Identity
            displayName={displayName}
            email={email}
            greeting={greeting}
            roleLabel={roleLabel}
          />
        </div>

        <div className="relative mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
          <Activity className="size-3.5 text-emerald-500" />
          <span>Signed in and ready to learn</span>
        </div>
      </div>

      <AccountNavigation
        pathname={pathname}
        notificationCount={notificationCount}
        isAdmin={isAdmin}
        onNavigate={onNavigate}
      />

      <div className="border-t border-border pt-2">
        <LogoutButton />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- */
/* Desktop dropdown                                                 */
/* --------------------------------------------------------------- */

function AccountDropdown({
  user,
  displayName,
  email,
  initials,
  pathname,
  notificationCount,
  isAdmin,
  roleLabel,
}) {
  const router = useRouter();
  const greeting = useGreeting();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 1800);

    return () => clearTimeout(timer);
  }, [copied]);

  const copyEmail = useCallback(async () => {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [email]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <motion.button
            type="button"
            whileHover={reduceMotion ? undefined : { y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={popSpring}
            aria-label="Open account menu"
            className={cn(
              "group flex h-11 items-center gap-2 rounded-full border border-border bg-background px-1.5 pr-3",
              "outline-none transition-colors duration-200 hover:bg-accent",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              open && "bg-accent",
            )}
          />
        }
      >
        <span className="relative">
          <GlowAvatar user={user} initials={initials} />
          <OnlineDot className="size-2" />
          {notificationCount > 0 && !open && (
            <motion.span
              initial={reduceMotion ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={popSpring}
              className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-background"
            />
          )}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(21rem,calc(100vw-1.5rem))] overflow-auto rounded-2xl border-border bg-popover p-0 text-popover-foreground shadow-xl shadow-black/10"
      >
        {/* Account identity */}
        <div className="relative overflow-hidden border-b border-border bg-muted/40 p-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/[0.08] blur-2xl"
          />

          <div className="relative flex items-center gap-3">
            <motion.span
              initial={reduceMotion ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={popSpring}
              className="relative shrink-0"
            >
              <GlowAvatar user={user} initials={initials} size="size-12" />
              <OnlineDot />
            </motion.span>

            <Identity
              displayName={displayName}
              email={email}
              greeting={greeting}
              roleLabel={roleLabel}
            />
          </div>

          <div className="relative mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="size-3.5" />
            </span>
            <span className="flex-1">
              Account status
              <span className="mt-0.5 block font-medium text-foreground">
                Signed in
              </span>
            </span>
            <span className="size-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="p-2">
          {isAdmin && (
            <>
              <DropdownMenuLabel className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Administration
              </DropdownMenuLabel>

              <div className="px-1 pb-2">
                <AdminPanelButton onNavigate={() => setOpen(false)} />
              </div>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuLabel className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Your workspace
          </DropdownMenuLabel>

          <AccountNavigation
            pathname={pathname}
            notificationCount={notificationCount}
            isAdmin={false}
            onNavigate={() => setOpen(false)}
          />

          <DropdownMenuSeparator className="my-2" />

          {email && (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                copyEmail();
              }}
              className="cursor-pointer gap-2 rounded-lg py-2.5"
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4 text-muted-foreground" />
              )}

              <span className="flex-1">
                {copied ? "Email copied" : "Copy email address"}
              </span>

              <span role="status" className="sr-only">
                {copied ? "Email copied to clipboard" : ""}
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onSelect={() => {
              setOpen(false);
              router.push("/courses");
            }}
            className="cursor-pointer gap-2 rounded-lg py-2.5"
          >
            <GraduationCap className="size-4 text-muted-foreground" />
            <span className="flex-1">Explore courses</span>
            <ArrowUpRight className="size-3.5 text-muted-foreground" />
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setOpen(false);
              router.push("/contact");
            }}
            className="cursor-pointer gap-2 rounded-lg py-2.5"
          >
            <LifeBuoy className="size-4 text-muted-foreground" />
            <span className="flex-1">Help & support</span>
            <ArrowUpRight className="size-3.5 text-muted-foreground" />
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2" />

          <div className="px-1 pb-1">
            <LogoutButton />
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* --------------------------------------------------------------- */
/* Main export                                                      */
/* --------------------------------------------------------------- */

export function AuthNav({
  stacked = false,
  notificationCount = 0,
  onNavigate,
}) {
  const { user, loading, profile } = useAuth();
  const pathname = usePathname();

  // Hooks stay above every early return so their order never changes.
  const { isAdmin: profileAdmin } = useAdminRole(user, profile);
  const staff = useStaffAccess(user);

  // `admins` collection (server) is the source of truth; profile/claims are a fallback.
  const isAdmin = staff.isStaff || profileAdmin;
  const roleLabel = isAdmin ? ROLE_LABELS[staff.role] || ROLE_LABELS.admin : "";

  if (loading) {
    return (
      <div
        role="status"
        aria-busy="true"
        className={cn(
          "flex items-center gap-2",
          stacked && "w-full flex-col items-stretch",
        )}
      >
        <span className="sr-only">Loading account...</span>

        {stacked ? (
          <>
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </>
        ) : (
          <>
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="hidden h-9 w-24 rounded-xl sm:block" />
          </>
        )}
      </div>
    );
  }

  if (!user) {
    return <GuestButtons stacked={stacked} onNavigate={onNavigate} />;
  }

  const displayName =
    user.displayName ||
    profile?.displayName ||
    user.email?.split("@")[0] ||
    "User";

  const email = user.email || profile?.email || "";
  const initials = initialsOf(displayName);

  const shared = {
    user,
    displayName,
    email,
    initials,
    pathname,
    notificationCount,
    isAdmin,
    roleLabel,
  };

  if (stacked) {
    return <StackedMenu {...shared} onNavigate={onNavigate} />;
  }

  return <AccountDropdown {...shared} />;
}

export default AuthNav;
