"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Clock,
  Copyright,
  FileCheck2,
  GraduationCap,
  Handshake,
  HelpCircle,
  Link2,
  LockKeyhole,
  MessageCircle,
  Printer,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import { TechScene } from "@/components/public/TechScene";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

// Shortcuts only render for section ids that exist in the data.
const shortcuts = [
  { id: "accounts", label: "Accounts" },
  { id: "payments", label: "Payments" },
  { id: "refunds", label: "Refunds" },
  { id: "courses-access", label: "Course access" },
  { id: "reviews", label: "Reviews" },
];

// Optional icons for known section ids; unknown ids fall back to the number only.
const sectionIcons = {
  "using-apni-university": FileCheck2,
  accounts: UserRound,
  "courses-access": BookOpen,
  payments: WalletCards,
  refunds: RotateCcw,
  reviews: MessageCircle,
  "acceptable-use": ShieldCheck,
  jobs: Briefcase,
  "intellectual-property": Copyright,
  "user-content": MessageCircle,
  limitation: Scale,
  contact: MessageCircle,
};

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

function scrollBehavior() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/** Returns the id of the section currently under the sticky header area. */
function useActiveSection(ids) {
  const key = ids.join("|");
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const list = key ? key.split("|") : [];
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 180) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [key]);

  return active;
}

function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary ${className}`}
    >
      <span aria-hidden="true" className="h-px w-6 bg-primary" />
      {children}
    </p>
  );
}

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
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-primary print:hidden"
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

  return (
    <motion.button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={
        visible
          ? { opacity: 1, scale: 1 }
          : { opacity: 0, scale: 0.6, pointerEvents: "none" }
      }
      transition={{ duration: 0.25 }}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 print:hidden ${focusRing}`}
      aria-label="Back to top"
    >
      <ArrowUp className="size-5" aria-hidden="true" />
    </motion.button>
  );
}

