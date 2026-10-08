import { FiMail, FiLock, FiMonitor } from "react-icons/fi";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChangePasswordForm,
  ResendVerification,
  SignOutEverywhere,
} from "@/components/student/SettingsPanels";
import { SecurityOverview } from "@/components/student/SecurityOverview";
import { NotificationPreferences } from "@/components/student/NotificationPreferences";
import { AppearanceCard } from "@/components/student/AppearanceCard";
import { DangerZone } from "@/components/student/DangerZone";
import { SettingsNav } from "@/components/student/SettingsNav";
import { SectionTitle } from "@/components/student/SectionTitle";
import { Reveal } from "@/components/student/Reveal";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Settings"
        description="Account security, notifications, appearance and sessions."
      />

      <Reveal>
        <SecurityOverview user={user} />
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <SettingsNav />

        <div className="max-w-2xl space-y-6">
          <Reveal>
            <Card id="email" className="scroll-mt-24 gap-3 p-6">
              <SectionTitle icon={FiMail} title="Email" />
              <p className="flex flex-wrap items-center gap-2 text-sm">
                {user.email}{" "}
                <Badge>
                  {user.emailVerified ? "Verified" : "Not verified"}
                </Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                We use this address for sign-in, receipts and course updates.
              </p>
              {!user.emailVerified && <ResendVerification />}
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card id="password" className="scroll-mt-24 gap-4 p-6">
              <SectionTitle icon={FiLock} title="Change password" />
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Kam az kam 8 characters</li>
                <li>• Letters, numbers aur symbols mix karein</li>
                <li>• Dusri sites wala password dobara use na karein</li>
              </ul>
              <ChangePasswordForm />
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <NotificationPreferences />
          </Reveal>

          <Reveal delay={0.05}>
            <AppearanceCard />
          </Reveal>

          <Reveal delay={0.05}>
            <Card id="sessions" className="scroll-mt-24 gap-3 p-6">
              <SectionTitle icon={FiMonitor} title="Sessions" />
              <p className="text-sm text-muted-foreground">
                Signs you out everywhere, including this device. Use it if you
                think someone else has access to your account.
              </p>
              <div>
                <SignOutEverywhere />
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <DangerZone />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
