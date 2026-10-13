// app/(public)/pricing/page.jsx

import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiCreditCard,
  FiGift,
  FiLock,
  FiMinus,
  FiPlay,
  FiRefreshCw,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { JsonLd } from "@/components/shared/JsonLd";
import { CTASection } from "@/components/public/CTASection";
import { PricingGlows } from "@/components/public/PricingMotion";
import { TiltCard } from "@/components/public/TiltCard";
import { BudgetPlanner } from "@/components/public/PricingTools";
import {
  PricingChips,
  PricingFlow,
} from "@/components/public/PricingClientSections";

export const metadata = {
  title: "Pricing",
  description:
    "Pay per course. Many courses are free, and paid courses are a one-time payment through secure Stripe Checkout.",
  alternates: { canonical: "/pricing" },
};

const tiers = [
  {
    name: "Free courses",
    icon: FiGift,
    badge: "Start here",
    price: "Free",
    text: "Enroll with a free account and start right away.",
    points: [
      "Full course access",
      "Progress tracking",
      "Certificate on completion",
    ],
    href: "/courses?price=free",
    cta: "Browse free courses",
    featured: false,
  },
  {
    name: "Paid courses",
    icon: FiCreditCard,
    badge: "Pay once",
    price: "One-time payment",
    text: "Each paid course has its own price, shown before you pay. There are no subscriptions.",
    points: [
      "Pay once per course",
      "Secure Stripe Checkout",
      "Access after payment is confirmed",
    ],
    href: "/courses?price=paid",
    cta: "Browse paid courses",
    featured: true,
  },
  {
    name: "Free previews",
    icon: FiPlay,
    badge: "Try first",
    price: "Try first",
    text: "Many paid courses include preview lessons you can watch without enrolling.",
    points: [
      "No account needed to preview",
      "See the teaching style",
      "Decide before you buy",
    ],
    href: "/courses",
    cta: "Find a course",
    featured: false,
  },
];

const trust = [
  {
    icon: FiLock,
    title: "Payments by Stripe",
    text: "Your card details are handled by Stripe and are never stored by us.",
  },
  {
    icon: FiZap,
    title: "No subscriptions",
    text: "Pay once per course. There are no monthly charges or hidden renewals.",
  },
  {
    icon: FiShield,
    title: "Price shown first",
    text: "You always see the full price of a course before you pay.",
  },
  {
    icon: FiRefreshCw,
    title: "Clear refund terms",
    text: "Refund conditions are written plainly in our Terms.",
  },
];

const compare = [
  ["How to start", "Enroll with an account", "Buy Now, then pay with Stripe"],
  ["Lessons", "All lessons", "All lessons after payment; previews before"],
  ["Progress & certificate", true, true],
  ["Recurring fees", false, false],
  ["Card details", "Not needed", "Handled by Stripe; never stored by us"],
];

const faqs = [
  {
    q: "Do I need to pay a monthly fee?",
    a: "No. There are no subscriptions. Free courses cost nothing, and each paid course is a one-time payment.",
  },
  {
    q: "When do I get access to a paid course?",
    a: "Access starts after your payment is confirmed by Stripe. This usually takes a few moments.",
  },
  {
    q: "Can I try a paid course before buying?",
    a: "Many paid courses include preview lessons that you can watch without enrolling or creating an account.",
  },
  {
    q: "Is my card information safe?",
    a: "Payments go through Stripe Checkout. Your card details are handled by Stripe and are never stored by us.",
  },
  {
    q: "What if I want a refund?",
    a: "Refund conditions are described in our Terms page. Please read them before you buy.",
  },
];

// In-page navigation: every target below exists on this page
const sections = [
  { id: "plans", label: "Plans" },
  { id: "flow", label: "How it works" },
  { id: "planner", label: "Budget planner" },
  { id: "compare", label: "Compare" },
  { id: "faq", label: "FAQ" },
];

function Cell({ value }) {
  if (value === true)
    return (
      <span className="inline-flex items-center gap-1.5">
        <FiCheck className="size-4 text-primary" aria-hidden="true" />
        Included
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center gap-1.5">
        <FiMinus className="size-4 text-muted-foreground" aria-hidden="true" />
        None
      </span>
    );
  return value;
}

