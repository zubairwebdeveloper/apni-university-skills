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
import { requireUser } from "@/lib/auth/session";
import { userService } from "@/services/userService";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await userService.getProfile(user.uid);
  if (!profile) notFound();

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Profile"
        description="Your public name appears on reviews you write. Keep your details fresh so instructors and peers know who you are."
      />

      <Reveal>
        <ProfileHero profile={profile} />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Reveal delay={0.05}>
            <Card className="p-6">
              <h2 className="mb-4 text-base font-semibold">Profile photo</h2>
              <AvatarUploader
                uid={user.uid}
                photoURL={profile.photoURL}
                initial={(profile.displayName || "U").charAt(0).toUpperCase()}
              />
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="p-6">
              <h2 className="mb-1 text-base font-semibold">
                Personal information
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Email:{" "}
                <span className="font-medium text-foreground">
                  {profile.email}
                </span>
              </p>
              <ProfileForm profile={profile} />
            </Card>
          </Reveal>
        </div>

        <aside className="space-y-6">
          <Reveal delay={0.1}>
            <ProfileCompletion profile={profile} />
          </Reveal>
          <Reveal delay={0.15}>
            <AccountDetails profile={profile} />
          </Reveal>
          <Reveal delay={0.2}>
            <ProfileTips />
          </Reveal>
          <Reveal delay={0.25}>
            <PrivacyCard />
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
