import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

import { Container } from "@/components/ui/container";
import { footerNav } from "@/config/site";
import { AnimatedLogo } from "@/components/layout/AnimatedLogo";
import { FooterCtaButtons, FooterCtaText } from "./FooterClient";

const DEFAULT_SITE_NAME = "Apni University";

const DEFAULT_DESCRIPTION =
  "Master practical technology skills, build real-world projects, and prepare for the future of work.";

const POPULAR_TECH = [
  { label: "Web Development", href: "/courses?category=web-development" },
  {
    label: "Artificial Intelligence",
    href: "/courses?category=artificial-intelligence",
  },
  { label: "React & Next.js", href: "/courses?search=React" },
  { label: "Full Stack Development", href: "/courses?search=Full%20Stack" },
];

const SOCIALS = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "twitter", label: "X", Icon: FaXTwitter },
];

function cleanText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim() || fallback;
}

function safeHttpsUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function FooterLink({ href, children }) {
  if (!href || typeof href !== "string") return null;

  const isExternal = /^https:\/\//i.test(href);

  const classes =
    "group inline-flex items-center gap-1.5 text-sm text-stone-600 transition-colors duration-200 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2";

  if (isExternal) {
    const safeHref = safeHttpsUrl(href);
    if (!safeHref) return null;

    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
        <ArrowUpRight
          size={13}
          aria-hidden="true"
          className="opacity-0 transition-opacity group-hover:opacity-100"
        />
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      <ArrowRight
        size={13}
        aria-hidden="true"
        className="opacity-0 transition-opacity group-hover:opacity-100"
      />
    </Link>
  );
}

function ContactRow({ icon: Icon, children, href }) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white text-amber-800">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="min-w-0 break-words text-sm leading-6 text-stone-600">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-xl transition-colors hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}

function SocialLink({ label, href, Icon }) {
  const safeHref = safeHttpsUrl(href);
  if (!safeHref) return null;

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex size-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition duration-200 hover:-translate-y-0.5 hover:border-amber-700 hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
    >
      <Icon size={16} aria-hidden="true" />
    </a>
  );
}

function normalizeNavGroups(navigation) {
  if (Array.isArray(navigation)) {
    return [
      {
        title: "Explore",
        links: navigation.filter(
          (item) => item && typeof item.label === "string" && item.href,
        ),
      },
    ];
  }

  if (!navigation || typeof navigation !== "object") return [];

  return Object.entries(navigation)
    .map(([key, value]) => {
      const links = Array.isArray(value)
        ? value
        : Array.isArray(value?.links)
          ? value.links
          : [];

      return {
        title: value?.title || key,
        links: links.filter(
          (item) => item && typeof item.label === "string" && item.href,
        ),
      };
    })
    .filter((group) => group.links.length > 0);
}

export async function FooterView({
  settings = {},
  siteName,
  tagline,
  description,
  contactEmail,
  phone,
  address,
  social,
  isLoggedIn,
  showCta = true,
  showExplore = true,
  ctaHref = "/register",
  ctaSecondaryHref = "/courses",
  dashboardHref = "/student",
  myCoursesHref = "/student/courses",
  navigation,
  className = "",
}) {
  const resolvedSiteName = cleanText(
    siteName ?? settings.siteName,
    DEFAULT_SITE_NAME,
  );

  const resolvedTagline = cleanText(
    tagline ?? settings.tagline,
    "Learn Skills. Build Your Future.",
  );

  const resolvedDescription = cleanText(
    description ?? settings.description,
    DEFAULT_DESCRIPTION,
  );

  const email = cleanText(contactEmail ?? settings.contactEmail, "");

  const phoneNumber = cleanText(phone ?? settings.phone, "");
  const location = cleanText(address ?? settings.address, "");

  const socialLinks = social ?? settings.social ?? {};
  const navGroups = normalizeNavGroups(navigation ?? footerNav);

  const emailHref = email ? `mailto:${email}` : undefined;
  const phoneHref = phoneNumber
    ? `tel:${phoneNumber.replace(/[^\d+]/g, "")}`
    : undefined;

  return (
    <footer
      className={`relative isolate overflow-hidden border-t border-stone-200 bg-[#faf9f6] text-stone-950 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-[radial-gradient(ellipse_at_top,rgba(217,163,91,0.10),transparent_70%)]"
      />

      <Container>
        {showCta && (
          <section className="border-b border-stone-200 py-12 sm:py-16">
            <div className="grid gap-7 rounded-3xl border border-stone-200 bg-white/80 p-6 shadow-sm sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
              <FooterCtaText
                title={resolvedTagline}
                description={resolvedDescription}
              />

              <FooterCtaButtons
                isLoggedIn={isLoggedIn}
                dashboardHref={dashboardHref}
                myCoursesHref={myCoursesHref}
                primaryHref={ctaHref}
                secondaryHref={ctaSecondaryHref}
                className="lg:justify-end"
              />
            </div>
          </section>
        )}

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              aria-label={`${resolvedSiteName} home`}
              className="inline-flex max-w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
            >
              <AnimatedLogo />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-stone-600">
              {resolvedDescription}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Built around modern technology
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIALS.map(({ key, label, Icon }) => (
                <SocialLink
                  key={key}
                  label={label}
                  href={socialLinks?.[key]}
                  Icon={Icon}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-stone-950">
              Get in touch
            </h3>

            <div className="mt-5 space-y-4">
              {email && (
                <ContactRow icon={Mail} href={emailHref}>
                  {email}
                </ContactRow>
              )}

              {phoneNumber && (
                <ContactRow icon={Phone} href={phoneHref}>
                  {phoneNumber}
                </ContactRow>
              )}

              {location && <ContactRow icon={MapPin}>{location}</ContactRow>}

              {!email && !phoneNumber && !location && (
                <p className="text-sm leading-6 text-stone-500">
                  Contact details will appear here when configured in site
                  settings.
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-stone-950">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">
              <li>
                <FooterLink href="/courses">
                  <BookOpen size={15} aria-hidden="true" />
                  All courses
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/instructors">Instructors</FooterLink>
              </li>
              <li>
                <FooterLink href="/blog">Blog & insights</FooterLink>
              </li>
              <li>
                <FooterLink href="/careers">Careers</FooterLink>
              </li>
              <li>
                <FooterLink href="/contact">Contact us</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-stone-950">
              Popular skills
            </h3>

            <ul className="mt-5 space-y-3">
              {POPULAR_TECH.map((item) => (
                <li key={item.label}>
                  <FooterLink href={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>

            {showExplore && navGroups.length > 0 && (
              <div className="mt-7 border-t border-stone-200 pt-5">
                {navGroups.slice(0, 1).map((group) => (
                  <div key={group.title}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                      {group.title}
                    </p>
                    <ul className="space-y-3">
                      {group.links.slice(0, 4).map((item) => (
                        <li key={`${item.label}-${item.href}`}>
                          <FooterLink href={item.href}>{item.label}</FooterLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-stone-200 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-stone-500">
            © {new Date().getFullYear()} {resolvedSiteName}. All rights
            reserved.
          </p>

          <nav
            aria-label="Legal links"
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <FooterLink href="/privacy-policy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/refund-policy">Refund policy</FooterLink>
          </nav>
        </div>
      </Container>

      
    </footer>
  );
}
