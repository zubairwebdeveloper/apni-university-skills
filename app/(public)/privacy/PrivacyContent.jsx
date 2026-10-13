"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cookie,
  Database,
  FileCheck2,
  Globe2,
  HelpCircle,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  ShieldOff,
  UserRound,
  X,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { TiltCard } from "@/components/public/TiltCard";

const sections = [
  {
    id: "information-we-collect",
    icon: UserRound,
    heading: "Information we collect",
    body: [
      "When you create an Apni University account, we may collect your name, email address, profile photo, phone number, country, city, and other optional profile information you choose to provide.",
      "We also collect information about your learning activity, including course enrollments, lesson progress, wishlist items, reviews, certificates, and other actions needed to provide your learning experience.",
      "When you purchase a course, we store payment-related information such as the amount, currency, payment status, and relevant Stripe identifiers. Your card number and full payment credentials are handled by Stripe and are not stored on Apni University's servers.",
      "If you contact us, we may receive the information you provide through contact forms, support messages, newsletter subscriptions, or other communication channels.",
    ],
  },
  {
    id: "how-we-use-information",
    icon: Database,
    heading: "How we use your information",
    body: [
      "We use your information to create and maintain your account, provide access to courses, track your learning progress, issue certificates, manage your wishlist, process purchases, and provide customer support.",
      "We may also use information to protect the platform against fraud, abuse, unauthorized access, and other security threats.",
      "Where appropriate, we use aggregated or non-identifying information to understand how learners use Apni University and improve our courses, user experience, performance, and services.",
    ],
  },
  {
    id: "learning-data",
    icon: BookOpen,
    heading: "Your learning activity",
    body: [
      "Apni University is designed around practical learning. To provide features such as progress tracking, course completion, certificates, and personalized dashboards, we need to store certain learning activity associated with your account.",
      "This information may include enrolled courses, completed lessons, progress percentages, reviews, saved courses, and certificate records.",
      "We use this information only to provide and improve the learning experience and related platform functionality.",
    ],
  },
  {
    id: "payments",
    icon: FileCheck2,
    heading: "Payments and Stripe",
    body: [
      "Paid courses may be processed through Stripe, a third-party payment provider. When you make a payment, Stripe processes your payment information according to its own privacy and security practices.",
      "Apni University does not store your complete card number, security code, or other sensitive card credentials.",
      "We may store transaction information necessary to identify your purchase, such as course, amount, currency, payment status, Stripe payment identifiers, and enrollment information.",
    ],
  },
  {
    id: "firebase",
    icon: ShieldCheck,
    heading: "Firebase and infrastructure",
    body: [
      "Apni University uses Google Firebase services for important platform functionality such as authentication, database operations, and file storage.",
      "Depending on the feature you use, information may be processed or stored through Firebase services. We configure access controls and server-side permissions to help protect information from unauthorized access.",
      "Third-party infrastructure providers may process information on our behalf under their applicable terms and privacy policies.",
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    heading: "Cookies and similar technologies",
    body: [
      "Apni University uses essential cookies or session technologies required to keep you signed in and maintain secure application functionality.",
      "We do not currently use advertising cookies for targeted advertising.",
      "If we introduce analytics, advertising, or other non-essential tracking technologies in the future, we will update this policy and provide appropriate information about their use.",
    ],
  },
  {
    id: "data-sharing",
    icon: LockKeyhole,
    heading: "When information may be shared",
    body: [
      "We do not sell your personal information.",
      "We may share information with trusted service providers when necessary to operate Apni University, such as authentication, hosting, database, storage, email, payment, security, or infrastructure providers.",
      "We may also disclose information when required by applicable law, legal process, court order, or when necessary to protect the rights, safety, security, or property of Apni University, our users, or others.",
    ],
  },
  {
    id: "not-collected",
    icon: ShieldOff,
    heading: "What we don't collect",
    body: [
      "We never ask for or store your full card number, CVV, or banking passwords — these are entered directly on Stripe's secure checkout pages.",
      "We do not collect government ID numbers, biometric data, or precise GPS location.",
      "We do not run advertising trackers or sell lists of learner emails to third parties.",
    ],
  },
  {
    id: "international",
    icon: Globe2,
    heading: "International users",
    body: [
      "Apni University welcomes learners from different countries. Because our infrastructure providers (such as Google Firebase and Stripe) operate globally, your information may be processed or stored in countries other than your own.",
      "Wherever your information is processed, we work with providers that apply appropriate security and contractual safeguards.",
    ],
  },
  {
    id: "third-party-links",
    icon: Globe2,
    heading: "Third-party links",
    body: [
      "Our platform may contain links to external websites, course resources, or tools that are not operated by Apni University.",
      "We are not responsible for the privacy practices of third-party sites. We encourage you to review the privacy policy of any external site you visit.",
    ],
  },
  {
    id: "security",
    icon: ShieldCheck,
    heading: "Security",
    body: [
      "We use reasonable technical and organizational measures to protect personal information, including server-side authorization, authenticated access, permission checks, secure payment processing, and trusted infrastructure providers.",
      "Access to sensitive platform functionality is restricted according to user permissions and roles.",
      "However, no internet-based service can guarantee absolute security. We encourage you to use a strong password and keep your account credentials private.",
    ],
  },
  {
    id: "your-rights",
    icon: CheckCircle2,
    heading: "Your choices and rights",
    body: [
      "You can review and update certain profile information through your account settings.",
      "You may contact us to request access to personal information we hold about you, ask for correction of inaccurate information, or request deletion where applicable.",
      "Some information may need to be retained for legitimate business, security, legal, accounting, fraud-prevention, or transaction-record purposes.",
      "If you have subscribed to our newsletter, you can unsubscribe at any time using the available unsubscribe option or by contacting us.",
    ],
  },
  {
    id: "data-retention",
    icon: Database,
    heading: "Data retention",
    body: [
      "We retain personal information for as long as reasonably necessary to provide our services, maintain your account, fulfill transactions, meet legal obligations, resolve disputes, and enforce our agreements.",
      "Retention periods may differ depending on the type of information and the reason it was collected.",
    ],
  },
  {
    id: "children",
    icon: UserRound,
    heading: "Children's privacy",
    body: [
      "Apni University is not directed toward children under 13, and we do not knowingly collect personal information from children under 13.",
      "If you believe a child has provided personal information to us, please contact us so we can take appropriate steps to review and remove the information where required.",
    ],
  },
  {
    id: "policy-changes",
    icon: FileCheck2,
    heading: "Changes to this policy",
    body: [
      "We may update this Privacy Policy when our services, technology, legal requirements, or data practices change.",
      "When we make significant changes, we will update the policy on this page and revise the effective date so you can see when the latest version was published.",
    ],
  },
];

const highlights = [
  {
    icon: LockKeyhole,
    title: "Privacy first",
    description: "We do not sell your personal information to advertisers.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    description:
      "Authentication and sensitive permissions are handled with server-side controls.",
  },
  {
    icon: FileCheck2,
    title: "Transparent payments",
    description: "Stripe handles sensitive card information during checkout.",
  },
  {
    icon: UserRound,
    title: "You're in control",
    description:
      "You can update your profile and request access or deletion of your data.",
  },
];

const stats = [
  { label: "Card data stored on our servers", value: "0" },
  { label: "Data sold to advertisers", value: "Never" },
  { label: "Ways to request your data", value: "2" },
  { label: "Policy reviewed", value: "Regularly" },
];

const faqs = [
  {
    q: "Does Apni University sell my data?",
    a: "No. We do not sell your personal information to advertisers or data brokers, ever.",
  },
  {
    q: "Who can see my payment details?",
    a: "Stripe processes your card details directly. We only store the transaction result (amount, currency, status, and Stripe's reference ID) — never your full card number.",
  },
  {
    q: "Can I delete my account and data?",
    a: "Yes. Contact us and we will process your deletion request, subject to a few records we may need to retain for legal or accounting reasons.",
  },
  {
    q: "Where is my data stored?",
    a: "We use Google Firebase for authentication, database, and storage, which may process data in multiple regions depending on the service.",
  },
  {
    q: "How do I stop receiving the newsletter?",
    a: "Use the unsubscribe link in any newsletter email, or contact us directly and we'll remove you right away.",
  },
];

const toc = sections.map(({ id, heading }) => ({ id, heading }));

// Estimated from the real policy text, at roughly 220 words per minute
const wordCount = [
  ...sections.flatMap((s) => [s.heading, ...s.body]),
  ...faqs.flatMap((f) => [f.q, f.a]),
]
  .join(" ")
  .split(/\s+/)
  .filter(Boolean).length;
const readMinutes = Math.max(1, Math.round(wordCount / 220));

function ScrollProgressBar() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });
  const scaleX = reduce ? scrollYProgress : spring;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-primary"
    />
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg outline-none transition-opacity duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </button>
  );
}

