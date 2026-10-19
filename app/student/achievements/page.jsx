"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Flame,
  Lock,
  Download,
  Star,
  Medal,
  Target,
  Crown,
  Award,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import AchievementsScene from "@/components/three/scene-achievements";

// ---------------------------------------------------------------------------
// TEMP DATA — replace with real profile/progress data from Firestore (e.g.
// a `studentProgress` doc and an `achievements` collection) once wired into
// the existing data-fetching pattern.
// ---------------------------------------------------------------------------
const PROFILE = {
  name: "You",
  level: 7,
  xp: 2340,
  xpForNextLevel: 3000,
  currentStreak: 12,
  longestStreak: 29,
};

const BADGES = [
  {
    id: "b1",
    title: "First Steps",
    description: "Completed your first course",
    icon: Star,
    earned: true,
    tier: "bronze",
  },
  {
    id: "b2",
    title: "Night Owl",
    description: "Studied after midnight 5 times",
    icon: Flame,
    earned: true,
    tier: "bronze",
  },
  {
    id: "b3",
    title: "Consistent Learner",
    description: "7-day learning streak",
    icon: Medal,
    earned: true,
    tier: "silver",
  },
  {
    id: "b4",
    title: "Community Voice",
    description: "20 helpful replies in Community",
    icon: Trophy,
    earned: true,
    tier: "silver",
  },
  {
    id: "b5",
    title: "Deep Diver",
    description: "Finish 3 advanced-level courses",
    icon: Target,
    earned: false,
    tier: "gold",
  },
  {
    id: "b6",
    title: "Mentor",
    description: "Help 50 students in Community",
    icon: Crown,
    earned: false,
    tier: "gold",
  },
];

const CERTIFICATES = [
  { id: "c1", title: "Foundations of Machine Learning", date: "Aug 2026" },
  { id: "c2", title: "Full-Stack Web Development", date: "May 2026" },
];

const LEADERBOARD = [
  { name: "Usman Farooq", xp: 4820 },
  { name: "Zara Malik", xp: 3960 },
  { name: "You", xp: 2340, isUser: true },
  { name: "Hina Siddiqui", xp: 2100 },
];

// Full class strings are kept literal so Tailwind can detect them.
const TIERS = {
  bronze: {
    label: "Bronze",
    icon: "text-orange-500",
    well: "bg-orange-500/10 ring-orange-500/30",
    chip: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    edge: "border-t-orange-500",
  },
  silver: {
    label: "Silver",
    icon: "text-slate-400",
    well: "bg-slate-400/10 ring-slate-400/30",
    chip: "bg-slate-400/15 text-slate-600 dark:text-slate-300",
    edge: "border-t-slate-400",
  },
  gold: {
    label: "Gold",
    icon: "text-yellow-500",
    well: "bg-yellow-400/10 ring-yellow-400/40",
    chip: "bg-yellow-400/15 text-yellow-700 dark:text-yellow-400",
    edge: "border-t-yellow-400",
  },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "earned", label: "Earned" },
  { id: "locked", label: "Locked" },
];

const EMPTY_COPY = {
  earned: {
    title: "No badges earned yet",
    body: "Finish a course or keep your streak going to earn your first badge.",
  },
  locked: {
    title: "Every badge unlocked",
    body: "You have earned all available badges. New ones will appear here.",
  },
};

const formatXp = (n) => n.toLocaleString("en-US");

