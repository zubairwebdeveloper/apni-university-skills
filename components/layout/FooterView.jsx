// components/layout/FooterView.jsx
// Server component. All motion is CSS-only (no framer-motion, no WebGL).
// Client-only bits (scroll-to-top, spotlight hover, auth-aware buttons)
// live in ./FooterClient.jsx
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Compass,
  Cpu,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
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
import {
  Reveal,
  Stagger,
  StaggerItem,
  Tilt3D,
  Magnetic,
  CountUp,
  CursorGlow,
  ShimmerLine,
} from "./FooterMotion";
import { SpotlightCard, FooterCtaButtons, FooterCtaText } from "./FooterClient";
import { ScrollToTop } from "./ScrollToTop";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

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

// Edit these to your real numbers (or pass `stats` as a prop)
const defaultStats = [
  { icon: Users, value: "10K+", label: "Active learners" },
  { icon: BookOpen, value: "50+", label: "Practical courses" },
  { icon: GraduationCap, value: "100+", label: "Hands-on projects" },
  { icon: Award, value: "24/7", label: "Learn at your pace" },
];

const quickExplore = [
  {
    icon: Cpu,
    title: "AI & Machine Learning",
    text: "Models, data and real projects",
    href: "/courses?q=AI",
  },
  {
    icon: Compass,
    title: "Web Development",
    text: "Build modern full-stack apps",
    href: "/courses?q=Web",
  },
  {
    icon: BookOpen,
    title: "Free Resources",
    text: "Guides and starter material",
    href: "/courses",
  },
  {
    icon: Briefcase,
    title: "Career Paths",
    text: "A clear route into tech jobs",
    href: "/courses",
  },
];

// New: short trust strip. Pass `trustedBy` to override.
const defaultTrustedBy = [
  "Systems Ltd",
  "NetSol",
  "Devsinc",
  "Arbisoft",
  "Contour Software",
  "10Pearls",
  "TPS Pakistan",
  "Techlogix",
];

const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ft-a))] focus-visible:ring-offset-2 focus-visible:ring-offset-background";

// A social link is shown only when the admin saved a real https:// URL.
// There are deliberately no fallback links: blank, missing or malformed
// values all mean "hide this icon".
function safeHttpsUrl(value) {
  if (typeof value !== "string") return "";
  const v = value.trim();
  return /^https:\/\/\S+$/i.test(v) ? v : "";
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

// Link: gradient-clipped text color sweeps in on hover, underline grows
// from the left, arrow slides in. Layout never shifts.
function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className={`group -mx-2.5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-all duration-300 hover:translate-x-0.5 hover:bg-[rgb(var(--ft-a)/0.08)] motion-reduce:transition-none motion-reduce:hover:translate-x-0 ${FOCUS}`}
    >
      <span
        className="relative bg-[length:200%_100%] bg-left bg-gradient-to-r from-[rgb(var(--ft-a))] via-[rgb(var(--ft-c))] to-[rgb(var(--ft-b))] bg-clip-text text-transparent transition-[background-position,color] duration-500 group-hover:bg-right"
        style={{ WebkitTextFillColor: "currentColor" }}
      >
        <span className="transition-colors duration-300 group-hover:text-[rgb(var(--ft-a))] group-focus-visible:text-[rgb(var(--ft-a))]">
          {children}
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-[rgb(var(--ft-a))] to-[rgb(var(--ft-b))] transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
        />
      </span>
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 -translate-x-1 text-[rgb(var(--ft-a))] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:transition-none"
      />
    </Link>
  );
}

