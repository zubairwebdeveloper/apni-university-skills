// components/student/CertificatesView.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  FileText,
  Globe,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Search,
  Target,
  Trophy,
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
import { cn } from "@/lib/utils";
import {
  CERT_FAQ,
  CERT_SORTS,
  CERT_STEPS,
  SHARE_TIPS,
} from "@/lib/certificates-data";

/* ---------------- Helpers ---------------- */
// Fixed locale + UTC so server and client always render the same text
const fmtDate = (ms) =>
  ms
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(ms))
    : "—";

const SORTERS = {
  newest: (a, b) => b.issuedAt - a.issuedAt,
  oldest: (a, b) => a.issuedAt - b.issuedAt,
  title: (a, b) => a.title.localeCompare(b.title),
};

const ICONS = {
  book: BookOpen,
  play: PlayCircle,
  award: Award,
  briefcase: Briefcase,
  file: FileText,
  globe: Globe,
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const isEditable = (t) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

// Shared interactive-surface styles
const CHUNKY = "shadow-[0_3px_0_0_var(--border)]";
const CARD_HOVER =
  "transition-colors hover:border-primary/40 motion-reduce:transition-none";

/* ---------------- Building blocks ---------------- */

// Staggered reveal. Renders statically when reduced motion is requested.
function Stagger({ className, children, inView = true }) {
  const reduce = useReducedMotion();
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "-60px" } }
    : { animate: "show" };
  return (
    <motion.div
      variants={listVariants}
      initial={reduce ? false : "hidden"}
      {...trigger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({ children, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={reduce ? undefined : itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ value }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv, reduce]);

  return <motion.span>{rounded}</motion.span>;
}

// Static medal: the hero's focal point. Only the number counts up, once.
function AwardMedal({ count }) {
  return (
    <div
      className="shrink-0 rounded-full border-2 border-dashed border-primary/30 p-3"
      aria-hidden="true"
    >
      <div className="relative grid size-28 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_0_0_color-mix(in_oklab,var(--primary)_55%,black)] ring-4 ring-inset ring-white/20 sm:size-32">
        <div className="flex flex-col items-center">
          <Award className="size-8 sm:size-9" />
          <span className="text-3xl font-bold leading-none sm:text-4xl">
            <AnimatedNumber value={count} />
          </span>
          <span className="mt-0.5 text-[11px] opacity-90">
            {count === 1 ? "Certificate" : "Certificates"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ value }) {
  const reduce = useReducedMotion();
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg
      viewBox="0 0 44 44"
      className="size-12 shrink-0 -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        strokeWidth="4"
        className="stroke-muted"
      />
      <motion.circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-primary"
        strokeDasharray={c}
        initial={{ strokeDashoffset: reduce ? c * (1 - value / 100) : c }}
        whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
        viewport={{ once: true }}
        transition={{ duration: reduce ? 0 : 1, ease: "easeOut" }}
      />
    </svg>
  );
}

function SectionHeading({ id, icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-2.5">
      {Icon && (
        <Icon
          aria-hidden="true"
          className="mt-1 size-5 shrink-0 text-primary"
        />
      )}
      <div>
        <h2 id={id} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- Almost there (real in-progress courses) ---------------- */
function AlmostThere({ inProgress }) {
  if (!inProgress?.length) return null;
  return (
    <section aria-labelledby="almost-title">
      <SectionHeading
        id="almost-title"
        icon={Target}
        title="Almost there"
        description="Finish these courses to earn your next certificates."
      />

      <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {inProgress.map((c) => (
          <StaggerItem key={c.id}>
            <div
              className={cn(
                "group h-full rounded-xl border bg-card p-5",
                CHUNKY,
                CARD_HOVER,
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ProgressRing value={c.progress} />
                  <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold tabular-nums">
                    {c.progress}%
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="truncate font-semibold transition-colors group-hover:text-primary motion-reduce:transition-none"
                    title={c.courseTitle}
                  >
                    {c.courseTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Finish every lesson to earn it
                  </p>
                </div>
              </div>

              <Link
                href={`/student/learning/${c.courseSlug}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "group/btn mt-4 w-full",
                )}
              >
                Continue course
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover/btn:translate-x-1 motion-reduce:transition-none"
                />
              </Link>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/* ---------------- Guide, share tips, FAQ (also used on empty page) ---------------- */
export function CertificatesExtras({ inProgress = [] }) {
  return (
    <div className="mt-10 space-y-12">
      <AlmostThere inProgress={inProgress} />

      <section aria-labelledby="steps-title">
        <SectionHeading id="steps-title" title="How you earn a certificate" />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {CERT_STEPS.map((s, i) => {
            const Icon = ICONS[s.icon] ?? Award;
            return (
              <StaggerItem key={s.title}>
                <div
                  className={cn(
                    "h-full rounded-xl border bg-card p-5",
                    CARD_HOVER,
                  )}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-muted-foreground"
                    />
                  </div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section aria-labelledby="share-title">
        <SectionHeading
          id="share-title"
          icon={Lightbulb}
          title="Show off your achievement"
        />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {SHARE_TIPS.map((t) => {
            const Icon = ICONS[t.icon] ?? Award;
            return (
              <StaggerItem key={t.title}>
                <div className="h-full rounded-xl bg-muted/50 p-5">
                  <Icon
                    aria-hidden="true"
                    className="mb-3 size-5 text-primary"
                  />
                  <h3 className="font-semibold">{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section aria-labelledby="faq-title">
        <SectionHeading
          id="faq-title"
          icon={HelpCircle}
          title="Frequently asked questions"
        />
        <Accordion
          type="single"
          collapsible
          className="rounded-xl border bg-card px-5"
        >
          {CERT_FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left hover:text-primary hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
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
// meta:  [{ id, title, issuedAt(ms) }]   cards: { [id]: <CertificateCard /> rendered on the server }
export function CertificatesView({ meta, cards, inProgress = [] }) {
  const reduce = useReducedMotion();
  const searchRef = useRef(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [year, setYear] = useState("all");

  // Press "/" to focus the search field
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stats = useMemo(() => {
    const thisYear = new Date().getUTCFullYear();
    const latest = [...meta].sort(SORTERS.newest)[0] ?? null;
    const years = [
      ...new Set(
        meta
          .filter((m) => m.issuedAt)
          .map((m) => String(new Date(m.issuedAt).getUTCFullYear())),
      ),
    ].sort((a, b) => b - a);
    return {
      total: meta.length,
      thisYear: meta.filter(
        (m) => m.issuedAt && new Date(m.issuedAt).getUTCFullYear() === thisYear,
      ).length,
      latest,
      years,
    };
  }, [meta]);

  const activeYear = stats.years.includes(year) ? year : "all";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meta
      .filter((m) => !q || m.title.toLowerCase().includes(q))
      .filter(
        (m) =>
          activeYear === "all" ||
          (m.issuedAt &&
            String(new Date(m.issuedAt).getUTCFullYear()) === activeYear),
      )
      .sort(SORTERS[sort]);
  }, [meta, query, sort, activeYear]);

  const statCards = [
    { label: "Certificates earned", value: stats.total, icon: Award },
    { label: "Earned this year", value: stats.thisYear, icon: CalendarDays },
    { label: "Courses in progress", value: inProgress.length, icon: Target },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        aria-labelledby="cert-hero-title"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border bg-primary/5 p-5 shadow-[0_4px_0_0_var(--border)] sm:p-8"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="gap-1">
              <Trophy aria-hidden="true" className="size-3" />
              Your achievements
            </Badge>
            <h2
              id="cert-hero-title"
              className="mt-3 text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {stats.total === 1
                ? "You've earned your first certificate"
                : `You've earned ${stats.total} certificates`}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Each certificate is proof of the skills you built. Download them,
              share them and keep adding more.
            </p>

            {stats.latest && (
              <div
                className={cn(
                  "mt-5 flex max-w-xl items-center gap-4 rounded-xl border bg-background p-4",
                  CHUNKY,
                )}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  <Award aria-hidden="true" className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Latest certificate
                  </p>
                  <p
                    className="truncate text-sm font-semibold sm:text-base"
                    title={stats.latest.title}
                  >
                    {stats.latest.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Issued {fmtDate(stats.latest.issuedAt)}
                  </p>
                </div>
              </div>
            )}

            <Link
              href="/courses"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "group mt-5 bg-background transition-[transform,box-shadow] duration-100",
                CHUNKY,
                "active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
              )}
            >
              Earn another certificate
              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
          </div>

          <div className="flex justify-center lg:justify-end">
            <AwardMedal count={stats.total} />
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <Stagger
        inView={false}
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
      >
        {statCards.map((s) => (
          <StaggerItem key={s.label}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card p-4",
                CHUNKY,
                CARD_HOVER,
              )}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <s.icon aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-2xl font-bold leading-none tabular-nums">
                  <AnimatedNumber value={s.value} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Toolbar + certificates */}
      <section aria-labelledby="your-certs-title" className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2
            id="your-certs-title"
            className="text-xl font-semibold tracking-tight"
          >
            Your certificates
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
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
                aria-label="Search certificates"
                placeholder="Search certificates (press /)"
                className="pl-9 pr-9"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              )}
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                className="w-full sm:w-40"
                aria-label="Sort certificates"
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {CERT_SORTS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Year chips */}
        {stats.years.length > 1 && (
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Filter by year"
          >
            {["all", ...stats.years].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                aria-pressed={activeYear === y}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  activeYear === y
                    ? "border-primary/30 bg-primary/10 font-medium text-foreground shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary)_25%,transparent)]"
                    : "text-muted-foreground hover:-translate-y-0.5 hover:text-foreground motion-reduce:hover:translate-y-0",
                )}
              >
                {y === "all" ? "All years" : y}
              </button>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {stats.total} certificates
        </p>

        {filtered.length ? (
          <motion.div
            layout
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((m, i) => (
                <motion.div
                  key={m.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.25,
                    delay: reduce ? 0 : Math.min(i * 0.04, 0.3),
                  }}
                >
                  <div className="h-full transition-transform duration-200 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none">
                    {cards[m.id]}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching certificates"
            description="Try a different keyword or year."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setYear("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </section>

      <CertificatesExtras inProgress={inProgress} />
    </div>
  );
}
