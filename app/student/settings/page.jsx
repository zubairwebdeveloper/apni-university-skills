// app/student/settings/page.jsx
import {
  FiAlertCircle,
  FiCheckCircle,
  FiLock,
  FiMail,
  FiMonitor,
} from "react-icons/fi";
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
  "At least 8 characters",
  "Mix letters, numbers and symbols",
  "Don't reuse a password from another site",
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

          <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SettingsNav />
            </div>

            <div className="min-w-0 max-w-2xl space-y-6">
              <Reveal>
                <TiltCard>
                  <Card id="email" className="scroll-mt-24 gap-3 p-5 sm:p-6">
                    <SectionTitle icon={FiMail} title="Email" />
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      <span className="break-all">{user.email}</span>
                      <Badge
                        className={
                          user.emailVerified
                            ? "gap-1 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300"
                            : "gap-1 bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300"
                        }
                      >
                        {user.emailVerified ? (
                          <FiCheckCircle
                            aria-hidden="true"
                            className="size-3"
                          />
                        ) : (
                          <FiAlertCircle
                            aria-hidden="true"
                            className="size-3"
                          />
                        )}
                        {user.emailVerified ? "Verified" : "Not verified"}
                      </Badge>
                    </p>
                    <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                      We use this address for sign-in, receipts and course
                      updates.
                    </p>
                    {!user.emailVerified && <ResendVerification />}
                  </Card>
                </TiltCard>
              </Reveal>

              <Reveal delay={0.05}>
                {/* no tilt here: this card holds a form */}
                <Card id="password" className="scroll-mt-24 gap-4 p-5 sm:p-6">
                  <SectionTitle icon={FiLock} title="Change password" />
                  <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                    Choose a strong password that you don&apos;t use anywhere
                    else.
                  </p>
                  <ul
                    aria-label="Password requirements"
                    className="space-y-2 rounded-lg bg-muted/40 p-3.5 text-sm text-muted-foreground"
                  >
                    {PASSWORD_TIPS.map((tip) => (
                      <li key={tip} className="flex items-start gap-2.5">
                        <FiCheckCircle
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300"
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
                  <Card id="sessions" className="scroll-mt-24 gap-3 p-5 sm:p-6">
                    <SectionTitle icon={FiMonitor} title="Sessions" />
                    <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
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
