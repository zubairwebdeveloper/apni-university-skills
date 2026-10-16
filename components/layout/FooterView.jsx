// components/layout/FooterView.jsx
// Server component: responsive, accessible footer with a calm ivory / forest / clay palette.
// Client-side auth behavior remains in FooterClient; scroll-to-top remains in ScrollToTop.
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Cpu,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import { Container } from "./Container";
import { footerNav } from "@/config/site";
import { AnimatedLogo } from "./AnimatedLogo";
import { FooterCtaButtons, FooterCtaText } from "./FooterClient";
import { ScrollToTop } from "./ScrollToTop";
import { getGeneralSettings } from "./Footer";

const popularTech = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "Node.js",
  "Firebase",
  "Python",
  "TensorFlow",
  "Docker",
];

const quickExplore = [
  {
    icon: Cpu,
    title: "AI & Machine Learning",
    text: "Learn with practical projects",
    href: "/courses?q=AI",
  },
  {
    icon: Compass,
    title: "Web Development",
    text: "Build modern web experiences",
    href: "/courses?q=Web",
  },
  {
    icon: BookOpen,
    title: "Free Resources",
    text: "Start with guides and learning material",
    href: "/courses",
  },
  {
    icon: Briefcase,
    title: "Career Paths",
    text: "Explore skills for your next step",
    href: "/courses",
  },
];

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ft-a))] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7f1]";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function safeHttpsUrl(value) {
  if (typeof value !== "string") return "";
  const url = value.trim();
  return /^https:\/\/\S+$/i.test(url) ? url : "";
}

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-9 items-center gap-2 rounded-md text-sm text-[#586861] transition-colors duration-200 hover:text-[rgb(var(--ft-a))] ${focusRing}`}
    >
      <span>{children}</span>
      <ArrowUpRight
        aria-hidden="true"
        className="size-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </Link>
  );
}

function SocialLink({ icon: Icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${label}`}
      className={`inline-flex size-10 items-center justify-center rounded-full border border-[#dce3dc] bg-white/70 text-[#40564d] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgb(var(--ft-a)/0.35)] hover:bg-[rgb(var(--ft-a))] hover:text-white ${focusRing}`}
    >
      <Icon aria-hidden="true" className="size-4" />
    </a>
  );
}

function ContactRow({ icon: Icon, label, href }) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f0e9] text-[rgb(var(--ft-a))]">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 break-words">{label}</span>
    </>
  );

  const className = `group flex items-center gap-3 text-sm text-[#586861] transition-colors hover:text-[rgb(var(--ft-a))] ${focusRing}`;
  return href ? (
    <a href={href} className={className}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

function StatItem({ icon: Icon = Sparkles, value, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e1e7df] bg-white/75 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3eb] text-[rgb(var(--ft-a))]">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold leading-tight tracking-tight text-[#20332d]">
          {value}
        </span>
        <span className="mt-1 block text-xs leading-snug text-[#68766e]">
          {label}
        </span>
      </span>
    </div>
  );
}

function StatusBadge({ href, label = "All systems operational" }) {
  if (!href) return null;
  return (
    <Link
      href={href}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border border-[#dce5db] bg-white/70 px-3.5 text-xs font-medium text-[#40564d] transition-colors hover:border-[rgb(var(--ft-a)/0.35)] hover:text-[rgb(var(--ft-a))] ${focusRing}`}
    >
      <span aria-hidden="true" className="size-2 rounded-full bg-emerald-600" />
      {label}
      <ArrowRight aria-hidden="true" className="size-3.5" />
    </Link>
  );
}

function RatingBadge({ value, of, href = "/reviews" }) {
  if (!value) return null;
  return (
    <Link
      href={href}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border border-[#eadfcd] bg-white/70 px-3.5 text-xs text-[#40564d] transition-colors hover:border-[#d8b87c] ${focusRing}`}
    >
      <span
        className="flex items-center gap-0.5 text-[#c58b38]"
        aria-hidden="true"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} className="size-3 fill-current" />
        ))}
      </span>
      <span className="font-semibold">{value}</span>
      {of ? <span className="hidden sm:inline">· {of}</span> : null}
    </Link>
  );
}

