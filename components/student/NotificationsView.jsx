"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  Award,
  Bell,
  BellOff,
  BellRing,
  BookOpen,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronDown,
  HelpCircle,
  Inbox,
  LayoutList,
  Lightbulb,
  Link2,
  List,
  MailOpen,
  Mail,
  Megaphone,
  Search,
  Square,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_FAQ,
  NOTIFICATION_KINDS,
  NOTIFICATION_TIPS,
} from "@/lib/notifications-data";
import {
  setNotificationsDismissed,
  setNotificationsRead,
} from "@/app/actions/notificationInbox";

/* ---------------- Helpers ---------------- */
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const KIND_META = {
  announcement: {
    icon: Megaphone,
    tone: "bg-primary/10 text-primary",
    label: "Announcement",
  },
  course: {
    icon: BookOpen,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    label: "Course",
  },
  certificate: {
    icon: Award,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    label: "Certificate",
  },
};

// Uses n.type when the page passes it, otherwise derives it from the link
const getKind = (n) => {
  if (n.type && KIND_META[n.type]) return n.type;
  const l = (n.href ?? "").toLowerCase();
  if (l.includes("certificate")) return "certificate";
  if (l.includes("course") || l.includes("learning")) return "course";
  return "announcement";
};

// `now` comes from the server so server and client render identical text
function timeAgo(ms, now, fallback) {
  if (!ms) return fallback;
  const diff = Math.max(0, now - ms);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return fallback;
}

function bucketOf(ms, now) {
  if (!ms) return "earlier";
  const diff = now - ms;
  if (diff < DAY) return "day";
  if (diff < 7 * DAY) return "week";
  return "earlier";
}

const BUCKETS = [
  { key: "day", label: "Last 24 hours" },
  { key: "week", label: "This week" },
  { key: "earlier", label: "Earlier" },
];

const TIP_ICONS = { check: CheckCheck, link: Link2, clear: MailOpen };

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

/* ---------------- Building blocks ---------------- */
// Circular progress: how much of the inbox has been read
function ProgressRing({ read, total }) {
  const pct = total ? Math.round((read / total) * 100) : 100;
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-32 shrink-0 sm:size-36">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          className="stroke-muted"
        />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none">{pct}%</span>
        <span className="mt-1 text-[11px] text-muted-foreground">read</span>
      </div>
    </div>
  );
}

function IconAction({ label, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {children}
    </button>
  );
}

