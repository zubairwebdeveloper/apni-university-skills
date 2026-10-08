"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Gift,
  Heart,
  HelpCircle,
  Layers,
  Lightbulb,
  Rocket,
  Scale,
  Search,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState } from "@/components/shared/EmptyState";
import { WishlistGrid } from "@/components/student/WishlistGrid";
import { ExploreSection } from "@/components/student/MyCoursesView";
import { cn } from "@/lib/utils";
import {
  WHY_WISHLIST,
  WISHLIST_FAQ,
  WISHLIST_SORTS,
  WISHLIST_STEPS,
} from "@/lib/wishlist-data";

/* ---------------- Config + helpers (edit to match your data) ---------------- */
const CURRENCY = "USD";

const toMs = (v) => {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Date.parse(v) || 0;
  const s = v.seconds ?? v._seconds;
  return s ? s * 1000 : 0;
};

const getTitle = (c) => c.title ?? c.courseTitle ?? "Untitled course";
const getHref = (c) => `/courses/${c.slug ?? c.courseSlug ?? c.id}`;
const getPrice = (c) => (typeof c.price === "number" ? c.price : null);
const isFree = (c) => c.isFree === true || c.price === 0;
const getSavedAt = (c) => toMs(c.savedAt ?? c.addedAt ?? c.createdAt);
const getCategory = (c) => {
  const v = c.category ?? c.categoryName;
  if (!v) return null;
  return typeof v === "string" ? v : (v.name ?? v.title ?? null);
};

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

const BIG = Number.MAX_SAFE_INTEGER;
const SORTERS = {
  recent: (a, b) => b.savedAt - a.savedAt || a.idx - b.idx,
  title: (a, b) => a.title.localeCompare(b.title),
  "price-asc": (a, b) => (a.price ?? BIG) - (b.price ?? BIG),
  "price-desc": (a, b) => (b.price ?? -1) - (a.price ?? -1),
};

const ICONS = {
  bookmark: Bookmark,
  scale: Scale,
  target: Target,
  search: Search,
  rocket: Rocket,
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
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

function HeartBadge({ count }) {
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
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.8 }}
          className="inline-flex"
        >
          <Heart className="size-10 fill-primary/20 text-primary sm:size-12" />
        </motion.span>
        <span className="mt-1 text-3xl font-bold sm:text-4xl">
          <AnimatedNumber value={count} />
        </span>
        <span className="text-[11px] text-muted-foreground">
          {count === 1 ? "Saved course" : "Saved courses"}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Guide, categories, FAQ (also used on the empty page) ---------------- */
