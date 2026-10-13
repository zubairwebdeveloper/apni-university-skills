// app/(public)/contact/page.jsx

import Link from "next/link";
import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiChevronDown,
  FiCompass,
  FiCreditCard,
  FiInbox,
  FiMail,
  FiMessageSquare,
  FiSend,
  FiShield,
  FiUser,
  FiZap,
} from "react-icons/fi";

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
        <ul className="mt-5 flex flex-wrap gap-2">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
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

        {/* Self-service shortcuts: one bordered strip, divided into cells */}
        <Container className="relative pt-10 sm:pt-12">
          <h2 className="text-xl sm:text-2xl">What do you need help with?</h2>
          <ul className="mt-5 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {topics.map(({ icon: Icon, title, text, href, cta }, i) => (
              <li
                key={title}
                className={`min-w-0 ${
                  i > 1 ? "sm:border-t sm:border-border lg:border-t-0" : ""
                } ${i % 2 === 1 ? "sm:border-l sm:border-border lg:border-l-0" : ""}`}
              >
                <Link
                  href={href}
                  className="group flex h-full flex-col p-5 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                  <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">
                    {text}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {cta}
                    <FiArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>

        {/* Form (the main job of this page) and sidebar */}
        <Container className="relative grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <Reveal className="min-w-0">
            <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl sm:text-3xl">Send us a message</h2>
              <p className="mt-2 text-muted-foreground">
                The more detail you share, the faster we can help.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </Reveal>

          <aside className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="font-sans text-lg font-semibold text-foreground">
                Before you write
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Many answers are on our FAQ page. For payment questions, include
                the email on your account and the course name.
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

            {contactEmail && (
              <div className="border-t pt-8">
                <div className="flex items-start gap-3">
                  <FiMail
                    aria-hidden="true"
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      You can also email
                    </p>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="mt-0.5 block break-all font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {contactEmail}
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-8">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-foreground">
                <FiShield aria-hidden="true" className="size-5 text-primary" />
                Your privacy
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We use your message only to reply to you. Never send your card
                number or password in a message. We will never ask for them.
              </p>
            </div>
          </aside>
        </Container>

        {/* What to include: three columns, no cards */}
        <section
          aria-labelledby="include-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <h2
              id="include-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              What to include in your message
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              A few details at the start save a lot of back and forth.
            </p>

            <ul className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {includeGuide.map(({ icon: Icon, title, points }) => (
                <li
                  key={title}
                  className="min-w-0 border-t-2 border-primary pt-5"
                >
                  <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-foreground">
                    <Icon aria-hidden="true" className="size-5 text-primary" />
                    {title}
                  </h3>
                  <ul className="mt-4 space-y-2.5 text-sm sm:text-base">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2.5">
                        <FiCheckCircle
                          aria-hidden="true"
                          className="mt-1 size-4 shrink-0 text-primary"
                        />
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* What happens next: a true sequence */}
        <section
          aria-labelledby="next-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <h2
              id="next-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              From your message to our reply
            </h2>

            <Reveal>
              <ol className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                />
                {nextSteps.map(({ icon: Icon, title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 sm:block sm:pr-4"
                  >
                    <span
                      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ${
                        i === nextSteps.length - 1
                          ? "bg-highlight text-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="sm:mt-5">
                      <h3 className="font-sans text-base font-semibold text-foreground">
                        <span className="sr-only">Step {i + 1}: </span>
                        {title}
                      </h3>
                      <p className="mt-1 max-w-xs text-sm text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </Container>
        </section>

        {/* FAQ: heading left, accordion right */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <h2
                  id="faq-title"
                  className="text-balance text-3xl sm:text-4xl"
                >
                  Before you contact us
                </h2>
                <p className="mt-4 text-sm text-muted-foreground sm:text-base">
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
              </div>

              <div className="divide-y divide-border border-y border-border lg:col-span-8">
                {faqs.map(({ q, a }) => (
                  <details key={q} className="group py-1">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 text-left text-base font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="max-w-2xl pb-4 text-muted-foreground">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