function NotificationCard({
  n,
  now,
  compact,
  selectMode,
  selected,
  onSelect,
  onRead,
  onDismiss,
}) {
  const [expanded, setExpanded] = useState(false);
  const kind = getKind(n);
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  const isLong = (n.body ?? "").length > (compact ? 90 : 180);

  const toggleExpand = () => {
    setExpanded((v) => !v);
    // Opening an unread message marks it as read
    if (!expanded && !n.read) onRead([n.id], true);
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all",
        compact ? "p-3" : "p-4 sm:p-5",
        n.read
          ? "bg-card hover:border-primary/30"
          : "border-primary/40 bg-primary/[0.04] hover:border-primary/60",
        selected && "ring-2 ring-primary",
      )}
    >
      {!n.read && (
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-1 bg-primary"
        />
      )}

      <div className="flex items-start gap-3 sm:gap-4">
        {selectMode ? (
          <button
            type="button"
            onClick={() => onSelect(n.id)}
            aria-pressed={selected}
            aria-label={selected ? "Deselect" : "Select"}
            className="mt-0.5 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {selected ? (
              <CheckSquare className="size-6" />
            ) : (
              <Square className="size-6 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg",
              compact ? "size-8" : "size-10",
              meta.tone,
            )}
          >
            <Icon className={compact ? "size-4" : "size-5"} />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "font-serif text-base",
                n.read ? "font-medium" : "font-semibold",
              )}
            >
              {n.title}
              {!n.read && <span className="sr-only"> (unread)</span>}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {!n.read && (
                <span className="size-2 rounded-full bg-primary" aria-hidden />
              )}
              <time
                title={n.dateLabel}
                className="whitespace-nowrap text-xs text-muted-foreground"
              >
                {timeAgo(n.createdAt, now, n.dateLabel)}
              </time>
            </div>
          </div>

          <p
            className={cn(
              "mt-1 whitespace-pre-line text-sm text-muted-foreground",
              !expanded && (compact ? "line-clamp-1" : "line-clamp-3"),
            )}
          >
            {n.body}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {!compact && (
              <Badge variant="secondary" className="text-[10px]">
                {meta.label}
              </Badge>
            )}

            {isLong && (
              <button
                type="button"
                onClick={toggleExpand}
                aria-expanded={expanded}
                className="inline-flex items-center gap-1 rounded text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {expanded ? "Show less" : "Read more"}
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>
            )}

            <div className="ml-auto flex items-center gap-0.5">
              {!selectMode && (
                <>
                  <IconAction
                    label={n.read ? "Mark as unread" : "Mark as read"}
                    onClick={() => onRead([n.id], !n.read)}
                  >
                    {n.read ? (
                      <Mail className="size-4" />
                    ) : (
                      <Check className="size-4" />
                    )}
                  </IconAction>
                  <IconAction
                    label="Dismiss"
                    onClick={() => onDismiss([n.id])}
                    className="hover:text-destructive"
                  >
                    <X className="size-4" />
                  </IconAction>
                </>
              )}
              {n.href && !selectMode && (
                <Link
                  href={n.href}
                  onClick={() => !n.read && onRead([n.id], true)}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "group/btn ml-1 h-8 px-2.5 text-xs",
                  )}
                >
                  Open
                  <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Guide + FAQ (also used on the empty page) ---------------- */
