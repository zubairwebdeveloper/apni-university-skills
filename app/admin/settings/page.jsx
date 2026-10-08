// app/admin/settings/page.jsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
export const metadata = { title: "Settings" };
const CARDS = [
  [
    "General",
    "/admin/settings/general",
    "Site name, logo, contact details, social links and SEO defaults.",
  ],
  [
    "Security",
    "/admin/settings/security",
    "Session lengths, and what each role can do.",
  ],
  [
    "Notifications",
    "/admin/settings/notifications",
    "Which emails are sent, and where admin alerts go.",
  ],
];
export default async function SettingsIndex() {
  await requirePermission(P.SETTINGS_READ);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {CARDS.map(([t, h, d]) => (
        <Link
          key={h}
          href={h}
          className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full gap-2 p-5 transition-shadow group-hover:shadow-md">
            <h2 className="text-lg">{t}</h2>
            <p className="text-sm text-muted-foreground">{d}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}