export default function AchievementsPage() {
  const [filter, setFilter] = useState("all");
  const reduceMotion = useReducedMotion();

  const badges = useMemo(() => {
    if (filter === "earned") return BADGES.filter((b) => b.earned);
    if (filter === "locked") return BADGES.filter((b) => !b.earned);
    return BADGES;
  }, [filter]);

  const earnedCount = BADGES.filter((b) => b.earned).length;
  const counts = {
    all: BADGES.length,
    earned: earnedCount,
    locked: BADGES.length - earnedCount,
  };

  const xpPercent = Math.min(
    100,
    Math.round((PROFILE.xp / PROFILE.xpForNextLevel) * 100),
  );
  const xpRemaining = Math.max(0, PROFILE.xpForNextLevel - PROFILE.xp);

  const streakPercent = Math.min(
    100,
    Math.round((PROFILE.currentStreak / PROFILE.longestStreak) * 100),
  );
  const daysToRecord = Math.max(
    0,
    PROFILE.longestStreak - PROFILE.currentStreak,
  );

  const userIndex = LEADERBOARD.findIndex((p) => p.isUser);
  const userRank = userIndex + 1;
  const ahead = userIndex > 0 ? LEADERBOARD[userIndex - 1] : null;
  const xpToNextRank = ahead ? ahead.xp - PROFILE.xp : 0;

  // Motion: one orchestrated header reveal; list stagger only on filter change.
  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
  };
  const itemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.01 : 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.15 } },
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* 3D banner */}
      <header className="relative h-[280px] overflow-hidden sm:h-[340px]">
        <AchievementsScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" />
              {PROFILE.currentStreak}-day streak
            </span>
            <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your learning record
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Track your level, unlock badges, and see how you rank among other
              learners.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
          {/* Main column */}
          <div className="min-w-0">
            {/* Level / XP */}
            <section aria-labelledby="level-heading">
              <Card className="overflow-hidden border-border bg-card shadow-sm">
                <CardContent className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-xl font-semibold tabular-nums text-violet-600 ring-1 ring-violet-500/30 dark:text-violet-400"
                        aria-hidden="true"
                      >
                        L{PROFILE.level}
                      </div>
                      <div>
                        <h2
                          id="level-heading"
                          className="text-xl font-semibold tracking-tight text-card-foreground"
                        >
                          Level {PROFILE.level}
                        </h2>
                        <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                          {formatXp(PROFILE.xp)} /{" "}
                          {formatXp(PROFILE.xpForNextLevel)} XP
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="gap-1.5 bg-accent px-3 py-1 text-accent-foreground"
                    >
                      <Award className="h-3.5 w-3.5" aria-hidden="true" />
                      {earnedCount}/{BADGES.length} badges earned
                    </Badge>
                  </div>

                  <Progress
                    value={xpPercent}
                    aria-label={`Progress to level ${PROFILE.level + 1}`}
                    className="mt-6 h-2.5"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Sparkles
                        className="h-4 w-4 text-violet-500"
                        aria-hidden="true"
                      />
                      <span className="font-medium tabular-nums text-card-foreground">
                        {formatXp(xpRemaining)} XP
                      </span>
                      to reach level {PROFILE.level + 1}
                    </p>
                    <p className="tabular-nums text-muted-foreground">
                      {xpPercent}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Badges */}
            <section className="mt-12" aria-labelledby="badges-heading">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2
                    id="badges-heading"
                    className="text-xl font-semibold tracking-tight text-foreground"
                  >
                    Badges
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Earned badges are highlighted. Locked badges show what to do
                    next.
                  </p>
                </div>
                <div
                  role="group"
                  aria-label="Filter badges"
                  className="flex gap-1 rounded-lg border border-border bg-card p-1 text-sm"
                >
                  {FILTERS.map((f) => {
                    const active = filter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        aria-pressed={active}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {f.label}
                        <span
                          className={`text-xs tabular-nums ${
                            active
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {counts[f.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div aria-live="polite">
                {badges.length === 0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
                    <Award
                      className="mx-auto h-8 w-8 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-sm font-semibold text-foreground">
                      {EMPTY_COPY[filter].title}
                    </p>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                      {EMPTY_COPY[filter].body}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setFilter("all")}
                    >
                      Show all badges
                    </Button>
                  </div>
                ) : (
                  <motion.ul
                    key={filter}
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="mt-5 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3"
                  >
                    <AnimatePresence mode="popLayout">
                      {badges.map((badge) => (
                        <motion.li
                          key={badge.id}
                          variants={itemVariants}
                          exit="exit"
                          layout={!reduceMotion}
                        >
                          <BadgeCard
                            badge={badge}
                            reduceMotion={reduceMotion}
                          />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </motion.ul>
                )}
              </div>
            </section>

            {/* Certificates */}
            <section className="mt-12" aria-labelledby="certs-heading">
              <h2
                id="certs-heading"
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                Certificates
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Download proof of the courses you have completed.
              </p>

              {CERTIFICATES.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    No certificates yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Complete a course to receive your first certificate.
                  </p>
                </div>
              ) : (
                <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                  {CERTIFICATES.map((cert) => (
                    <li
                      key={cert.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-600 ring-1 ring-yellow-400/30 dark:text-yellow-400">
                          <Trophy className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-card-foreground">
                            {cert.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Issued {cert.date}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="group gap-1.5"
                        aria-label={`Download certificate: ${cert.title}`}
                      >
                        <Download
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5"
                          aria-hidden="true"
                        />
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <Trophy
                      className="h-4 w-4 text-violet-500"
                      aria-hidden="true"
                    />
                    Leaderboard
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    You are #{userRank}
                  </span>
                </div>

                <ol className="mt-4 space-y-1">
                  {LEADERBOARD.map((p, i) => (
                    <li
                      key={p.name}
                      aria-current={p.isUser ? "true" : undefined}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm ${
                        p.isUser
                          ? "bg-violet-500/10 ring-1 ring-violet-500/25"
                          : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                            i === 0
                              ? "bg-yellow-400 text-neutral-900"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span
                          className={`truncate ${
                            p.isUser
                              ? "font-semibold text-violet-700 dark:text-violet-300"
                              : "text-card-foreground"
                          }`}
                        >
                          {p.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatXp(p.xp)} XP
                      </span>
                    </li>
                  ))}
                </ol>

                {ahead && (
                  <p className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                    <ArrowUp
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500"
                      aria-hidden="true"
                    />
                    <span>
                      Earn{" "}
                      <span className="font-medium tabular-nums text-card-foreground">
                        {formatXp(xpToNextRank)} XP
                      </span>{" "}
                      to pass {ahead.name}.
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Flame
                    className="h-4 w-4 text-yellow-500"
                    aria-hidden="true"
                  />
                  Streak
                </h2>
                <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                  {PROFILE.currentStreak}
                  <span className="ml-1.5 text-base font-medium text-muted-foreground">
                    days
                  </span>
                </p>
                <Progress
                  value={streakPercent}
                  aria-label="Current streak compared with your longest streak"
                  className="mt-4 h-1.5"
                />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Longest streak:{" "}
                  <span className="font-medium tabular-nums text-card-foreground">
                    {PROFILE.longestStreak} days
                  </span>
                  {daysToRecord > 0 && (
                    <>
                      . Keep going for {daysToRecord} more{" "}
                      {daysToRecord === 1 ? "day" : "days"} to set a new record.
                    </>
                  )}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function BadgeCard({ badge, reduceMotion }) {
  const Icon = badge.icon;
  const tier = TIERS[badge.tier] ?? TIERS.bronze;

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className={`h-full border-border transition-shadow hover:shadow-md ${
          badge.earned
            ? `border-t-2 bg-card ${tier.edge}`
            : "border-dashed bg-muted/30"
        }`}
      >
        <CardContent className="flex h-full flex-col items-center gap-3 p-5 text-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ring-1 ${
              badge.earned ? tier.well : "bg-muted ring-border"
            }`}
          >
            {badge.earned ? (
              <Icon className={`h-6 w-6 ${tier.icon}`} aria-hidden="true" />
            ) : (
              <Lock
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>

          <div className="space-y-1">
            <p
              className={`text-sm font-semibold ${
                badge.earned ? "text-card-foreground" : "text-muted-foreground"
              }`}
            >
              {badge.title}
            </p>
            <p className="text-xs leading-snug text-muted-foreground">
              {badge.description}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-center gap-1.5 pt-1">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tier.chip}`}
            >
              {tier.label}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {badge.earned ? "Earned" : "Locked"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
