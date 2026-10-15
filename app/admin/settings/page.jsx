// app/admin/settings/page.jsx
import Link from "next/link";
import { ArrowRight, Bell, Globe, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { settingsService } from "@/services/settingsService";

export const metadata = { title: "Settings" };

const blank = (v) => typeof v !== "string" || v.trim() === "";

// updatedAt can be a Date, a number, an ISO string or a { seconds } object.
function toDate(value) {
  if (!value) return null;
  const raw =
    typeof value === "object" && "seconds" in value
      ? value.seconds * 1000
      : value;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = toDate(value);
  return d
    ? d.toLocaleDateString("en", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
}

const days = (n) => (Number(n) === 1 ? "1 day" : `${Number(n)} days`);

// Each section describes itself from its saved record. If a record can't be
// loaded the card still renders with its static description.
const SECTIONS = [
  {
    key: "general",
    title: "General",
    href: "/admin/settings/general",
    icon: Globe,
    description:
      "Site name, logo, contact details, social links and SEO defaults.",
    summarize(r) {
      const social = Object.values(r.social ?? {}).filter((v) => !blank(v));
      const facts = [
        blank(r.siteName) ? null : r.siteName,
        `${social.length} social ${social.length === 1 ? "link" : "links"}`,
      ].filter(Boolean);
      const issues = [];
      if (blank(r.siteName)) issues.push("Add a site name");
      if (blank(r.logo)) issues.push("No logo yet");
      if (blank(r.contactEmail)) issues.push("No contact email");
      if (blank(r.seoTitle) || blank(r.seoDescription))
        issues.push("SEO defaults incomplete");
      return { facts, issues };
    },
  },
  {
    key: "security",
    title: "Security",
    href: "/admin/settings/security",
    icon: ShieldCheck,
    description: "Session lengths, and what each role can do.",
    summarize(r) {
      const facts = [];
      if (r.sessionDays) facts.push(`Students: ${days(r.sessionDays)}`);
      if (r.staffSessionDays) facts.push(`Staff: ${days(r.staffSessionDays)}`);
      const issues = [];
      if (Number(r.staffSessionDays) > Number(r.sessionDays))
        issues.push("Staff sessions are longer than student sessions");
      return { facts, issues };
    },
  },
  {
    key: "notifications",
    title: "Notifications",
    href: "/admin/settings/notifications",
    icon: Bell,
    description: "Which emails are sent, and where admin alerts go.",
    summarize(r) {
      const types = [
        "welcome",
        "enrollment",
        "payment",
        "completion",
        "certificate",
      ];
      const on = types.filter((k) => r[k]).length;
      const facts = [
        r.emailsEnabled ? `${on} of ${types.length} emails on` : "Emails off",
      ];
      const issues = [];
      if (!r.emailsEnabled) issues.push("No emails are being sent");
      if (r.notifyOnContact && blank(r.adminAlertEmail))
        issues.push("Contact alerts have no address");
      return { facts, issues };
    },
  },
];

async function loadSections() {
  const results = await Promise.allSettled(
    SECTIONS.map((s) => settingsService.forEdit(s.key)),
  );
  return SECTIONS.map((s, i) => {
    const res = results[i];
    if (res.status !== "fulfilled" || !res.value) {
      return { ...s, facts: [], issues: [], updated: null };
    }
    const record = res.value;
    const { facts, issues } = s.summarize(record);
    return { ...s, facts, issues, updated: formatDate(record.updatedAt) };
  });
}

export default async function SettingsIndex() {
  await requirePermission(P.SETTINGS_READ);
  const sections = await loadSections();
  const attention = sections.reduce((n, s) => n + s.issues.length, 0);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          {attention > 0
            ? `${attention} ${attention === 1 ? "thing needs" : "things need"} a look.`
            : "Everything is set up."}{" "}
          Pick a section to make changes.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map(
          ({
            key,
            title,
            href,
            icon: Icon,
            description,
            facts,
            issues,
            updated,
          }) => (
            <Link
              key={key}
              href={href}
              className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full gap-4 p-5 transition-shadow group-hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <ArrowRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden="true"
                  />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg">{title}</h2>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>

                {facts.length > 0 && (
                  <ul
                    className="flex flex-wrap gap-1.5"
                    aria-label={`${title} summary`}
                  >
                    {facts.map((f) => (
                      <li
                        key={f}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto space-y-2">
                  {issues.length > 0 && (
                    <ul
                      className="space-y-1"
                      aria-label={`${title}: needs attention`}
                    >
                      {issues.map((i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400"
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-amber-500"
                            aria-hidden="true"
                          />
                          {i}
                        </li>
                      ))}
                    </ul>
                  )}
                  {updated && (
                    <p className="text-xs text-muted-foreground">
                      Last saved {updated}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
