// app/(public)/faq/page.jsx
import Link from "next/link";
import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiCreditCard,
  FiLock,
  FiMail,
  FiMessageSquare,
  FiSearch,
  FiSend,
  FiShield,
  FiUser,
  FiZap,
} from "react-icons/fi";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTASection } from "@/components/public/CTASection";
import { FaqExplorer } from "@/components/public/FaqExplorer";
import { Reveal } from "@/components/public/PricingMotion";
import { faqs } from "@/config/faq";

export const metadata = {
  title: "FAQ",
  description:
    "Answers about courses, enrollment, payments, certificates, and reviews at Apni University.",
  alternates: { canonical: "/faq" },
};

const chips = [
  { icon: FiZap, text: "Quick answers" },
  { icon: FiShield, text: "Clear and honest" },
  { icon: FiMessageSquare, text: "Help when you need it" },
];

const helpTopics = [
  {
    icon: FiBookOpen,
    title: "Courses",
    text: "Find courses, previews and how to start learning.",
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
    icon: FiAward,
    title: "Certificates",
    text: "Finish the lessons and earn your certificate.",
    href: "/courses",
    cta: "Start a course",
  },
  {
    icon: FiUser,
    title: "Your account",
    text: "Sign up free and keep your progress safe.",
    href: "/register",
    cta: "Create account",
  },
];

const quickFacts = [
  { icon: FiZap, title: "No subscriptions", text: "Pay once per paid course." },
  {
    icon: FiLock,
    title: "Secure payments",
    text: "Handled by Stripe Checkout.",
  },
  { icon: FiBookOpen, title: "Free previews", text: "Try before you buy." },
  { icon: FiCheckCircle, title: "Certificates", text: "On course completion." },
];

const helpSteps = [
  {
    icon: FiSearch,
    title: "Search first",
    text: "Type a keyword above. Most answers are one search away.",
  },
  {
    icon: FiSend,
    title: "Write to us",
    text: "Cannot find it? Send a message with as much detail as you can.",
  },
  {
    icon: FiCheckCircle,
    title: "Get an answer",
    text: "We read every message and reply as soon as we can.",
  },
];

export default function FAQPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />

      <PageHeader
        title="Frequently asked questions"
        description="Quick answers about courses, payments, certificates and your account."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "FAQ" }]}
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

        {/* Search and answers come first: this is why people are here */}
        <Container className="relative max-w-3xl pb-12 pt-10 sm:pb-16 sm:pt-14">
          <h2 className="text-balance text-3xl sm:text-4xl">
            Find your answer fast
          </h2>
          <div className="mt-6">
            <FaqExplorer faqs={faqs} />
          </div>
        </Container>

        {/* Other places to go: one bordered strip, divided into cells */}
        <section
          aria-labelledby="topics-title"
          className="border-t bg-muted/30 py-14 sm:py-16"
        >
          <Container>
            <h2 id="topics-title" className="text-2xl sm:text-3xl">
              Looking for something else?
            </h2>
            <ul className="mt-6 grid grid-cols-1 divide-y divide-border overflow-hidden rounded-2xl border bg-card sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
              {helpTopics.map(({ icon: Icon, title, text, href, cta }, i) => (
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
        </section>

        {/* Quick facts: open columns */}
        <section
          aria-labelledby="facts-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <h2
              id="facts-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              The short version
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Four things people ask about most.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {quickFacts.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="min-w-0 border-t-2 border-primary pt-5"
                >
                  <Icon aria-hidden="true" className="size-6 text-primary" />
                  <h3 className="mt-3 font-sans text-base font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Get help: a true sequence */}
        <section
          aria-labelledby="help-title"
          className="border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <h2
              id="help-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              Getting help takes three steps
            </h2>

            <Reveal>
              <ol className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                />
                {helpSteps.map(({ icon: Icon, title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 sm:block sm:pr-4"
                  >
                    <span
                      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ${
                        i === helpSteps.length - 1
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

        {/* Contact banner */}
        <section className="border-t py-14 sm:py-16">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="flex items-start gap-4">
                <FiMail
                  aria-hidden="true"
                  className="mt-1 size-7 shrink-0 text-primary"
                />
                <div>
                  <h2 className="text-balance text-2xl sm:text-3xl">
                    Still have a question?
                  </h2>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    Send us a message and we will get back to you. You can also
                    read our Terms for refund and payment details.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 md:shrink-0">
                <Link
                  href="/contact"
                  className={buttonVariants({ variant: "default", size: "lg" })}
                >
                  Contact us
                </Link>
                <Link
                  href="/terms"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Read Terms
                </Link>
              </div>
            </div>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
