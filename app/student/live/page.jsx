"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Timer,
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function formatCountdown(mins) {
  if (mins <= 0) return "Starting now";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function LiveClassesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [category, setCategory] = useState("All");
  const [reminders, setReminders] = useState(new Set());
  const [, setTick] = useState(0);

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

  const remindedSessions = LIVE_SESSIONS.filter((s) => reminders.has(s.id));

  return (
    <div className="min-h-screen bg-background">
      {/* 3D banner */}
      <div className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <LiveScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {liveNowCount > 0 && (
              <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                {liveNowCount} session{liveNowCount > 1 ? "s" : ""} live now
              </span>
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Live Classes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Join live sessions with instructors, ask questions in real time,
              and catch up on anything you missed.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main column */}
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  {STATUS_FILTERS.map((f) => (
                    <TabsTrigger key={f} value={f} className="capitalize">
                      {f}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence>
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    variants={item}
                    layout
                    exit={{ opacity: 0, scale: 0.96 }}
                  >
                    <SessionCard
                      session={session}
                      reminded={reminders.has(session.id)}
                      onToggleReminder={() => toggleReminder(session.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {sessions.length === 0 && (
              <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No sessions match these filters right now.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {nextUpcoming && (
              <Card className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                    <Timer className="h-4 w-4 text-primary" />
                    Starts In
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-foreground">
                    {formatCountdown(nextUpcoming.startsInMins)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {nextUpcoming.title}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <BellRing className="h-4 w-4 text-primary" />
                  My Reminders
                </div>
                {remindedSessions.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Set a reminder on an upcoming session to see it here.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {remindedSessions.map((s) => (
                      <li key={s.id} className="text-sm">
                        <p className="font-medium text-card-foreground">
                          {s.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.startsAt}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ session, reminded, onToggleReminder }) {
  const isLive = session.status === "live";
  const isEnded = session.status === "ended";

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="flex h-full flex-col justify-between border-border bg-card transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <Badge
            variant="secondary"
            className="bg-accent text-accent-foreground"
          >
            {session.category}
          </Badge>
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
              LIVE
            </span>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pb-4">
          <h3 className="text-lg font-semibold leading-snug text-card-foreground">
            {session.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            with {session.instructor}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {session.startsAt} · {session.durationMins} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {session.attendees} joined
            </span>
          </div>
        </CardContent>

        <CardFooter className="gap-2 pt-0">
          {isLive && (
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Radio className="h-4 w-4" />
              Join Now
            </Button>
          )}
          {!isLive && !isEnded && (
            <Button
              variant={reminded ? "secondary" : "outline"}
              onClick={onToggleReminder}
              className="w-full gap-2"
            >
              <Bell className="h-4 w-4" />
              {reminded ? "Reminder set" : "Set Reminder"}
            </Button>
          )}
          {isEnded && (
            <Button variant="ghost" className="w-full text-muted-foreground">
              Watch Recording
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
