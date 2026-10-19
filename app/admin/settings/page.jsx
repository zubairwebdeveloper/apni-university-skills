import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Globe,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { settingsService } from "@/services/settingsService";

export const metadata = {
  title: "Settings",
};

const blank = (value) => typeof value !== "string" || value.trim() === "";

function toDate(value) {
  if (!value) return null;

  const raw =
    typeof value === "object" && "seconds" in value
      ? value.seconds * 1000
      : value;

  const date = new Date(raw);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);

  return date
    ? date.toLocaleDateString("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
}

const days = (value) =>
  Number(value) === 1 ? "1 day" : `${Number(value)} days`;

const SECTIONS = [
  {
    key: "general",
    title: "General",
    eyebrow: "Website identity",
    href: "/admin/settings/general",
    icon: Globe,
    accent: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/10",
    description:
      "Manage your site identity, branding, contact details, social links and SEO defaults.",
    features: ["Branding", "Contact details", "SEO defaults"],

    summarize(record) {
      const social = Object.values(record.social ?? {}).filter(
        (value) => !blank(value),
      );

      const facts = [
        blank(record.siteName) ? null : record.siteName,
        `${social.length} social ${social.length === 1 ? "link" : "links"}`,
      ].filter(Boolean);

      const issues = [];

      if (blank(record.siteName)) issues.push("Add a site name");
      if (blank(record.logo)) issues.push("No logo yet");
      if (blank(record.contactEmail)) issues.push("No contact email");

      if (blank(record.seoTitle) || blank(record.seoDescription)) {
        issues.push("SEO defaults incomplete");
      }

      return { facts, issues };
    },
  },
  {
    key: "security",
    title: "Security",
    eyebrow: "Access & protection",
    href: "/admin/settings/security",
    icon: ShieldCheck,
    accent: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
    description:
      "Configure session durations and review the access rules that help protect your platform.",
    features: ["Session policies", "Role permissions"],

    summarize(record) {
      const facts = [];

      if (record.sessionDays) {
        facts.push(`Students: ${days(record.sessionDays)}`);
      }

      if (record.staffSessionDays) {
        facts.push(`Staff: ${days(record.staffSessionDays)}`);
      }

      const issues = [];

      if (Number(record.staffSessionDays) > Number(record.sessionDays)) {
        issues.push("Staff sessions are longer than student sessions");
      }

      return { facts, issues };
    },
  },
  {
    key: "notifications",
    title: "Notifications",
    eyebrow: "Communication preferences",
    href: "/admin/settings/notifications",
    icon: Bell,
    accent: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10",
    description:
      "Control automated email notifications and decide where administrative alerts are delivered.",
    features: ["Email notifications", "Admin alerts"],

    summarize(record) {
      const types = [
        "welcome",
        "enrollment",
        "payment",
        "completion",
        "certificate",
      ];

      const enabled = types.filter((type) => record[type]).length;

      const facts = [
        record.emailsEnabled
          ? `${enabled} of ${types.length} emails on`
          : "Emails off",
      ];

      const issues = [];

      if (!record.emailsEnabled) {
        issues.push("No emails are being sent");
      }

      if (record.notifyOnContact && blank(record.adminAlertEmail)) {
        issues.push("Contact alerts have no address");
      }

      return { facts, issues };
    },
  },
];

async function loadSections() {
  const results = await Promise.allSettled(
    SECTIONS.map((section) => settingsService.forEdit(section.key)),
  );

  return SECTIONS.map((section, index) => {
    const result = results[index];

    if (result.status !== "fulfilled" || !result.value) {
      return {
        ...section,
        facts: [],
        issues: [],
        updated: null,
        loaded: false,
      };
    }

    const record = result.value;
    const { facts, issues } = section.summarize(record);

    return {
      ...section,
      facts,
      issues,
      updated: formatDate(record.updatedAt),
      loaded: true,
    };
  });
}

function OverviewMetric({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-background/70 p-3.5 sm:p-4">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <Icon className="size-[19px]" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">
          {label}
        </p>
      </div>
    </div>
  );
}

