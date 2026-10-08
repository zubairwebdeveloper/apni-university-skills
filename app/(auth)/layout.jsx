// app/(auth)/layout.jsx

import { Logo } from "@/components/layout/Logo";
import {
  AuthContentShell,
  AuthSidePanel,
} from "@/components/auth/AuthSidePanel";
import { settingsService } from "@/services/settingsService";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthLayout({ children }) {
  const s = await settingsService.getPublic();

  const siteName = s?.siteName || "Apni University";
  const tagline = s?.tagline || "Learn Skills. Build Your Future.";

  const logo = <Logo src={s?.logo || undefined} name={siteName} />;

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1600px] lg:grid-cols-[1fr_1.1fr]">
        {/* Left Side */}
        <AuthSidePanel
          siteName={siteName}
          tagline={tagline}
          year={new Date().getFullYear()}
          logo={logo}
        />

        {/* Right Side */}
        <section
          id="main"
          className="flex min-w-0 flex-col px-4 py-4 sm:px-6 md:px-8 lg:px-10"
        >
          <AuthContentShell logo={logo}>{children}</AuthContentShell>
        </section>
      </div>
    </div>
  );
}
