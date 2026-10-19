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
    caption: "No card required",
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
    caption: "Price shown before you pay",
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
    price: "Free to preview",
    caption: "Watch before you enroll",
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

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function Eyebrow({ children }) {
  return (
    <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
      <span aria-hidden="true" className="h-px w-6 bg-primary" />
      {children}
    </p>
  );
}

function SectionHeading({ id, eyebrow, title, description, className = "" }) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className="mt-3 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function Cell({ value }) {
  if (value === true)
    return (
      <span className="inline-flex items-center gap-2 font-medium text-foreground">
        <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary">
          <FiCheck className="size-3" aria-hidden="true" />
        </span>
        Included
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className="grid size-5 place-items-center rounded-full bg-muted">
          <FiMinus className="size-3" aria-hidden="true" />
        </span>
        None
      </span>
    );
  return <span className="leading-snug text-foreground">{value}</span>;
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
          className="scroll-mt-24 py-10 sm:py-16"
        >
          <Container>
            <nav aria-label="On this page" className="mb-10">
              <ul className="flex flex-wrap gap-2">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`group/nav inline-flex min-h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary motion-reduce:transition-none ${focusRing}`}
                    >
                      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground transition-colors group-hover/nav:text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Each tier is a 3D scene: icon, badge and price float on their own layers */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
              {tiers.map((t) => (
                <TiltCard
                  key={t.name}
                  className="h-full min-w-0"
                  max={t.featured ? 7 : 6}
                >
                  <Card
                    className={`relative h-full gap-5 p-6 transition-shadow [transform-style:preserve-3d] motion-reduce:transition-none sm:p-8 ${
                      t.featured
                        ? "border-2 border-primary shadow-xl shadow-primary/10"
                        : "shadow-sm hover:shadow-md"
                    }`}
                  >
                    {t.featured ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-primary"
                      />
                    ) : null}

                    <div className="flex items-center justify-between gap-3 [transform-style:preserve-3d]">
                      <span
                        className={`grid size-12 place-items-center rounded-xl [transform:translateZ(30px)] ${
                          t.featured
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <t.icon aria-hidden="true" className="size-5" />
                      </span>
                      <Badge
                        variant={t.featured ? "default" : "secondary"}
                        className="[transform:translateZ(20px)]"
                      >
                        {t.badge}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {t.name}
                      </h2>
                      <p className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground [transform:translateZ(18px)]">
                        {t.price}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {t.caption}
                      </p>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {t.text}
                    </p>

                    <ul className="space-y-3 border-t pt-5 text-sm sm:text-base">
                      {t.points.map((p) => (
                        <li key={p} className="flex gap-3 text-foreground">
                          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                            <FiCheck className="size-3" aria-hidden="true" />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={t.href}
                      className={buttonVariants({
                        variant: t.featured ? "default" : "outline",
                        size: "lg",
                        className: "group/btn mt-auto min-h-11",
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

            <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              <FiShield aria-hidden="true" className="size-4 text-primary" />
              Every price is shown in full before you pay.
            </p>
          </Container>
        </section>

        {/* How payment works */}
        <section
          id="flow"
          aria-labelledby="flow-title"
          className="scroll-mt-24 border-t bg-muted/30 py-16 sm:py-24"
        >
          <Container>
            <SectionHeading
              id="flow-title"
              eyebrow="How it works"
              title="From first click to certificate"
              description="Four simple steps. Free courses skip the payment step."
            />
            <div className="mt-12">
              <PricingFlow />
            </div>
          </Container>
        </section>

        {/* Budget planner */}
        <section
          id="planner"
          aria-labelledby="plan-title"
          className="scroll-mt-24 border-t py-16 sm:py-24"
        >
          <Container>
            <SectionHeading
              id="plan-title"
              eyebrow="Budget planner"
              title="Plan what you will spend"
              description="Move the sliders to see a rough one-time total. Nothing is charged here."
            />
            <div className="mt-10">
              <BudgetPlanner />
            </div>
          </Container>
        </section>

        {/* Comparison */}
        <section
          id="compare"
          aria-labelledby="compare-title"
          className="scroll-mt-24 border-t bg-muted/30 py-16 sm:py-24"
        >
          <Container>
            <SectionHeading
              id="compare-title"
              eyebrow="Compare"
              title="Free vs. paid at a glance"
              className="mb-10"
            />
            <div className="rounded-2xl border bg-card shadow-sm">
              {/* Mobile: one card per row (below md) */}
              <ul className="divide-y md:hidden">
                {/* Column labels stay visible while scrolling */}
                <li
                  aria-hidden="true"
                  className="sticky top-0 z-10 grid grid-cols-[1fr_1fr] gap-3 rounded-t-2xl border-b bg-card px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  <span>Free course</span>
                  <span className="text-primary">Paid course</span>
                </li>

                {compare.map(([label, free, paid]) => (
                  <li key={label} className="px-4 py-5">
                    <p className="mb-3 text-sm font-semibold leading-snug text-foreground">
                      {label}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0 rounded-xl border bg-muted/30 p-3.5">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Free
                        </p>
                        <div className="text-sm">
                          <Cell value={free} />
                        </div>
                      </div>

                      <div className="min-w-0 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
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
                      <TableHead className="w-[34%] py-5 pl-6">
                        <span className="sr-only">Feature</span>
                      </TableHead>
                      <TableHead className="w-[33%] py-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Free course
                      </TableHead>
                      <TableHead className="w-[33%] border-x border-primary/20 bg-primary/10 py-5 text-sm font-semibold uppercase tracking-wider text-primary">
                        Paid course
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {compare.map(([label, free, paid]) => (
                      <TableRow
                        key={label}
                        className="group transition-colors hover:bg-muted/40 motion-reduce:transition-none"
                      >
                        <TableCell className="py-5 pl-6 font-medium text-foreground">
                          {label}
                        </TableCell>
                        <TableCell className="whitespace-normal py-5">
                          <Cell value={free} />
                        </TableCell>
                        <TableCell className="whitespace-normal border-x border-primary/20 bg-primary/5 py-5 transition-colors group-hover:bg-primary/10 motion-reduce:transition-none">
                          <Cell value={paid} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Refund conditions are described in our{" "}
              <Link
                href="/terms"
                className={`rounded-sm font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
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
          className="border-t py-16 sm:py-24"
        >
          <Container>
            <div className="grid items-center gap-14 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-24">
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
                <SectionHeading
                  id="trust-title"
                  eyebrow="Security & clarity"
                  title="Pay with confidence"
                />
                <ul className="mt-10 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
                  {trust.map(({ icon: Icon, title, text }) => (
                    <li
                      key={title}
                      className="flex min-w-0 gap-4 border-t py-6"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-sans text-base font-semibold text-foreground">
                          {title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                          {text}
                        </p>
                      </div>
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
          className="scroll-mt-24 border-t bg-muted/30 py-16 sm:py-24"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-28">
                  <SectionHeading
                    id="faq-title"
                    eyebrow="FAQ"
                    title="Pricing questions"
                    description="Quick answers about payments, access and refunds."
                  />
                  <p className="mt-6 text-sm text-muted-foreground">
                    Need the fine print? Read our{" "}
                    <Link
                      href="/terms"
                      className={`rounded-sm font-medium text-primary underline-offset-4 hover:underline ${focusRing}`}
                    >
                      Terms
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="space-y-3 lg:col-span-8">
                {faqs.map(({ q, a }, i) => (
                  <details
                    key={q}
                    className="group rounded-xl border bg-card px-5 shadow-sm transition-colors hover:border-primary/30 open:border-primary/30 motion-reduce:transition-none sm:px-6"
                  >
                    <summary
                      className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-4 text-left text-base font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden`}
                    >
                      <span className="flex min-w-0 items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="text-xs font-semibold tabular-nums text-primary"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{q}</span>
                      </span>
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <FiChevronDown
                          aria-hidden="true"
                          className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                        />
                      </span>
                    </summary>
                    <p className="max-w-2xl pb-5 pl-0 leading-relaxed text-muted-foreground sm:pl-8">
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