function SocialLink({ icon: Icon, label, href }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`group relative flex size-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:rotate-6 hover:scale-110 hover:border-transparent hover:bg-gradient-to-br hover:from-[rgb(var(--ft-a))] hover:via-[rgb(var(--ft-c))] hover:to-[rgb(var(--ft-d))] hover:text-[#080B12] hover:shadow-lg hover:shadow-[rgb(var(--ft-a)/0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100 ${FOCUS}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full opacity-0 ring-2 ring-[rgb(var(--ft-a)/0.45)] transition-opacity duration-300 group-hover:animate-ping group-hover:opacity-100 motion-reduce:hidden"
      />
      <Icon
        aria-hidden="true"
        className="size-4 transition-transform duration-300 group-hover:scale-110"
      />
    </Link>
  );
}

function ContactRow({ icon: Icon, label, href }) {
  const content = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--ft-a)/0.12)] text-[rgb(var(--ft-a))] ring-1 ring-[rgb(var(--ft-a)/0.25)] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[rgb(var(--ft-a))] group-hover:to-[rgb(var(--ft-b))] group-hover:text-[#080B12] group-hover:shadow-md group-hover:shadow-[rgb(var(--ft-a)/0.3)] motion-reduce:transition-none">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 break-words transition-colors duration-300 group-hover:text-foreground">
        {label}
      </span>
    </>
  );

  const base = "group flex items-center gap-3 text-sm text-muted-foreground";

  return href ? (
    <Link
      href={href}
      className={`${base} -mx-2 rounded-xl px-2 py-1 transition-all duration-300 hover:translate-x-1 hover:bg-[rgb(var(--ft-a)/0.06)] hover:text-foreground motion-reduce:hover:translate-x-0 ${FOCUS}`}
    >
      {content}
    </Link>
  ) : (
    <div className={base}>{content}</div>
  );
}

function StatItem({ icon: Icon, value, label }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[rgb(var(--ft-a)/0.5)] hover:bg-[rgb(var(--ft-a)/0.08)] hover:shadow-lg hover:shadow-[rgb(var(--ft-a)/0.15)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-[rgb(var(--ft-a))] via-[rgb(var(--ft-c))] to-[rgb(var(--ft-b))] transition-transform duration-500 group-hover:scale-x-100"
      />
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--ft-a)/0.22)] to-[rgb(var(--ft-b)/0.22)] text-[rgb(var(--ft-a))] ring-1 ring-[rgb(var(--ft-a)/0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 motion-reduce:transition-none">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xl font-semibold leading-none tracking-tight text-foreground">
            <CountUp value={value} />
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

// New: small live-status pill, common in SaaS footers/headers.
function StatusBadge({ label = "All systems operational", href = "/status" }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-[rgb(var(--ft-a)/0.5)] hover:bg-[rgb(var(--ft-a)/0.10)] hover:text-foreground ${FOCUS}`}
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[rgb(var(--ft-a))] opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-[rgb(var(--ft-a))]" />
      </span>
      {label}
      <ArrowRight
        aria-hidden="true"
        className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </Link>
  );
}

