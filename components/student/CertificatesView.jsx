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
  Sparkles,
  Target,
  Trophy,
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

/* ---------------- Building blocks ---------------- */
function AnimatedNumber({ value, suffix = "" }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);

  return (
    <>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </>
  );
}

function AwardBadge({ count }) {
  return (
    <div className="relative flex size-36 shrink-0 items-center justify-center sm:size-44">
      {/* Rotating dashed ring */}
      <motion.div
        aria-hidden
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
      />
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/25 to-primary/5" />

      {/* Floating sparkles */}
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
        <Award className="size-9 text-primary sm:size-11" />
        <span className="mt-1 text-3xl font-bold sm:text-4xl">
          <AnimatedNumber value={count} />
        </span>
        <span className="text-[11px] text-muted-foreground">
          {count === 1 ? "Certificate" : "Certificates"}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Almost there (real in-progress courses) ---------------- */
function AlmostThere({ inProgress }) {
  if (!inProgress?.length) return null;
  return (
    <section>
      <div className="mb-5 flex items-center gap-2">
        <Target className="size-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Almost there</h2>
          <p className="text-sm text-muted-foreground">
            Finish these courses to earn your next certificates.
          </p>
        </div>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {inProgress.map((c) => (
          <motion.div
            key={c.id}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Award className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold transition-colors group-hover:text-primary">
                  {c.courseTitle}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {c.progress}% complete · finish every lesson to earn it
                </p>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${c.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              />
            </div>

            <Link
              href={`/student/learning/${c.courseSlug}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "group/btn mt-4 w-full",
              )}
            >
              Continue course
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ---------------- Guide, share tips, FAQ (also used on empty page) ---------------- */
export function CertificatesExtras({ inProgress = [] }) {
  return (
    <div className="mt-10 space-y-12">
      <AlmostThere inProgress={inProgress} />

      <section>
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          How you earn a certificate
        </h2>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {CERT_STEPS.map((s, i) => {
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

      <section>
        <div className="mb-5 flex items-center gap-2">
          <Lightbulb className="size-5 text-yellow-500" />
          <h2 className="text-xl font-semibold tracking-tight">
            Show off your achievement
          </h2>
        </div>
        <motion.div
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-4 md:grid-cols-3"
        >
          {SHARE_TIPS.map((t) => {
            const Icon = ICONS[t.icon];
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
          {CERT_FAQ.map((f, i) => (
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
// meta:  [{ id, title, issuedAt(ms) }]   cards: { [id]: <CertificateCard /> rendered on the server }
export function CertificatesView({ meta, cards, inProgress }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const stats = useMemo(() => {
    const year = new Date().getUTCFullYear();
    const latest = [...meta].sort(SORTERS.newest)[0] ?? null;
    return {
      total: meta.length,
      thisYear: meta.filter(
        (m) => m.issuedAt && new Date(m.issuedAt).getUTCFullYear() === year,
      ).length,
      latest,
    };
  }, [meta]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meta
      .filter((m) => !q || m.title.toLowerCase().includes(q))
      .sort(SORTERS[sort]);
  }, [meta, query, sort]);

  const statCards = [
    {
      label: "Certificates earned",
      value: stats.total,
      icon: Award,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Earned this year",
      value: stats.thisYear,
      icon: CalendarDays,
      tone: "text-orange-500 bg-orange-500/10",
    },
    {
      label: "Courses in progress",
      value: inProgress.length,
      icon: Target,
      tone: "text-violet-500 bg-violet-500/10",
    },
  ];

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
              <Trophy className="size-3" /> Your achievements
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {stats.total === 1
                ? "You've earned your first certificate"
                : `You've earned ${stats.total} certificates`}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              Each certificate is proof of the skills you built. Download them,
              share them and keep adding more.
            </p>

            {stats.latest && (
              <motion.div
                whileHover={{ y: -2 }}
                className="mt-5 flex max-w-xl items-center gap-4 rounded-xl border bg-background/80 p-4 backdrop-blur"
              >
                <Award className="size-9 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Latest certificate
                  </p>
                  <p className="truncate text-sm font-semibold sm:text-base">
                    {stats.latest.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Issued {fmtDate(stats.latest.issuedAt)}
                  </p>
                </div>
              </motion.div>
            )}

            <Link
              href="/courses"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "group mt-5",
              )}
            >
              Earn another certificate
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex justify-center lg:justify-end">
            <AwardBadge count={stats.total} />
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
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

      {/* Toolbar + certificates */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Your certificates
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search certificates..."
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full sm:w-40">
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
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(i * 0.04, 0.3),
                  }}
                  whileHover={{ y: -4 }}
                >
                  {cards[m.id]}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon={Search}
            title="No matching certificates"
            description="Try a different keyword."
            action={
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        )}
      </section>

      <CertificatesExtras inProgress={inProgress} />
    </div>
  );
}