function SectionCard({ section }) {
  const {
    title,
    eyebrow,
    href,
    icon: Icon,
    accent,
    iconBg,
    description,
    features,
    facts,
    issues,
    updated,
    loaded,
  } = section;

  const needsAttention = issues.length > 0;
  const hasWarnings = needsAttention || !loaded;

  return (
    <Link
      href={href}
      className="group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      aria-label={`Manage ${title} settings`}
    >
      <Card className="relative flex h-full flex-col gap-0 overflow-hidden rounded-2xl border-border/70 bg-card p-0 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
        <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-yellow-400 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex size-12 items-center justify-center rounded-2xl ${iconBg} transition-transform duration-300 group-hover:scale-105`}
            >
              <Icon className={`size-6 ${accent}`} aria-hidden="true" />
            </div>

            <div
              className={`flex size-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-primary-foreground`}
            >
              <ArrowRight
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>

            <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
              {title}
            </h2>

            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {features.map((feature) => (
              <span
                key={feature}
                className="rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {feature}
              </span>
            ))}
          </div>

          {facts.length > 0 && (
            <div className="mt-5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Current configuration
              </p>

              <ul
                className="flex flex-wrap gap-2"
                aria-label={`${title} summary`}
              >
                {facts.map((fact) => (
                  <li
                    key={fact}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-medium text-foreground ring-1 ring-border/70"
                  >
                    <CheckCircle2
                      className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                    <span className="break-words">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 flex-1">
            {hasWarnings ? (
              <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                <div className="flex items-center gap-2">
                  {loaded ? (
                    <CircleAlert
                      className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <TriangleAlert
                      className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
                      aria-hidden="true"
                    />
                  )}

                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {loaded
                      ? `${issues.length} item${issues.length === 1 ? "" : "s"} to review`
                      : "Configuration unavailable"}
                  </span>
                </div>

                {loaded ? (
                  <ul
                    className="space-y-2"
                    aria-label={`${title}: needs attention`}
                  >
                    {issues.map((issue) => (
                      <li
                        key={issue}
                        className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
                      >
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500"
                          aria-hidden="true"
                        />
                        {issue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs leading-5 text-muted-foreground">
                    We couldn&apos;t load this section&apos;s saved
                    configuration. Open it to review the settings.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-3">
                <CheckCircle2
                  className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  No configuration issues detected
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
            <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {updated ? `Last saved ${updated}` : "Save date unavailable"}
              </span>
            </div>

            <span className="shrink-0 text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
              Manage
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function SettingsIndex() {
  await requirePermission(P.SETTINGS_READ);

  const sections = await loadSections();

  const attention = sections.reduce(
    (total, section) => total + section.issues.length,
    0,
  );

  const unavailable = sections.filter((section) => !section.loaded).length;

  const healthy = sections.filter(
    (section) => section.loaded && section.issues.length === 0,
  ).length;

  const needsReview = attention > 0 || unavailable > 0;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-8">
      {/* Page heading */}
      <header className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="absolute right-0 top-0 size-48 translate-x-1/3 -translate-y-1/3 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-36 translate-y-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/15 text-amber-600 ring-1 ring-yellow-500/20 dark:text-yellow-400 sm:size-14">
              <Settings2 className="size-6 sm:size-7" aria-hidden="true" />
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
                  Platform management
                </span>
                <span className="rounded-full border border-border/70 bg-background/70 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  ADMIN
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                Settings
                <span className="text-purple-600 dark:text-purple-400">.</span>
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Manage your university&apos;s identity, security policies and
                notification preferences from one central workspace.
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium ${
              needsReview
                ? "border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-400"
                : "border-emerald-500/25 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {needsReview ? (
              <CircleAlert className="size-4" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            )}

            {needsReview ? "Review recommended" : "Looking good"}
          </div>
        </div>
      </header>

      {/* Live overview */}
      <section
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        aria-label="Settings overview"
      >
        <OverviewMetric
          icon={Settings2}
          label="Settings sections"
          value={sections.length}
          accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />

        <OverviewMetric
          icon={CheckCircle2}
          label="Without detected issues"
          value={healthy}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />

        <OverviewMetric
          icon={CircleAlert}
          label="Items to review"
          value={attention + unavailable}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </section>

      {/* Section introduction */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Configuration center
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a category to review or update its settings.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-4 text-purple-500" aria-hidden="true" />
            Your platform, your rules
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <SectionCard key={section.key} section={section} />
          ))}
        </div>
      </section>

      {/* Security reminder */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Keep your platform configuration up to date
            </p>
            <p className="max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
              Review access policies, verify contact details and confirm that
              important notifications have the correct destination.
            </p>
          </div>
        </div>

        <Link
          href="/admin/settings/security"
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-purple-500/40 hover:bg-purple-500/5 hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-purple-400"
        >
          Review security
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
