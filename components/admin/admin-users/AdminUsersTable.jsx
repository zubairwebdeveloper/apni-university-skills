"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  GraduationCap,
  LayoutGrid,
  Loader2,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Rows3,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
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
import { Card, CardContent } from "@/components/ui/card";
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

const PAGE_SIZES = [8, 16, 24];

const ROLE_META = {
  admin: {
    label: "Admin",
    badge: "border-primary/25 bg-primary/10 text-primary",
    icon: ShieldCheck,
  },
  editor: {
    label: "Editor",
    badge: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    icon: UserCog,
  },
  instructor: {
    label: "Instructor",
    badge:
      "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: GraduationCap,
  },
};

const ROLE_GUIDE = [
  {
    role: "admin",
    title: "Admin",
    text: "Full access to every section, including adding and removing other admins.",
  },
  {
    role: "editor",
    title: "Editor",
    text: "Creates and publishes courses, blog posts, careers and jobs. Can moderate reviews.",
  },
  {
    role: "instructor",
    title: "Instructor",
    text: "Read-only access to courses and lessons. Cannot publish or delete anything.",
  },
];

const roleMeta = (role) =>
  ROLE_META[role] ?? {
    label: String(role || "admin").replace(/[_-]/g, " "),
    badge: "border-border bg-muted text-muted-foreground",
    icon: ShieldCheck,
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

const SORTS = {
  "name-asc": {
    label: "Name (A-Z)",
    fn: (a, b) => (a.name || "").localeCompare(b.name || ""),
  },
  "name-desc": {
    label: "Name (Z-A)",
    fn: (a, b) => (b.name || "").localeCompare(a.name || ""),
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
  if (!ms) return "—";
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

function csvCell(v) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function exportCsv(rows) {
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
  const a = document.createElement("a");
  a.href = url;
  a.download = `admin-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function useCountUp(value, reduce) {
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) return;
    let raf;
    const start = performance.now();
    const dur = 600;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
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

function PersonCell({ admin, isMe, size = "size-10" }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={cn(size, "shrink-0 ring-2 ring-background")}>
        {admin.image ? (
          <AvatarImage src={admin.image} alt={admin.name || admin.id} />
        ) : null}
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {initialOf(admin.name, admin.id)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="flex items-center gap-2 truncate text-sm font-semibold leading-tight text-foreground">
          <span className="truncate">{admin.name || "Unnamed"}</span>
          {isMe ? (
            <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
              You
            </span>
          ) : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">{admin.id}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone, delay, active, onClick }) {
  const reduce = useReducedMotion();
  const shown = useCountUp(value, reduce);
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="text-left outline-none"
    >
      <Card
        className={cn(
          "gap-0 py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          active && "border-primary ring-1 ring-primary/40",
        )}
      >
        <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11",
              tone,
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-semibold tabular-nums leading-none tracking-tight sm:text-2xl">
              {shown}
            </p>
            <p className="mt-1.5 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {label}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[72px] rounded-xl" />
        ))}
      </div>
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
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center sm:py-16">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        {filtered ? (
          <Search className="size-6" />
        ) : (
          <Users className="size-6" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">
          {filtered ? "No results found" : "No admins yet"}
        </h3>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {filtered
            ? "Try a different search term or clear the filters."
            : "Add your first admin so they can start using the dashboard."}
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
          <Plus className="mr-1.5 size-4" /> Add admin
        </Link>
      )}
    </div>
  );
}

function RowMenu({ admin, canDelete, blockedReason, onCopy, onDelete }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Options for ${admin.name || admin.id}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link
            href={`/admin/admin-users/${encodeURIComponent(admin.id)}/edit`}
          >
            <Pencil className="mr-2 size-4" /> Edit admin
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onCopy(admin.id)}>
          <Copy className="mr-2 size-4" /> Copy email
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
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

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

export function AdminUsersTable() {
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

  const [selected, setSelected] = useState(() => new Set());
  const [pending, setPending] = useState([]); // admins waiting for delete confirmation
  const [deleting, setDeleting] = useState(false);

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

  // Press "/" to jump to the search box
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable)
        return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- derived data ---------- */

  const counts = useMemo(() => {
    const c = { total: admins.length, admin: 0, editor: 0, instructor: 0 };
    for (const a of admins) if (c[a.role] !== undefined) c[a.role] += 1;
    return c;
  }, [admins]);

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
        return { ok: false, reason: "Last admin can't be deleted" };
      return { ok: true, reason: "" };
    },
    [me, counts.admin],
  );

  const selectablePage = pageItems.filter((a) => deleteState(a).ok);
  const allPageSelected =
    selectablePage.length > 0 &&
    selectablePage.every((a) => selected.has(a.id));
  const somePageSelected = selectablePage.some((a) => selected.has(a.id));

  const selectedAdmins = admins.filter((a) => selected.has(a.id));
  const selectedAdminRoleCount = selectedAdmins.filter(
    (a) => a.role === "admin",
  ).length;
  const bulkBlocked = selectedAdminRoleCount >= counts.admin;

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

  function pickRole(role) {
    setRoleFilter((cur) => (cur === role ? "all" : role));
    setPage(1);
  }

  /* ---------- actions ---------- */

  async function copyEmail(email) {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Couldn't copy the email");
    }
  }

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
          <span>{error}</span>
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
    <div className="space-y-5 pb-24 sm:space-y-6">
      {/* Stats (click to filter) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total admins"
          value={counts.total}
          icon={Users}
          tone="bg-primary/10 text-primary"
          delay={0}
          active={roleFilter === "all"}
          onClick={() => pickRole("all")}
        />
        <StatCard
          label="Admins"
          value={counts.admin}
          icon={ShieldCheck}
          tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
          delay={0.06}
          active={roleFilter === "admin"}
          onClick={() => pickRole("admin")}
        />
        <StatCard
          label="Editors"
          value={counts.editor}
          icon={UserCog}
          tone="bg-sky-500/10 text-sky-600 dark:text-sky-300"
          delay={0.12}
          active={roleFilter === "editor"}
          onClick={() => pickRole("editor")}
        />
        <StatCard
          label="Instructors"
          value={counts.instructor}
          icon={GraduationCap}
          tone="bg-amber-500/10 text-amber-600 dark:text-amber-300"
          delay={0.18}
          active={roleFilter === "instructor"}
          onClick={() => pickRole("instructor")}
        />
      </div>

      {/* Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
              placeholder="Search by name or email…"
              aria-label="Search admins"
              className="px-9"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground sm:block">
                /
              </kbd>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-full sm:w-[140px]"
                aria-label="Filter by role"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                className="w-full sm:w-[150px]"
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
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "admin" : "admins"}
            {hasFilters ? " found" : ""}
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-2 font-medium text-primary underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </p>

          <div className="flex items-center gap-2">
            {syncedAt ? (
              <span className="hidden items-center gap-1 text-xs text-muted-foreground md:inline-flex">
                <Clock aria-hidden="true" className="size-3" />
                Synced{" "}
                {new Intl.DateTimeFormat("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(syncedAt)}
              </span>
            ) : null}

            {/* View toggle: desktop only, phones always get cards */}
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
              onClick={() => exportCsv(filtered)}
              disabled={!filtered.length}
              className="gap-1.5"
            >
              <Download aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => load({ soft: true })}
              disabled={refreshing}
              aria-label="Refresh list"
            >
              <RefreshCw
                className={cn("size-4", refreshing && "animate-spin")}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="gap-0 overflow-hidden py-0">
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
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Admin
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide">
                      Role
                    </TableHead>
                    <TableHead className="hidden text-xs font-semibold uppercase tracking-wide lg:table-cell">
                      Added
                    </TableHead>
                    <TableHead className="pr-4 text-right text-xs font-semibold uppercase tracking-wide">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((a, i) => {
                    const isMe = a.id === me;
                    const del = deleteState(a);
                    return (
                      <TableRow
                        key={a.id}
                        data-state={selected.has(a.id) ? "selected" : undefined}
                        style={{
                          animationDelay: `${i * 45}ms`,
                          animationFillMode: "backwards",
                        }}
                        className="animate-in fade-in slide-in-from-bottom-1 duration-500 motion-reduce:animate-none"
                      >
                        <TableCell className="pl-4">
                          <Checkbox
                            aria-label={`Select ${a.name || a.id}`}
                            checked={selected.has(a.id)}
                            disabled={!del.ok}
                            onCheckedChange={(v) => toggleOne(a.id, v === true)}
                          />
                        </TableCell>
                        <TableCell className="py-3">
                          <PersonCell admin={a} isMe={isMe} />
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={a.role} />
                        </TableCell>
                        <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                          <p className="text-foreground/80">
                            {formatDate(a.createdAt)}
                          </p>
                          <p className="truncate text-xs">
                            {timeAgo(a.createdAt)}
                            {a.createdBy ? ` · by ${a.createdBy}` : ""}
                          </p>
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex justify-end">
                            <RowMenu
                              admin={a}
                              canDelete={del.ok}
                              blockedReason={del.reason}
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
                "grid gap-3 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-3",
                showTable && "md:hidden",
              )}
            >
              {pageItems.map((a, i) => {
                const isMe = a.id === me;
                const del = deleteState(a);
                const isSel = selected.has(a.id);
                return (
                  <motion.div
                    key={a.id}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      isSel && "border-primary ring-1 ring-primary/40",
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                    <div className="flex items-start gap-3">
                      <Checkbox
                        aria-label={`Select ${a.name || a.id}`}
                        checked={isSel}
                        disabled={!del.ok}
                        onCheckedChange={(v) => toggleOne(a.id, v === true)}
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <PersonCell admin={a} isMe={isMe} size="size-11" />
                      </div>
                      <RowMenu
                        admin={a}
                        canDelete={del.ok}
                        blockedReason={del.reason}
                        onCopy={copyEmail}
                        onDelete={(x) => setPending([x])}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                      <RoleBadge role={a.role} />
                      <span className="text-xs text-muted-foreground">
                        {a.createdAt
                          ? `Added ${timeAgo(a.createdAt)}`
                          : "Added —"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-3 border-t bg-muted/30 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
              <p>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {from}-{to}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>
              </p>
              <label className="inline-flex items-center gap-2">
                <span className="text-xs">Per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-8 w-[72px]"
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
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
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
                <span className="px-2 text-xs text-muted-foreground sm:hidden">
                  {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
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

      {/* Role guide */}
      <section aria-labelledby="role-guide" className="space-y-3">
        <div className="space-y-1">
          <h2
            id="role-guide"
            className="text-base font-semibold tracking-tight"
          >
            Role guide
          </h2>
          <p className="text-sm text-muted-foreground">
            What each role can do in the dashboard.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLE_GUIDE.map((r, i) => {
            const m = roleMeta(r.role);
            const Icon = m.icon;
            return (
              <motion.div
                key={r.role}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="rounded-xl border bg-card p-4"
              >
                <span
                  className={cn(
                    "mb-3 flex size-9 items-center justify-center rounded-lg border",
                    m.badge,
                  )}
                >
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <h3 className="text-sm font-semibold tracking-tight">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {r.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Floating bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-2 rounded-2xl border bg-card/95 p-3 shadow-xl backdrop-blur sm:bottom-6"
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
              >
                Clear
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

      {/* Delete dialog (single and bulk) */}
      <AlertDialog
        open={pending.length > 0}
        onOpenChange={(open) => !open && !deleting && setPending([])}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-1 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 aria-hidden="true" className="size-5" />
            </div>
            <AlertDialogTitle>
              {pending.length > 1
                ? `Delete ${pending.length} admins?`
                : "Delete this admin?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
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
              This action can&apos;t be undone.
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
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
