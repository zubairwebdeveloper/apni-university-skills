// components/admin/AdminUserMenu.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiGrid,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { ChevronDown } from "lucide-react";

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
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

function initialsOf(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "A";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function UserAvatar({ photoURL, initials, name, className }) {
  return (
    <Avatar className={className}>
      {photoURL ? (
        <AvatarImage src={photoURL} alt={name} referrerPolicy="no-referrer" />
      ) : null}
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function AdminUserMenu({ person = {}, role = "student" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const name = person?.name || "Admin";
  const email = person?.email || "";
  const photoURL = person?.photoURL || null;
  const roleLabel = ROLE_LABELS?.[role] ?? role ?? "User";
  const initials = initialsOf(name);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function copyEmail(e) {
    e.preventDefault(); // menu khula rahe taake "Copied" nazar aaye
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard block ho to chup rahen
    }
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center gap-2 rounded-full p-0.5 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring sm:pr-2",
            open && "bg-accent",
          )}
          aria-label="Open account menu"
        >
          <UserAvatar
            photoURL={photoURL}
            initials={initials}
            name=""
            className="size-9"
          />
          <span className="hidden min-w-0 max-w-32 text-left leading-tight xl:block">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {roleLabel}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "hidden size-3.5 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none sm:block",
              open && "rotate-180",
            )}
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[min(18rem,calc(100vw-1.5rem))] p-0"
        >
          <DropdownMenuLabel className="border-b p-4 font-normal">
            <div className="flex items-center gap-3">
              <UserAvatar
                photoURL={photoURL}
                initials={initials}
                name={name}
                className="size-12"
              />
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
              <DropdownMenuItem
                onSelect={() => router.push("/admin")}
                className="gap-2"
              >
                <FiGrid aria-hidden="true" className="size-4" />
                Dashboard
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={() => router.push("/student/profile")}
                className="gap-2"
              >
                <FiUser aria-hidden="true" className="size-4" />
                My profile
              </DropdownMenuItem>

              {email ? (
                <DropdownMenuItem onSelect={copyEmail} className="gap-2">
                  {copied ? (
                    <FiCheck
                      aria-hidden="true"
                      className="size-4 text-emerald-600 dark:text-emerald-400"
                    />
                  ) : (
                    <FiCopy aria-hidden="true" className="size-4" />
                  )}
                  {copied ? "Email copied" : "Copy email"}
                  <span role="status" className="sr-only">
                    {copied ? "Email copied to clipboard" : ""}
                  </span>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={() => window.open("/", "_blank", "noopener,noreferrer")}
              className="gap-2"
            >
              <FiExternalLink aria-hidden="true" className="size-4" />
              View website
              <span className="sr-only">(opens in a new tab)</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <LogoutButton
              hideTrigger
              open={logoutOpen}
              onOpenChange={setLogoutOpen}
              userName={person?.name}
              userEmail={email}
              userPhoto={photoURL ?? undefined}
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