// New: rating/social-proof pill.
function RatingBadge({
  value = "4.9",
  of = "2,400+ learners",
  href = "/reviews",
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all duration-300 hover:border-[rgb(var(--ft-d)/0.5)] hover:bg-[rgb(var(--ft-d)/0.12)] hover:text-foreground ${FOCUS}`}
    >
      <span className="flex items-center gap-0.5 text-[rgb(var(--ft-d))]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            aria-hidden="true"
            className="size-3 fill-current transition-transform duration-300 group-hover:scale-110"
            style={{ transitionDelay: `${i * 40}ms` }}
          />
        ))}
      </span>
      <span className="text-foreground">{value}</span>
      <span className="hidden sm:inline">· {of}</span>
    </Link>
  );
}

// New: infinite-scrolling "trusted by" marquee. Pure CSS, pauses on hover
// and is disabled under prefers-reduced-motion (falls back to a wrapped list).
function TrustStrip({ names = defaultTrustedBy }) {
  const loop = [...names, ...names];
  return (
    <div className="relative z-10 border-t border-border py-7">
      <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-left">
        Learners work at teams like
      </p>
      <div className="group/marquee relative mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="ft-marquee flex w-max flex-nowrap items-center gap-10 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-8 motion-reduce:gap-y-3">
          {loop.map((name, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= names.length ? "true" : undefined}
              className="shrink-0 whitespace-nowrap text-sm font-semibold tracking-tight text-muted-foreground/70 transition-colors duration-300 hover:text-[rgb(var(--ft-a))]"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SaaS-style background                                               */
/* Clean gradient mesh + fine dot grid + soft glow border, instead of  */
/* a literal 3D scene — reads as product chrome, not a space scene.    */
/* ------------------------------------------------------------------ */

function FooterBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <style>{`
        @keyframes ft-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(60px,30px,0) scale(1.08); } }
        @keyframes ft-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-50px,-24px,0) scale(1.06); } }
        @keyframes ft-drift-c { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(0,-26px,0) scale(1.05); } }
        @keyframes ft-float { 0%,100% { transform: translateY(0); opacity: .2; } 50% { transform: translateY(-14px); opacity: .7; } }
        @keyframes ft-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: no-preference) {
          .ft-drift-a { animation: ft-drift-a 20s ease-in-out infinite; }
          .ft-drift-b { animation: ft-drift-b 24s ease-in-out infinite; }
          .ft-drift-c { animation: ft-drift-c 18s ease-in-out infinite; }
          .ft-float { animation: ft-float 7s ease-in-out infinite; }
          .ft-marquee { animation: ft-marquee 28s linear infinite; }
          .group\\/marquee:hover .ft-marquee { animation-play-state: paused; }
        }
      `}</style>

      {/* Base: deep slate, the classic SaaS "dark product footer" wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 70% at 50% 0%, rgb(var(--ft-d) / 0.16), transparent 60%), linear-gradient(180deg, #0a0e1a 0%, #070a14 55%, #060911 100%)",
        }}
      />

      {/* Soft gradient-mesh blobs, SaaS marketing-site style */}
      <div
        className="ft-drift-a absolute -left-1/4 -top-1/4 h-[70%] w-[55%] rounded-full blur-3xl will-change-transform"
        style={{ background: "rgb(var(--ft-a) / 0.16)" }}
      />
      <div
        className="ft-drift-b absolute -right-1/4 top-0 h-[65%] w-[55%] rounded-full blur-3xl will-change-transform"
        style={{ background: "rgb(var(--ft-b) / 0.18)" }}
      />
      <div
        className="ft-drift-c absolute bottom-[-20%] left-1/3 h-[55%] w-[45%] rounded-full blur-3xl will-change-transform"
        style={{ background: "rgb(var(--ft-d) / 0.14)" }}
      />

      {/* Fine dot grid — the quiet product-chrome texture SaaS footers use */}
      <div
        className="absolute inset-0 opacity-[0.25] [mask-image:radial-gradient(85%_60%_at_50%_0%,black,transparent)]"
        style={{
          backgroundImage:
            "radial-gradient(rgb(var(--ft-a) / 0.5) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Hairline top border with a soft glow, like a product panel edge */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(var(--ft-a) / 0.6), rgb(var(--ft-b) / 0.6), transparent)",
        }}
      />

      {/* A few quiet drifting particles for depth, kept subtle */}
      {[
        { x: "10%", y: "20%", s: 3, d: 6.5, c: "a" },
        { x: "28%", y: "70%", s: 3, d: 8, c: "d" },
        { x: "62%", y: "16%", s: 3, d: 7.5, c: "b" },
        { x: "85%", y: "55%", s: 3, d: 9, c: "a" },
      ].map((p, i) => (
        <span
          key={i}
          className="ft-float absolute rounded-full will-change-transform"
          style={{
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            background: `rgb(var(--ft-${p.c}))`,
            animationDuration: `${p.d}s`,
            animationDelay: `${i * 0.5}s`,
            opacity: 0.35,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

// Props:
// - isLoggedIn: optional. Leave it out and the client checks Firebase auth.
//   Only pass true/false if you already know the state on the server.
// - contactEmail / phone / address: each row is hidden when blank. There is
//   no default email, so nothing from another project can leak in.
//   `address` falls back to "Islamabad, Pakistan" only when not passed at
//   all; pass "" to hide it.
// - social: { facebook, instagram, linkedin, youtube, x, github }. Only
//   valid https:// URLs are shown; blank or missing keys are hidden.
// - newsletter: optional node (e.g. <Newsletter variant="inline" />) shown in
//   its own band; nothing is rendered when it is not passed
// - showCta / showStats / showExplore / showTrust / showBadges: toggle sections
// - stats: override the numbers strip
// - trustedBy: override the "trusted by" marquee names
// - rating / statusHref: override the new social-proof / status pills
export function FooterView({
  siteName = "Apni University",
  contactEmail,
  phone,
  address = "Islamabad, Pakistan",
  social,
  newsletter,
  isLoggedIn, // leave undefined: FooterClient checks Firebase itself
  showCta = true,
  showStats = true,
  showExplore = true,
  showTrust = true,
  showBadges = true,
  stats = defaultStats,
  trustedBy = defaultTrustedBy,
  rating = { value: "4.9", of: "2,400+ learners", href: "/reviews" },
  statusHref = "/status",
  ctaHref = "/register",
  loginHref = "/login",
  ctaSecondaryHref = "/courses",
  dashboardHref = "/dashboard",
  myCoursesHref = "/dashboard/courses",
}) {
  const email = cleanText(contactEmail);
  const phoneText = cleanText(phone);
  const addressText = cleanText(address);

  const contactInfo = [
    email && {
      icon: Mail,
      label: email,
      href: `mailto:${email}`,
    },
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
      href: safeHttpsUrl(social?.facebook),
    },
    {
      icon: FaInstagram,
      label: "Instagram",
      href: safeHttpsUrl(social?.instagram),
    },
    {
      icon: FaLinkedinIn,
      label: "LinkedIn",
      href: safeHttpsUrl(social?.linkedin),
    },
    { icon: FaYoutube, label: "YouTube", href: safeHttpsUrl(social?.youtube) },
    { icon: FaXTwitter, label: "X", href: safeHttpsUrl(social?.x) },
    { icon: FaGithub, label: "GitHub", href: safeHttpsUrl(social?.github) },
  ].filter((s) => s.href);

  return (
    <>
      <footer
        // Deliberately dark in both themes. The `dark` class re-scopes the
        // semantic tokens (foreground, card, border, ...) for everything inside.
        className="dark relative isolate overflow-hidden border-t border-border bg-[#060913] text-foreground [--ft-a:52_211_153] [--ft-b:79_140_255] [--ft-c:141_203_255] [--ft-d:139_92_246]"
      >
        <FooterBackdrop />
        <CursorGlow />

        {/* Top edge with a sweeping light */}
        <ShimmerLine />

        <Container>
          {/* Status + rating pills — quiet SaaS-style social proof row */}
          {showBadges && (
            <Reveal className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-10 sm:justify-start">
              <StatusBadge href={statusHref} />
              <RatingBadge
                value={rating.value}
                of={rating.of}
                href={rating.href}
              />
            </Reveal>
          )}

          {/* Call-to-action band */}
          {showCta && (
            <Reveal className="relative z-10 pt-6">
              <Tilt3D max={3} className="relative rounded-3xl">
                <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 px-6 py-10 text-center backdrop-blur-md transition-colors duration-500 hover:border-[rgb(var(--ft-a)/0.35)] sm:px-12 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:text-left">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{
                      background:
                        "linear-gradient(120deg, rgb(var(--ft-a) / 0.20), rgb(var(--ft-d) / 0.12) 50%, rgb(var(--ft-b) / 0.22))",
                    }}
                  />
                  <FooterCtaText isLoggedIn={isLoggedIn} />

                  <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:mt-0 lg:shrink-0">
                    <FooterCtaButtons
                      isLoggedIn={isLoggedIn}
                      registerHref={ctaHref}
                      loginHref={loginHref}
                      coursesHref={ctaSecondaryHref}
                      dashboardHref={dashboardHref}
                      myCoursesHref={myCoursesHref}
                    />
                  </div>
                </div>
              </Tilt3D>
            </Reveal>
          )}

          {/* Stats strip */}
          {showStats && stats?.length > 0 && (
            <Reveal delay={0.05} className="relative z-10 pt-6">
              <Stagger className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                  <StaggerItem key={s.label}>
                    <StatItem {...s} />
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          )}

          {/* Newsletter band (only when a node is passed in) */}
          {newsletter && (
            <Reveal delay={0.05} className="relative z-10 pt-6">
              <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-md transition-colors duration-300 hover:border-[rgb(var(--ft-a)/0.35)] sm:p-8">
                {newsletter}
              </div>
            </Reveal>
          )}

          {/* Quick explore */}
          {showExplore && (
            <Reveal delay={0.05} className="relative z-10 pt-6">
              <nav aria-label="Quick explore">
                <Stagger
                  as="ul"
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
                >
                  {quickExplore.map(({ icon: Icon, title, text, href }) => (
                    <StaggerItem as="li" key={title}>
                      <SpotlightCard href={href} className="h-full">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-[rgb(var(--ft-a)/0.12)] text-[rgb(var(--ft-a))] ring-1 ring-[rgb(var(--ft-a)/0.25)] transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[rgb(var(--ft-a))] group-hover:to-[rgb(var(--ft-b))] group-hover:text-[#080B12] motion-reduce:transition-none">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors duration-300 group-hover:text-[rgb(var(--ft-a))]">
                          {title}
                          <ArrowRight
                            aria-hidden="true"
                            className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none"
                          />
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/90">
                          {text}
                        </span>
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[rgb(var(--ft-a))] to-[rgb(var(--ft-b))] transition-transform duration-300 group-hover:scale-x-100"
                        />
                      </SpotlightCard>
                    </StaggerItem>
                  ))}
                </Stagger>
              </nav>
            </Reveal>
          )}

          {/* Trusted-by marquee */}
          {showTrust && trustedBy?.length > 0 && (
            <TrustStrip names={trustedBy} />
          )}

          {/* Main area: brand on the left, navigation spread on the right */}
          <div className="relative z-10 flex flex-col gap-12 py-14 lg:flex-row lg:justify-between lg:gap-16 lg:py-16">
            <Reveal className="space-y-6 lg:max-w-sm">
              <AnimatedLogo tagline="Learn Skills. Build Your Future." />

              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {siteName} is a technology education platform for learners who
                want practical skills, real projects and a clear path into tech
                careers. Explore AI, web development and more at your own pace.
              </p>

              {/* Security / accreditation reassurance strip */}
              {showBadges && (
                <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <li className="group inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-[rgb(var(--ft-a))]">
                    <ShieldCheck
                      aria-hidden="true"
                      className="size-3.5 text-[rgb(var(--ft-a))] transition-transform duration-300 group-hover:scale-110"
                    />
                    Secure checkout
                  </li>
                  <li className="group inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-[rgb(var(--ft-a))]">
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-3.5 text-[rgb(var(--ft-a))] transition-transform duration-300 group-hover:scale-110"
                    />
                    Certified instructors
                  </li>
                  <li className="group inline-flex items-center gap-1.5 transition-colors duration-300 hover:text-[rgb(var(--ft-a))]">
                    <Sparkles
                      aria-hidden="true"
                      className="size-3.5 text-[rgb(var(--ft-a))] transition-transform duration-300 group-hover:scale-110"
                    />
                    Updated every term
                  </li>
                </ul>
              )}

              {contactInfo.length > 0 && (
                <ul className="space-y-3">
                  {contactInfo.map((item) => (
                    <li key={item.label}>
                      <ContactRow {...item} />
                    </li>
                  ))}
                </ul>
              )}

              {socials.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  {socials.map((s) => (
                    <Magnetic key={s.label} className="inline-flex">
                      <SocialLink {...s} />
                    </Magnetic>
                  ))}
                </div>
              )}
            </Reveal>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:flex sm:flex-wrap sm:justify-between sm:gap-8 lg:flex-1 lg:flex-nowrap lg:justify-around">
              {Object.entries(footerNav).map(([title, links], i) => (
                <Reveal key={title} delay={0.1 + i * 0.1}>
                  <nav aria-label={title}>
                    <h2 className="relative inline-block font-sans text-sm font-semibold text-foreground">
                      {title}
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1.5 left-0 flex items-center gap-1"
                      >
                        <span className="h-0.5 w-6 rounded-full bg-gradient-to-r from-[rgb(var(--ft-a))] to-[rgb(var(--ft-b))]" />
                        <span className="size-1.5 rounded-full bg-[rgb(var(--ft-d))]" />
                      </span>
                    </h2>

                    <ul className="mt-5 space-y-1.5">
                      {links.map((link) => (
                        <li key={link.href}>
                          <FooterLink href={link.href}>{link.label}</FooterLink>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Popular technologies */}
          <Reveal
            delay={0.1}
            y={12}
            className="relative z-10 border-t border-border py-8"
          >
            <nav aria-label="Popular technologies">
              <p className="text-sm font-medium text-muted-foreground">
                Popular technologies
              </p>
              <Stagger
                as="ul"
                stagger={0.05}
                className="mt-4 flex flex-wrap gap-2.5"
              >
                {popularTech.map((t) => (
                  <StaggerItem as="li" key={t}>
                    <Link
                      href={`/courses?q=${encodeURIComponent(t)}`}
                      className={`inline-flex min-h-9 items-center rounded-full border border-border bg-card/60 px-3.5 text-sm font-medium text-card-foreground backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-transparent hover:bg-gradient-to-r hover:from-[rgb(var(--ft-a)/0.25)] hover:via-[rgb(var(--ft-b)/0.22)] hover:to-[rgb(var(--ft-d)/0.25)] hover:text-white hover:shadow-md hover:shadow-[rgb(var(--ft-b)/0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${FOCUS}`}
                    >
                      {t}
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </nav>
          </Reveal>

          {/* Bottom bar */}
          <Reveal
            delay={0.2}
            y={12}
            className="relative z-10 flex flex-col items-center gap-3 border-t border-border py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left"
          >
            <p>
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <nav aria-label="Legal" className="flex items-center gap-4">
              <Link
                href="/privacy"
                className={`relative rounded-sm transition-colors duration-300 hover:text-[rgb(var(--ft-a))] ${FOCUS}`}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className={`relative rounded-sm transition-colors duration-300 hover:text-[rgb(var(--ft-a))] ${FOCUS}`}
              >
                Terms
              </Link>
              <Link
                href="/status"
                className={`relative rounded-sm transition-colors duration-300 hover:text-[rgb(var(--ft-a))] ${FOCUS}`}
              >
                Status
              </Link>
            </nav>
            <p>Made with care for learners everywhere.</p>
          </Reveal>
        </Container>
      </footer>

      {/* Outside the footer on purpose: fixed positioning is never clipped */}
      <ScrollToTop className="text-[#eb0aa0]" />
    </>
  );
}
