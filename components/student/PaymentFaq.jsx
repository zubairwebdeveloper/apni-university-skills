import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Receipt kahan se milegi?",
    a: "Har successful payment ke saath external-link icon par click karein, Stripe receipt open ho jayegi.",
  },
  {
    q: "Kya aap meri card details save karte hain?",
    a: "Nahi. Card details sirf Stripe ke paas hoti hain, hamare servers par kabhi store nahi hotin.",
  },
  {
    q: "Payment pending kyun hai?",
    a: "Kuch banks verification mein time lete hain. Aam taur par yeh kuch minutes mein complete ho jati hai.",
  },
  {
    q: "Refund kaise request karun?",
    a: "Support se rabta karein aur apna payment ID share karein. Eligible refunds 5-10 business days mein process hote hain.",
  },
];

export function PaymentFaq() {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">Billing FAQ</h2>
      <Accordion type="single" collapsible>
        {faqs.map(({ q, a }, i) => (
          <AccordionItem key={q} value={`faq-${i}`}>
            <AccordionTrigger>{q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
