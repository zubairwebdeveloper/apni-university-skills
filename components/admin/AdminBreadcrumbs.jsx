// components/admin/AdminBreadcrumbs.jsx
"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LayoutDashboard } from "lucide-react";

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
  courses: "Courses",
  payments: "Payments",
  enrollments: "Enrollments",
  certificates: "Certificates",
  settings: "Settings",
};

// Firestore auto-ID jaisa lamba alphanumeric segment (letters + digits, no hyphen)
const looksLikeId = (s) => /^(?=.*\d)(?=.*[a-zA-Z])[A-Za-z0-9]{20,}$/.test(s);

const pretty = (s) => {
  if (LABELS[s]) return LABELS[s];
  if (looksLikeId(s)) return "Details";
  return decodeURIComponent(s)
    .replace(/-/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
};

const MAX_VISIBLE = 4;

const linkClass =
  "rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((p, i) => ({
      label: pretty(p),
      href: "/" + parts.slice(0, i + 1).join("/"),
    }));
  }, [pathname]);

  if (crumbs.length <= 1) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium">
        <LayoutDashboard
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
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

  const renderCrumb = (c, isHome, isLast) => (
    <BreadcrumbItem className="max-w-[10rem] sm:max-w-[16rem]">
      {isLast ? (
        <BreadcrumbPage className="truncate font-semibold">
          {c.label}
        </BreadcrumbPage>
      ) : (
        <Link
          href={c.href}
          className={cn(linkClass, "flex items-center gap-1.5 truncate")}
          aria-label={isHome ? "Dashboard" : undefined}
        >
          {isHome ? (
            <LayoutDashboard aria-hidden="true" className="size-4 shrink-0" />
          ) : null}
          {isHome ? null : <span className="truncate">{c.label}</span>}
        </Link>
      )}
    </BreadcrumbItem>
  );

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      {/* Mobile: back link + current page */}
      <div className="flex min-w-0 items-center gap-1 text-sm sm:hidden">
        <Link
          href={parent.href}
          className={cn(
            linkClass,
            "flex shrink-0 items-center gap-1 rounded-md border bg-background px-2 py-1 text-muted-foreground",
          )}
        >
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          <span className="max-w-[6rem] truncate">{parent.label}</span>
        </Link>
        <span aria-hidden="true" className="text-muted-foreground/50">
          /
        </span>
        <span
          aria-current="page"
          className="min-w-0 truncate font-semibold text-foreground"
        >
          {current.label}
        </span>
      </div>

      {/* Tablet / desktop: poori trail */}
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          {head.map((c, i) => {
            const isHome = i === 0;
            const last = !collapsed && i === crumbs.length - 1;
            return (
              <Fragment key={c.href}>
                {renderCrumb(c, isHome, last)}
                {!last && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}

          {collapsed && (
            <>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      linkClass,
                      "flex items-center gap-1 rounded-md px-1 hover:bg-accent",
                    )}
                    aria-label="Show hidden pages"
                  >
                    <BreadcrumbEllipsis className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {hidden.map((c) => (
                      <DropdownMenuItem key={c.href}>
                        <Link href={c.href} className="w-full">
                          {c.label}
                        </Link>
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
                    {renderCrumb(c, false, last)}
                    {!last && <BreadcrumbSeparator />}
                  </Fragment>
                );
              })}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
