// app/layout.jsx

import { cache } from "react";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { SiteBackground } from "@/components/layout/SiteBackground";
import { AIChatWidget } from "@/components/ai-assistant";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { settingsService } from "@/services/settingsService";

import "./globals.css";
import { SnakeScrollAuto } from "@/components/layout/SnakeScrollbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { Analytics } from "@vercel/analytics/next";
// Fonts are loaded via a <link> tag below (browser-fetched at runtime,
// cached by the CDN) instead of next/font/google, so the build never needs
// to reach fonts.googleapis.com itself. Font families are mapped to
// --font-dm-sans / --font-source-serif in globals.css.
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..1000&family=Source+Serif+4:opsz,wght@8..60,200..900&display=swap";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://apni-university-skills-lurc.vercel.app"
).replace(/\/+$/, "");

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
    keywords: settings?.seoKeywords || [
      "technology courses",
      "AI",
      "practical skills",
      "online learning",
    ],
    alternates: { canonical: "/" },
    formatDetection: { telephone: false, email: false, address: false },
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
     "@graph": [
       {
         "@type": "EducationalOrganization",
         "@id": `${siteUrl}/#organization`,
         name: siteName,
         url: siteUrl,
         description,
         logo: absoluteUrl(settings?.logo),
         email: settings?.contactEmail || undefined,
         telephone: settings?.phone || undefined,
         sameAs: Object.values(settings?.social ?? {}).filter(
           (v) => typeof v === "string" && v.trim(),
         ),
       },
       {
         "@type": "WebSite",
         "@id": `${siteUrl}/#website`,
         url: siteUrl,
         name: siteName,
         publisher: { "@id": `${siteUrl}/#organization` },
         inLanguage: "en",
       },
     ],
   };

  return (
    <html
      lang="en"
      className="scroll-smooth motion-reduce:scroll-auto"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body className="relative flex min-h-dvh flex-col overflow-x-clip bg-background font-sans text-[15px] leading-relaxed text-foreground antialiased selection:bg-primary/20 selection:text-foreground sm:text-base lg:text-[17px] dark:selection:bg-primary/30">
        <Providers>
          <AuthProvider>
            <ScrollProgress />
            <SiteBackground />
            <Navbar />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 outline-none motion-safe:animate-fade-in"
            >
              {children}
            </main>
            <Footer />

            {/* Dono ek stack mein: chat upar, scroll-to-top neeche */}
            <AIChatWidget className="ai-chat-slot fixed  right-4 z-[9998]" />
            <ScrollToTop bottom={24} />

            <CommandPalette />
            <OfflineBanner />
            <Toaster richColors closeButton position="top-right" />
          </AuthProvider>
        </Providers>
        <SnakeScrollAuto />
        <Analytics />
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