export function WishlistExtras() {
  return (
    <div className="mt-10 space-y-12">
      <section>
        <div className="mb-5 flex items-center gap-2">
          <Lightbulb className="size-5 text-yellow-500" />
          <h2 className="text-xl font-semibold tracking-tight">
            Why build a wishlist?
          </h2>
        </div>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {WHY_WISHLIST.map((w) => {
            const Icon = ICONS[w.icon];
            return (
              <motion.div
                key={w.title}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="group rounded-xl border bg-gradient-to-br from-muted/60 to-transparent p-5 transition-colors hover:border-primary/40"
              >
                <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-semibold">{w.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {w.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section>
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          From saved to started
        </h2>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {WISHLIST_STEPS.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <motion.div
                key={s.title}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <ExploreSection />

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
          {WISHLIST_FAQ.map((f, i) => (
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

      {/* Closing CTA */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/70 p-6 text-primary-foreground sm:p-8"
      >
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/30 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Ready to learn something new?
            </h2>
            <p className="mt-1 text-sm opacity-90">
              Discover tech courses in AI, web, cloud, security and more.
            </p>
          </div>
          <Link
            href="/courses"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "group shrink-0",
            )}
          >
            Browse all courses
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
}

/* ---------------- Main view ---------------- */
export function WishlistView({ courses }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [category, setCategory] = useState("all");

  const enriched = useMemo(
    () =>
      courses.map((c, idx) => ({
        c,
        idx,
        title: getTitle(c),
        price: getPrice(c),
        free: isFree(c),
        cat: getCategory(c),
        savedAt: getSavedAt(c),
      })),
    [courses],
  );

  const hasPrices = enriched.some((e) => e.price !== null);
  const categories = useMemo(
    () => [...new Set(enriched.map((e) => e.cat).filter(Boolean))].sort(),
    [enriched],
  );

  const stats = useMemo(() => {
    const paid = enriched.filter((e) => e.price !== null && !e.free);
    return {
      total: enriched.length,
      free: enriched.filter((e) => e.free).length,
      value: paid.reduce((n, e) => n + e.price, 0),
      categories: categories.length,
    };
  }, [enriched, categories]);

  const featured = useMemo(
    () => [...enriched].sort(SORTERS.recent)[0] ?? null,
    [enriched],
  );

  const q = query.trim().toLowerCase();
  const filtered = enriched
    .filter(
      (e) =>
        (category === "all" || e.cat === category) &&
        (!q || `${e.title} ${e.cat ?? ""}`.toLowerCase().includes(q)),
    )
    .sort(SORTERS[sort]);

  const sortOptions = WISHLIST_SORTS.filter(
    (o) => hasPrices || !o.value.startsWith("price"),
  );

  const statCards = [
    {
      label: "Saved courses",
      value: stats.total,
      icon: Bookmark,
      tone: "text-primary bg-primary/10",
    },
    stats.free > 0 && {
      label: "Free courses",
      value: stats.free,
      icon: Gift,
      tone: "text-green-600 bg-green-500/10",
    },
    hasPrices &&
      stats.value > 0 && {
        label: "Total value",
        text: money(stats.value),
        icon: Wallet,
        tone: "text-orange-500 bg-orange-500/10",
      },
    stats.categories > 0 && {
      label: "Categories",
      value: stats.categories,
      icon: Layers,
      tone: "text-violet-500 bg-violet-500/10",
    },
  ].filter(Boolean);

  const chips = [
    { value: "all", label: "All" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
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
              <Heart className="size-3" /> Your wishlist
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {stats.total === 1
                ? "You've saved 1 course for later"
                : `You've saved ${stats.total} courses for later`}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              Great learning starts with a plan. Review your saved courses and
              pick the one you want to start next.
            </p>

            {featured && (
              <motion.div
                whileHover={{ y: -2 }}
                className="mt-5 flex max-w-xl flex-col gap-3 rounded-xl border bg-background/80 p-4 backdrop-blur sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <BookOpen className="size-9 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Up next on your list
                    </p>
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {featured.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        featured.cat,
                        featured.free
                          ? "Free"
                          : featured.price !== null
                            ? money(featured.price)
                            : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
                <Link
                  href={getHref(featured.c)}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "group shrink-0",
                  )}
                >
                  View course
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )}

            <Link
              href="/courses"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "group mt-5",
              )}
            >
              Browse more courses
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeartBadge count={stats.total} />
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className={cn(
          "grid grid-cols-2 gap-3 sm:gap-4",
          statCards.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
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
            <div className="min-w-0">
              <p className="truncate text-2xl font-bold leading-none">
                {s.text ?? <AnimatedNumber value={s.value} />}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Saved courses
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your wishlist..."
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {chips.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={category === c.value}
                className={cn(
                  "relative shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c.value
                    ? "border-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {category === c.value && (
                  <motion.span
                    layoutId="wishlist-chip-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {stats.total} courses
        </p>

        {filtered.length ? (
          <WishlistGrid courses={filtered.map((e) => e.c)} />
        ) : (
          <EmptyState
            icon={Search}
            title="No matching courses"
            description="Try a different keyword or category."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}
      </section>

      <WishlistExtras />
    </div>
  );
}