export default function PrivacyContent() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(sections[0].id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter((s) =>
      [s.heading, ...s.body].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  // Highlight the section being read in the table of contents
  const visibleKey = filtered.map((s) => s.id).join("|");
  useEffect(() => {
    const elements = visibleKey
      .split("|")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActiveId(hit.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleKey]);

  return (
    <MotionConfig reducedMotion="user">
      {/* overflow-x-clip (not hidden) so the sticky table of contents keeps working */}
      <main className="relative overflow-x-clip bg-background">
        <ScrollProgressBar />
        <BackToTop />

        {/* Static decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
        >
          <div className="absolute left-1/2 top-[-280px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Hero with a 3D shield scene */}
        <section className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Privacy, explained{" "}
                  <span className="text-primary">simply.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                  We believe learning should feel empowering, and your personal
                  information should feel protected. Here is how Apni University
                  collects, uses, and safeguards your information.
                </p>

                <ul className="mt-8 flex flex-wrap gap-2">
                  <li className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-foreground">
                    <FileCheck2
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    Effective: October 7, 2026
                  </li>
                  <li className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-foreground">
                    <Clock className="size-4 text-primary" aria-hidden="true" />
                    {readMinutes} min read
                  </li>
                </ul>
              </motion.div>

              {/* 3D scene: depth layers + orbit ring, pointer-responsive on desktop */}
              <TiltCard
                className="mx-auto size-44 sm:size-52 lg:size-60"
                max={12}
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-highlight/40 [transform:translateZ(-36px)_translate(12px,12px)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute -inset-7 [transform-style:preserve-3d] [transform:translateZ(-8px)_rotateX(68deg)]"
                >
                  <span className="relative block size-full animate-spin rounded-full border border-dashed border-primary/50 [animation-duration:28s] motion-reduce:animate-none">
                    <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-highlight shadow-md" />
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-3 grid place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-xl [transform:translateZ(36px)]"
                >
                  <ShieldCheck
                    className="size-16 sm:size-20"
                    aria-hidden="true"
                  />
                </span>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* Key facts: one quiet strip */}
        <section aria-label="Privacy at a glance" className="border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col-reverse items-center gap-1 px-3 py-6 text-center"
                >
                  <dt className="text-xs text-muted-foreground sm:text-sm">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Highlights: open columns */}
        <section
          aria-labelledby="highlights-title"
          className="border-b bg-muted/30"
        >
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <h2
              id="highlights-title"
              className="max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            >
              The short version
            </h2>
            <ul className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.title}
                    className="border-t-2 border-primary pt-5"
                  >
                    <Icon className="size-6 text-primary" aria-hidden="true" />
                    <h3 className="mt-3 text-base font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground sm:text-base">
                      {item.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Policy */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            {/* Table of contents (desktop) with the section being read highlighted */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  <h2 className="font-semibold">On this page</h2>
                </div>

                <nav
                  aria-label="Privacy policy sections"
                  className="max-h-[65vh] space-y-0.5 overflow-y-auto pr-1"
                >
                  {toc.map((item) => {
                    const active = activeId === item.id;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        aria-current={active ? "location" : undefined}
                        className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none ${
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <ChevronRight
                          className="mt-0.5 size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{item.heading}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div className="min-w-0">
              {/* Table of contents (mobile) */}
              <details className="group mb-6 rounded-xl border bg-card lg:hidden">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    On this page
                  </span>
                  <ChevronRight
                    className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <nav
                  aria-label="Privacy policy sections"
                  className="max-h-72 space-y-0.5 overflow-y-auto border-t px-2 py-2"
                >
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.heading}
                    </a>
                  ))}
                </nav>
              </details>

              {/* Search within the policy */}
              <div className="mb-10">
                <label htmlFor="policy-search" className="sr-only">
                  Search this policy
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="policy-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search this policy, e.g. Stripe, cookies, deletion"
                    className="h-12 w-full rounded-xl border bg-card pl-11 pr-11 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p
                  aria-live="polite"
                  className="mt-2 text-sm text-muted-foreground"
                >
                  {query.trim()
                    ? `${filtered.length} of ${sections.length} sections match`
                    : `${sections.length} sections`}
                </p>
              </div>

              {/* Approach */}
              {!query.trim() && (
                <div className="mb-10 flex gap-4 border-b pb-10">
                  <ShieldCheck
                    className="mt-1 size-6 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">
                      Our approach to privacy
                    </h2>
                    <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
                      Apni University is built to help people learn practical
                      technology skills, build real projects, explore AI, and
                      prepare for the future of work. We collect information
                      primarily when it is needed to provide those experiences.
                      We aim to keep our practices understandable and our
                      security controls appropriate for the service we provide.
                    </p>
                  </div>
                </div>
              )}

              {/* Sections */}
              {filtered.length > 0 ? (
                <div>
                  {filtered.map((section) => {
                    const Icon = section.icon;
                    const number = sections.indexOf(section) + 1;

                    return (
                      <article
                        key={section.id}
                        id={section.id}
                        className="scroll-mt-24 border-t py-8 first:border-t-0 first:pt-0"
                      >
                        <div className="flex items-start gap-4">
                          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-5" aria-hidden="true" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold tabular-nums text-primary">
                              Section {String(number).padStart(2, "0")}
                            </p>

                            <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                              {section.heading}
                            </h2>

                            <div className="mt-4 max-w-3xl space-y-4">
                              {section.body.map((paragraph) => (
                                <p
                                  key={paragraph}
                                  className="text-sm leading-7 text-muted-foreground sm:text-base"
                                >
                                  {paragraph}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="font-medium">No sections match your search.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different word, or clear the search to read the whole
                    policy.
                  </p>
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className={buttonVariants({
                      variant: "outline",
                      className: "mt-4",
                    })}
                  >
                    Clear search
                  </button>
                </div>
              )}

              {/* FAQ */}
              <section
                aria-labelledby="privacy-faq"
                className="mt-12 border-t pt-10"
              >
                <div className="mb-6 flex items-center gap-3">
                  <HelpCircle
                    className="size-6 text-primary"
                    aria-hidden="true"
                  />
                  <h2
                    id="privacy-faq"
                    className="text-xl font-bold tracking-tight sm:text-2xl"
                  >
                    Frequently asked questions
                  </h2>
                </div>

                <div className="divide-y divide-border border-y border-border">
                  {faqs.map((faq) => (
                    <details key={faq.q} className="group py-1">
                      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 text-left text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                        {faq.q}
                        <ChevronRight
                          className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </summary>
                      <p className="max-w-2xl pb-4 leading-7 text-muted-foreground">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>

              {/* Contact */}
              <div className="mt-12 flex flex-col gap-6 border-t pt-10 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <Mail
                    className="mt-1 size-6 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div className="max-w-xl">
                    <h2 className="text-2xl font-bold tracking-tight">
                      Have a privacy question?
                    </h2>
                    <p className="mt-2 leading-7 text-muted-foreground">
                      If you want to access, update, or request deletion of your
                      personal information, our team is here to help.
                    </p>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className={buttonVariants({
                    size: "lg",
                    className: "shrink-0",
                  })}
                >
                  Contact us
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              <p className="mt-10 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                By using Apni University, you acknowledge that you have read
                this Privacy Policy. This page may be updated from time to time
                as our platform and privacy practices evolve.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom brand band */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="flex items-start gap-4">
              <BookOpen
                className="mt-1 size-7 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Learn with confidence.
                </h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Practical skills, real projects, and a learning experience
                  built with your trust in mind.
                </p>
              </div>
            </div>

            <Link
              href="/courses"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "shrink-0",
              })}
            >
              Explore courses
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