export default function PricingPage() {
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
        title="Simple, per-course pricing"
        description="Start free. Pay only for the courses you choose."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
      >
        <PricingChips />
      </PageHeader>

      <div className="relative overflow-x-clip">
        <PricingGlows />

        {/* Plans */}
        <section
          id="plans"
          aria-label="Plans"
          className="scroll-mt-24 py-10 sm:py-14"
        >
          <Container>
            <nav aria-label="On this page" className="mb-8">
              <ul className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="inline-flex min-h-9 items-center rounded-full border bg-card px-4 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Each tier is a 3D scene: icon, badge and price float on their own layers */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {tiers.map((t) => (
                <TiltCard
                  key={t.name}
                  className="h-full min-w-0"
                  max={t.featured ? 7 : 6}
                >
                  <Card
                    className={`h-full gap-4 p-6 [transform-style:preserve-3d] sm:p-7 ${
                      t.featured
                        ? "border-2 border-primary shadow-lg shadow-primary/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 [transform-style:preserve-3d]">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary [transform:translateZ(30px)]">
                        <t.icon aria-hidden="true" className="size-5" />
                      </span>
                      <Badge
                        variant={t.featured ? "default" : "secondary"}
                        className="[transform:translateZ(20px)]"
                      >
                        {t.badge}
                      </Badge>
                    </div>

                    <h2 className="text-xl">{t.name}</h2>
                    <p className="font-serif text-2xl font-semibold text-foreground [transform:translateZ(18px)]">
                      {t.price}
                    </p>
                    <p className="text-sm text-muted-foreground sm:text-base">
                      {t.text}
                    </p>

                    <ul className="space-y-2.5 text-sm sm:text-base">
                      {t.points.map((p) => (
                        <li key={p} className="flex gap-2.5">
                          <FiCheck
                            className="mt-1 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          {p}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={t.href}
                      className={buttonVariants({
                        variant: t.featured ? "default" : "outline",
                        size: "lg",
                        className: "group/btn mt-auto",
                      })}
                    >
                      {t.cta}
                      <FiArrowRight
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/btn:translate-x-1 motion-reduce:transition-none"
                      />
                    </Link>
                  </Card>
                </TiltCard>
              ))}
            </div>
          </Container>
        </section>

        {/* How payment works */}
        <section
          id="flow"
          aria-labelledby="flow-title"
          className="scroll-mt-24 border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <h2
              id="flow-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              From first click to certificate
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Four simple steps. Free courses skip the payment step.
            </p>
            <div className="mt-10">
              <PricingFlow />
            </div>
          </Container>
        </section>

        {/* Budget planner */}
        <section
          id="planner"
          aria-labelledby="plan-title"
          className="scroll-mt-24 border-t py-14 sm:py-20"
        >
          <Container>
            <h2
              id="plan-title"
              className="max-w-xl text-balance text-3xl sm:text-4xl"
            >
              Plan what you will spend
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Move the sliders to see a rough one-time total. Nothing is charged
              here.
            </p>
            <div className="mt-8">
              <BudgetPlanner />
            </div>
          </Container>
        </section>

        {/* Comparison */}
        <section
          id="compare"
          aria-labelledby="compare-title"
          className="scroll-mt-24 border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <h2
              id="compare-title"
              className="mb-6 max-w-xl text-balance text-3xl sm:text-4xl"
            >
              Free vs. paid at a glance
            </h2>
            <div className="rounded-2xl border bg-card shadow-sm">
              {/* Mobile: one card per row (below md) */}
              <ul className="divide-y md:hidden">
                {/* Column labels stay visible while scrolling */}
                <li
                  aria-hidden="true"
                  className="sticky top-0 z-10 grid grid-cols-[1fr_1fr] gap-3 rounded-t-2xl bg-card px-4 py-3 text-xs font-semibold text-muted-foreground"
                >
                  <span>Free course</span>
                  <span className="text-primary">Paid course</span>
                </li>

                {compare.map(([label, free, paid]) => (
                  <li key={label} className="px-4 py-4">
                    <p className="mb-3 text-sm font-semibold leading-snug text-foreground">
                      {label}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border bg-muted/30 p-3">
                        <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                          Free
                        </p>
                        <div className="text-sm">
                          <Cell value={free} />
                        </div>
                      </div>

                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <p className="mb-1 text-[11px] font-medium text-primary">
                          Paid
                        </p>
                        <div className="text-sm">
                          <Cell value={paid} />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Desktop and tablet: table (md and up) */}
              <div className="hidden overflow-hidden rounded-2xl md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[40%] py-4 pl-6">
                        <span className="sr-only">Feature</span>
                      </TableHead>
                      <TableHead className="w-[30%] py-4 text-base font-semibold">
                        Free course
                      </TableHead>
                      <TableHead className="w-[30%] border-x border-primary/20 bg-primary/10 py-4 text-base font-semibold text-primary">
                        Paid course
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {compare.map(([label, free, paid]) => (
                      <TableRow
                        key={label}
                        className="group transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="py-4 pl-6 font-medium">
                          {label}
                        </TableCell>
                        <TableCell className="py-4">
                          <Cell value={free} />
                        </TableCell>
                        <TableCell className="border-x border-primary/20 bg-primary/5 py-4 transition-colors group-hover:bg-primary/10">
                          <Cell value={paid} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Refund conditions are described in our{" "}
              <Link
                href="/terms"
                className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Terms
              </Link>
              .
            </p>
          </Container>
        </section>

        {/* Trust: a 3D checkout-card scene beside the reasons to pay with confidence */}
        <section
          aria-labelledby="trust-title"
          className="border-t py-14 sm:py-20"
        >
          <Container>
            <div className="grid items-center gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
              <TiltCard className="mx-auto h-40 w-64 sm:h-44 sm:w-72" max={14}>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-highlight/40 [transform:translateZ(-40px)_translate(16px,16px)]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl border-2 border-primary/40 bg-card p-5"
                >
                  <span className="block h-2.5 w-1/2 rounded-full bg-muted" />
                  <span className="mt-3 block h-2.5 w-1/3 rounded-full bg-muted" />
                  <span className="absolute bottom-5 left-5 block h-2.5 w-2/5 rounded-full bg-primary/30" />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-3 -right-3 grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-xl [transform:translateZ(50px)]"
                >
                  <FiLock aria-hidden="true" className="size-7" />
                </span>
              </TiltCard>

              <div className="min-w-0">
                <h2
                  id="trust-title"
                  className="max-w-xl text-balance text-3xl sm:text-4xl"
                >
                  Pay with confidence
                </h2>
                <ul className="mt-8 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                  {trust.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="min-w-0 border-t py-5">
                      <h3 className="flex items-center gap-2 font-sans text-base font-semibold text-foreground">
                        <Icon
                          aria-hidden="true"
                          className="size-5 text-primary"
                        />
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                        {text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        {/* FAQ: heading left, accordion right */}
        <section
          id="faq"
          aria-labelledby="faq-title"
          className="scroll-mt-24 border-t bg-muted/30 py-14 sm:py-20"
        >
          <Container>
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
              <h2
                id="faq-title"
                className="text-balance text-3xl sm:text-4xl lg:col-span-4"
              >
                Pricing questions
              </h2>

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
