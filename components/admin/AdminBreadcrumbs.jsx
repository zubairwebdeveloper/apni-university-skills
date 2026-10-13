// components/admin/AdminBreadcrumbs.jsx
"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronLeft, Link2, LayoutDashboard } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LABELS = {
  admin: "Dashboard",
  create: "New",
  edit: "Edit",
  general: "General",
  security: "Security",
  notifications: "Notifications",
  users: "Users & Roles",
  students: "Students",
  teachers: "Teachers",
  instructors: "Instructors",
  courses: "Courses",
  lessons: "Lessons",
  payments: "Payments",
  enrollments: "Enrollments",
  certificates: "Certificates",
  reviews: "Reviews",
  coupons: "Coupons",
  audit: "Audit log",
  settings: "Settings",
};

// Firestore auto-ID jaisa lamba alphanumeric segment
const looksLikeId = (s) => /^(?=.*\d)(?=.*[a-zA-Z])[A-Za-z0-9]{20,}$/.test(s);

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const pretty = (s) => {
  if (LABELS[s]) return LABELS[s];
  if (looksLikeId(s)) return "Details";
  return safeDecode(s)
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
};

const MAX_VISIBLE = 4;

// Entrance: pure CSS, har crumb ki apni delay
const enter =
  "animate-in fade-in slide-in-from-left-2 fill-mode-both duration-300 motion-reduce:animate-none";
const delay = (i) => ({ animationDelay: `${i * 60}ms` });

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// 3D chip: hover par perspective tilt + uthna, press par dabna
const chip = cn(
  "rounded-lg border border-transparent px-2 py-1 text-muted-foreground",
  "transition-[transform,background-color,color,box-shadow,border-color] duration-200",
  "hover:border-border hover:bg-background hover:text-foreground hover:shadow-sm",
  "hover:[transform:perspective(420px)_rotateX(10deg)_translateY(-1px)]",
  "active:[transform:perspective(420px)_rotateX(0deg)_translateY(1px)]",
  "motion-reduce:transition-none motion-reduce:hover:[transform:none] motion-reduce:active:[transform:none]",
  focusRing,
);

function CopyLink() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard block ho to chup rahen
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        title="Copy link to this page"
        aria-label="Copy link to this page"
        className={cn(
          "ml-1 grid size-7 shrink-0 place-items-center rounded-md border bg-background text-muted-foreground shadow-sm",
          "transition-all duration-150 hover:-translate-y-0.5 hover:text-primary active:translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          focusRing,
        )}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-3.5 text-primary" />
        ) : (
          <Link2 aria-hidden="true" className="size-3.5" />
        )}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </>
  );
}

function HomeTile({ className }) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary",
        "shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)] ring-1 ring-inset ring-primary/20",
        className,
      )}
    >
      <LayoutDashboard aria-hidden="true" className="size-4" />
    </span>
  );
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const router = useRouter();

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((p, i) => ({
      label: pretty(p),
      href: "/" + parts.slice(0, i + 1).join("/"),
    }));
  }, [pathname]);

  if (crumbs.length <= 1) {
    return (
      <p className="flex items-center gap-2 text-sm font-semibold">
        <HomeTile />
        Dashboard
      </p>
    );
  }

  const current = crumbs[crumbs.length - 1];
  const parent = crumbs[crumbs.length - 2];

  // Lambi trail: pehla crumb + dropdown (beech wale) + aakhri 2
  const collapsed = crumbs.length > MAX_VISIBLE;
  const head = collapsed ? [crumbs[0]] : crumbs;
  const hidden = collapsed ? crumbs.slice(1, -2) : [];
  const tail = collapsed ? crumbs.slice(-2) : [];

  const renderCrumb = (c, { isHome, isLast, index }) => (
    <BreadcrumbItem
      className={cn(
        "max-w-[10rem] [perspective:420px] sm:max-w-[16rem]",
        enter,
      )}
      style={delay(index)}
    >
      {isLast ? (
        <BreadcrumbPage
          className={cn(
            "flex items-center truncate rounded-lg border border-primary/20 bg-gradient-to-b from-primary/15 to-primary/5 px-2.5 py-1 font-semibold text-foreground",
            "shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_22%,transparent)]",
          )}
        >
          <span className="truncate">{c.label}</span>
        </BreadcrumbPage>
      ) : (
        <Link
          href={c.href}
          className={cn(chip, "flex items-center gap-1.5 truncate")}
          aria-label={isHome ? "Dashboard" : undefined}
        >
          {isHome ? <HomeTile /> : <span className="truncate">{c.label}</span>}
        </Link>
      )}
    </BreadcrumbItem>
  );

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      {/* Mobile: back button + current page */}
      <div className="flex min-w-0 items-center gap-1.5 text-sm sm:hidden">
        <Link
          href={parent.href}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-lg border bg-background px-2 py-1 text-muted-foreground shadow-[0_2px_0_0_var(--border)]",
            "transition-[transform,box-shadow] duration-100 active:translate-y-[2px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
            focusRing,
          )}
        >
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          <span className="max-w-[6rem] truncate">{parent.label}</span>
        </Link>
        <span
          aria-current="page"
          className="min-w-0 truncate rounded-lg bg-primary/10 px-2 py-1 font-semibold text-foreground"
        >
          {current.label}
        </span>
        <CopyLink />
      </div>

      {/* Tablet / desktop: poori trail */}
      <div className="hidden items-center sm:flex">
        {/* key = pathname: page badalne par entrance dobara chalta hai */}
        <Breadcrumb key={pathname} className="min-w-0">
          <BreadcrumbList className="flex-nowrap">
            {head.map((c, i) => {
              const last = !collapsed && i === crumbs.length - 1;
              return (
                <Fragment key={c.href}>
                  {renderCrumb(c, { isHome: i === 0, isLast: last, index: i })}
                  {!last && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}

            {collapsed && (
              <>
                <BreadcrumbItem className={enter} style={delay(1)}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(chip, "flex items-center")}
                      aria-label="Show hidden pages"
                    >
                      <BreadcrumbEllipsis className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {hidden.map((c) => (
                        <DropdownMenuItem
                          key={c.href}
                          onSelect={() => router.push(c.href)}
                        >
                          {c.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {tail.map((c, i) => {
                  const last = i === tail.length - 1;
                  return (
                    <Fragment key={c.href}>
                      {renderCrumb(c, {
                        isHome: false,
                        isLast: last,
                        index: i + 2,
                      })}
                      {!last && <BreadcrumbSeparator />}
                    </Fragment>
                  );
                })}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <CopyLink />
      </div>
    </nav>
  );
}
