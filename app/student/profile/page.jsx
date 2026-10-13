import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AvatarUploader } from "@/components/student/AvatarUploader";
import { ProfileForm } from "@/components/student/ProfileForm";
import { ProfileHero } from "@/components/student/ProfileHero";
import { ProfileCompletion } from "@/components/student/ProfileCompletion";
import { ProfileTips } from "@/components/student/ProfileTips";
import { AccountDetails } from "@/components/student/AccountDetails";
import { PrivacyCard } from "@/components/student/PrivacyCard";
import { Reveal } from "@/components/student/Reveal";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import {
  MotionRoot,
  ProfileBackdrop,
  ProfileQuickNav,
  TiltCard,
} from "@/components/student/ProfileMotion";
import { requireUser } from "@/lib/auth/session";
import { userService } from "@/services/userService";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await userService.getProfile(user.uid);
  if (!profile) notFound();

  return (
    <MotionRoot>
      <div className="relative isolate overflow-hidden">
        <ProfileBackdrop />

        <div className="space-y-8">
          <StudentPageHeader
            title="Profile"
            description="Your public name appears on reviews you write. Keep your details fresh so instructors and peers know who you are."
          />

          <ProfileQuickNav />

          <Reveal>
            <ProfileHero profile={profile} />
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-6">
              <Reveal delay={0.05}>
                <div id="profile-photo" className="scroll-mt-24">
                  <TiltCard>
                    <Card className="p-6 transition-shadow hover:shadow-md">
                      <h2 className="mb-4 text-base font-semibold">
                        Profile photo
                      </h2>
                      <AvatarUploader
                        uid={user.uid}
                        photoURL={profile.photoURL}
                        initial={(profile.displayName || "U")
                          .charAt(0)
                          .toUpperCase()}
                      />
                    </Card>
                  </TiltCard>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div id="profile-info" className="scroll-mt-24">
                  {/* no tilt here: this card holds a form */}
                  <Card className="p-6">
                    <h2 className="mb-1 text-base font-semibold">
                      Personal information
                    </h2>
                    <p className="mb-5 text-sm text-muted-foreground">
                      Email:{" "}
                      <span className="break-all font-medium text-foreground">
                        {profile.email}
                      </span>
                    </p>
                    <ProfileForm profile={profile} />
                  </Card>
                </div>
              </Reveal>
            </div>

            <aside className="min-w-0 space-y-6">
              <Reveal delay={0.1}>
                <div id="profile-completion" className="scroll-mt-24">
                  <TiltCard>
                    <ProfileCompletion profile={profile} />
                  </TiltCard>
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div id="profile-account" className="scroll-mt-24">
                  <AccountDetails profile={profile} />
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <ProfileTips />
              </Reveal>
              <Reveal delay={0.25}>
                <div id="profile-privacy" className="scroll-mt-24">
                  <PrivacyCard />
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </div>
    </MotionRoot>
  );
}
