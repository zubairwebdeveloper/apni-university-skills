import Link from "next/link";
import { FiCreditCard } from "react-icons/fi";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { PaymentHistory } from "@/components/student/PaymentHistory";
import { PaymentStats } from "@/components/student/PaymentStats";
import { PaymentSecurityCard } from "@/components/student/PaymentSecurityCard";
import { PaymentFaq } from "@/components/student/PaymentFaq";
import { StudentPageHeader } from "@/components/student/StudentPageHeader";
import { requireUser } from "@/lib/auth/session";
import { paymentService } from "@/services/paymentService";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  const user = await requireUser();
  const payments = await paymentService.listForStudent(user.uid);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Payments"
        description="Your purchase history, receipts and billing help. Card details are handled by Stripe and never stored by us."
      />

      {payments.length ? (
        <>
          <PaymentStats payments={payments} />
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <PaymentHistory payments={payments} />
            <aside className="space-y-6">
              <PaymentSecurityCard />
            </aside>
          </div>
        </>
      ) : (
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
      )}

      <PaymentFaq />
    </div>
  );
}