export function NotificationsExtras() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="mt-10 space-y-12">
        <section>
          <h2 className="mb-5 text-xl font-semibold tracking-tight">
            Types of notifications
          </h2>
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-4 md:grid-cols-3"
          >
            {NOTIFICATION_KINDS.map((k) => {
              const meta = KIND_META[k.value] ?? KIND_META.announcement;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={k.value}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <span
                    className={cn(
                      "mb-3 flex size-10 items-center justify-center rounded-lg",
                      meta.tone,
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">{k.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {k.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section>
          <div className="mb-5 flex items-center gap-2">
            <Lightbulb className="size-5 text-amber-600 dark:text-amber-300" />
            <h2 className="text-xl font-semibold tracking-tight">
              Make the most of your inbox
            </h2>
          </div>
          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-4 md:grid-cols-3"
          >
            {NOTIFICATION_TIPS.map((t) => {
              const Icon = TIP_ICONS[t.icon] ?? Lightbulb;
              return (
                <motion.div
                  key={t.title}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border bg-gradient-to-br from-muted/60 to-transparent p-5"
                >
                  <Icon className="mb-3 size-5 text-primary" />
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" className="rounded-xl border bg-card px-5">
            {NOTIFICATION_FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left hover:text-primary hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </MotionConfig>
  );
}

/* ---------------- Main view ---------------- */
export function NotificationsView({ items, now }) {
  const router = useRouter();

  // Local copy so read/dismiss feel instant (optimistic updates)
  const [list, setList] = useState(items);
  useEffect(() => setList(items), [items]);

  const [tab, setTab] = useState("all");
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [compact, setCompact] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const searchRef = useRef(null);

  // "/" jumps to search (ignored while typing in a field)
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (
        e.key !== "/" ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        e.target?.isContentEditable
      )
        return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ----- actions (optimistic, rolled back on failure) ----- */
  const markRead = useCallback(
    async (ids, read) => {
      let snapshot;
      setList((l) => {
        snapshot = l;
        return l.map((n) => (ids.includes(n.id) ? { ...n, read } : n));
      });
      const res = await setNotificationsRead({ ids, read }).catch(() => null);
      if (!res?.ok) {
        setList(snapshot);
        toast.error(res?.error ?? "Could not update. Please try again.");
        return;
      }
      router.refresh();
    },
    [router],
  );

  const dismiss = useCallback(
    async (ids) => {
      let snapshot;
      let removed = [];
      setList((l) => {
        snapshot = l;
        removed = l.filter((n) => ids.includes(n.id));
        return l.filter((n) => !ids.includes(n.id));
      });
      setSelected(new Set());
      const res = await setNotificationsDismissed({
        ids,
        dismissed: true,
      }).catch(() => null);
      if (!res?.ok) {
        setList(snapshot);
        toast.error(res?.error ?? "Could not dismiss. Please try again.");
        return;
      }
      toast(
        ids.length > 1
          ? `${ids.length} notifications dismissed`
          : "Notification dismissed",
        {
          action: {
            label: "Undo",
            onClick: async () => {
              setList((l) => [...l, ...removed]);
              const undo = await setNotificationsDismissed({
                ids,
                dismissed: false,
              }).catch(() => null);
              if (!undo?.ok) toast.error("Could not restore.");
              router.refresh();
            },
          },
        },
      );
      router.refresh();
    },
    [router],
  );

  const toggleSelect = (id) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const exitSelect = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  /* ----- derived data ----- */
  const stats = useMemo(() => {
    const unread = list.filter((n) => !n.read).length;
    return {
      total: list.length,
      unread,
      read: list.length - unread,
      week: list.filter((n) => n.createdAt && now - n.createdAt < 7 * DAY)
        .length,
    };
  }, [list, now]);

  const kindCounts = useMemo(() => {
    const c = { all: list.length };
    for (const n of list) {
      const k = getKind(n);
      c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter((n) => {
        if (tab === "unread" && n.read) return false;
        if (tab === "read" && !n.read) return false;
        if (kind !== "all" && getKind(n) !== kind) return false;
        if (q && !`${n.title} ${n.body}`.toLowerCase().includes(q))
          return false;
        return true;
      })
      .sort((a, b) =>
        sort === "newest"
          ? b.createdAt - a.createdAt
          : a.createdAt - b.createdAt,
      );
  }, [list, tab, kind, query, sort]);

  const groups = useMemo(() => {
    const out = BUCKETS.map((b) => ({
      ...b,
      items: filtered.filter((n) => bucketOf(n.createdAt, now) === b.key),
    })).filter((g) => g.items.length);
    return sort === "oldest" ? out.reverse() : out;
  }, [filtered, now, sort]);

  const kindChips = [
    { value: "all", label: "All types" },
    ...NOTIFICATION_KINDS.map((k) => ({ value: k.value, label: k.label })),
  ];

  const clearFilters = () => {
    setTab("all");
    setKind("all");
    setQuery("");
  };

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((n) => selected.has(n.id));
  const filtersActive = tab !== "all" || kind !== "all" || query.trim();

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <Badge variant="secondary" className="gap-1">
                {stats.unread > 0 ? (
                  <BellRing className="size-3" />
                ) : (
                  <Bell className="size-3" />
                )}
                Your inbox
              </Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {stats.unread > 0
                  ? `${stats.unread} unread notification${stats.unread > 1 ? "s" : ""}`
                  : "You're all caught up"}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                {stats.unread > 0
                  ? "Catch up on the latest announcements and updates from our team."
                  : "No new messages right now. We will let you know when there is something new."}
              </p>
              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  <strong className="text-foreground">{stats.total}</strong>{" "}
                  total
                </span>
                <span>
                  <strong className="text-foreground">{stats.week}</strong> in
                  the last 7 days
                </span>
              </p>
              {stats.unread > 0 && tab !== "unread" && (
                <Button onClick={() => setTab("unread")} className="group mt-5">
                  View unread
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </div>
            <div className="flex justify-center sm:justify-end">
              <ProgressRing read={stats.read} total={stats.total} />
            </div>
          </div>
        </motion.section>

        {/* Toolbar */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 overflow-x-auto px-1">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="w-max">
                  {[
                    { value: "all", label: "All", count: stats.total },
                    { value: "unread", label: "Unread", count: stats.unread },
                    { value: "read", label: "Read", count: stats.read },
                  ].map((t) => (
                    <TabsTrigger key={t.value} value={t.value}>
                      {t.label}
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {t.count}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setQuery("");
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder="Search notifications..."
                  aria-label="Search notifications"
                  className="pl-9 pr-9"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 text-[10px] text-muted-foreground sm:block">
                    /
                  </kbd>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSort((s) => (s === "newest" ? "oldest" : "newest"))
                  }
                >
                  <ArrowUpDown className="size-4" />
                  {sort === "newest" ? "Newest" : "Oldest"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCompact((v) => !v)}
                  aria-pressed={compact}
                  aria-label={compact ? "Comfortable view" : "Compact view"}
                  title={compact ? "Comfortable view" : "Compact view"}
                >
                  {compact ? (
                    <LayoutList className="size-4" />
                  ) : (
                    <List className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant={selectMode ? "default" : "outline"}
                  onClick={() =>
                    selectMode ? exitSelect() : setSelectMode(true)
                  }
                >
                  <CheckSquare className="size-4" />
                  {selectMode ? "Done" : "Select"}
                </Button>
              </div>
            </div>
          </div>

          {/* Type chips */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            <LayoutGroup id="kind-chips">
              {kindChips.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setKind(c.value)}
                  aria-pressed={kind === c.value}
                  className={cn(
                    "relative shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    kind === c.value
                      ? "border-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
                  )}
                >
                  {kind === c.value && (
                    <motion.span
                      layoutId="kind-chip-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">
                    {c.label}
                    <span className="ml-1.5 opacity-70">
                      {kindCounts[c.value] ?? 0}
                    </span>
                  </span>
                </button>
              ))}
            </LayoutGroup>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Showing {filtered.length} of {stats.total} notifications
            </p>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          {/* Grouped list */}
          {groups.length ? (
            <div className={cn("space-y-8", selectMode && "pb-24")}>
              {groups.map((g) => (
                <div key={g.key}>
                  <div className="mb-3 flex items-center gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.label}
                    </h2>
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {g.items.length}
                    </span>
                  </div>
                  <ul className={cn(compact ? "space-y-2" : "space-y-3")}>
                    <AnimatePresence initial={false}>
                      {g.items.map((n) => (
                        <motion.li
                          key={n.id}
                          layout="position"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -24, height: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <NotificationCard
                            n={n}
                            now={now}
                            compact={compact}
                            selectMode={selectMode}
                            selected={selected.has(n.id)}
                            onSelect={toggleSelect}
                            onRead={markRead}
                            onDismiss={dismiss}
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={filtersActive ? Search : BellOff}
              title={
                filtersActive ? "No matching notifications" : "Nothing here"
              }
              description={
                filtersActive
                  ? "Try a different keyword or switch to another tab."
                  : "Announcements from our team will appear here."
              }
              action={
                filtersActive ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          )}
        </section>

        <NotificationsExtras />
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectMode && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl border bg-background/95 p-3 shadow-lg backdrop-blur"
            role="toolbar"
            aria-label="Bulk actions"
          >
            <span className="px-1 text-sm font-medium">
              {selected.size} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setSelected(
                  allVisibleSelected
                    ? new Set()
                    : new Set(filtered.map((n) => n.id)),
                )
              }
            >
              {allVisibleSelected ? "Select none" : "Select all"}
            </Button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!selected.size}
                onClick={() => {
                  markRead([...selected], true);
                  exitSelect();
                }}
              >
                <Check className="size-4" /> Read
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!selected.size}
                onClick={() => {
                  markRead([...selected], false);
                  exitSelect();
                }}
              >
                <Mail className="size-4" /> Unread
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={!selected.size}
                onClick={() => dismiss([...selected])}
              >
                <X className="size-4" /> Dismiss
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={exitSelect}
                aria-label="Cancel selection"
              >
                <X className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
