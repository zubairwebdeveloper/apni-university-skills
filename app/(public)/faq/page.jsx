// app/(public)/faq/page.jsx
import Link from "next/link";
import {
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

import { Badge } from "@/components/ui/badge";
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

        {/* Help topics */}
        <Container className="relative pt-10">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {helpTopics.map(({ icon: Icon, title, text, href, cta }, i) => (
              <li key={title} className="min-w-0">
                <Reveal delay={i * 0.08} className="h-full">
                  <Link
                    href={href}
                    className="group flex  h-full flex-col rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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

        {/* Explorer */}
        <Container className="relative max-w-3xl py-10 sm:py-12">
          <Reveal className="mb-6 text-center">
            <Badge variant="secondary" className="mb-3">
              Search the answers
            </Badge>
            <h2 className="text-2xl sm:text-3xl">Find your answer fast</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <FaqExplorer faqs={faqs} />
          </Reveal>
        </Container>

        {/* Quick facts */}
        <section
          aria-labelledby="facts-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 id="facts-title" className="text-2xl sm:text-3xl">
                The short version
              </h2>
              <p className="mt-3 text-muted-foreground">
                Four things people ask about most.
              </p>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickFacts.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border bg-card p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Get help */}
        <section
          aria-labelledby="help-title"
          className="border-t py-12 sm:py-16"
        >
          <Container className="max-w-4xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Need more help?
              </Badge>
              <h2 id="help-title" className="text-2xl sm:text-3xl">
                Getting help takes three steps
              </h2>
            </Reveal>
            <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {helpSteps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.1} className="h-full">
                    <div className="relative h-full rounded-2xl border bg-card p-5 text-center">
                      <span className="absolute right-4 top-3 font-serif text-4xl font-semibold text-primary/10">
                        {i + 1}
                      </span>
                      <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
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

        {/* Contact banner */}
        <section className="border-t bg-muted/20 py-12 sm:py-14">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border bg-card p-8 sm:p-10">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-highlight"
                />
                <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <FiMail aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl">
                        Still have a question?
                      </h2>
                      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                        Send us a message and we will get back to you. You can
                        also read our Terms for refund and payment details.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className={buttonVariants({ variant: "default" })}
                    >
                      Contact us
                    </Link>
                    <Link
                      href="/terms"
                      className={buttonVariants({ variant: "outline" })}
                    >
                      Read Terms
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
