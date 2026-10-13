import Link from "next/link";
import { FiCreditCard } from "react-icons/fi";
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
                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
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
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Browse paid courses
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
