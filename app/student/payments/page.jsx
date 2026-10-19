// app/student/payments/page.jsx
import Link from "next/link";
import { FiCreditCard } from "react-icons/fi";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaymentHistory } from "@/components/student/PaymentHistory";
import { PaymentStats } from "@/components/student/PaymentStats";
import { PaymentSecurityCard } from "@/components/student/PaymentSecurityCard";
import { PaymentFaq } from "@/components/student/PaymentFaq";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import {
  MotionRoot,
  PaymentsBackdrop,
  PaymentsHero,
  Reveal,
} from "@/components/student/PaymentsMotion";
import { requireUser } from "@/lib/auth/session";
import { paymentService } from "@/services/paymentService";
import { cn } from "@/lib/utils";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const user = await requireUser();
  const payments = await paymentService.listForStudent(user.uid);

  return (
    <MotionRoot>
      <div className="relative isolate">
        <PaymentsBackdrop />

        <div className="space-y-8">
          <StudentPageHeader
            title="Payments"
            description="Your purchase history, receipts and billing help. Card details are handled by Stripe and never stored by us."
          />

          <PaymentsHero count={payments.length} />

          {payments.length ? (
            <>
              <Reveal>
                <PaymentStats payments={payments} />
              </Reveal>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div id="payment-history" className="min-w-0 scroll-mt-24">
                  <Reveal>
                    <PaymentHistory payments={payments} />
                  </Reveal>
                </div>
                <aside
                  aria-label="Payment security"
                  className="space-y-6 lg:sticky lg:top-24 lg:self-start"
                >
                  <Reveal delay={0.1}>
                    <PaymentSecurityCard />
                  </Reveal>
                </aside>
              </div>
            </>
          ) : (
            <Reveal>
              <EmptyState
                icon={FiCreditCard}
                title="No payments yet"
                description="Purchases of paid courses will appear here, along with downloadable receipts."
                action={
                  <Link
                    href="/courses?price=paid"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "group gap-2 shadow-[0_3px_0_0_var(--border)] transition-[transform,box-shadow] duration-100",
                      "active:translate-y-[3px] active:shadow-none motion-reduce:transition-none motion-reduce:active:translate-y-0",
                    )}
                  >
                    Browse paid courses
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </Link>
                }
              />
            </Reveal>
          )}

          <div id="payment-faq" className="scroll-mt-24">
            <Reveal>
              <PaymentFaq />
            </Reveal>
          </div>
        </div>
      </div>
    </MotionRoot>
  );
}
