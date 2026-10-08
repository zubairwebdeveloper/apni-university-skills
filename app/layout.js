// app/layout.jsx

import { cache } from "react";
import { DM_Sans, Source_Serif_4 } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SiteBackground } from "@/components/layout/SiteBackground";

import { settingsService } from "@/services/settingsService";

import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// One settings request per render, shared by metadata and the layout.
const getSettings = cache(() => settingsService.getPublic());

// Turns a relative path into an absolute URL (needed for structured data).
function absoluteUrl(value) {
  if (!value || typeof value !== "string") return undefined;
  try {
    return new URL(value, siteUrl).toString();
  } catch {
    return undefined;
  }
}

export const viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export async function generateMetadata() {
  const settings = await getSettings();

  const siteName = settings?.siteName || "Apni University";

  const tagline = settings?.tagline || "Learn Skills. Build Your Future.";

  const description =
    settings?.seoDescription ||
    settings?.description ||
    "Master practical technology skills, build real projects, explore AI, and prepare for the future of work.";

  const title = settings?.seoTitle || `${siteName}: ${tagline}`;

  return {
    metadataBase: new URL(siteUrl),

    title: {
      default: title,
      template: `%s | ${siteName}`,
    },

    description,
    applicationName: siteName,

    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      locale: "en_US",
      images: settings?.ogImage ? [{ url: settings.ogImage }] : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings?.ogImage ? [settings.ogImage] : undefined,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  const siteName = settings?.siteName || "Apni University";
  const description =
    settings?.seoDescription ||
    settings?.description ||
    "Practical technology education.";

  // Structured data so search engines understand the site
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: siteName,
    url: siteUrl,
    description,
    logo: absoluteUrl(settings?.logo),
    email: settings?.contactEmail || undefined,
    telephone: settings?.phone || undefined,
    sameAs: Object.values(settings?.social ?? {}).filter(
      (v) => typeof v === "string" && v.trim(),
    ),
  };

  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
      <body className="relative flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
        <Providers>
          <AuthProvider>
            {/* Animated background behind the whole site */}
            <SiteBackground />

            <Navbar />

            {/* Target of the "Skip to content" link in the Navbar */}
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 outline-none"
            >
              {children}
            </main>

            <Footer />

            {/* Ctrl/⌘ + K quick search */}
            <CommandPalette />

            <Toaster richColors closeButton position="top-right" />
          </AuthProvider>
        </Providers>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
