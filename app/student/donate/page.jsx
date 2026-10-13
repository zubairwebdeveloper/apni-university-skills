"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
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
  { label: "Students sponsored", value: "312", icon: GraduationCap },
  { label: "Devices provided", value: "94", icon: Laptop },
  { label: "Active mentors", value: "48", icon: Users },
];

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const RECENT_DONORS = [
  { name: "Ahmed R.", initials: "AR", amount: 2500, time: "3m ago" },
  { name: "Sara K.", initials: "SK", amount: 1000, time: "22m ago" },
  { name: "Anonymous", initials: "A", amount: 5000, time: "1h ago" },
  { name: "Bilal M.", initials: "BM", amount: 500, time: "2h ago" },
];

function formatPKR(n) {
  return `₨${n.toLocaleString("en-PK")}`;
}

export default function DonatePage() {
  const [frequency, setFrequency] = useState("once");
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");

  const percent = Math.min(
    100,
    Math.round((CAMPAIGN.raised / CAMPAIGN.goal) * 100),
  );

  const finalAmount = useMemo(() => {
    const custom = parseInt(customAmount, 10);
    return Number.isFinite(custom) && custom > 0 ? custom : amount;
  }, [amount, customAmount]);

  return (
    <div className="min-h-screen bg-background">
      {/* 3D banner */}
      <div className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <DonateScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
              <HeartHandshake className="h-3.5 w-3.5" />
              {CAMPAIGN.daysLeft} days left
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {CAMPAIGN.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Every contribution goes directly toward tuition, devices, and
              mentorship for students who can&apos;t afford them.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Main column */}
          <div>
            {/* Progress card */}
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatPKR(CAMPAIGN.raised)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      raised of {formatPKR(CAMPAIGN.goal)} goal
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {CAMPAIGN.donors} donors
                  </p>
                </div>
                <Progress value={percent} className="mt-4 h-2.5" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {percent}% funded
                </p>
              </CardContent>
            </Card>

            {/* Impact stats */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {IMPACT_STATS.map((stat) => (
                <Card key={stat.label} className="border-border bg-card">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-card-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Why it matters */}
            <Card className="mt-6 border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Where your donation goes
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Scholarship funds cover course access, laptops for students
                  without one, and stipends for mentors who review projects and
                  answer questions outside class hours. Apni University
                  publishes a transparency report each semester.
                </p>
              </CardContent>
            </Card>

            {/* Recent donors */}
            <h2 className="mt-10 text-lg font-semibold text-foreground">
              Recent Donors
            </h2>
            <div className="mt-4 space-y-3">
              {RECENT_DONORS.map((donor, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                          {donor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          {donor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {donor.time}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatPKR(donor.amount)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Donate panel */}
          <aside>
            <Card className="sticky top-6 border-border bg-card">
              <CardContent className="p-6">
                <div className="flex gap-1 rounded-md border border-border bg-background p-1 text-sm">
                  {["once", "monthly"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`flex-1 rounded px-3 py-1.5 capitalize transition-colors ${
                        frequency === f
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f === "once" ? "One-time" : "Monthly"}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount("");
                      }}
                      className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                        amount === preset && !customAmount
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-card-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {formatPKR(preset)}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <Input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Custom amount (₨)"
                  />
                </div>

                {/* Wire this up to the existing payment flow */}
                <Button className="mt-5 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <HeartHandshake className="h-4 w-4" />
                  Donate {formatPKR(finalAmount)}
                  {frequency === "monthly" ? "/mo" : ""}
                </Button>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Secure payment. Cancel monthly giving anytime.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
