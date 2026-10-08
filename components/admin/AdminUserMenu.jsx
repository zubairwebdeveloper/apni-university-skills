// components/admin/AdminUserMenu.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiGrid,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { ArrowUpRight, ChevronDown, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { endServerSession } from "@/lib/firebase/client/auth";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

const itemLink =
  "flex w-full items-center gap-2 px-2 py-1.5 text-sm outline-none";

function initialsOf(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// A Link inside a menu item. The item's onSelect does the navigation
// (so Enter / Space work from the keyboard too); the Link gives us a real
// href and route prefetching. A plain click is handled once, by onSelect.
function MenuLink({ href, external = false, icon: Icon, children, trailing }) {
  const router = useRouter();

  const go = () => {
    if (external) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  };

  return (
    <DropdownMenuItem onSelect={go} className="group p-0">
      <Link
        href={href}
        tabIndex={-1}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={(e) => e.preventDefault()}
        className={itemLink}
      >
        <Icon
          aria-hidden="true"
          className="size-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:scale-110 group-hover:text-primary group-data-[highlighted]:translate-x-0.5 group-data-[highlighted]:text-primary motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:scale-100"
        />
        <span className="flex-1 transition-transform duration-200 group-hover:translate-x-0.5 group-data-[highlighted]:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0">
          {children}
        </span>
        {external ? (
          <span className="sr-only">(opens in a new tab)</span>
        ) : null}
        {trailing}
      </Link>
    </DropdownMenuItem>
  );
}

export function AdminUserMenu({ person = {}, role = "student" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const name = person?.name || "Admin";
  const email = person?.email || "";
  const photoURL = person?.photoURL || null;
  const roleLabel = ROLE_LABELS?.[role] ?? role ?? "User";
  const initials = initialsOf(name);

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

  async function logout(e) {
    // Keep the menu open while we show the loading state.
    e.preventDefault();
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await endServerSession();
    } catch (error) {
      console.error("[admin-user-menu] logout failed:", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "group flex items-center gap-2 rounded-full p-0.5 outline-none transition-all duration-200 hover:bg-accent hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 sm:pr-2",
          open && "bg-accent",
        )}
        aria-label="Open account menu"
      >
        <span className="relative">
          <Avatar className="size-9 ring-2 ring-background transition-transform duration-200 group-hover:scale-105 group-hover:ring-primary/40 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            {photoURL ? <AvatarImage src={photoURL} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Online dot */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
          />
        </span>

        {/* Name + role (large screens only) */}
        <span className="hidden min-w-0 max-w-32 text-left leading-tight xl:block">
          <span className="block truncate text-sm font-medium">{name}</span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {roleLabel}
          </span>
        </span>

        <ChevronDown
          aria-hidden="true"
          className={cn(
            "hidden size-3.5 text-muted-foreground transition-all duration-200 group-hover:translate-y-0.5 group-hover:text-foreground motion-reduce:transition-none sm:block",
            open && "rotate-180 group-hover:-translate-y-0.5",
          )}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden p-0"
      >
        {/* Profile header */}
        <DropdownMenuLabel className="relative border-b bg-gradient-to-br from-primary/10 via-background to-background p-4 font-normal">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/15 blur-2xl"
          />

          <div className="relative flex items-center gap-3">
            <Avatar className="size-12 ring-2 ring-background">
              {photoURL ? <AvatarImage src={photoURL} alt={name} /> : null}
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold leading-none">
                {name}
              </p>
              {email ? (
                <p className="truncate text-xs text-muted-foreground">
                  {email}
                </p>
              ) : null}
              <Badge variant="secondary" className="capitalize">
                {roleLabel}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="p-1">
          <DropdownMenuGroup>
            <MenuLink href="/admin" icon={FiGrid}>
              Dashboard
            </MenuLink>

            <MenuLink href="/student/profile" icon={FiUser}>
              My profile
            </MenuLink>

            {email ? (
              <DropdownMenuItem onSelect={copyEmail} className="group gap-2">
                {copied ? (
                  <FiCheck
                    aria-hidden="true"
                    className="size-4 text-emerald-600 dark:text-emerald-400"
                  />
                ) : (
                  <FiCopy
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-all duration-200 group-hover:scale-110 group-hover:text-primary group-data-[highlighted]:text-primary motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                )}
                <span className="flex-1">
                  {copied ? "Email copied" : "Copy email"}
                </span>
                <span role="status" className="sr-only">
                  {copied ? "Email copied to clipboard" : ""}
                </span>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <MenuLink
              href="/"
              external
              icon={FiExternalLink}
              trailing={
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-70 group-data-[highlighted]:opacity-70 motion-reduce:transition-none"
                />
              }
            >
              View website
            </MenuLink>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onSelect={logout}
            disabled={loggingOut}
            className="group gap-2"
          >
            {loggingOut ? (
              <Loader2
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            ) : (
              <FiLogOut
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-1 group-data-[highlighted]:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            )}
            <span>{loggingOut ? "Logging out…" : "Log out"}</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
