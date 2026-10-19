"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio,
  Clock,
  Users,
  CalendarDays,
  Bell,
  BellRing,
  BellOff,
  Timer,
  PlayCircle,
  Hourglass,
} from "lucide-react";
import LiveScene from "@/components/three/scene-live";

// ---------------------------------------------------------------------------
// TEMP DATA — replace with real data from Firestore (e.g. a `liveSessions`
// collection) once this page is wired into the existing data-fetching
// pattern used elsewhere in the app.
// ---------------------------------------------------------------------------
const LIVE_SESSIONS = [
  {
    id: "ls_1",
    title: "Intro to Transformer Architectures",
    instructor: "Ayesha Khan",
    category: "AI & Machine Learning",
    status: "live",
    startsAt: "Now",
    startsInMins: 0,
    durationMins: 60,
    attendees: 142,
  },
  {
    id: "ls_2",
    title: "Building REST APIs with Node.js",
    instructor: "Bilal Ahmed",
    category: "Software Engineering",
    status: "upcoming",
    startsAt: "Today, 6:00 PM",
    startsInMins: 95,
    durationMins: 90,
    attendees: 58,
  },
  {
    id: "ls_3",
    title: "CI/CD Pipelines on AWS",
    instructor: "Sana Tariq",
    category: "Cloud Computing",
    status: "upcoming",
    startsAt: "Tomorrow, 11:00 AM",
    startsInMins: 1180,
    durationMins: 75,
    attendees: 34,
  },
  {
    id: "ls_4",
    title: "Automating Workflows with Python",
    instructor: "Hamza Raza",
    category: "Automation",
    status: "ended",
    startsAt: "Yesterday, 4:00 PM",
    startsInMins: null,
    durationMins: 60,
    attendees: 201,
  },
];

const STATUS_FILTERS = ["all", "live", "upcoming", "ended"];
const CATEGORIES = ["All", ...new Set(LIVE_SESSIONS.map((s) => s.category))];

