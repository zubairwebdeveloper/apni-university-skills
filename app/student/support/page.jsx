"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Mail,
  MessageCircle,
  Phone,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  LifeBuoy,
  Ticket,
  X,
} from "lucide-react";
import SupportScene from "@/components/three/scene-support";

// ---------------------------------------------------------------------------
// TEMP DATA — replace with real FAQ content and ticket data from Firestore
// (e.g. an `faqs` collection and a `supportTickets` collection scoped to
// the signed-in student) once this page is wired into the existing data
// layer and support backend.
// ---------------------------------------------------------------------------
const CONTACT_OPTIONS = [
  {
    icon: Mail,
    title: "Email Support",
    detail: "support@apniuniversity.com",
    note: "Typically replies within 24 hours",
    tone: "bg-primary/10 text-primary ring-primary/20",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    detail: "Chat with the support team",
    note: "Mon–Sat, 10am–7pm",
    tone: "bg-violet-500/10 text-violet-600 ring-violet-500/25 dark:text-violet-400",
  },
  {
    icon: Phone,
    title: "WhatsApp",
    detail: "+92 300 1234567",
    note: "For urgent account issues",
    tone: "bg-yellow-400/15 text-yellow-700 ring-yellow-400/35 dark:text-yellow-400",
  },
];

const FAQ_CATEGORIES = [
  "All",
  "Account",
  "Courses",
  "Payments",
  "Certificates",
  "Technical",
];

const FAQS = [
  {
    id: "f1",
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "Go to the login page and select 'Forgot password'. You'll receive a reset link at the email tied to your account. If you don't see it within a few minutes, check your spam folder.",
  },
  {
    id: "f2",
    category: "Courses",
    question: "Can I switch learning paths after enrolling?",
    answer:
      "Yes. Open the course page and select 'Switch path' from the options menu. Your progress on shared modules carries over automatically.",
  },
  {
    id: "f3",
    category: "Payments",
    question: "Do you offer refunds?",
    answer:
      "Refunds are available within 7 days of purchase if you haven't completed more than 20% of the course. Request one from your billing settings.",
  },
  {
    id: "f4",
    category: "Certificates",
    question: "Why hasn't my certificate been issued yet?",
    answer:
      "Certificates are generated once all required modules and the final assessment are marked complete. This usually takes under an hour — if it's been longer, open a ticket below.",
  },
  {
    id: "f5",
    category: "Technical",
    question: "Videos keep buffering — what can I do?",
    answer:
      "Try lowering the playback quality from the video settings, or switch networks if possible. If the issue persists across devices, let us know and include your city and ISP.",
  },
  {
    id: "f6",
    category: "Account",
    question: "Can I change the email linked to my account?",
    answer:
      "Yes, from Account Settings → Email. You'll need to verify the new address before it becomes active.",
  },
];

const TICKETS = [
  {
    id: "t1",
    subject: "Certificate not generated after course completion",
    status: "open",
    updated: "2h ago",
  },
  {
    id: "t2",
    subject: "Payment deducted twice for Cloud Computing path",
    status: "pending",
    updated: "1d ago",
  },
  {
    id: "t3",
    subject: "Unable to access recorded live session",
    status: "resolved",
    updated: "5d ago",
  },
];