function ExploreCard({ icon: Icon, title, text, href }) {
  return (
    <Link
      href={href}
      className={`group relative flex h-full flex-col rounded-2xl border border-[#e1e7df] bg-white/75 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[rgb(var(--ft-a)/0.35)] hover:bg-white hover:shadow-[0_16px_34px_-24px_rgba(32,51,45,0.45)] ${focusRing}`}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf3eb] text-[rgb(var(--ft-a))] transition-colors group-hover:bg-[rgb(var(--ft-a))] group-hover:text-white">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#20332d]">
        {title}
        <ArrowRight
          aria-hidden="true"
          className="size-3.5 text-[rgb(var(--ft-b))] transition-transform group-hover:translate-x-1"
        />
      </span>
      <span className="mt-1.5 text-xs leading-relaxed text-[#68766e]">
        {text}
      </span>
    </Link>
  );
}

function TrustStrip({ names }) {
  if (!names?.length) return null;
  return (
    <section
      className="border-y border-[#e1e7df] py-6"
      aria-label="Learner community"
    >
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8980] sm:text-left">
        Learners from
      </p>
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:justify-start">
        {names.map((name) => (
          <li
            key={name}
            className="text-sm font-semibold tracking-tight text-[#64746b]"
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FooterBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -right-40 -top-48 size-[26rem] rounded-full bg-[#e6eee4]/70 blur-3xl" />
      <div className="absolute -left-44 top-[42%] size-[22rem] rounded-full bg-[#f2e7d8]/55 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c5d4c5] to-transparent" />
    </div>
  );
}

/**
 * FooterView props:
 * - siteName/contactEmail/phone/address/social override saved General settings.
 * - newsletter accepts a newsletter form/component; it is omitted when absent.
 * - showCta/showStats/showExplore/showTrust/showBadges control optional sections.
 * - stats, trustedBy, rating, and statusHref are supplied by the app when real data exists.
 * - CTA destinations can be overridden for projects with custom routes.
 */
export async function FooterView({
  siteName,
  contactEmail,
  phone,
  address,
  social,
  newsletter,
  isLoggedIn,
  showCta = true,
  showStats = true,
  showExplore = true,
  showTrust = true,
  showBadges = true,
  stats = [],
  trustedBy = [],
  rating,
  statusHref,
  ctaHref = "/register",
  loginHref = "/login",
  ctaSecondaryHref = "/courses",
  dashboardHref = "/dashboard",
  myCoursesHref = "/dashboard/courses",
}) {
  const settings = (await getGeneralSettings().catch(() => null)) ?? {};
  const resolvedSiteName =
    cleanText(siteName ?? settings.siteName) || "Apni University";
  const email = cleanText(contactEmail ?? settings.contactEmail);
  const phoneText = cleanText(phone ?? settings.phone);
  const addressText = cleanText(
    address ?? settings.address ?? "Islamabad, Pakistan",
  );
  const resolvedSocial = social ?? settings.social ?? {};

  const contactInfo = [
    email && { icon: Mail, label: email, href: `mailto:${email}` },
    phoneText && {
      icon: Phone,
      label: phoneText,
      href: `tel:${phoneText.replace(/[^\d+]/g, "")}`,
    },
    addressText && { icon: MapPin, label: addressText },
  ].filter(Boolean);

  const socials = [
    {
      icon: FaFacebookF,
      label: "Facebook",
      href: safeHttpsUrl(resolvedSocial.facebook),
    },
    {
      icon: FaInstagram,
      label: "Instagram",
      href: safeHttpsUrl(resolvedSocial.instagram),
    },
    {
      icon: FaLinkedinIn,
      label: "LinkedIn",
      href: safeHttpsUrl(resolvedSocial.linkedin),
    },
    {
      icon: FaYoutube,
      label: "YouTube",
      href: safeHttpsUrl(resolvedSocial.youtube),
    },
    { icon: FaXTwitter, label: "X", href: safeHttpsUrl(resolvedSocial.x) },
    {
      icon: FaGithub,
      label: "GitHub",
      href: safeHttpsUrl(resolvedSocial.github),
    },
  ].filter((item) => item.href);

  return (
    <>
      <footer className="relative isolate overflow-hidden border-t border-[#e1e7df] bg-[#f6f7f1] text-[#20332d] [--ft-a:22_101_82] [--ft-b:194_103_67] [--ft-c:224_174_91] [--ft-d:119_146_127]">
        <FooterBackdrop />
        <Container>
          <div className="relative z-10">
            {(statusHref || rating?.value) && (
              <div className="flex flex-wrap items-center gap-2.5 pt-8">
                <StatusBadge href={statusHref} />
                {rating?.value ? (
                  <RatingBadge
                    value={rating.value}
                    of={rating.of}
                    href={rating.href}
                  />
                ) : null}
              </div>
            )}

            {showCta && (
              <section className="dark relative mt-8 overflow-hidden rounded-[1.75rem] bg-[#174d40] px-6 py-9 text-white shadow-[0_24px_60px_-36px_rgba(23,77,64,0.8)] sm:px-10 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-80"
                >
                  <div className="absolute -right-16 -top-24 size-72 rounded-full bg-[#b3c9a7]/20 blur-3xl" />
                  <div className="absolute -bottom-36 left-1/3 size-72 rounded-full bg-[#d8a268]/20 blur-3xl" />
                </div>
                <div className="relative z-10">
                  <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#d9e8d8]">
                    <Sparkles
                      aria-hidden="true"
                      className="size-4 text-[#e8bb78]"
                    />
                    Make your next step count
                  </p>
                  <FooterCtaText isLoggedIn={isLoggedIn} />
                </div>
                <div className="relative z-10 mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
                  <FooterCtaButtons
                    isLoggedIn={isLoggedIn}
                    registerHref={ctaHref}
                    loginHref={loginHref}
                    coursesHref={ctaSecondaryHref}
                    dashboardHref={dashboardHref}
                    myCoursesHref={myCoursesHref}
                  />
                </div>
              </section>
            )}

            {showStats && stats?.length > 0 && (
              <section className="mt-5" aria-label="Learning highlights">
                <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <StatItem key={stat.label} {...stat} />
                  ))}
                </div>
              </section>
            )}

            {newsletter ? (
              <section className="mt-5 rounded-2xl border border-[#e1e7df] bg-white/75 p-5 sm:p-7">
                {newsletter}
              </section>
            ) : null}

            {showExplore && (
              <section
                className="mt-12"
                aria-labelledby="footer-explore-heading"
              >
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(var(--ft-b))]">
                      Find your next lesson
                    </p>
                    <h2
                      id="footer-explore-heading"
                      className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#20332d]"
                    >
                      Explore what you can learn
                    </h2>
                  </div>
                  <form
                    action="/courses"
                    method="GET"
                    role="search"
                    className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-[#dfe6dd] bg-white px-3 py-2 shadow-sm focus-within:border-[rgb(var(--ft-a)/0.55)]"
                  >
                    <Search
                      aria-hidden="true"
                      className="size-4 shrink-0 text-[#718078]"
                    />
                    <label htmlFor="footer-course-search" className="sr-only">
                      Search courses
                    </label>
                    <input
                      id="footer-course-search"
                      name="q"
                      type="search"
                      placeholder="Search courses"
                      className="min-w-0 flex-1 bg-transparent text-sm text-[#20332d] outline-none placeholder:text-[#89958d]"
                    />
                    <button
                      type="submit"
                      aria-label="Search courses"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--ft-a))] text-white transition-colors hover:bg-[#104b3d] ${focusRing}`}
                    >
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </button>
                  </form>
                </div>
                <nav aria-label="Quick explore">
                  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {quickExplore.map((item) => (
                      <li key={item.title}>
                        <ExploreCard {...item} />
                      </li>
                    ))}
                  </ul>
                </nav>
              </section>
            )}

            {showTrust && trustedBy?.length > 0 ? (
              <div className="mt-10">
                <TrustStrip names={trustedBy} />
              </div>
            ) : null}

            <div className="relative z-10 grid gap-12 py-12 sm:py-14 lg:grid-cols-[minmax(260px,0.9fr)_2fr] lg:gap-16">
              <div className="max-w-md">
                <AnimatedLogo tagline="Learn skills. Build your future." />
                <p className="mt-5 max-w-sm text-sm leading-7 text-[#586861]">
                  {resolvedSiteName} helps learners build practical skills, work
                  on real projects, and take their next step in technology.
                </p>

                {showBadges ? (
                  <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#68766e]">
                    <li className="inline-flex items-center gap-1.5">
                      <ShieldCheck
                        aria-hidden="true"
                        className="size-3.5 text-[rgb(var(--ft-a))]"
                      />
                      Learn at your pace
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <CheckCircle2
                        aria-hidden="true"
                        className="size-3.5 text-[rgb(var(--ft-a))]"
                      />
                      Practice as you learn
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <Sparkles
                        aria-hidden="true"
                        className="size-3.5 text-[rgb(var(--ft-a))]"
                      />
                      Build real skills
                    </li>
                  </ul>
                ) : null}

                {contactInfo.length > 0 ? (
                  <ul className="mt-6 space-y-3">
                    {contactInfo.map((item) => (
                      <li key={item.label}>
                        <ContactRow {...item} />
                      </li>
                    ))}
                  </ul>
                ) : null}

                {socials.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {socials.map((item) => (
                      <SocialLink key={item.label} {...item} />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:flex sm:flex-wrap sm:justify-between sm:gap-8 lg:justify-around">
                {Object.entries(footerNav ?? {}).map(([title, links]) => (
                  <nav key={title} aria-label={title}>
                    <h2 className="font-serif text-base font-semibold text-[#20332d]">
                      {title}
                    </h2>
                    <ul className="mt-4 space-y-1">
                      {links.map((link) => (
                        <li key={link.href}>
                          <FooterLink href={link.href}>{link.label}</FooterLink>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>

            <section
              className="border-t border-[#e1e7df] py-7"
              aria-label="Popular technologies"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718078]">
                Popular technologies
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {popularTech.map((technology) => (
                  <li key={technology}>
                    <Link
                      href={`/courses?q=${encodeURIComponent(technology)}`}
                      className={`inline-flex min-h-9 items-center rounded-full border border-[#dfe6dd] bg-white/70 px-3.5 text-xs font-medium text-[#506158] transition-colors hover:border-[rgb(var(--ft-a)/0.35)] hover:bg-[#e9f0e9] hover:text-[rgb(var(--ft-a))] ${focusRing}`}
                    >
                      {technology}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <div className="flex flex-col items-center gap-3 border-t border-[#e1e7df] py-6 text-center text-xs text-[#718078] sm:flex-row sm:justify-between sm:text-left">
              <p>
                © {new Date().getFullYear()} {resolvedSiteName}. All rights
                reserved.
              </p>
              <nav aria-label="Legal" className="flex items-center gap-5">
                <Link
                  href="/privacy"
                  className={`rounded-sm transition-colors hover:text-[rgb(var(--ft-a))] ${focusRing}`}
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className={`rounded-sm transition-colors hover:text-[rgb(var(--ft-a))] ${focusRing}`}
                >
                  Terms
                </Link>
                <Link
                  href="/status"
                  className={`rounded-sm transition-colors hover:text-[rgb(var(--ft-a))] ${focusRing}`}
                >
                  Status
                </Link>
              </nav>
              <p>Made with care for learners everywhere.</p>
            </div>
          </div>
        </Container>
      </footer>
      <ScrollToTop className="text-[#155f4e]" />
    </>
  );
}
