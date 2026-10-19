// components/student/WishlistView.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MotionConfig,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
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
  X,
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

/* Design tokens: yellow #FACC15 = highlights, violet #8B5CF6 = selected / brand */
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const SELECTED_TEXT = "text-violet-700 dark:text-violet-300";
const YELLOW_TEXT = "text-amber-700 dark:text-[#FACC15]";

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
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return undefined;
    }
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return <motion.span>{rounded}</motion.span>;
}

function SectionHeading({ icon: Icon, iconClass, children }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      {Icon && (
        <span className="grid size-8 place-items-center rounded-lg border border-border bg-muted/50">
          <Icon className={cn("size-4", iconClass)} aria-hidden="true" />
        </span>
      )}
      <h2 className="text-xl font-bold tracking-tight">{children}</h2>
    </div>
  );
}

function HeartBadge({ count }) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative flex size-36 shrink-0 items-center justify-center sm:size-44"
    >
      <motion.div
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-[#8B5CF6]/35"
      />
      <div className="absolute inset-4 rounded-full border border-border bg-background shadow-sm" />

      {["-right-1 top-6", "-left-2 bottom-8", "right-4 -bottom-1"].map(
        (pos, i) => (
          <motion.span
            key={pos}
            animate={
              reduce ? undefined : { y: [0, -8, 0], opacity: [0.5, 1, 0.5] }
            }
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
            className={cn("absolute", pos)}
          >
            <Sparkles className="size-4 fill-[#FACC15] text-[#FACC15]" />
          </motion.span>
        ),
      )}

      <div className="relative flex flex-col items-center">
        <motion.span
          animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.8 }}
          className="inline-flex"
        >
          <Heart className="size-10 fill-[#8B5CF6] text-[#8B5CF6] sm:size-12" />
        </motion.span>
        <span className="mt-1 text-3xl font-extrabold tabular-nums sm:text-4xl">
          <AnimatedNumber value={count} />
        </span>
        <span className="text-[11px] font-medium text-muted-foreground">
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
      <section aria-labelledby="why-wishlist">
        <SectionHeading
          icon={Lightbulb}
          iconClass="text-amber-600 dark:text-[#FACC15]"
        >
          <span id="why-wishlist">Why build a wishlist?</span>
        </SectionHeading>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {WHY_WISHLIST.map((w) => {
            const Icon = ICONS[w.icon] ?? Bookmark;
            return (
              <motion.div
                key={w.title}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[#8B5CF6]/40"
              >
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-muted-foreground transition-all group-hover:scale-105 group-hover:border-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-bold tracking-tight">{w.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {w.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <section aria-labelledby="saved-to-started">
        <SectionHeading>
          <span id="saved-to-started">From saved to started</span>
        </SectionHeading>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {WISHLIST_STEPS.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Bookmark;
            return (
              <motion.div
                key={s.title}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[#8B5CF6]/40"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-sm font-bold tabular-nums text-violet-700 dark:text-violet-300">
                    {i + 1}
                  </span>
                  <Icon
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="font-bold tracking-tight">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      <ExploreSection />

      <section aria-labelledby="wishlist-faq">
        <SectionHeading icon={HelpCircle} iconClass="text-[#8B5CF6]">
          <span id="wishlist-faq">Frequently asked questions</span>
        </SectionHeading>
        <Accordion
          type="single"
          className="rounded-2xl border border-border bg-card px-5"
        >
          {WISHLIST_FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger
                className={cn(
                  "text-left font-semibold hover:no-underline hover:text-violet-700 dark:hover:text-violet-300",
                  FOCUS,
                )}
              >
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
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
        className="relative overflow-hidden rounded-2xl bg-[#111318] p-6 text-[#F8FAFC] sm:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-[#8B5CF6]/25 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-[#FACC15]"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Ready to learn something new?
            </h2>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Discover tech courses in AI, web, cloud, security and more.
            </p>
          </div>
          <Link
            href="/courses"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "group shrink-0 gap-1.5 bg-[#FACC15] font-bold text-[#111318] hover:bg-[#EAB308]",
              FOCUS,
            )}
          >
            Browse all courses
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
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

  const categoryCounts = useMemo(() => {
    const counts = {};
    enriched.forEach((e) => {
      if (e.cat) counts[e.cat] = (counts[e.cat] || 0) + 1;
    });
    return counts;
  }, [enriched]);

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
      tone: "text-violet-700 bg-[#8B5CF6]/10 dark:text-violet-300",
    },
    stats.free > 0 && {
      label: "Free courses",
      value: stats.free,
      icon: Gift,
      tone: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
    },
    hasPrices &&
      stats.value > 0 && {
        label: "Total value",
        text: money(stats.value),
        icon: Wallet,
        tone: "text-amber-700 bg-[#FACC15]/15 dark:text-[#FACC15]",
      },
    stats.categories > 0 && {
      label: "Categories",
      value: stats.categories,
      icon: Layers,
      tone: "text-sky-700 bg-sky-500/10 dark:text-sky-300",
    },
  ].filter(Boolean);

  const chips = [
    { value: "all", label: "All", count: stats.total },
    ...categories.map((c) => ({
      value: c,
      label: c,
      count: categoryCounts[c],
    })),
  ];

  const filtersActive = Boolean(q) || category !== "all";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-8">
        {/* Hero */}
        <motion.section
          aria-labelledby="wishlist-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-8"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-[#FACC15]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-[#8B5CF6]/10 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <Badge
                variant="secondary"
                className="gap-1.5 border border-border"
              >
                <Heart
                  className="size-3 fill-[#8B5CF6] text-[#8B5CF6]"
                  aria-hidden="true"
                />
                Your wishlist
              </Badge>
              <h2
                id="wishlist-title"
                className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl"
              >
                {stats.total === 1 ? (
                  <>
                    You&apos;ve saved{" "}
                    <span className={cn("tabular-nums", YELLOW_TEXT)}>1</span>{" "}
                    course for later
                  </>
                ) : (
                  <>
                    You&apos;ve saved{" "}
                    <span className={cn("tabular-nums", YELLOW_TEXT)}>
                      {stats.total}
                    </span>{" "}
                    courses for later
                  </>
                )}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Great learning starts with a plan. Review your saved courses and
                pick the one you want to start next.
              </p>

              {featured && (
                <motion.div
                  whileHover={{ y: -2 }}
                  className="mt-5 flex max-w-xl flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#8B5CF6] text-white">
                      <BookOpen className="size-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        Up next on your list
                      </p>
                      <p className="truncate text-sm font-bold sm:text-base">
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
                      "group shrink-0 gap-1.5",
                      FOCUS,
                    )}
                  >
                    View course
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              )}

              <Link
                href="/courses"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "group mt-5 gap-1.5",
                  FOCUS,
                )}
              >
                Browse more courses
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
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
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-[#8B5CF6]/40"
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  s.tone,
                )}
              >
                <s.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-2xl font-extrabold leading-none tabular-nums">
                  {s.text ?? <AnimatedNumber value={s.value} />}
                </p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Toolbar + grid (id is the target of the hero's "View saved courses" link) */}
        <section
          id="saved-courses"
          aria-labelledby="saved-courses-title"
          className="scroll-mt-24 space-y-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="saved-courses-title"
              className="text-xl font-bold tracking-tight"
            >
              Saved courses
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div role="search" className="relative sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your wishlist..."
                  aria-label="Search your wishlist"
                  className="pl-9 pr-9"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className={cn(
                      "absolute right-1.5 top-1/2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      FOCUS,
                    )}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger
                  className="w-full sm:w-48"
                  aria-label="Sort saved courses"
                >
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
            <div
              role="group"
              aria-label="Filter by category"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none]"
            >
              {chips.map((c) => {
                const selected = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    aria-pressed={selected}
                    className={cn(
                      "relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      FOCUS,
                      selected
                        ? "border-[#8B5CF6] text-white"
                        : "border-border bg-muted/50 text-muted-foreground hover:border-[#8B5CF6]/40 hover:text-foreground",
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="wishlist-chip-pill"
                        className="absolute inset-0 rounded-full bg-[#8B5CF6]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{c.label}</span>
                    <span
                      className={cn(
                        "relative z-10 rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums leading-none",
                        selected
                          ? "bg-white/20 text-white"
                          : "bg-background text-muted-foreground",
                      )}
                    >
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Showing{" "}
              <span className="font-semibold tabular-nums text-foreground">
                {filtered.length}
              </span>{" "}
              of {stats.total} courses
            </p>
            {filtersActive && filtered.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className={cn(
                  "cursor-pointer rounded-md px-2 py-1 text-xs font-semibold hover:underline",
                  SELECTED_TEXT,
                  FOCUS,
                )}
              >
                Clear filters
              </button>
            )}
          </div>

          {filtered.length ? (
            /* key: WishlistGrid copies `courses` into state once, so it must remount
               whenever the filtered list changes, otherwise search/sort/category
               changes would never show up in the grid. */
            <WishlistGrid
              key={filtered.map((e) => e.c.id).join("|")}
              courses={filtered.map((e) => e.c)}
            />
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
    </MotionConfig>
  );
}
