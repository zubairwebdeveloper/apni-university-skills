"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Mail,
  Minus,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Rows3,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Run once if missing: npx shadcn@latest add sheet
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { auth } from "@/lib/firebase/client/auth";
import { listAdmins, deleteAdmin } from "@/services/admin/adminUsersClient";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const PAGE_SIZES = [8, 16, 24, 48];
const DAY = 86400000;
const PREF_KEY = "admin-users-table:prefs";

const ROLE_META = {
  admin: {
    label: "Admin",
    plural: "Admins",
    badge: "border-primary/25 bg-primary/10 text-primary",
    tint: "bg-primary/10 text-primary",
    bar: "bg-primary",
    icon: ShieldCheck,
    summary: "Full control of the dashboard, including who else has access.",
  },
  editor: {
    label: "Editor",
    plural: "Editors",
    badge: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    tint: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    bar: "bg-sky-500",
    icon: UserCog,
    summary: "Creates and publishes content. Can moderate reviews.",
  },
  instructor: {
    label: "Instructor",
    plural: "Instructors",
    badge:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    tint: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    icon: GraduationCap,
    summary: "Can view courses and lessons. Cannot publish or delete.",
  },
};

const ROLE_RANK = { admin: 0, editor: 1, instructor: 2 };

// Edit these rows to match your real permissions.
const PERMISSIONS = [
  {
    area: "Courses and lessons",
    admin: "full",
    editor: "full",
    instructor: "view",
  },
  { area: "Blog posts", admin: "full", editor: "full", instructor: "none" },
  {
    area: "Careers and jobs",
    admin: "full",
    editor: "full",
    instructor: "none",
  },
  { area: "Reviews", admin: "full", editor: "full", instructor: "none" },
  {
    area: "Students and enrollments",
    admin: "full",
    editor: "none",
    instructor: "none",
  },
  {
    area: "Payments and analytics",
    admin: "full",
    editor: "none",
    instructor: "none",
  },
  {
    area: "Admin users and settings",
    admin: "full",
    editor: "none",
    instructor: "none",
  },
];

const LEVEL = {
  full: {
    label: "Can manage",
    icon: Check,
    cls: "text-emerald-600 dark:text-emerald-300",
  },
  view: {
    label: "View only",
    icon: Eye,
    cls: "text-amber-600 dark:text-amber-300",
  },
  none: { label: "No access", icon: Minus, cls: "text-muted-foreground/60" },
};

const roleMeta = (role) =>
  ROLE_META[role] ?? {
    label: String(role || "admin").replace(/[_-]/g, " "),
    plural: "Others",
    badge: "border-border bg-muted text-muted-foreground",
    tint: "bg-muted text-muted-foreground",
    bar: "bg-muted-foreground",
    icon: ShieldCheck,
    summary: "",
  };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function toMs(ts) {
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  const d = new Date(ts).getTime();
  return Number.isNaN(d) ? 0 : d;
}

const byName = (a, b) => (a.name || a.id).localeCompare(b.name || b.id);
const byRole = (a, b) =>
  (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9) || byName(a, b);

const SORTS = {
  "name-asc": { label: "Name, A to Z", fn: byName },
  "name-desc": { label: "Name, Z to A", fn: (a, b) => byName(b, a) },
  "role-asc": { label: "Role, most access first", fn: byRole },
  "role-desc": {
    label: "Role, least access first",
    fn: (a, b) => byRole(b, a),
  },
  newest: {
    label: "Newest first",
    fn: (a, b) => toMs(b.createdAt) - toMs(a.createdAt),
  },
  oldest: {
    label: "Oldest first",
    fn: (a, b) => toMs(a.createdAt) - toMs(b.createdAt),
  },
};

function formatDate(ts) {
  const ms = toMs(ts);
  if (!ms) return "Unknown";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

function timeAgo(ts) {
  const ms = toMs(ts);
  if (!ms) return "";
  const diff = (ms - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const steps = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, sec] of steps) {
    if (Math.abs(diff) >= sec) return rtf.format(Math.round(diff / sec), unit);
  }
  return "just now";
}

