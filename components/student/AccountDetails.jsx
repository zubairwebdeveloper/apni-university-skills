import {
  FiMail,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";

function StatusBadge({ verified }) {
  const Icon = verified ? FiCheckCircle : FiAlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        verified
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}

export function AccountDetails({ profile }) {
  const since = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const rows = [
    {
      icon: FiMail,
      label: "Email",
      value: profile.email || "—",
      truncate: true,
    },
    { icon: FiCalendar, label: "Member since", value: since },
    {
      icon: FiShield,
      label: "Email status",
      value: profile.emailVerified ? "Verified" : "Not verified",
      badge: true,
      hint: profile.emailVerified
        ? null
        : "Verify your email to keep your account recoverable.",
    },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b px-5 py-4">
        <h3 className="text-base font-semibold leading-tight tracking-tight">
          Account details
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The email and membership information tied to your account.
        </p>
      </div>

      <dl className="divide-y">
        {rows.map(({ icon: Icon, label, value, truncate, badge, hint }) => (
          <div
            key={label}
            className="flex items-start gap-3.5 px-5 py-4 transition-colors motion-reduce:transition-none sm:items-center"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <dt className="text-xs font-medium text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium leading-snug">
                {badge ? (
                  <StatusBadge verified={Boolean(profile.emailVerified)} />
                ) : (
                  <span
                    className={truncate ? "block truncate" : undefined}
                    title={truncate ? value : undefined}
                  >
                    {value}
                  </span>
                )}
              </dd>
              {hint && (
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {hint}
                </p>
              )}
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}
