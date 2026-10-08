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
  Clock,
  FileCheck2,
  GraduationCap,
  Handshake,
  HelpCircle,
  LockKeyhole,
  Mail,
  MessageCircle,
  Printer,
  Scale,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardHover = {
  y: -4,
  transition: {
    duration: 0.25,
    ease: "easeOut",
  },
};

const highlights = [
  {
    icon: ShieldCheck,
    title: "Built for trust",
    description:
      "Clear rules help keep learning, payments, and accounts safer for everyone.",
  },
  {
    icon: BookOpen,
    title: "Learning first",
    description:
      "Course access is designed for personal learning and practical skill development.",
  },
  {
    icon: WalletCards,
    title: "Transparent payments",
    description:
      "Prices, currencies, payment processing, and refund terms are explained clearly.",
  },
  {
    icon: Handshake,
    title: "Fair community",
    description:
      "Respectful reviews and responsible platform use help everyone learn better.",
  },
];

const quickFacts = [
  "Personal learning access",
  "Secure account responsibility",
  "Clear payment terms",
  "Respect for creators",
  "Responsible platform use",
];

const faqs = [
  {
    q: "Can I share my account with someone else?",
    a: "No. Your account is personal and non-transferable. Sharing login access or course content outside your own use isn't permitted under these Terms.",
  },
  {
    q: "Does completing a course guarantee me a job?",
    a: "No. We provide practical skills and projects, but employment outcomes depend on many factors outside our control, including your effort, the market, and how you apply what you learn.",
  },
  {
    q: "What happens if I don't agree with these Terms?",
    a: "If you don't agree with any part of these Terms, you should not create an account or continue using Apni University.",
  },
  {
    q: "Can Apni University change these Terms later?",
    a: "Yes. We may update these Terms as the platform evolves. We'll update the effective date, and material changes will be communicated where appropriate.",
  },
  {
    q: "Who owns the course content I purchase?",
    a: "You get a personal license to access and learn from the content — not ownership. The underlying videos, lessons, and materials remain owned by Apni University or the respective creators.",
  },
];

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
      className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5"
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" />
    </motion.button>
  );
}

export default function TermsContent({ sections = [] }) {
  // ~200 words/min reading estimate from section body text
  const wordCount = sections.reduce((total, section) => {
    const text = Array.isArray(section.body) ? section.body.join(" ") : "";
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <main className="relative overflow-hidden bg-background">
      <ScrollProgressBar />
      <BackToTop />

      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-[28rem] h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="absolute left-1/2 top-[55rem] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur">
                <FileCheck2 className="size-4 text-primary" />
                Terms of Service
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
            >
              Learn with confidence.
              <span className="mt-2 block text-primary">Know your rights.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg"
            >
              These Terms of Service explain how Apni University works, what you
              can expect from us, and what we expect from you as part of our
              learning community.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Clear & transparent
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
                <LockKeyhole className="size-4 text-primary" />
                Account focused
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
                <Scale className="size-4 text-primary" />
                Fair platform rules
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm">
                <Clock className="size-4 text-primary" />
                {readingMinutes} min read
              </div>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
            >
              <span>
                Effective date:{" "}
                <span className="font-semibold text-foreground">
                  October 7, 2026
                </span>
              </span>

              <span className="hidden size-1 rounded-full bg-muted-foreground/40 sm:inline-block" />

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <Printer className="size-3.5" />
                Print this page
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust highlights */}
      <section className="relative border-b">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={container}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {highlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <motion.div
                  key={highlight.title}
                  variants={item}
                  whileHover={cardHover}
                  className="group rounded-2xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-5" />
                  </div>

                  <h2 className="font-bold">{highlight.title}</h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {highlight.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-2xl border bg-background/90 p-5 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <h2 className="font-bold">On this page</h2>
                </div>

                <nav className="mt-4 max-h-[55vh] space-y-1 overflow-y-auto pr-1">
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="group flex items-start gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="mt-0.5 min-w-5 text-xs font-bold text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="leading-5">{section.heading}</span>

                      <ChevronRight className="ml-auto mt-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </nav>

                <div className="mt-5 border-t pt-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    About {readingMinutes} min read
                  </div>
                </div>
              </div>
            </aside>

            {/* Content */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              variants={container}
              className="min-w-0"
            >
              {/* Intro */}
              <motion.div
                variants={item}
                className="mb-8 rounded-3xl border bg-primary/[0.04] p-6 sm:p-8"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                    <GraduationCap className="size-6" />
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-primary">
                      Welcome to Apni University
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight">
                      A simple agreement for a better learning experience.
                    </h2>

                    <p className="mt-3 leading-7 text-muted-foreground">
                      Apni University exists to help learners build practical
                      technology skills, work on real projects, explore modern
                      tools, and prepare for the future of work. These terms
                      provide the basic rules that make that experience
                      possible.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Quick facts */}
              <motion.div
                variants={item}
                className="mb-10 rounded-2xl border bg-background p-6 shadow-sm"
              >
                <h2 className="flex items-center gap-2 font-bold">
                  <Sparkles className="size-4 text-primary" />
                  Before you continue
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {quickFacts.map((fact) => (
                    <div
                      key={fact}
                      className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm"
                    >
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Terms sections */}
              <div className="space-y-5">
                {sections.map((section, index) => (
                  <motion.article
                    key={section.id}
                    id={section.id}
                    variants={item}
                    whileHover={{ y: -2 }}
                    className="scroll-mt-28 rounded-3xl border bg-background p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8"
                  >
                    <div className="flex gap-4">
                      <div className="hidden shrink-0 sm:block">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-black text-primary">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:hidden">
                            <span className="text-xs font-black">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <h2 className="text-xl font-black tracking-tight sm:text-2xl">
                            {section.heading}
                          </h2>
                        </div>

                        <div className="mt-5 space-y-4">
                          {section.body?.map((paragraph, paragraphIndex) => (
                            <p
                              key={`${section.id}-${paragraphIndex}`}
                              className="leading-7 text-muted-foreground"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {section.note && (
                          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.04] p-4 text-sm leading-6 text-muted-foreground">
                            <span className="font-semibold text-foreground">
                              Note:
                            </span>{" "}
                            {section.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* FAQ */}
              <motion.div
                variants={item}
                className="mt-10 rounded-3xl border bg-background p-6 shadow-sm sm:p-8"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HelpCircle className="size-5" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight sm:text-2xl">
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
                variants={item}
                className="mt-10 overflow-hidden rounded-3xl border bg-foreground text-background"
              >
                <div className="relative p-7 sm:p-10">
                  <div
                    aria-hidden="true"
                    className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl"
                  />

                  <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <MessageCircle className="size-4" />
                        Need clarification?
                      </div>

                      <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                        We're here to help you understand the rules.
                      </h2>

                      <p className="mt-3 leading-7 text-background/70">
                        If something in these Terms is unclear, reach out to the
                        Apni University team before making an important
                        decision.
                      </p>
                    </div>

                    <Link
                      href="/contact"
                      className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-5 py-3 font-bold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      Contact us
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Bottom brand CTA */}
              <motion.div variants={item} className="mt-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <GraduationCap className="size-6" />
                </div>

                <h2 className="mt-4 text-2xl font-black">
                  Ready to keep learning?
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Explore practical courses, build real projects, and continue
                  your journey with Apni University.
                </p>

                <Link
                  href="/courses"
                  className="group mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Explore courses
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