const initialOf = (name, email) =>
  (name || email || "A").trim().slice(0, 1).toUpperCase();

const isNewAdmin = (a) => {
  const ms = toMs(a.createdAt);
  return ms > 0 && Date.now() - ms < 7 * DAY;
};

function pageList(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  const arr = [...set]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out = [];
  arr.forEach((p, i) => {
    if (i && p - arr[i - 1] > 1) out.push(`gap-${p}`);
    out.push(p);
  });
  return out;
}

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function exportCsv(rows, scope) {
  const header = ["Name", "Email", "Role", "Added", "Added by"];
  const lines = rows.map((a) =>
    [
      a.name,
      a.id,
      roleMeta(a.role).label,
      toMs(a.createdAt) ? new Date(toMs(a.createdAt)).toISOString() : "",
      a.createdBy,
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob(
    [[header.map(csvCell).join(","), ...lines].join("\n")],
    {
      type: "text/csv;charset=utf-8",
    },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `admin-users-${scope}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(
    `Exported ${rows.length} ${rows.length === 1 ? "admin" : "admins"}`,
  );
}

function useCountUp(value, reduce) {
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 700);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduce]);
  return reduce ? value : n;
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// Gives a small checkbox a finger-sized tap area without changing its look.
function TapTarget({ children, disabled }) {
  return (
    <label
      className={cn(
        "-m-3 flex size-10 items-center justify-center",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      {children}
    </label>
  );
}

function RoleBadge({ role }) {
  const m = roleMeta(role);
  const Icon = m.icon;
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", m.badge)}>
      <Icon aria-hidden="true" className="size-3" />
      {m.label}
    </Badge>
  );
}

function PersonCell({ admin, isMe, size = "size-10", onOpen }) {
  const m = roleMeta(admin.role);
  const name = admin.name || "Unnamed admin";
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={cn(size, "shrink-0 ring-2 ring-background")}>
        {admin.image ? <AvatarImage src={admin.image} alt={name} /> : null}
        <AvatarFallback className={cn("font-semibold", m.tint)}>
          {initialOf(admin.name, admin.id)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="truncate rounded text-left text-sm font-semibold leading-tight text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {name}
            </button>
          ) : (
            <span className="truncate text-sm font-semibold leading-tight">
              {name}
            </span>
          )}
          {isMe ? (
            <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              You
            </span>
          ) : null}
          {isNewAdmin(admin) ? (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              New
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">{admin.id}</p>
      </div>
    </div>
  );
}

function SortHead({ label, first, second, sort, setSort, className }) {
  const dir = sort === first ? "asc" : sort === second ? "desc" : null;
  const Icon =
    dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <TableHead
      className={className}
      aria-sort={
        dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none"
      }
    >
      <button
        type="button"
        onClick={() => setSort(sort === first ? second : first)}
        className={cn(
          "-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
          dir ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon aria-hidden="true" className="size-3.5" />
      </button>
    </TableHead>
  );
}

/* Overview: one card that shows how access is split across roles. */
function Overview({ counts, recent, roleFilter, onPick }) {
  const reduce = useReducedMotion();
  const total = counts.total || 1;
  const items = [
    {
      key: "all",
      label: "Everyone",
      value: counts.total,
      icon: Users,
      tint: "bg-foreground/5 text-foreground",
    },
    ...["admin", "editor", "instructor"].map((k) => ({
      key: k,
      label: ROLE_META[k].plural,
      value: counts[k],
      icon: ROLE_META[k].icon,
      tint: ROLE_META[k].tint,
    })),
  ];

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Who has access
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {counts.total === 0
              ? "No one has been added yet."
              : recent > 0
                ? `${recent} added in the last 30 days.`
                : "No new people in the last 30 days."}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Select a role to filter the list.
        </p>
      </div>

      <div
        className="mx-4 mt-4 flex h-2.5 overflow-hidden rounded-full bg-muted sm:mx-5"
        role="img"
        aria-label={`Admins ${counts.admin}, editors ${counts.editor}, instructors ${counts.instructor}`}
      >
        {["admin", "editor", "instructor"].map((k) => (
          <motion.div
            key={k}
            className={cn("h-full", ROLE_META[k].bar)}
            initial={reduce ? false : { width: 0 }}
            animate={{ width: `${(counts[k] / total) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px border-t bg-border lg:grid-cols-4">
        {items.map((it) => (
          <OverviewTile
            key={it.key}
            item={it}
            share={
              it.key === "all" ? null : Math.round((it.value / total) * 100)
            }
            active={roleFilter === it.key}
            onClick={() => onPick(it.key)}
            reduce={reduce}
          />
        ))}
      </div>
    </Card>
  );
}

function OverviewTile({ item, share, active, onClick, reduce }) {
  const Icon = item.icon;
  const shown = useCountUp(item.value, reduce);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-3 bg-card p-3.5 text-left outline-none transition-colors hover:bg-muted/50 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-4",
        active &&
          "bg-primary/5 shadow-[inset_0_-2px_0_0_var(--color-primary,theme(colors.primary.DEFAULT))]",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          item.tint,
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xl font-semibold tabular-nums leading-none tracking-tight sm:text-2xl">
          {shown}
        </span>
        <span className="mt-1.5 block truncate text-xs font-medium text-muted-foreground">
          {item.label}
          {share !== null ? ` · ${share}%` : ""}
        </span>
      </span>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-[188px] rounded-xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ filtered, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {filtered ? (
          <Search className="size-6" />
        ) : (
          <Users className="size-6" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">
          {filtered ? "No admins match these filters" : "No admins yet"}
        </h3>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {filtered
            ? "Check the spelling, or clear the filters to see everyone."
            : "Add the first person who should manage this dashboard."}
        </p>
      </div>
      {filtered ? (
        <Button variant="outline" size="sm" onClick={onClear}>
          <X className="mr-1.5 size-4" /> Clear filters
        </Button>
      ) : (
        <Link
          href="/admin/admin-users/create"
          className={buttonVariants({ size: "sm" })}
        >
          <UserPlus className="mr-1.5 size-4" /> Add admin
        </Link>
      )}
    </div>
  );
}

function RowMenu({
  admin,
  canDelete,
  blockedReason,
  onOpen,
  onCopy,
  onDelete,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger >
        <Button
          variant="ghost"
          size="icon"
          className="size-10 shrink-0 md:size-9"
          aria-label={`Options for ${admin.name || admin.id}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        collisionPadding={12}
        className="w-56 max-w-[calc(100vw-1.5rem)]"
      >
        <DropdownMenuItem onClick={() => onOpen(admin)}>
          <Eye className="mr-2 size-4" /> View details
        </DropdownMenuItem>
        <DropdownMenuItem >
          <Link
            href={`/admin/admin-users/${encodeURIComponent(admin.id)}/edit`}
          >
            <Pencil className="mr-2 size-4" /> Edit admin
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopy(admin.id)}>
          <Copy className="mr-2 size-4" /> Copy email
        </DropdownMenuItem>
        <DropdownMenuItem >
          <a href={`mailto:${admin.id}`}>
            <Mail className="mr-2 size-4" /> Send email
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canDelete}
          onClick={() => onDelete(admin)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 size-4" />
          {canDelete ? "Delete admin" : blockedReason}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterChip({ children, onRemove, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border bg-muted/50 py-0.5 pl-2.5 pr-1 text-xs font-medium">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={label}
        className="rounded-full p-1 text-muted-foreground outline-none transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

/* Side panel with full details and the permissions for that person's role. */
function DetailSheet({ admin, isMe, del, onClose, onCopy, onDelete }) {
  const m = admin ? roleMeta(admin.role) : null;
  const key = admin && ROLE_META[admin.role] ? admin.role : null;
  return (
    <Sheet open={!!admin} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        {admin ? (
          <>
            <SheetHeader className="border-b bg-muted/30 p-5 pr-12">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 shrink-0 ring-2 ring-background">
                  {admin.image ? (
                    <AvatarImage
                      src={admin.image}
                      alt={admin.name || admin.id}
                    />
                  ) : null}
                  <AvatarFallback
                    className={cn("text-lg font-semibold", m.tint)}
                  >
                    {initialOf(admin.name, admin.id)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-lg">
                    {admin.name || "Unnamed admin"}
                    {isMe ? (
                      <span className="ml-2 text-xs font-medium text-emerald-600">
                        You
                      </span>
                    ) : null}
                  </SheetTitle>
                  <SheetDescription className="truncate">
                    {admin.id}
                  </SheetDescription>
                  <div className="mt-2">
                    <RoleBadge role={admin.role} />
                  </div>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-6 p-5">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Added on</dt>
                  <dd className="mt-0.5 font-medium">
                    {formatDate(admin.createdAt)}
                  </dd>
                  <dd className="text-xs text-muted-foreground">
                    {timeAgo(admin.createdAt)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Added by</dt>
                  <dd className="mt-0.5 truncate font-medium">
                    {admin.createdBy || "Unknown"}
                  </dd>
                </div>
              </dl>

              <div>
                <h3 className="text-sm font-semibold">What this role can do</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {m.summary}
                </p>
                {key ? (
                  <ul className="mt-3 divide-y rounded-lg border">
                    {PERMISSIONS.map((p) => {
                      const lv = LEVEL[p[key]];
                      const Icon = lv.icon;
                      return (
                        <li
                          key={p.area}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
                        >
                          <span>{p.area}</span>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-xs font-medium",
                              lv.cls,
                            )}
                          >
                            <Icon aria-hidden="true" className="size-3.5" />
                            {lv.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/admin-users/${encodeURIComponent(admin.id)}/edit`}
                  className={buttonVariants({ size: "sm" })}
                >
                  <Pencil className="mr-1.5 size-4" /> Edit admin
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCopy(admin.id)}
                >
                  <Copy className="mr-1.5 size-4" /> Copy email
                </Button>
                <a
                  href={`mailto:${admin.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <Mail className="mr-1.5 size-4" /> Send email
                </a>
              </div>

              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-sm font-medium">Remove access</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {del.ok
                    ? "This person will lose dashboard access immediately."
                    : `${del.reason}.`}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                  disabled={!del.ok}
                  onClick={() => onDelete(admin)}
                >
                  <Trash2 className="mr-1.5 size-4" /> Delete admin
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function PermissionMatrix() {
  const roles = ["admin", "editor", "instructor"];
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4 text-xs font-semibold">Area</TableHead>
            {roles.map((r) => (
              <TableHead key={r} className="text-xs font-semibold">
                <RoleBadge role={r} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {PERMISSIONS.map((p) => (
            <TableRow key={p.area}>
              <TableCell className="pl-4 text-sm font-medium">
                {p.area}
              </TableCell>
              {roles.map((r) => {
                const lv = LEVEL[p[r]];
                const Icon = lv.icon;
                return (
                  <TableCell key={r}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        lv.cls,
                      )}
                    >
                      <Icon aria-hidden="true" className="size-3.5" />
                      {lv.label}
                    </span>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function AdminUsersTable() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const searchRef = useRef(null);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [me, setMe] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [view, setView] = useState("table");
  const [density, setDensity] = useState("comfortable");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [showMatrix, setShowMatrix] = useState(false);

  const [selected, setSelected] = useState(() => new Set());
  const [pending, setPending] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [detail, setDetail] = useState(null);

  // Remember view, density and page size between visits
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
      if (p.view) setView(p.view);
      if (p.density) setDensity(p.density);
      if (PAGE_SIZES.includes(p.pageSize)) setPageSize(p.pageSize);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({ view, density, pageSize }),
      );
    } catch {}
  }, [view, density, pageSize]);

  const load = useCallback(async ({ soft = false } = {}) => {
    soft ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      setAdmins(await listAdmins());
      setSyncedAt(new Date());
      if (soft) toast.success("List updated");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setMe(u?.email?.toLowerCase() ?? null);
      if (u) load();
    });
    return unsub;
  }, [load]);

  // Keyboard shortcuts: / search, r refresh, n new admin
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t?.tagName === "INPUT" ||
        t?.tagName === "TEXTAREA" ||
        t?.isContentEditable
      )
        return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "r") {
        load({ soft: true });
      } else if (e.key === "n") {
        router.push("/admin/admin-users/create");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [load, router]);

  /* ---------- derived data ---------- */

  const counts = useMemo(() => {
    const c = { total: admins.length, admin: 0, editor: 0, instructor: 0 };
    for (const a of admins) if (c[a.role] !== undefined) c[a.role] += 1;
    return c;
  }, [admins]);

  const recent = useMemo(
    () =>
      admins.filter(
        (a) => toMs(a.createdAt) && Date.now() - toMs(a.createdAt) < 30 * DAY,
      ).length,
    [admins],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return admins
      .filter((a) => roleFilter === "all" || a.role === roleFilter)
      .filter(
        (a) =>
          !q ||
          (a.name || "").toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q),
      )
      .sort(SORTS[sort].fn);
  }, [admins, query, roleFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const from = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const to = Math.min(safePage * pageSize, filtered.length);
  const hasFilters = query.trim() !== "" || roleFilter !== "all";

  // Protect yourself and the last admin
  const deleteState = useCallback(
    (a) => {
      if (a.id === me)
        return { ok: false, reason: "You can't delete yourself" };
      if (a.role === "admin" && counts.admin <= 1)
        return { ok: false, reason: "The last admin can't be deleted" };
      return { ok: true, reason: "" };
    },
    [me, counts.admin],
  );

  const selectablePage = pageItems.filter((a) => deleteState(a).ok);
  const selectableAll = filtered.filter((a) => deleteState(a).ok);
  const allPageSelected =
    selectablePage.length > 0 &&
    selectablePage.every((a) => selected.has(a.id));
  const somePageSelected = selectablePage.some((a) => selected.has(a.id));
  const allFilteredSelected =
    selectableAll.length > 0 && selectableAll.every((a) => selected.has(a.id));
  const showSelectAllStrip =
    allPageSelected && selectableAll.length > selectablePage.length;

  const selectedAdmins = admins.filter((a) => selected.has(a.id));
  const selectedAdminRoleCount = selectedAdmins.filter(
    (a) => a.role === "admin",
  ).length;
  const bulkBlocked = selectedAdminRoleCount >= counts.admin;

  const compact = density === "compact";

  function clearFilters() {
    setQuery("");
    setRoleFilter("all");
    setPage(1);
  }

  function toggleOne(id, on) {
    setSelected((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });
  }

  function togglePage(on) {
    setSelected((prev) => {
      const next = new Set(prev);
      selectablePage.forEach((a) => (on ? next.add(a.id) : next.delete(a.id)));
      return next;
    });
  }

  function selectAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev);
      selectableAll.forEach((a) => next.add(a.id));
      return next;
    });
  }

  function pickRole(role) {
    setRoleFilter((cur) => (cur === role ? "all" : role));
    setPage(1);
  }

  /* ---------- actions ---------- */

  async function copyText(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(okMsg);
    } catch {
      toast.error("Couldn't copy to the clipboard");
    }
  }
  const copyEmail = (email) => copyText(email, "Email copied");

  async function confirmDelete() {
    if (!pending.length) return;
    setDeleting(true);
    const results = await Promise.allSettled(
      pending.map((a) => deleteAdmin(a.id)),
    );
    const okIds = pending
      .filter((_, i) => results[i].status === "fulfilled")
      .map((a) => a.id);
    const failed = pending.length - okIds.length;

    setAdmins((prev) => prev.filter((a) => !okIds.includes(a.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      okIds.forEach((id) => next.delete(id));
      return next;
    });
    if (detail && okIds.includes(detail.id)) setDetail(null);

    if (okIds.length)
      toast.success(
        okIds.length === 1 ? "Admin deleted" : `${okIds.length} admins deleted`,
      );
    if (failed) {
      const firstErr = results.find((r) => r.status === "rejected");
      toast.error(
        `${failed} could not be deleted. ${firstErr?.reason?.message ?? ""}`.trim(),
      );
    }
    setPending([]);
    setDeleting(false);
  }

  /* ---------- states ---------- */

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertCircle className="size-4" />
        <AlertTitle>Couldn&apos;t load admins</AlertTitle>
        <AlertDescription className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <span className="min-w-0 break-words">{error}</span>
          <Button size="sm" variant="outline" onClick={() => load()}>
            <RefreshCw className="mr-1.5 size-4" /> Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const showTable = view === "table";

  /* ---------- render ---------- */

  return (
    <div className="min-w-0 space-y-5 pb-28 sm:space-y-6 sm:pb-24">
      <Overview
        counts={counts}
        recent={recent}
        roleFilter={roleFilter}
        onPick={pickRole}
      />

      {/* Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              aria-label="Search admins"
              className="px-9"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground md:block">
                /
              </kbd>
            )}
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              className="w-full md:w-[210px]"
              aria-label="Sort admins"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORTS).map(([key, s]) => (
                <SelectItem key={key} value={key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link
            href="/admin/admin-users/create"
            className={cn(buttonVariants(), "hidden gap-1.5 md:inline-flex")}
          >
            <UserPlus aria-hidden="true" className="size-4" /> Add admin
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div
            className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground"
            aria-live="polite"
          >
            <span>
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "admin" : "admins"}
              {hasFilters ? " match" : ""}
            </span>
            {query.trim() ? (
              <FilterChip
                onRemove={() => setQuery("")}
                label="Remove search filter"
              >
                Search: {query.trim()}
              </FilterChip>
            ) : null}
            {roleFilter !== "all" ? (
              <FilterChip
                onRemove={() => setRoleFilter("all")}
                label="Remove role filter"
              >
                Role: {roleMeta(roleFilter).label}
              </FilterChip>
            ) : null}
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="py-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
            {syncedAt ? (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground lg:inline-flex">
                <Clock aria-hidden="true" className="size-3" />
                Updated{" "}
                {new Intl.DateTimeFormat("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(syncedAt)}
              </span>
            ) : null}

            {/* Density: table only */}
            {showTable ? (
              <div
                className="hidden rounded-lg border bg-muted/40 p-0.5 lg:inline-flex"
                role="group"
                aria-label="Row density"
              >
                {["comfortable", "compact"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDensity(d)}
                    aria-pressed={density === d}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors motion-reduce:transition-none",
                      density === d
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : null}

            <div
              className="hidden rounded-lg border bg-muted/40 p-0.5 md:inline-flex"
              role="group"
              aria-label="Change view"
            >
              {[
                { key: "table", icon: Rows3, label: "Table view" },
                { key: "cards", icon: LayoutGrid, label: "Cards view" },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-label={label}
                  aria-pressed={view === key}
                  className={cn(
                    "rounded-md p-2 transition-colors motion-reduce:transition-none",
                    view === key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportCsv(filtered, hasFilters ? "filtered" : "all")
              }
              disabled={!filtered.length}
              className="h-10 flex-1 gap-1.5 sm:h-8 sm:flex-none"
            >
              <Download aria-hidden="true" className="size-4" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => load({ soft: true })}
              disabled={refreshing}
              aria-label="Refresh list"
              className="size-10 shrink-0 sm:size-8"
            >
              <RefreshCw
                className={cn("size-4", refreshing && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="min-w-0 gap-0 overflow-hidden py-0">
        {showSelectAllStrip ? (
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-b bg-primary/5 px-4 py-2.5 text-sm">
            {allFilteredSelected ? (
              <>
                <span>All {selectableAll.length} admins are selected.</span>
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Clear selection
                </button>
              </>
            ) : (
              <>
                <span>
                  All {selectablePage.length} admins on this page are selected.
                </span>
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Select all {selectableAll.length}
                </button>
              </>
            )}
          </div>
        ) : null}

        {pageItems.length === 0 ? (
          <EmptyState filtered={hasFilters} onClear={clearFilters} />
        ) : (
          <>
            {/* Table: md and up */}
            <div className={cn(showTable ? "hidden md:block" : "hidden")}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-10 pl-4">
                      <TapTarget disabled={selectablePage.length === 0}>
                        <Checkbox
                          aria-label="Select all on this page"
                          checked={
                            allPageSelected
                              ? true
                              : somePageSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(v) => togglePage(v === true)}
                          disabled={selectablePage.length === 0}
                        />
                      </TapTarget>
                    </TableHead>
                    <SortHead
                      label="Admin"
                      first="name-asc"
                      second="name-desc"
                      sort={sort}
                      setSort={setSort}
                    />
                    <SortHead
                      label="Role"
                      first="role-asc"
                      second="role-desc"
                      sort={sort}
                      setSort={setSort}
                    />
                    <SortHead
                      label="Added"
                      first="newest"
                      second="oldest"
                      sort={sort}
                      setSort={setSort}
                      className="hidden lg:table-cell"
                    />
                    <TableHead className="pr-4 text-right text-xs font-semibold text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((a) => {
                    const isMe = a.id === me;
                    const del = deleteState(a);
                    return (
                      <TableRow
                        key={a.id}
                        data-state={selected.has(a.id) ? "selected" : undefined}
                      >
                        <TableCell className="pl-4">
                          <TapTarget disabled={!del.ok}>
                            <Checkbox
                              aria-label={`Select ${a.name || a.id}`}
                              checked={selected.has(a.id)}
                              disabled={!del.ok}
                              onCheckedChange={(v) =>
                                toggleOne(a.id, v === true)
                              }
                            />
                          </TapTarget>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "max-w-[12rem] md:max-w-[16rem] lg:max-w-[22rem]",
                            compact ? "py-2" : "py-3.5",
                          )}
                        >
                          <PersonCell
                            admin={a}
                            isMe={isMe}
                            size={compact ? "size-8" : "size-10"}
                            onOpen={() => setDetail(a)}
                          />
                          {a.createdAt && !compact ? (
                            <p
                              className={cn(
                                "mt-1 truncate text-xs text-muted-foreground lg:hidden",
                                "pl-[3.25rem]",
                              )}
                            >
                              Added {timeAgo(a.createdAt)}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={a.role} />
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          <p className="text-foreground/80">
                            {formatDate(a.createdAt)}
                          </p>
                          {!compact ? (
                            <p className="max-w-[16rem] truncate text-xs">
                              {timeAgo(a.createdAt)}
                              {a.createdBy ? ` by ${a.createdBy}` : ""}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex justify-end">
                            <RowMenu
                              admin={a}
                              canDelete={del.ok}
                              blockedReason={del.reason}
                              onOpen={setDetail}
                              onCopy={copyEmail}
                              onDelete={(x) => setPending([x])}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Cards: phones always, desktop when chosen */}
            <div
              className={cn(
                "grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3",
                showTable && "md:hidden",
              )}
            >
              {pageItems.map((a) => {
                const isMe = a.id === me;
                const del = deleteState(a);
                const isSel = selected.has(a.id);
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "relative min-w-0 overflow-hidden rounded-xl border bg-card p-3.5 transition-colors hover:border-primary/40 motion-reduce:transition-none sm:p-4",
                      isSel && "border-primary ring-1 ring-primary/40",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-y-0 left-0 w-1",
                        roleMeta(a.role).bar,
                      )}
                    />
                    <div className="flex items-start gap-3 pl-1.5">
                      <div className="mt-1 shrink-0">
                        <TapTarget disabled={!del.ok}>
                          <Checkbox
                            aria-label={`Select ${a.name || a.id}`}
                            checked={isSel}
                            disabled={!del.ok}
                            onCheckedChange={(v) => toggleOne(a.id, v === true)}
                          />
                        </TapTarget>
                      </div>
                      <div className="min-w-0 flex-1">
                        <PersonCell
                          admin={a}
                          isMe={isMe}
                          size="size-11"
                          onOpen={() => setDetail(a)}
                        />
                      </div>
                      <RowMenu
                        admin={a}
                        canDelete={del.ok}
                        blockedReason={del.reason}
                        onOpen={setDetail}
                        onCopy={copyEmail}
                        onDelete={(x) => setPending([x])}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 pl-1.5">
                      <RoleBadge role={a.role} />
                      <span className="text-xs text-muted-foreground">
                        {a.createdAt
                          ? `Added ${timeAgo(a.createdAt)}`
                          : "Added date unknown"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3 border-t bg-muted/30 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-muted-foreground sm:justify-start">
              <p>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {from} to {to}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>
              </p>
              <label className="inline-flex items-center gap-2">
                <span className="text-xs">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-9 w-[72px] sm:h-8"
                    aria-label="Rows per page"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            </div>

            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-1.5 sm:justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 sm:size-8"
                  disabled={safePage <= 1}
                  onClick={() => setPage(safePage - 1)}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="hidden items-center gap-1 sm:flex">
                  {pageList(safePage, totalPages).map((p) =>
                    typeof p === "string" ? (
                      <span key={p} className="px-1 text-muted-foreground">
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        size="icon"
                        variant={p === safePage ? "default" : "ghost"}
                        className="size-8 tabular-nums"
                        onClick={() => setPage(p)}
                        aria-label={`Page ${p}`}
                        aria-current={p === safePage ? "page" : undefined}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                </div>
                <span className="px-2 text-xs tabular-nums text-muted-foreground sm:hidden">
                  Page {safePage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 sm:size-8"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(safePage + 1)}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>

      {/* Role guide with a full permission comparison */}
      <section aria-labelledby="role-guide" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="space-y-1">
            <h2
              id="role-guide"
              className="text-base font-semibold tracking-tight"
            >
              Choosing a role
            </h2>
            <p className="text-sm text-muted-foreground">
              Give people the lowest role that lets them do their job.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatrix((s) => !s)}
            aria-expanded={showMatrix}
          >
            {showMatrix ? "Hide permission details" : "Compare permissions"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {["admin", "editor", "instructor"].map((r) => {
            const m = roleMeta(r);
            const Icon = m.icon;
            return (
              <div
                key={r}
                className="flex items-start gap-3 rounded-xl border bg-card p-4 md:block"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border md:mb-3",
                    m.badge,
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold tracking-tight">
                    {m.label}{" "}
                    <span className="font-normal text-muted-foreground">
                      ({counts[r]})
                    </span>
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {m.summary}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence initial={false}>
          {showMatrix ? (
            <motion.div
              key="matrix"
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <Card className="gap-0 overflow-hidden py-0">
                <PermissionMatrix />
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <p className="hidden text-xs text-muted-foreground md:block">
        Shortcuts: <kbd className="rounded border bg-muted px-1">/</kbd> search,{" "}
        <kbd className="rounded border bg-muted px-1">r</kbd> refresh,{" "}
        <kbd className="rounded border bg-muted px-1">n</kbd> add admin.
      </p>

      {/* Floating bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-[4.75rem] z-40 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:right-3"
            role="region"
            aria-label="Bulk actions"
          >
            <p className="px-1 text-sm font-medium">
              {selected.size} selected
              {bulkBlocked ? (
                <span className="block text-xs font-normal text-destructive">
                  At least one admin must remain.
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  copyText(
                    selectedAdmins.map((a) => a.id).join(", "),
                    "Emails copied",
                  )
                }
              >
                <Copy aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Copy emails</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => exportCsv(selectedAdmins, "selected")}
              >
                <Download aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={bulkBlocked}
                onClick={() => setPending(selectedAdmins)}
                className="gap-1.5"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details panel */}
      <DetailSheet
        admin={detail}
        isMe={detail?.id === me}
        del={detail ? deleteState(detail) : { ok: false, reason: "" }}
        onClose={() => setDetail(null)}
        onCopy={copyEmail}
        onDelete={(x) => setPending([x])}
      />

      {/* Delete dialog (single and bulk) */}
      <AlertDialog
        open={pending.length > 0}
        onOpenChange={(open) => !open && !deleting && setPending([])}
      >
        <AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <AlertDialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 aria-hidden="true" className="size-5" />
            </div>
            <AlertDialogTitle>
              {pending.length > 1
                ? `Delete ${pending.length} admins?`
                : "Delete this admin?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="break-words leading-6">
              {pending.length === 1 ? (
                <>
                  <strong className="text-foreground">
                    {pending[0].name || pending[0].id}
                  </strong>{" "}
                  ({pending[0].id}) will lose dashboard access immediately.
                </>
              ) : (
                <>
                  These {pending.length} people will lose dashboard access
                  immediately.
                </>
              )}{" "}
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