const STATUS_META = {
  open: {
    label: "Open",
    icon: AlertCircle,
    className: "text-destructive bg-destructive/10",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-400/15 text-yellow-700 dark:text-yellow-400",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "text-success bg-success/10",
  },
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketFormOpen, setTicketFormOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const reduceMotion = useReducedMotion();

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((f) => {
      const matchesCategory = category === "All" || f.category === category;
      const matchesQuery = f.question
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  // Category counts respect the current search so the numbers match the list
  const categoryCounts = useMemo(() => {
    const base = FAQS.filter((f) =>
      f.question.toLowerCase().includes(query.toLowerCase()),
    );
    const counts = { All: base.length };
    base.forEach((f) => {
      counts[f.category] = (counts[f.category] ?? 0) + 1;
    });
    return counts;
  }, [query]);

  const ticketCounts = useMemo(() => {
    const counts = { open: 0, pending: 0, resolved: 0 };
    TICKETS.forEach((t) => {
      counts[t.status] += 1;
    });
    return counts;
  }, []);

  const hasFilters = category !== "All" || query.trim() !== "";

  function clearFilters() {
    setCategory("All");
    setQuery("");
  }

  const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.05 } },
  };
  const itemVariants = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.01 : 0.35, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* 3D banner */}
      <header className="relative h-[280px] overflow-hidden sm:h-[340px]">
        <SupportScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/50 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <LifeBuoy className="h-3.5 w-3.5" aria-hidden="true" />
              We usually reply within a few hours
            </span>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Support
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Search common questions, reach the team directly, or track a
              ticket you&apos;ve already opened.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="relative mx-auto max-w-xl">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search frequently asked questions"
            placeholder="Search for help..."
            className="h-12 pl-10 text-base"
          />
        </div>

        {/* Contact options */}
        <motion.ul
          aria-label="Contact options"
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {CONTACT_OPTIONS.map((option) => (
            <motion.li key={option.title} variants={itemVariants}>
              <Card className="h-full border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-2 p-5">
                  <span
                    className={`grid size-11 place-items-center rounded-lg ring-1 ring-inset ${option.tone}`}
                  >
                    <option.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h2 className="mt-1 text-sm font-semibold text-card-foreground">
                    {option.title}
                  </h2>
                  <p className="break-words text-sm font-medium text-card-foreground">
                    {option.detail}
                  </p>
                  <p className="text-xs text-muted-foreground">{option.note}</p>
                </CardContent>
              </Card>
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          {/* FAQ column */}
          <section className="min-w-0" aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="text-xl font-semibold tracking-tight text-foreground"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick answers to the questions students ask most.
            </p>

            <div
              role="group"
              aria-label="Filter questions by category"
              className="mt-5 flex flex-wrap gap-2"
            >
              {FAQ_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    aria-pressed={active}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${focusRing} ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {cat}
                    <span
                      className={`tabular-nums ${
                        active
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground/80"
                      }`}
                    >
                      {categoryCounts[cat] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              aria-live="polite"
              className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground"
            >
              <p>
                <span className="font-medium tabular-nums text-foreground">
                  {filteredFaqs.length}
                </span>{" "}
                {filteredFaqs.length === 1 ? "question" : "questions"}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-500/10 dark:text-violet-400 ${focusRing}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {filteredFaqs.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaq === faq.id}
                  reduceMotion={reduceMotion}
                  onToggle={() =>
                    setOpenFaq((prev) => (prev === faq.id ? null : faq.id))
                  }
                />
              ))}

              {filteredFaqs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
                  <Search
                    className="h-7 w-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    No matching questions
                  </p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Try a different keyword, or open a ticket and the team will
                    help directly.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {hasFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setTicketFormOpen(true)}>
                      Open a ticket
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Tickets sidebar */}
          <aside
            aria-labelledby="tickets-heading"
            className="lg:sticky lg:top-6 lg:self-start"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="tickets-heading"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  My Tickets
                </h2>
                <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                  {ticketCounts.open} open, {ticketCounts.pending} pending,{" "}
                  {ticketCounts.resolved} resolved
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="min-h-9 gap-1.5"
                aria-expanded={ticketFormOpen}
                aria-controls="new-ticket-form"
                onClick={() => setTicketFormOpen((v) => !v)}
              >
                <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                New
              </Button>
            </div>

            <AnimatePresence initial={false}>
              {ticketFormOpen && (
                <motion.div
                  id="new-ticket-form"
                  initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
                  className="overflow-hidden"
                >
                  <Card className="mt-4 border-border bg-card shadow-sm">
                    <CardContent className="space-y-3 p-4">
                      <Input
                        autoFocus
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        aria-label="Ticket subject"
                        placeholder="Subject"
                      />
                      <Textarea
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        aria-label="Describe the issue"
                        placeholder="Describe the issue..."
                        className="min-h-[96px] resize-y"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTicketFormOpen(false);
                            setTicketSubject("");
                            setTicketMessage("");
                          }}
                        >
                          Cancel
                        </Button>
                        {/* Wire this up to the real ticket-creation mutation */}
                        <Button
                          size="sm"
                          disabled={
                            !ticketSubject.trim() || !ticketMessage.trim()
                          }
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Submit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {TICKETS.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {TICKETS.map((ticket) => {
                  const meta = STATUS_META[ticket.status];
                  return (
                    <li key={ticket.id}>
                      <Card className="border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                        <CardContent className="space-y-3 p-4">
                          <p className="text-pretty text-sm font-medium leading-snug text-card-foreground">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                            >
                              <meta.icon
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                              {meta.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Updated {ticket.updated}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-border px-5 py-10 text-center">
                <Ticket
                  className="mx-auto h-7 w-7 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-semibold text-foreground">
                  No tickets yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open a ticket and you can track its status here.
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function FaqItem({ faq, isOpen, onToggle, reduceMotion }) {
  const panelId = `faq-panel-${faq.id}`;
  const buttonId = `faq-button-${faq.id}`;

  return (
    <Card
      className={`border-border bg-card transition-colors ${
        isOpen ? "border-violet-500/30" : ""
      }`}
    >
      <h3>
        <button
          id={buttonId}
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl p-4 text-left ${focusRing}`}
        >
          <span className="text-sm font-medium leading-snug text-card-foreground sm:text-base">
            {faq.question}
          </span>
          <motion.span
            aria-hidden="true"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
            className="shrink-0 text-muted-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.25 }}
            className="overflow-hidden"
          >
            <CardContent className="max-w-prose pt-0 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
