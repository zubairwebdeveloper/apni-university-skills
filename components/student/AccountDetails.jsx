import { FiMail, FiCalendar, FiShield } from "react-icons/fi";
import { Card } from "@/components/ui/card";

export function AccountDetails({ profile }) {
  const since = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const rows = [
    { icon: FiMail, label: "Email", value: profile.email },
    { icon: FiCalendar, label: "Member since", value: since },
    {
      icon: FiShield,
      label: "Email status",
      value: profile.emailVerified ? "Verified" : "Not verified",
    },
  ];

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold">Account details</h3>
      <dl className="space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 text-primary" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="truncate text-sm font-medium">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}
