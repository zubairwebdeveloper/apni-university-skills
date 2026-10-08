import Link from "next/link";
import { FiShield, FiLock, FiRefreshCw, FiHelpCircle } from "react-icons/fi";

const items = [
  {
    icon: FiLock,
    title: "Secure checkout",
    text: "Payments are processed by Stripe with PCI-DSS compliance.",
  },
  {
    icon: FiRefreshCw,
    title: "Refund policy",
    text: "Eligible courses can be refunded within the refund window.",
  },
  {
    icon: FiHelpCircle,
    title: "Need help?",
    text: "Billing issue? Contact support with your payment ID.",
  },
];

export function PaymentSecurityCard() {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 font-semibold">
        <FiShield className="text-primary" /> Billing & security
      </div>
      <ul className="space-y-4">
        {items.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="/contact"
        className="mt-5 inline-block text-sm font-medium text-primary hover:underline"
      >
        Contact support →
      </Link>
    </div>
  );
}
