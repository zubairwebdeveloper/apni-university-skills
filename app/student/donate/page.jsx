"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HeartHandshake,
  GraduationCap,
  Users,
  Laptop,
  Sparkles,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";
import DonateScene from "@/components/three/scene-donate";

// ---------------------------------------------------------------------------
// TEMP DATA — replace with real campaign/donation data from Firestore (e.g.
// a `campaign` doc and a `donations` collection) and wire the donate button
// into the existing payment flow once this page is connected.
// ---------------------------------------------------------------------------
const CAMPAIGN = {
  title: "Fund Scholarships for Next Semester",
  raised: 842000,
  goal: 1200000,
  donors: 614,
  daysLeft: 18,
};

const IMPACT_STATS = [
  {
    label: "Students sponsored",
    value: "312",
    icon: GraduationCap,
    tone: "bg-primary/10 text-primary ring-primary/20",
  },
  {
    label: "Devices provided",
    value: "94",
    icon: Laptop,
    tone: "bg-violet-500/10 text-violet-600 ring-violet-500/25 dark:text-violet-400",
  },
  {
    label: "Active mentors",
    value: "48",
    icon: Users,
    tone: "bg-yellow-400/15 text-yellow-700 ring-yellow-400/35 dark:text-yellow-400",
  },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const FREQUENCIES = [
  { id: "once", label: "One-time" },
  { id: "monthly", label: "Monthly" },
];

const RECENT_DONORS = [
  { name: "Ahmed R.", initials: "AR", amount: 2500, time: "3m ago" },
  { name: "Sara K.", initials: "SK", amount: 1000, time: "22m ago" },
  { name: "Anonymous", initials: "A", amount: 5000, time: "1h ago" },
  { name: "Bilal M.", initials: "BM", amount: 500, time: "2h ago" },
];

function formatPKR(n) {
  return `₨${n.toLocaleString("en-PK")}`;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function DonatePage() {
  const [frequency, setFrequency] = useState("once");
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const reduceMotion = useReducedMotion();

  const percent = Math.min(
    100,
    Math.round((CAMPAIGN.raised / CAMPAIGN.goal) * 100),
  );
  const remaining = Math.max(0, CAMPAIGN.goal - CAMPAIGN.raised);
  const perDayNeeded =
    CAMPAIGN.daysLeft > 0 ? Math.ceil(remaining / CAMPAIGN.daysLeft) : 0;

  const finalAmount = useMemo(() => {
    const custom = parseInt(customAmount, 10);
    return Number.isFinite(custom) && custom > 0 ? custom : amount;
  }, [amount, customAmount]);

  const usingCustom = Boolean(customAmount);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* 3D banner */}
      <header className="relative h-[280px] overflow-hidden sm:h-[340px]">
        <DonateScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {CAMPAIGN.daysLeft} days left
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {CAMPAIGN.title}
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Every contribution goes directly toward tuition, devices, and
              mentorship for students who can&apos;t afford them.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          {/* Main column */}
          <div className="min-w-0">
            {/* Campaign progress */}
            <section aria-labelledby="progress-heading">
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-5 sm:p-7">
                  <h2 id="progress-heading" className="sr-only">
                    Campaign progress
                  </h2>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-4xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
                        {formatPKR(CAMPAIGN.raised)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        raised of{" "}
                        <span className="font-medium tabular-nums text-card-foreground">
                          {formatPKR(CAMPAIGN.goal)}
                        </span>{" "}
                        goal
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold tabular-nums text-card-foreground">
                        {CAMPAIGN.donors.toLocaleString("en-PK")}
                      </span>{" "}
                      donors
                    </p>
                  </div>

                  <Progress
                    value={percent}
                    aria-label={`Campaign ${percent}% funded`}
                    className="mt-6 h-3"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
                    <p className="font-medium tabular-nums text-card-foreground">
                      {percent}% funded
                    </p>
                    {remaining > 0 && (
                      <p className="text-muted-foreground">
                        <span className="tabular-nums">
                          {formatPKR(remaining)}
                        </span>{" "}
                        to go
                        {perDayNeeded > 0 && (
                          <>
                            , about{" "}
                            <span className="tabular-nums">
                              {formatPKR(perDayNeeded)}
                            </span>{" "}
                            a day
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Impact stats */}
            <ul
              aria-label="Impact so far"
              className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {IMPACT_STATS.map((stat) => (
                <li
                  key={stat.label}
                  className="flex items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${stat.tone}`}
                  >
                    <stat.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xl font-semibold leading-none tracking-tight tabular-nums text-card-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Where it goes */}
            <section className="mt-6" aria-labelledby="where-heading">
              <Card className="border-border bg-card shadow-sm">
                <CardContent className="p-5 sm:p-7">
                  <h2
                    id="where-heading"
                    className="flex items-center gap-2 text-base font-semibold tracking-tight text-card-foreground"
                  >
                    <Sparkles
                      className="h-4 w-4 text-violet-500"
                      aria-hidden="true"
                    />
                    Where your donation goes
                  </h2>
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                    Scholarship funds cover course access, laptops for students
                    without one, and stipends for mentors who review projects
                    and answer questions outside class hours. Apni University
                    publishes a transparency report each semester.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Recent donors */}
            <section className="mt-12" aria-labelledby="donors-heading">
              <h2
                id="donors-heading"
                className="text-xl font-semibold tracking-tight text-foreground"
              >
                Recent donors
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Thank you to everyone who has given so far.
              </p>
              <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
                {RECENT_DONORS.map((donor, i) => (
                  <li
                    key={`${donor.name}-${i}`}
                    className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                          {donor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {donor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {donor.time}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatPKR(donor.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Donate panel */}
          <aside aria-labelledby="donate-heading">
            <Card className="border-border bg-card shadow-md lg:sticky lg:top-6">
              <CardContent className="p-5 sm:p-6">
                <h2
                  id="donate-heading"
                  className="text-lg font-semibold tracking-tight text-card-foreground"
                >
                  Make a donation
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose how often and how much.
                </p>

                <div
                  role="group"
                  aria-label="Donation frequency"
                  className="mt-5 flex gap-1 rounded-lg border border-border bg-background p-1 text-sm"
                >
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrequency(f.id)}
                      aria-pressed={frequency === f.id}
                      className={`min-h-10 flex-1 rounded-md px-3 py-2 font-medium transition-colors ${focusRing} ${
                        frequency === f.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div
                  role="group"
                  aria-label="Donation amount"
                  className="mt-5 grid grid-cols-2 gap-2.5"
                >
                  {PRESET_AMOUNTS.map((preset) => {
                    const selected = amount === preset && !usingCustom;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setAmount(preset);
                          setCustomAmount("");
                        }}
                        aria-pressed={selected}
                        className={`min-h-12 rounded-lg border px-3 py-3 text-sm font-semibold tabular-nums transition-colors ${focusRing} ${
                          selected
                            ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                            : "border-border text-card-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {formatPKR(preset)}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    aria-label="Custom amount in rupees"
                    placeholder="Custom amount (₨)"
                    className="h-11"
                  />
                </div>

                <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">Your gift</span>
                  <span
                    aria-live="polite"
                    className="font-semibold tabular-nums text-card-foreground"
                  >
                    {formatPKR(finalAmount)}
                    <span className="ml-1 font-normal text-muted-foreground">
                      {frequency === "monthly" ? "per month" : "one-time"}
                    </span>
                  </span>
                </div>

                {/* Wire this up to the existing payment flow */}
                <Button
                  size="lg"
                  className="mt-4 min-h-12 w-full gap-2 bg-yellow-400 font-semibold text-neutral-900 shadow-[0_3px_0_0_rgb(202_138_4)] transition-[transform,box-shadow] duration-100 hover:bg-yellow-300 active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0"
                >
                  <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                  Donate {formatPKR(finalAmount)}
                  {frequency === "monthly" ? "/mo" : ""}
                </Button>

                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500"
                    aria-hidden="true"
                  />
                  Secure payment. Cancel monthly giving anytime.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
