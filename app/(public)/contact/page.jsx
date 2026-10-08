// app/(public)/contact/page.jsx

import Link from "next/link";
import {
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiCompass,
  FiCreditCard,
  FiHelpCircle,
  FiInbox,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiShield,
  FiUser,
  FiZap,
} from "react-icons/fi";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/public/ContactForm";
import { CTASection } from "@/components/public/CTASection";
import { Reveal } from "@/components/public/PricingMotion";

import { settingsService } from "@/services/settingsService";

export const metadata = {
  title: "Contact",
  description:
    "Questions about courses, payments, or careers? Send us a message.",
  alternates: {
    canonical: "/contact",
  },
};

const chips = [
  { icon: FiMessageSquare, text: "We read every message" },
  { icon: FiCreditCard, text: "Payment help" },
  { icon: FiCompass, text: "Course and career questions" },
];

const topics = [
  {
    icon: FiBookOpen,
    title: "Courses",
    text: "Questions about a course, its lessons or previews.",
    href: "/courses",
    cta: "Browse courses",
  },
  {
    icon: FiCreditCard,
    title: "Payments",
    text: "Prices, one-time payments and refund terms.",
    href: "/pricing",
    cta: "See pricing",
  },
  {
    icon: FiBriefcase,
    title: "Careers and jobs",
    text: "Roadmaps, skills and job listings.",
    href: "/careers",
    cta: "Explore careers",
  },
  {
    icon: FiUser,
    title: "Your account",
    text: "Sign in, progress and certificates.",
    href: "/faq",
    cta: "Read the FAQ",
  },
];

const includeGuide = [
  {
    icon: FiCreditCard,
    title: "For payment questions",
    points: [
      "The email on your account",
      "The name of the course",
      "What happened and when",
    ],
  },
  {
    icon: FiBookOpen,
    title: "For course questions",
    points: [
      "The course name",
      "The lesson where you are stuck",
      "What you expected and what you saw",
    ],
  },
  {
    icon: FiZap,
    title: "For technical problems",
    points: [
      "The page you were on",
      "Your device and browser",
      "Any message shown on screen",
    ],
  },
];

const nextSteps = [
  {
    icon: FiSend,
    title: "You send a message",
    text: "Fill in the form with a clear subject and the details you have.",
  },
  {
    icon: FiInbox,
    title: "We read it",
    text: "Every message is read by a person, not just filed away.",
  },
  {
    icon: FiCheckCircle,
    title: "You get a reply",
    text: "We reply by email as soon as we can, so please check your spam folder too.",
  },
];

const faqs = [
  {
    q: "How will you reply?",
    a: "We reply to the email address you enter in the form, so please double-check it before you send.",
  },
  {
    q: "I have a payment problem. What should I include?",
    a: "Write the email on your account, the course name and what happened. This helps us find your order faster.",
  },
  {
    q: "Can I ask about a refund here?",
    a: "Yes. Refund conditions are described in our Terms, so please read them first and then send us the details of your case.",
  },
  {
    q: "Is it better to check the FAQ first?",
    a: "Often, yes. Many common questions about courses, payments and certificates are answered there in a few seconds.",
  },
];

export default async function ContactPage() {
  const s = await settingsService.getPublic();

  const contactEmail = s?.contactEmail || "";

  return (
    <>
      <PageHeader
        title="Contact us"
        description="Questions about courses, payments, or careers? We read every message."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      >
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-sm font-medium backdrop-blur"
            >
              <Icon aria-hidden="true" className="size-4 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className="relative overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        {/* Topic cards */}
        <Container className="relative pt-10">
          <Reveal className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              What do you need help with?
            </p>
          </Reveal>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map(({ icon: Icon, title, text, href, cta }, i) => (
              <li key={title} className="min-w-0">
                <Reveal delay={i * 0.08} className="h-full">
                  <Link
                    href={href}
                    className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h2 className="mt-4 font-sans text-base font-semibold">
                      {title}
                    </h2>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">
                      {text}
                    </p>
                    <span className="mt-3 text-sm font-medium text-primary">
                      {cta} <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>

        {/* Form and sidebar */}
        <Container className="relative grid items-start gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <Reveal className="min-w-0">
            <div className="relative overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
              />
              <div className="mb-6 flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FiSend aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl">Send us a message</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The more detail you share, the faster we can help.
                  </p>
                </div>
              </div>
              <ContactForm />
            </div>
          </Reveal>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Reveal delay={0.1}>
              <div className="rounded-2xl border bg-card p-5">
                <h2 className="flex items-center gap-2 font-sans text-lg font-semibold">
                  <FiHelpCircle
                    aria-hidden="true"
                    className="size-5 text-primary"
                  />
                  Before you write
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Many answers are on our FAQ page. For payment questions,
                  include the email on your account and the course name.
                </p>
                <Link
                  href="/faq"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "mt-4",
                  })}
                >
                  Read the FAQ
                </Link>
              </div>
            </Reveal>

            {contactEmail && (
              <Reveal delay={0.18}>
                <div className="group rounded-2xl border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none">
                  <div className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <FiMail aria-hidden="true" className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        You can also email
                      </p>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="mt-0.5 block break-all font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.26}>
              <div className="rounded-2xl border bg-card p-5">
                <h2 className="flex items-center gap-2 font-sans text-lg font-semibold">
                  <FiShield
                    aria-hidden="true"
                    className="size-5 text-primary"
                  />
                  Your privacy
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We use your message only to reply to you. Never send your card
                  number or password in a message. We will never ask for them.
                </p>
              </div>
            </Reveal>
          </aside>
        </Container>

        {/* What to include */}
        <section
          aria-labelledby="include-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Get a faster answer
              </Badge>
              <h2 id="include-title" className="text-2xl sm:text-3xl">
                What to include in your message
              </h2>
              <p className="mt-3 text-muted-foreground">
                A few details at the start save a lot of back and forth.
              </p>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {includeGuide.map(({ icon: Icon, title, points }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="group h-full rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold">
                        {title}
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm">
                        {points.map((p) => (
                          <li key={p} className="flex gap-2">
                            <FiCheckCircle
                              aria-hidden="true"
                              className="mt-0.5 size-4 shrink-0 text-primary"
                            />
                            <span className="text-muted-foreground">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* What happens next */}
        <section
          aria-labelledby="next-title"
          className="border-t py-12 sm:py-16"
        >
          <Container className="max-w-4xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                What happens next
              </Badge>
              <h2 id="next-title" className="text-2xl sm:text-3xl">
                From your message to our reply
              </h2>
            </Reveal>
            <ol className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <span
                aria-hidden="true"
                className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block"
              />
              {nextSteps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="relative h-full rounded-2xl border bg-card p-5 text-center">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-3 font-sans text-base font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* FAQ */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className="text-2xl sm:text-3xl">
                Before you contact us
              </h2>
            </Reveal>
            <div className="mt-8 space-y-3">
              {faqs.map(({ q, a }, i) => (
                <Reveal key={q} delay={i * 0.06}>
                  <details className="group rounded-xl border bg-card px-4 py-3 open:shadow-md">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">{a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <p className="mt-8 text-center text-sm text-muted-foreground">
                More answers are on the{" "}
                <Link
                  href="/faq"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  FAQ page
                </Link>{" "}
                and in our{" "}
                <Link
                  href="/terms"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Terms
                </Link>
                .
              </p>
            </Reveal>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
