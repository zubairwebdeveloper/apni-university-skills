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
  FiHelpCircle,
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

import { cn } from "@/lib/utils";

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

const eyebrow =
  "mb-3 inline-block text-xs font-semibold uppercase tracking-wider text-primary";
const sectionTitle =
  "text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl";
const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15";
const inlineLink =
  "rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {chips.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm backdrop-blur"
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
          className="pointer-events-none absolute -top-24 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/15"
        />

        {/* Self-service shortcuts: one bordered strip, divided into cells */}
        <Container className="relative pt-10 sm:pt-12">
          <Reveal>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              What do you need help with?
            </h2>
            <ul className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              {topics.map(({ icon: Icon, title, text, href, cta }) => (
                <li key={title} className="min-w-0 bg-card">
                  <Link
                    href={href}
                    className="group flex h-full flex-col p-5 outline-none transition-colors duration-200 hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring motion-reduce:transition-none sm:p-6"
                  >
                    <span
                      className={cn(
                        iconTile,
                        "size-11 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary motion-reduce:transition-none",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {text}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      {cta}
                      <FiArrowRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>

        {/* Form (the main job of this page) and sidebar */}
        <Container className="relative grid items-start gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <Reveal className="min-w-0">
            <section
              aria-labelledby="form-title"
              className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10"
            >
              <div className="flex items-start gap-4">
                <span className={cn(iconTile, "hidden size-12 sm:grid")}>
                  <FiMessageSquare aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <h2
                    id="form-title"
                    className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
                  >
                    Send us a message
                  </h2>
                  <p className="mt-2 text-pretty text-muted-foreground">
                    The more detail you share, the faster we can help.
                  </p>
                </div>
              </div>
              <div className="mt-8 border-t border-border pt-8">
                <ContactForm />
              </div>
            </section>
          </Reveal>

          <aside
            aria-label="Contact details and privacy"
            className="space-y-8 lg:sticky lg:top-24"
          >
            <div>
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-foreground">
                <FiHelpCircle
                  aria-hidden="true"
                  className="size-5 text-primary"
                />
                Before you write
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
              <div className="border-t border-border pt-8">
                <div className="flex items-start gap-3">
                  <span className={cn(iconTile, "size-10")}>
                    <FiMail aria-hidden="true" className="size-[18px]" />
                  </span>
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

            <div className="border-t border-border pt-8">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-foreground">
                <FiShield aria-hidden="true" className="size-5 text-primary" />
                Your privacy
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We use your message only to reply to you. Never send your card
                number or password in a message. We will never ask for them.
              </p>
            </div>
          </aside>
        </Container>

        {/* What to include: three columns, no cards */}
        <section
          aria-labelledby="include-title"
          className="border-t border-border bg-muted/30 py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <span className={eyebrow}>Write a better message</span>
            <h2 id="include-title" className={cn(sectionTitle, "max-w-xl")}>
              What to include in your message
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
              A few details at the start save a lot of back and forth.
            </p>

            <ul className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
              {includeGuide.map(({ icon: Icon, title, points }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="h-full border-t-2 border-primary pt-5">
                      <h3 className="flex items-center gap-2.5 font-sans text-base font-semibold text-foreground sm:text-lg">
                        <Icon
                          aria-hidden="true"
                          className="size-5 text-primary"
                        />
                        {title}
                      </h3>
                      <ul className="mt-4 space-y-3 text-sm sm:text-base">
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
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* What happens next: a true sequence */}
        <section
          aria-labelledby="next-title"
          className="border-t border-border py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <span className={eyebrow}>What happens next</span>
            <h2 id="next-title" className={cn(sectionTitle, "max-w-xl")}>
              From your message to our reply
            </h2>

            <Reveal>
              <ol className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
                {/* Connecting line (desktop only) */}
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                />
                {nextSteps.map(({ icon: Icon, title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 sm:block sm:pr-4"
                  >
                    {/* Connecting line (mobile only) */}
                    {i < nextSteps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-10 left-5 top-10 w-px bg-border sm:hidden"
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 grid size-10 shrink-0 place-items-center rounded-full shadow-sm",
                        i === nextSteps.length - 1
                          ? "bg-highlight text-foreground"
                          : "bg-primary text-primary-foreground",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <div className="sm:mt-5">
                      <h3 className="font-sans text-base font-semibold text-foreground sm:text-lg">
                        <span className="sr-only">Step {i + 1}: </span>
                        {title}
                      </h3>
                      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
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
          className="border-t border-border bg-muted/30 py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <span className={eyebrow}>FAQ</span>
                  <h2 id="faq-title" className={sectionTitle}>
                    Before you contact us
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    More answers are on the{" "}
                    <Link href="/faq" className={inlineLink}>
                      FAQ page
                    </Link>{" "}
                    and in our{" "}
                    <Link href="/terms" className={inlineLink}>
                      Terms
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border border-y border-border lg:col-span-8">
                {faqs.map(({ q, a }) => (
                  <details key={q} className="group py-1">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3 text-left text-base font-medium text-foreground outline-none transition-colors duration-200 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                      {q}
                      <FiChevronDown
                        aria-hidden="true"
                        className="size-4 shrink-0 text-primary transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                      />
                    </summary>
                    <p className="max-w-2xl pb-4 leading-relaxed text-muted-foreground">
                      {a}
                    </p>
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