/** Copies a link that jumps straight to one section. */
function CopyLink({ id, heading }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${window.location.pathname}#${id}`,
      );
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the section anchor still works in the address bar.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy link to ${heading}`}
      className={`grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground motion-reduce:transition-none print:hidden ${focusRing}`}
    >
      {copied ? (
        <Check className="size-4 text-emerald-600" aria-hidden="true" />
      ) : (
        <Link2 className="size-4" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied" : ""}
      </span>
    </button>
  );
}

// effectiveDate: pass the real date from your content; the old date is the default.
export default function TermsContent({
  sections = [],
  effectiveDate = "October 7, 2026",
}) {
  const [query, setQuery] = useState("");
  // Sections are open by default; this set holds the ones the reader collapsed.
  const [closed, setClosed] = useState(() => new Set());
  const [tocOpen, setTocOpen] = useState(false);
  const tocRef = useRef(null);

  // ~200 words/min reading estimate from section body text
  const wordCount = sections.reduce((total, section) => {
    const text = Array.isArray(section.body) ? section.body.join(" ") : "";
    return total + text.split(/\s+/).filter(Boolean).length;
  }, 0);
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  const numbered = useMemo(
    () =>
      sections.map((section, index) => ({
        ...section,
        number: String(index + 1).padStart(2, "0"),
      })),
    [sections],
  );

  const q = query.trim().toLowerCase();
  const matchIds = useMemo(() => {
    if (!q) return null;
    return new Set(
      numbered
        .filter((s) =>
          [s.heading, ...(Array.isArray(s.body) ? s.body : []), s.note ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
        .map((s) => s.id),
    );
  }, [q, numbered]);

  const tocSections = matchIds
    ? numbered.filter((s) => matchIds.has(s.id))
    : numbered;
  const active = useActiveSection(numbered.map((s) => s.id));
  const activeIndex = Math.max(
    0,
    numbered.findIndex((s) => s.id === active),
  );
  const activeSection = numbered[activeIndex];

  const allOpen = closed.size === 0;

  const openSection = (id) =>
    setClosed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  const toggleSection = (id) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandAll = () => setClosed(new Set());
  const collapseAll = () => setClosed(new Set(numbered.map((s) => s.id)));

  // Searching opens the sections that match, so the result is never hidden.
  useEffect(() => {
    if (!matchIds || matchIds.size === 0) return;
    setClosed((prev) => {
      let changed = false;
      const next = new Set(prev);
      matchIds.forEach((id) => {
        if (next.delete(id)) changed = true;
      });
      return changed ? next : prev;
    });
  }, [matchIds]);

  // Opening a link such as /terms#refunds expands that section first.
  useEffect(() => {
    const ids = new Set(numbered.map((s) => s.id));
    const openFromHash = () => {
      const id = window.location.hash.slice(1);
      if (!id || !ids.has(id)) return;
      openSection(id);
      requestAnimationFrame(() =>
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "auto", block: "start" }),
      );
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [numbered]);

  // The mobile list closes on Escape and when you tap outside it.
  useEffect(() => {
    if (!tocOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setTocOpen(false);
    };
    const onPointerDown = (e) => {
      if (tocRef.current && !tocRef.current.contains(e.target)) {
        setTocOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [tocOpen]);

  const jumpToFirstMatch = (e) => {
    e.preventDefault();
    const first = tocSections[0];
    if (q && first) {
      openSection(first.id);
      requestAnimationFrame(() =>
        document
          .getElementById(first.id)
          ?.scrollIntoView({ behavior: scrollBehavior(), block: "start" }),
      );
    }
  };

  const handlePrint = () => {
    expandAll();
    setTimeout(() => window.print(), 150);
  };

  const availableShortcuts = shortcuts.filter((s) =>
    numbered.some((n) => n.id === s.id),
  );

  return (
    <MotionConfig reducedMotion="user">
      {/* overflow-x-clip (not hidden) so the sticky sidebar and mobile nav keep working */}
      <main className="relative overflow-x-clip bg-background">
        <ScrollProgressBar />
        <BackToTop />

        {/* Decorative background: three soft, static glows (nothing moves) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden print:hidden"
        >
          <div className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-40 top-[28rem] h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute left-1/2 top-[55rem] h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>

        {/* Hero */}
        <section className="relative border-b bg-muted/20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:px-8 lg:py-24">
            <motion.div
              initial="hidden"
              animate="show"
              variants={container}
              className="mx-auto min-w-0 max-w-3xl text-center lg:mx-0 lg:text-left"
            >
              <motion.div variants={item}>
                <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur">
                  <FileCheck2
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  Terms of Service
                </span>
              </motion.div>

              <motion.h1
                variants={item}
                className="mt-6 text-balance text-[clamp(2.25rem,6vw,4.25rem)] font-semibold leading-[1.05] tracking-tight"
              >
                Learn with confidence.
                <span className="mt-2 block text-primary">
                  Know your rights.
                </span>
              </motion.h1>

              <motion.p
                variants={item}
                className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-9 lg:mx-0"
              >
                These Terms of Service explain how Apni University works, what
                you can expect from us, and what we expect from you as part of
                our learning community.
              </motion.p>

              <motion.div
                variants={item}
                className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start"
              >
                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm sm:px-4">
                  <CheckCircle2
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                  Clear &amp; transparent
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm sm:px-4">
                  <LockKeyhole
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  Account focused
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm sm:px-4">
                  <Scale className="size-4 text-primary" aria-hidden="true" />
                  Fair platform rules
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-2 text-sm font-medium shadow-sm sm:px-4">
                  <Clock className="size-4 text-primary" aria-hidden="true" />
                  {readingMinutes} min read
                </div>
              </motion.div>

              {availableShortcuts.length > 0 && (
                <motion.nav
                  variants={item}
                  aria-label="Jump to common sections"
                  className="mt-7 flex flex-wrap items-center justify-center gap-2 lg:justify-start print:hidden"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    Jump to:
                  </span>
                  {availableShortcuts.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={() => openSection(s.id)}
                      className={`inline-flex min-h-10 items-center rounded-full border bg-background px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary motion-reduce:transition-none ${focusRing}`}
                    >
                      {s.label}
                    </a>
                  ))}
                </motion.nav>
              )}

              <motion.div
                variants={item}
                className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground lg:justify-start"
              >
                <span>
                  Effective date:{" "}
                  <span className="font-semibold text-foreground">
                    {effectiveDate}
                  </span>
                </span>

                <span
                  aria-hidden="true"
                  className="hidden size-1 rounded-full bg-muted-foreground/40 sm:inline-block print:hidden"
                />

                <button
                  type="button"
                  onClick={handlePrint}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded font-medium text-primary underline-offset-4 hover:underline print:hidden ${focusRing}`}
                >
                  <Printer className="size-3.5" aria-hidden="true" />
                  Print this page
                </button>
              </motion.div>
            </motion.div>

            {/* Restrained 3D accent, only mounted on large screens */}
            <div className="relative hidden h-72 lg:block xl:h-80 print:hidden">
              <TechScene
                minWidth={1024}
                nodeCount={sections.length}
                className="absolute inset-0"
              />
            </div>
          </div>
        </section>

        {/* Trust highlights */}
        <section aria-label="Our principles" className="relative border-b">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={container}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
            >
              {highlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <motion.div
                    key={highlight.title}
                    variants={item}
                    whileHover={cardHover}
                    className="group min-w-0 rounded-2xl border bg-background p-5 shadow-sm transition-[box-shadow,border-color] hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none sm:p-6"
                  >
                    <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>

                    <h2 className="text-base font-semibold">
                      {highlight.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
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
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-24">
            {/* Mobile and tablet: one tidy dropdown instead of a scrolling strip */}
            <div
              ref={tocRef}
              className="sticky top-16 z-30 -mx-4 mb-8 border-b bg-background/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden print:hidden"
            >
              <button
                type="button"
                onClick={() => setTocOpen((v) => !v)}
                aria-expanded={tocOpen}
                aria-controls="terms-toc-panel"
                className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-lg py-2 text-left text-sm font-semibold ${focusRing}`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <BookOpen
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="shrink-0 tabular-nums text-primary">
                    {activeSection?.number}
                  </span>
                  <span className="truncate">
                    {activeSection?.heading ?? "On this page"}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none ${
                    tocOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {tocOpen && (
                <nav
                  id="terms-toc-panel"
                  aria-label="Terms sections"
                  className="absolute inset-x-0 top-full max-h-[60vh] overflow-y-auto border-b bg-background px-4 py-2 shadow-lg sm:px-6"
                >
                  {tocSections.length === 0 && (
                    <p className="px-2 py-3 text-sm text-muted-foreground">
                      No sections match your search.
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {tocSections.map((section) => {
                      const on = active === section.id;
                      return (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            aria-current={on ? "true" : undefined}
                            onClick={() => {
                              openSection(section.id);
                              setTocOpen(false);
                            }}
                            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors motion-reduce:transition-none ${focusRing} ${
                              on
                                ? "bg-primary/10 font-semibold text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <span className="min-w-6 text-xs font-bold tabular-nums text-primary">
                              {section.number}
                            </span>
                            <span className="leading-5">{section.heading}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              )}
            </div>

            <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-14">
              {/* Sidebar (desktop) */}
              <aside className="hidden space-y-5 lg:sticky lg:top-24 lg:block print:hidden">
                <div className="rounded-2xl border bg-background/90 p-5 shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BookOpen
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <h2 className="text-sm font-semibold">On this page</h2>
                    </div>
                    {numbered.length > 0 && (
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        {String(activeIndex + 1).padStart(2, "0")} /{" "}
                        {String(numbered.length).padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  <nav
                    aria-label="Terms sections"
                    className="mt-4 max-h-[50vh] space-y-1 overflow-y-auto pr-1"
                  >
                    {tocSections.length === 0 && (
                      <p className="px-2.5 py-2 text-sm text-muted-foreground">
                        No sections match your search.
                      </p>
                    )}
                    {tocSections.map((section) => {
                      const on = active === section.id;
                      return (
                        <a
                          key={section.id}
                          href={`#${section.id}`}
                          aria-current={on ? "true" : undefined}
                          onClick={() => openSection(section.id)}
                          className={`group flex items-start gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors motion-reduce:transition-none ${focusRing} ${
                            on
                              ? "bg-primary/10 font-semibold text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <span className="mt-0.5 min-w-5 text-xs font-bold tabular-nums text-primary">
                            {section.number}
                          </span>

                          <span className="leading-5">{section.heading}</span>

                          <ChevronRight
                            aria-hidden="true"
                            className={`ml-auto mt-0.5 size-3.5 shrink-0 transition-opacity motion-reduce:transition-none ${
                              on
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          />
                        </a>
                      );
                    })}
                  </nav>

                  <div className="mt-5 border-t pt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3.5" aria-hidden="true" />
                      About {readingMinutes} min read
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-background/90 p-5 shadow-sm backdrop-blur">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <MessageCircle className="size-4" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold">
                    Something unclear?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Ask us before you buy or enroll.
                  </p>
                  <Link
                    href="/contact"
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
                  >
                    Contact us
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
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
                {/* Search */}
                <motion.div variants={item} className="mb-8 print:hidden">
                  <form
                    role="search"
                    onSubmit={jumpToFirstMatch}
                    className="relative"
                  >
                    <label htmlFor="terms-search" className="sr-only">
                      Search these terms
                    </label>
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      id="terms-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape" && query) {
                          e.preventDefault();
                          setQuery("");
                        }
                      }}
                      placeholder="Search: refund, password, reviews"
                      autoComplete="off"
                      className="h-12 w-full rounded-2xl border bg-background pl-11 pr-11 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </form>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p
                      aria-live="polite"
                      className="min-h-5 min-w-0 text-sm text-muted-foreground"
                    >
                      {q
                        ? matchIds.size > 0
                          ? `${matchIds.size} of ${sections.length} sections match. Press Enter to jump to the first one.`
                          : "No sections match your search."
                        : `${sections.length} sections`}
                    </p>

                    {numbered.length > 0 && (
                      <button
                        type="button"
                        onClick={allOpen ? collapseAll : expandAll}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary motion-reduce:transition-none ${focusRing}`}
                      >
                        {allOpen ? (
                          <>
                            <ChevronsDownUp
                              className="size-4"
                              aria-hidden="true"
                            />
                            Collapse all
                          </>
                        ) : (
                          <>
                            <ChevronsUpDown
                              className="size-4"
                              aria-hidden="true"
                            />
                            Expand all
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* Intro */}
                <motion.div
                  variants={item}
                  className="mb-8 rounded-3xl border border-primary/20 bg-primary/[0.05] p-5 sm:p-8"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                      <GraduationCap className="size-6" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                      <Eyebrow>Welcome to Apni University</Eyebrow>

                      <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                        A simple agreement for a better learning experience.
                      </h2>

                      <p className="mt-3 leading-7 text-muted-foreground sm:text-lg sm:leading-8">
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
                  className="mb-10 rounded-2xl border bg-background p-5 shadow-sm sm:p-7"
                >
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <Sparkles
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    Before you continue
                  </h2>

                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {quickFacts.map((fact) => (
                      <li
                        key={fact}
                        className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium sm:text-base"
                      >
                        <CheckCircle2
                          className="size-4 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* Terms sections: each one opens and closes */}
                <div className="space-y-4 sm:space-y-5">
                  {numbered.map((section) => {
                    const matched = matchIds?.has(section.id);
                    const dimmed = matchIds && !matched;
                    const Icon = sectionIcons[section.id];
                    const isRefund = section.id === "refunds";
                    const open = !closed.has(section.id);
                    const panelId = `panel-${section.id}`;
                    const buttonId = `toggle-${section.id}`;

                    return (
                      <motion.article
                        key={section.id}
                        id={section.id}
                        variants={item}
                        className={`scroll-mt-32 rounded-3xl border shadow-sm transition-[box-shadow,opacity,border-color] duration-300 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none print:break-inside-avoid print:shadow-none ${
                          isRefund
                            ? "border-primary/30 bg-primary/[0.04]"
                            : "bg-background"
                        } ${matched ? "ring-2 ring-primary/30" : ""} ${
                          dimmed ? "opacity-70" : ""
                        }`}
                      >
                        {/* Header: the toggle button and the copy-link button are siblings */}
                        <div className="flex items-start gap-2 p-4 sm:gap-3 sm:p-6">
                          <button
                            type="button"
                            id={buttonId}
                            onClick={() => toggleSection(section.id)}
                            aria-expanded={open}
                            aria-controls={panelId}
                            className={`flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left sm:gap-4 ${focusRing}`}
                          >
                            <span
                              className={`flex size-11 shrink-0 items-center justify-center rounded-xl sm:size-12 ${
                                isRefund
                                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {Icon ? (
                                <Icon className="size-5" aria-hidden="true" />
                              ) : (
                                <span className="text-sm font-black tabular-nums">
                                  {section.number}
                                </span>
                              )}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-semibold uppercase tracking-[0.14em] tabular-nums text-primary">
                                Section {section.number}
                              </span>
                              <span className="mt-0.5 block text-balance break-words text-lg font-semibold leading-snug tracking-tight sm:text-2xl">
                                {section.heading}
                              </span>
                            </span>

                            <span
                              aria-hidden="true"
                              className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary print:hidden"
                            >
                              <ChevronDown
                                className={`size-4 transition-transform duration-300 motion-reduce:transition-none ${
                                  open ? "rotate-180" : ""
                                }`}
                              />
                            </span>
                          </button>

                          <CopyLink id={section.id} heading={section.heading} />
                        </div>

                        {/* Collapsible body: grid-rows animates height without measuring */}
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          className={`grid transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none print:visible print:grid-rows-[1fr] ${
                            open
                              ? "visible grid-rows-[1fr]"
                              : "invisible grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden print:overflow-visible">
                            <div className="px-5 pb-6 sm:px-8 sm:pb-8 sm:pl-[5.25rem]">
                              <div className="space-y-4">
                                {section.body?.map(
                                  (paragraph, paragraphIndex) => (
                                    <p
                                      key={`${section.id}-${paragraphIndex}`}
                                      className="max-w-prose break-words text-base leading-7 text-muted-foreground sm:leading-8"
                                    >
                                      {paragraph}
                                    </p>
                                  ),
                                )}
                              </div>

                              {section.note && (
                                <div className="mt-6 flex gap-3 rounded-xl border border-primary/20 bg-background p-4 text-sm leading-6 text-muted-foreground">
                                  <ShieldCheck
                                    className="mt-0.5 size-4 shrink-0 text-primary"
                                    aria-hidden="true"
                                  />
                                  <p className="min-w-0">
                                    <span className="font-semibold text-foreground">
                                      Note:
                                    </span>{" "}
                                    {section.note}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                {/* FAQ */}
                <motion.section
                  variants={item}
                  aria-labelledby="terms-faq"
                  className="mt-14"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <HelpCircle className="size-5" aria-hidden="true" />
                    </div>
                    <h2
                      id="terms-faq"
                      className="text-xl font-semibold tracking-tight sm:text-2xl"
                    >
                      Frequently asked questions
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <details
                        key={faq.q}
                        className="group rounded-xl border bg-background px-4 shadow-sm transition-colors hover:border-primary/30 open:border-primary/30 motion-reduce:transition-none sm:px-6"
                      >
                        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-md py-4 text-left text-base font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                          <span className="flex min-w-0 items-baseline gap-3">
                            <span
                              aria-hidden="true"
                              className="text-xs font-semibold tabular-nums text-primary"
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0 break-words">{faq.q}</span>
                          </span>
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            <ChevronRight
                              className="size-4 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
                              aria-hidden="true"
                            />
                          </span>
                        </summary>
                        <p className="max-w-2xl pb-5 leading-7 text-muted-foreground sm:pl-8">
                          {faq.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </motion.section>

                {/* Contact CTA */}
                <motion.div
                  variants={item}
                  className="mt-14 overflow-hidden rounded-3xl border bg-foreground text-background print:hidden"
                >
                  <div className="relative p-6 sm:p-10">
                    <div
                      aria-hidden="true"
                      className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/20 blur-3xl"
                    />

                    <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <MessageCircle
                            className="size-4"
                            aria-hidden="true"
                          />
                          Need clarification?
                        </div>

                        <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight sm:text-3xl">
                          We&apos;re here to help you understand the rules.
                        </h2>

                        <p className="mt-3 leading-7 text-background/70 sm:text-lg sm:leading-8">
                          If something in these Terms is unclear, reach out to
                          the Apni University team before making an important
                          decision.
                        </p>
                      </div>

                      <Link
                        href="/contact"
                        className={`group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-5 py-3 font-bold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
                      >
                        Contact us
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </div>
                </motion.div>

                {/* Bottom brand CTA */}
                <motion.div
                  variants={item}
                  className="mt-12 text-center print:hidden"
                >
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GraduationCap className="size-6" aria-hidden="true" />
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold tracking-tight">
                    Ready to keep learning?
                  </h2>

                  <p className="mx-auto mt-2 max-w-xl leading-7 text-muted-foreground">
                    Explore practical courses, build real projects, and continue
                    your journey with Apni University.
                  </p>

                  <Link
                    href="/courses"
                    className={`group mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRing}`}
                  >
                    Explore courses
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
