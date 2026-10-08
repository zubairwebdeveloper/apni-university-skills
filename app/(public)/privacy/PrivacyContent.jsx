"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Cookie,
  Database,
  FileCheck2,
  Globe2,
  HelpCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  UserRound,
} from "lucide-react";

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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.05, 0.4),
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6 } },
};

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-primary via-primary/70 to-accent"
    />
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={
        visible
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.6, pointerEvents: "none" }
      }
      transition={{ duration: 0.25 }}
      className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-transform"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </motion.button>
  );
}

export default function PrivacyContent() {
  return (
    <main className="relative overflow-hidden bg-background">
      <ScrollProgressBar />
      <BackToTop />

      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-1/2 top-[-280px] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[-180px] top-[120px] h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl"
        />
        <div className="absolute left-[-180px] top-[220px] h-[320px] w-[320px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm"
            >
              <ShieldCheck className="size-4 text-primary" />
              Your privacy matters
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Privacy, explained <span className="text-primary">simply.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg"
            >
              We believe learning should feel empowering, and your personal
              information should feel protected. Here is how Apni University
              collects, uses, and safeguards your information.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <FileCheck2 className="size-4 text-primary" />
                Effective: October 7, 2026
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <Sparkles className="size-4 text-primary" />
                Clear & transparent
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeIn}
        className="border-b bg-primary/5"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Privacy highlights */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.3 }}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border bg-background p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-5" />
                  </div>

                  <h2 className="font-semibold">{item.title}</h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main legal content */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Table of contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                <h2 className="font-semibold">On this page</h2>
              </div>

              <nav className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="group flex items-start gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <ChevronRight className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span>{item.heading}</span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="mb-10 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
            >
              <div className="flex gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Our approach to privacy
                  </h2>

                  <p className="mt-2 leading-7 text-muted-foreground">
                    Apni University is built to help people learn practical
                    technology skills, build real projects, explore AI, and
                    prepare for the future of work. We collect information
                    primarily when it is needed to provide those experiences. We
                    aim to keep our practices understandable and our security
                    controls appropriate for the service we provide.
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              {sections.map((section, index) => {
                const Icon = section.icon;

                return (
                  <motion.article
                    key={section.id}
                    id={section.id}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.15 }}
                    custom={index % 5}
                    variants={fadeUp}
                    whileHover={{ y: -2 }}
                    className="scroll-mt-24 rounded-2xl border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8"
                  >
                    <div className="flex gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">
                          Section {String(index + 1).padStart(2, "0")}
                        </div>

                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                          {section.heading}
                        </h2>

                        <div className="mt-4 space-y-4">
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
                  </motion.article>
                );
              })}
            </div>

            {/* FAQ */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              className="mt-10 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HelpCircle className="size-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Frequently asked questions
                </h2>
              </div>

              <div className="divide-y">
                {faqs.map((faq) => (
                  <details
                    key={faq.q}
                    className="group py-4 first:pt-0 last:pb-0"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold sm:text-base">
                      {faq.q}
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </motion.div>

            {/* Contact CTA */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              className="mt-10 overflow-hidden rounded-3xl border bg-card shadow-sm"
            >
              <div className="p-7 sm:p-10">
                <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight">
                      Have a privacy question?
                    </h2>

                    <p className="mt-3 leading-7 text-muted-foreground">
                      If you want to access, update, or request deletion of your
                      personal information, our team is here to help.
                    </p>
                  </div>

                  <Link
                    href="/contact"
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    Contact us
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Footer note */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              className="mt-8 flex items-start gap-3 rounded-2xl border border-dashed bg-muted/30 p-5"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />

              <p className="text-sm leading-6 text-muted-foreground">
                By using Apni University, you acknowledge that you have read
                this Privacy Policy. This page may be updated from time to time
                as our platform and privacy practices evolve.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom brand CTA */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="border-t bg-muted/30"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-6" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
            Learn with confidence.
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Practical skills, real projects, and a learning experience built
            with your trust in mind.
          </p>

          <Link
            href="/courses"
            className="group mt-6 inline-flex items-center gap-2 font-semibold text-primary"
          >
            Explore courses
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
