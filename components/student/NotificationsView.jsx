"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  Award,
  Bell,
  BellRing,
  BookOpen,
  CheckCheck,
  ChevronDown,
  Clock,
  HelpCircle,
  Inbox,
  Lightbulb,
  Link2,
  Megaphone,
  MailOpen,
  Search,
  Sparkles,
} from "lucide-react";

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

/* ---------------- Helpers ---------------- */
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// Derived from the link (your notifications have no type field)
const getKind = (n) => {
  const l = (n.href ?? "").toLowerCase();
  if (l.includes("certificate")) return "certificate";
  if (l.includes("course") || l.includes("learning")) return "course";
  return "announcement";
};

const KIND_META = {
  announcement: { icon: Megaphone, tone: "bg-primary/10 text-primary" },
  course: { icon: BookOpen, tone: "bg-orange-500/10 text-orange-500" },
  certificate: { icon: Award, tone: "bg-green-500/10 text-green-600" },
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
  { key: "week", label: "Earlier this week" },
  { key: "earlier", label: "Earlier" },
];

const TIP_ICONS = { check: CheckCheck, link: Link2, clear: MailOpen };

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

/* ---------------- Building blocks ---------------- */
function AnimatedNumber({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  return <motion.span>{rounded}</motion.span>;
}

function BellBadge({ unread }) {
  return (
    <div className="relative flex size-36 shrink-0 items-center justify-center sm:size-44">
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
      />
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/25 to-primary/5" />

      {["-right-1 top-6", "-left-2 bottom-8", "right-4 -bottom-1"].map(
        (pos, i) => (
          <motion.span
            key={pos}
            aria-hidden
            animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
            className={cn("absolute", pos)}
          >
            <Sparkles className="size-4 text-primary" />
          </motion.span>
        ),
      )}

      <div className="relative flex flex-col items-center">
        <motion.span
          animate={
            unread > 0 ? { rotate: [0, 14, -14, 10, -10, 0] } : { rotate: 0 }
          }
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
          className="inline-flex origin-top"
        >
          {unread > 0 ? (
            <BellRing className="size-10 text-primary sm:size-12" />
          ) : (
            <Bell className="size-10 text-primary sm:size-12" />
          )}
        </motion.span>
        <span className="mt-1 text-3xl font-bold sm:text-4xl">
          <AnimatedNumber value={unread} />
        </span>
        <span className="text-[11px] text-muted-foreground">Unread</span>
      </div>
    </div>
  );
}

function NotificationCard({ n, now }) {
  const [expanded, setExpanded] = useState(false);
  const kind = getKind(n);
  const meta = KIND_META[kind];
  const Icon = meta.icon;
  const isLong = (n.body ?? "").length > 180;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5 sm:p-5",
        n.read
          ? "bg-card hover:border-primary/30"
          : "border-primary/40 bg-primary/5 hover:border-primary/60",
      )}
    >
      {!n.read && (
        <motion.span
          aria-hidden
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          className="absolute inset-y-0 left-0 w-1 origin-top bg-primary"
        />
      )}

      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
            meta.tone,
          )}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "font-serif text-base transition-colors group-hover:text-primary",
                n.read ? "font-medium" : "font-semibold",
              )}
            >
              {n.title}
              {!n.read && <span className="sr-only"> (unread)</span>}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {!n.read && (
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
                </span>
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
              "mt-1.5 whitespace-pre-line text-sm text-muted-foreground",
              !expanded && isLong && "line-clamp-3",
            )}
          >
            {n.body}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {NOTIFICATION_KINDS.find((k) => k.value === kind)?.label}
            </Badge>

            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
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

            {n.href && (
              <Link
                href={n.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "group/btn ml-auto h-7 px-2.5 text-xs",
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
  );
}

/* ---------------- Guide + FAQ (also used on the empty page) ---------------- */
export function NotificationsExtras() {
  return (
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
            const meta = KIND_META[k.value];
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
          <Lightbulb className="size-5 text-yellow-500" />
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
            const Icon = TIP_ICONS[t.icon];
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
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border bg-card px-5"
        >
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
  );
}

/* ---------------- Main view ---------------- */
export function NotificationsView({ items, now }) {
  const [tab, setTab] = useState("all");
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const stats = useMemo(() => {
    const unread = items.filter((n) => !n.read).length;
    return {
      total: items.length,
      unread,
      read: items.length - unread,
      week: items.filter((n) => n.createdAt && now - n.createdAt < 7 * DAY)
        .length,
    };
  }, [items, now]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
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
  }, [items, tab, kind, query, sort]);

  const groups = useMemo(() => {
    const list = BUCKETS.map((b) => ({
      ...b,
      items: filtered.filter((n) => bucketOf(n.createdAt, now) === b.key),
    })).filter((g) => g.items.length);
    return sort === "oldest" ? list.reverse() : list;
  }, [filtered, now, sort]);

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: Inbox,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Unread",
      value: stats.unread,
      icon: BellRing,
      tone: "text-orange-500 bg-orange-500/10",
    },
    {
      label: "Read",
      value: stats.read,
      icon: CheckCheck,
      tone: "text-green-600 bg-green-500/10",
    },
    {
      label: "Last 7 days",
      value: stats.week,
      icon: Clock,
      tone: "text-violet-500 bg-violet-500/10",
    },
  ];

  const kindChips = [
    { value: "all", label: "All types" },
    ...NOTIFICATION_KINDS.map((k) => ({ value: k.value, label: k.label })),
  ];

  const clearFilters = () => {
    setTab("all");
    setKind("all");
    setQuery("");
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 sm:p-8"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="gap-1">
              <Inbox className="size-3" /> Your inbox
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {stats.unread > 0
                ? `You have ${stats.unread} unread notification${stats.unread > 1 ? "s" : ""}`
                : "You're all caught up"}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              {stats.unread > 0
                ? "Catch up on the latest announcements and updates from our team."
                : "No new messages right now. We will let you know when there is something new."}
            </p>
            <p className="mt-2 text-sm font-medium">
              {stats.week} new in the last 7 days
            </p>

            {stats.unread > 0 && tab !== "unread" && (
              <Button onClick={() => setTab("unread")} className="group mt-5">
                View unread
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>

          <div className="flex justify-center lg:justify-end">
            <BellBadge unread={stats.unread} />
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
      >
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                s.tone,
              )}
            >
              <s.icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">
                <AnimatedNumber value={s.value} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notifications..."
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSort((s) => (s === "newest" ? "oldest" : "newest"))
              }
              className="group justify-center"
            >
              <ArrowUpDown className="size-4 transition-transform group-hover:scale-110" />
              {sort === "newest" ? "Newest first" : "Oldest first"}
            </Button>
          </div>
        </div>

        {/* Type chips */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {kindChips.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setKind(c.value)}
              aria-pressed={kind === c.value}
              className={cn(
                "relative shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                kind === c.value
                  ? "border-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {kind === c.value && (
                <motion.span
                  layoutId="kind-chip-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{c.label}</span>
            </button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {stats.total} notifications
        </p>

        {/* Grouped list */}
        {groups.length ? (
          <div className="space-y-8">
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
                <motion.ul
                  key={`${g.key}-${tab}-${kind}-${sort}`}
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {g.items.map((n) => (
                    <motion.li key={n.id} variants={itemVariants}>
                      <NotificationCard n={n} now={now} />
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching notifications"
            description="Try a different keyword or switch to another tab."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}
      </section>

      <NotificationsExtras />
    </div>
  );
}
