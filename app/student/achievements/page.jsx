"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const TIER_STYLES = {
  bronze: "from-orange-400/20 to-orange-400/5 text-orange-500",
  silver: "from-slate-400/20 to-slate-400/5 text-slate-400",
  gold: "from-accent/30 to-accent/5 text-accent",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function AchievementsPage() {
  const [filter, setFilter] = useState("all");

  const badges = useMemo(() => {
    if (filter === "earned") return BADGES.filter((b) => b.earned);
    if (filter === "locked") return BADGES.filter((b) => !b.earned);
    return BADGES;
  }, [filter]);

  const xpPercent = Math.min(
    100,
    Math.round((PROFILE.xp / PROFILE.xpForNextLevel) * 100),
  );
  const earnedCount = BADGES.filter((b) => b.earned).length;

  return (
    <div className="min-h-screen bg-background">
      {/* 3D banner */}
      <div className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <AchievementsScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
              <Flame className="h-3.5 w-3.5" />
              {PROFILE.currentStreak}-day streak
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Achievements
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Track your progress, unlock badges, and see how you compare with
              other learners.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main column */}
          <div>
            {/* Level / XP card */}
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                      L{PROFILE.level}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">
                        Level {PROFILE.level}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {PROFILE.xp} / {PROFILE.xpForNextLevel} XP to next level
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-accent text-accent-foreground"
                  >
                    {earnedCount}/{BADGES.length} badges earned
                  </Badge>
                </div>
                <Progress value={xpPercent} className="mt-4 h-2" />
              </CardContent>
            </Card>

            {/* Badge filters */}
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Badges</h2>
              <div className="flex gap-1 rounded-md border border-border bg-card p-1 text-sm">
                {["all", "earned", "locked"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded px-3 py-1 capitalize transition-colors ${
                      filter === f
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3"
            >
              <AnimatePresence>
                {badges.map((badge) => (
                  <motion.div key={badge.id} variants={item} layout>
                    <BadgeCard badge={badge} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Certificates */}
            <h2 className="mt-10 text-lg font-semibold text-foreground">
              Certificates
            </h2>
            <div className="mt-4 space-y-3">
              {CERTIFICATES.map((cert) => (
                <Card key={cert.id} className="border-border bg-card">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {cert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Issued {cert.date}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Trophy className="h-4 w-4 text-primary" />
                  Leaderboard
                </div>
                <ul className="mt-4 space-y-3">
                  {LEADERBOARD.map((p, i) => (
                    <li
                      key={p.name}
                      className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${
                        p.isUser ? "bg-primary/10" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-4 text-xs font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                        <span
                          className={
                            p.isUser
                              ? "font-semibold text-primary"
                              : "text-card-foreground"
                          }
                        >
                          {p.name}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {p.xp} XP
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Flame className="h-4 w-4 text-accent" />
                  Streak
                </div>
                <p className="mt-3 text-2xl font-semibold text-foreground">
                  {PROFILE.currentStreak} days
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Longest streak: {PROFILE.longestStreak} days
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }) {
  const Icon = badge.icon;
  const tierClass = TIER_STYLES[badge.tier] ?? TIER_STYLES.bronze;

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
      <Card
        className={`relative overflow-hidden border-border bg-card transition-shadow hover:shadow-md ${
          !badge.earned ? "opacity-60" : ""
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tierClass}`}
        />
        <CardContent className="relative flex flex-col items-center gap-2 p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/60">
            {badge.earned ? (
              <Icon className={`h-6 w-6 ${tierClass.split(" ").pop()}`} />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            {badge.title}
          </p>
          <p className="text-xs leading-snug text-muted-foreground">
            {badge.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
