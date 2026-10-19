import { FiHelpCircle } from "react-icons/fi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Where can I find my receipt?",
    a: "Click the external-link icon next to any successful payment and your Stripe receipt will open.",
  },
  {
    q: "Do you save my card details?",
    a: "No. Your card details are held only by Stripe and are never stored on our servers.",
  },
  {
    q: "Why is my payment pending?",
    a: "Some banks take extra time to verify a payment. It usually completes within a few minutes.",
  },
  {
    q: "How do I request a refund?",
    a: "Contact support and share your payment ID. Eligible refunds are processed within 5–10 business days.",
  },
];

export function PaymentFaq() {
  return (
    <section
      aria-labelledby="billing-faq-title"
      className="rounded-xl border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20"
        >
          <FiHelpCircle className="size-4" />
        </span>
        <div>
          <h2
            id="billing-faq-title"
            className="text-lg font-semibold leading-tight tracking-tight"
          >
            Billing FAQ
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Quick answers about payments, receipts and refunds.
          </p>
        </div>
      </div>

      <Accordion type="single" collapsible className="mt-2">
        {faqs.map(({ q, a }, i) => (
          <AccordionItem key={q} value={`faq-${i}`}>
            <AccordionTrigger className="text-left hover:text-primary hover:no-underline">
              {q}
            </AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
