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
import { cn } from "@/lib/utils";

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

const eyebrow =
  "mb-3 inline-block text-xs font-semibold uppercase tracking-wider text-primary";
const sectionTitle =
  "text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl";
const iconTile =
  "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15";

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

        {/* Search and answers come first: this is why people are here */}
        <Container className="relative max-w-3xl pb-12 pt-10 sm:pb-16 sm:pt-14">
          <Reveal>
            <span className={eyebrow}>Search the FAQ</span>
            <h2 className={sectionTitle}>Find your answer fast</h2>
            <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
              Search by keyword or browse the questions below.
            </p>
          </Reveal>
          <div className="mt-6">
            <FaqExplorer faqs={faqs} />
          </div>
        </Container>

        {/* Other places to go: one bordered strip, divided into cells */}
        <section
          aria-labelledby="topics-title"
          className="border-t border-border bg-muted/30 py-14 sm:py-16 lg:py-20"
        >
          <Container>
            <Reveal>
              <span className={eyebrow}>More help</span>
              <h2
                id="topics-title"
                className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                Looking for something else?
              </h2>
              <ul className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                {helpTopics.map(({ icon: Icon, title, text, href, cta }) => (
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
        </section>

        {/* Quick facts: open columns */}
        <section
          aria-labelledby="facts-title"
          className="border-t border-border py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <span className={eyebrow}>Quick facts</span>
            <h2 id="facts-title" className={cn(sectionTitle, "max-w-xl")}>
              The short version
            </h2>
            <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
              Four things people ask about most.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {quickFacts.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="h-full border-t-2 border-primary pt-5">
                      <span className={cn(iconTile, "size-11")}>
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <h3 className="mt-4 font-sans text-base font-semibold text-foreground sm:text-lg">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Get help: a true sequence */}
        <section
          aria-labelledby="help-title"
          className="border-t border-border bg-muted/30 py-14 sm:py-20 lg:py-24"
        >
          <Container>
            <span className={eyebrow}>How to get help</span>
            <h2 id="help-title" className={cn(sectionTitle, "max-w-xl")}>
              Getting help takes three steps
            </h2>

            <Reveal>
              <ol className="relative mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
                {/* Connecting line (desktop only) */}
                <span
                  aria-hidden="true"
                  className="absolute left-5 right-5 top-5 hidden h-px bg-border sm:block"
                />
                {helpSteps.map(({ icon: Icon, title, text }, i) => (
                  <li
                    key={title}
                    className="relative flex gap-4 sm:block sm:pr-4"
                  >
                    {/* Connecting line (mobile only) */}
                    {i < helpSteps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-10 left-5 top-10 w-px bg-border sm:hidden"
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 grid size-10 shrink-0 place-items-center rounded-full shadow-sm",
                        i === helpSteps.length - 1
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

        {/* Contact banner */}
        <section className="border-t border-border py-14 sm:py-16">
          <Container>
            <Reveal>
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
                <div className="flex items-start gap-4">
                  <span className={cn(iconTile, "size-12")}>
                    <FiMail aria-hidden="true" className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Still have a question?
                    </h2>
                    <p className="mt-2 max-w-xl text-pretty text-muted-foreground">
                      Send us a message and we will get back to you. You can
                      also read our Terms for refund and payment details.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
                  <Link
                    href="/contact"
                    className={cn(
                      buttonVariants({ variant: "default", size: "lg" }),
                      "group",
                    )}
                  >
                    Contact us
                    <FiArrowRight
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </Link>
                  <Link
                    href="/terms"
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                    })}
                  >
                    Read Terms
                  </Link>
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
