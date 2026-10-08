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
import { CTASection } from "@/components/public/CTASection";
import { PricingGlows, Reveal } from "@/components/public/PricingMotion";
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
      <PageHeader
        title="Simple, per-course pricing"
        description="Start free. Pay only for the courses you choose."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pricing" }]}
      >
        <PricingChips />
      </PageHeader>

      <div className="relative overflow-x-clip">
        <PricingGlows />

        {/* Tiers */}
        <Container className="py-10 sm:py-12">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {tiers.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1} className="min-w-0">
                <Card
                  className={`group relative h-full gap-4 overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                    t.featured
                      ? "border-primary/50 shadow-lg shadow-primary/10"
                      : "hover:border-primary/40"
                  }`}
                >
                  {/* Top accent line that grows on hover */}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 origin-left bg-gradient-to-r from-primary to-highlight transition-transform duration-500 motion-reduce:transition-none ${
                      t.featured
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />

                  <div className="flex items-center justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
                      <t.icon aria-hidden="true" className="size-5" />
                    </span>
                    <Badge variant={t.featured ? "default" : "secondary"}>
                      {t.badge}
                    </Badge>
                  </div>

                  <h2 className="text-xl">{t.name}</h2>
                  <p className="font-serif text-2xl font-semibold">{t.price}</p>
                  <p className="text-sm text-muted-foreground">{t.text}</p>

                  <ul className="space-y-2 text-sm">
                    {t.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <FiCheck
                          className="mt-0.5 size-4 shrink-0 text-primary transition-transform duration-300 group-hover:scale-125 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
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
              </Reveal>
            ))}
          </div>
        </Container>

        {/* How payment works */}
        <section
          aria-labelledby="flow-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                How it works
              </Badge>
              <h2 id="flow-title" className="text-2xl sm:text-3xl">
                From first click to certificate
              </h2>
              <p className="mt-3 text-muted-foreground">
                Four simple steps. Free courses skip the payment step.
              </p>
            </Reveal>
            <div className="mt-8">
              <PricingFlow />
            </div>
          </Container>
        </section>

        {/* Budget planner */}
        <section
          aria-labelledby="plan-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">
                Budget planner
              </Badge>
              <h2 id="plan-title" className="text-2xl sm:text-3xl">
                Plan what you will spend
              </h2>
              <p className="mt-3 text-muted-foreground">
                Move the sliders to see a rough one-time total. Nothing is
                charged here.
              </p>
            </Reveal>
            <Reveal className="mt-8" delay={0.1}>
              <BudgetPlanner />
            </Reveal>
          </Container>
        </section>

        {/* Comparison */}
        <section
          aria-labelledby="compare-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container>
            <Reveal>
              <h2 id="compare-title" className="mb-6 text-2xl sm:text-3xl">
                Free vs. paid at a glance
              </h2>
              <div className="rounded-2xl border bg-card shadow-sm">
                {/* ---------- MOBILE: har row ek card (< md) ---------- */}
                <ul className="divide-y md:hidden">
                  {/* Column labels, sticky taake scroll karte waqt yaad rahe */}
                  <li
                    aria-hidden="true"
                    className="sticky top-0 z-10 grid grid-cols-[1fr_1fr] gap-3 rounded-t-2xl bg-card/95 px-4 py-3 text-xs font-semibold text-muted-foreground backdrop-blur"
                  >
                    <span>Free course</span>
                    <span className="text-primary">Paid course</span>
                  </li>

                  {compare.map(([label, free, paid]) => (
                    <li key={label} className="px-4 py-4">
                      <p className="mb-3 text-sm font-semibold leading-snug">
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

                {/* ---------- DESKTOP / TABLET: table (>= md) ---------- */}
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
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Terms
                </Link>
                .
              </p>
            </Reveal>
          </Container>
        </section>

        {/* Trust */}
        <section
          aria-labelledby="trust-title"
          className="border-t py-12 sm:py-16"
        >
          <Container>
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 id="trust-title" className="text-2xl sm:text-3xl">
                Pay with confidence
              </h2>
            </Reveal>
            <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trust.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="min-w-0">
                  <Reveal delay={i * 0.08} className="h-full">
                    <div className="group h-full rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
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

        {/* FAQ */}
        <section
          aria-labelledby="faq-title"
          className="border-t bg-muted/20 py-12 sm:py-16"
        >
          <Container className="max-w-3xl">
            <Reveal className="text-center">
              <h2 id="faq-title" className="text-2xl sm:text-3xl">
                Pricing questions
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
          </Container>
        </section>

        <CTASection />
      </div>
    </>
  );
}
