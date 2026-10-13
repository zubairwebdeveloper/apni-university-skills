import { FiCheckCircle, FiLock, FiMail, FiMonitor } from "react-icons/fi";
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
import {
  MotionRoot,
  SettingsBackdrop,
  TiltCard,
  VerifyBanner,
} from "@/components/student/SettingsMotion";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Settings" };

const PASSWORD_TIPS = [
  "Kam az kam 8 characters",
  "Letters, numbers aur symbols mix karein",
  "Dusri sites wala password dobara use na karein",
];

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <MotionRoot>
      <div className="relative isolate">
        <SettingsBackdrop />

        <div className="space-y-8">
          <StudentPageHeader
            title="Settings"
            description="Account security, notifications, appearance and sessions."
          />

          {!user.emailVerified && <VerifyBanner email={user.email} />}

          <Reveal>
            <SecurityOverview user={user} />
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SettingsNav />
            </div>

            <div className="min-w-0 max-w-2xl space-y-6">
              <Reveal>
                <TiltCard>
                  <Card id="email" className="scroll-mt-24 gap-3 p-6">
                    <SectionTitle icon={FiMail} title="Email" />
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="break-all">{user.email}</span>
                      <Badge
                        className={
                          user.emailVerified
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
                        }
                      >
                        {user.emailVerified ? "Verified" : "Not verified"}
                      </Badge>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      We use this address for sign-in, receipts and course
                      updates.
                    </p>
                    {!user.emailVerified && <ResendVerification />}
                  </Card>
                </TiltCard>
              </Reveal>

              <Reveal delay={0.05}>
                {/* no tilt here: this card holds a form */}
                <Card id="password" className="scroll-mt-24 gap-4 p-6">
                  <SectionTitle icon={FiLock} title="Change password" />
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {PASSWORD_TIPS.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <FiCheckCircle
                          aria-hidden="true"
                          className="mt-0.5 size-3.5 shrink-0 text-emerald-700 dark:text-emerald-300"
                        />
                        {tip}
                      </li>
                    ))}
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
                <TiltCard>
                  <Card id="sessions" className="scroll-mt-24 gap-3 p-6">
                    <SectionTitle icon={FiMonitor} title="Sessions" />
                    <p className="text-sm text-muted-foreground">
                      Signs you out everywhere, including this device. Use it if
                      you think someone else has access to your account.
                    </p>
                    <div>
                      <SignOutEverywhere />
                    </div>
                  </Card>
                </TiltCard>
              </Reveal>

              <Reveal delay={0.05}>
                <DangerZone />
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </MotionRoot>
  );
}
