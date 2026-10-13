"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    detail: "Chat with the support team",
    note: "Mon–Sat, 10am–7pm",
  },
  {
    icon: Phone,
    title: "WhatsApp",
    detail: "+92 300 1234567",
    note: "For urgent account issues",
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
    className: "text-accent bg-accent/15",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "text-success bg-success/10",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketFormOpen, setTicketFormOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((f) => {
      const matchesCategory = category === "All" || f.category === category;
      const matchesQuery = f.question
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <div className="min-h-screen bg-background">
      {/* 3D banner */}
      <div className="relative h-[260px] overflow-hidden sm:h-[320px]">
        <SupportScene className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <LifeBuoy className="h-3.5 w-3.5" />
              We usually reply within a few hours
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Support
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Search common questions, reach the team directly, or track a
              ticket you&apos;ve already opened.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="relative mx-auto max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help..."
            className="pl-9"
          />
        </div>

        {/* Contact options */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {CONTACT_OPTIONS.map((option) => (
            <motion.div key={option.title} variants={item}>
              <Card className="h-full border-border bg-card transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-2 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <option.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {option.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {option.detail}
                  </p>
                  <p className="text-xs text-muted-foreground">{option.note}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          {/* FAQ column */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Frequently Asked Questions
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    category === cat
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {filteredFaqs.map((faq) => (
                <FaqItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaq === faq.id}
                  onToggle={() =>
                    setOpenFaq((prev) => (prev === faq.id ? null : faq.id))
                  }
                />
              ))}

              {filteredFaqs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
                  <Search className="h-7 w-7 text-muted-foreground" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No matching questions. Try opening a ticket instead.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tickets sidebar */}
          <aside>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                My Tickets
              </h2>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setTicketFormOpen((v) => !v)}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                New
              </Button>
            </div>

            <AnimatePresence>
              {ticketFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Card className="mt-3 border-border bg-card">
                    <CardContent className="space-y-3 p-4">
                      <Input
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Subject"
                      />
                      <Textarea
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Describe the issue..."
                        className="min-h-[80px]"
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

            <div className="mt-4 space-y-3">
              {TICKETS.map((ticket) => {
                const meta = STATUS_META[ticket.status];
                return (
                  <Card key={ticket.id} className="border-border bg-card">
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-card-foreground">
                          {ticket.subject}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}
                        >
                          <meta.icon className="h-3.5 w-3.5" />
                          {meta.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {ticket.updated}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <Card className="border-border bg-card">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-sm font-medium text-card-foreground">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