function formatCountdown(mins) {
  if (mins <= 0) return "Starting now";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function LiveClassesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [category, setCategory] = useState("All");
  const [reminders, setReminders] = useState(new Set());
  const [, setTick] = useState(0);
  const reduceMotion = useReducedMotion();

  // Drives the live countdown without needing real timestamps for this demo
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const sessions = useMemo(() => {
    return LIVE_SESSIONS.filter((s) => {
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesCategory = category === "All" || s.category === category;
      return matchesStatus && matchesCategory;
    });
  }, [statusFilter, category]);

  const statusCounts = useMemo(() => {
    const counts = { all: 0, live: 0, upcoming: 0, ended: 0 };
    LIVE_SESSIONS.forEach((s) => {
      if (category !== "All" && s.category !== category) return;
      counts.all += 1;
      counts[s.status] += 1;
    });
    return counts;
  }, [category]);

  const liveNowCount = LIVE_SESSIONS.filter((s) => s.status === "live").length;
  const nextUpcoming = LIVE_SESSIONS.filter(
    (s) => s.status === "upcoming",
  ).sort((a, b) => a.startsInMins - b.startsInMins)[0];

  function toggleReminder(id) {
    setReminders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setStatusFilter("all");
    setCategory("All");
  }

  const remindedSessions = LIVE_SESSIONS.filter((s) => reminders.has(s.id));
  const hasFilters = statusFilter !== "all" || category !== "All";

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.06 } },
  };
  const itemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.01 : 0.35, ease: "easeOut" },
    },
    exit: { opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.15 } },
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* 3D banner */}
      <header className="relative h-[280px] overflow-hidden sm:h-[340px]">
        <LiveScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {liveNowCount > 0 && (
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive motion-reduce:animate-none"
                />
                {liveNowCount} session{liveNowCount > 1 ? "s" : ""} live now
              </span>
            )}
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Live Classes
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Join live sessions with instructors, ask questions in real time,
              and catch up on anything you missed.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          {/* Main column */}
          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="max-w-full overflow-x-auto"
              >
                <TabsList aria-label="Filter by session status">
                  {STATUS_FILTERS.map((f) => (
                    <TabsTrigger
                      key={f}
                      value={f}
                      className="min-h-9 gap-1.5 capitalize"
                    >
                      {f}
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {statusCounts[f]}
                      </span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Filter by category"
                className={`h-10 rounded-md border border-border bg-card px-3 text-sm text-foreground ${focusRing}`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <p
              aria-live="polite"
              className="mt-5 text-sm text-muted-foreground"
            >
              <span className="font-medium tabular-nums text-foreground">
                {sessions.length}
              </span>{" "}
              {sessions.length === 1 ? "session" : "sessions"}
            </p>

            {sessions.length > 0 ? (
              <motion.ul
                key={`${statusFilter}-${category}`}
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {sessions.map((session) => (
                    <motion.li
                      key={session.id}
                      variants={itemVariants}
                      exit="exit"
                      layout={!reduceMotion}
                    >
                      <SessionCard
                        session={session}
                        reminded={reminders.has(session.id)}
                        onToggleReminder={() => toggleReminder(session.id)}
                        reduceMotion={reduceMotion}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <CalendarDays
                  className="h-8 w-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  No sessions match these filters
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try another status or category to see what is scheduled.
                </p>
                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {nextUpcoming && (
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-5">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <Timer
                      className="h-4 w-4 text-yellow-500"
                      aria-hidden="true"
                    />
                    Next session starts in
                  </h2>
                  <p className="mt-3 text-3xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                    {formatCountdown(nextUpcoming.startsInMins)}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-snug text-card-foreground">
                    {nextUpcoming.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {nextUpcoming.startsAt}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <BellRing
                    className="h-4 w-4 text-violet-500"
                    aria-hidden="true"
                  />
                  My Reminders
                </h2>
                {remindedSessions.length === 0 ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Set a reminder on an upcoming session to see it here.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-border">
                    {remindedSessions.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 text-sm">
                          <p className="font-medium leading-snug text-card-foreground">
                            {s.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {s.startsAt}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleReminder(s.id)}
                          aria-label={`Remove reminder for ${s.title}`}
                          className={`grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${focusRing}`}
                        >
                          <BellOff className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SessionCard({ session, reminded, onToggleReminder, reduceMotion }) {
  const isLive = session.status === "live";
  const isEnded = session.status === "ended";
  const isUpcoming = !isLive && !isEnded;

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card
        className={`flex h-full flex-col justify-between bg-card transition-shadow hover:shadow-lg ${
          isLive
            ? "border-destructive/40 border-t-2 border-t-destructive"
            : "border-border"
        } ${isEnded ? "bg-muted/30" : ""}`}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <Badge
            variant="secondary"
            className="bg-violet-500/10 font-medium text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
          >
            {session.category}
          </Badge>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive motion-reduce:animate-none"
              />
              LIVE
            </span>
          )}
          {isUpcoming && session.startsInMins != null && (
            <span className="flex items-center gap-1.5 rounded-full bg-yellow-400/15 px-2.5 py-1 text-xs font-medium tabular-nums text-yellow-700 dark:text-yellow-400">
              <Hourglass className="h-3 w-3" aria-hidden="true" />
              In {formatCountdown(session.startsInMins)}
            </span>
          )}
          {isEnded && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Ended
            </span>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          <h3 className="text-pretty text-lg font-semibold leading-snug tracking-tight text-card-foreground">
            {session.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            with{" "}
            <span className="font-medium text-card-foreground">
              {session.instructor}
            </span>
          </p>

          <div className="flex flex-col gap-1.5 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {session.startsAt}, {session.durationMins} min
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Users className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {session.attendees} joined
            </span>
          </div>
        </CardContent>

        <CardFooter className="gap-2 pt-0">
          {isLive && (
            <Button className="min-h-11 w-full gap-2 bg-yellow-400 font-semibold text-neutral-900 shadow-[0_3px_0_0_rgb(202_138_4)] transition-[transform,box-shadow] duration-100 hover:bg-yellow-300 active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0">
              <Radio className="h-4 w-4" aria-hidden="true" />
              Join Now
            </Button>
          )}
          {isUpcoming && (
            <Button
              variant={reminded ? "secondary" : "outline"}
              onClick={onToggleReminder}
              aria-pressed={reminded}
              className="min-h-11 w-full gap-2"
            >
              <Bell
                className={`h-4 w-4 ${reminded ? "fill-current" : ""}`}
                aria-hidden="true"
              />
              {reminded ? "Reminder set" : "Set Reminder"}
            </Button>
          )}
          {isEnded && (
            <Button
              variant="ghost"
              className="min-h-11 w-full gap-2 text-muted-foreground"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Watch Recording
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.article>
  );
}
