// app/actions/admin/payments.js
"use server";
import { z } from "zod";
import { adminAction } from "@/lib/admin/action";
import { getStripe } from "@/lib/stripe/server";
import { AppError } from "@/lib/errors";
import { PERMISSIONS as P } from "@/lib/constants/permissions";
import { adminSlug } from "@/lib/validations/common";
import { paymentAdminRepository as repo } from "@/repositories/admin/paymentAdminRepository";

// There is deliberately no update or edit action. Payment state only changes through Stripe webhooks.
export const refundPayment = adminAction({
  permission: P.PAYMENTS_REFUND,
  fresh: true,
  limit: { limit: 10, windowSec: 60 },
  schema: z.object({
    slug: adminSlug,
    reason: z.enum(["requested_by_customer", "duplicate", "fraudulent"], {
      message: "Choose a reason",
    }),
  }),
  handler: async ({ input, actor }) => {
    const p = await repo.findBySlug(input.slug);
    if (!p) throw new AppError("Payment not found.", 404);
    if (p.status !== "paid")
      throw new AppError("Only paid payments can be refunded.", 409);
    if (!p.stripePaymentIntentId)
      throw new AppError("This payment has no Stripe charge to refund.", 409);
    let refund;
    try {
      refund = await getStripe().refunds.create(
        {
          payment_intent: p.stripePaymentIntentId,
          reason: input.reason,
          metadata: { paymentRef: p.slug, requestedBy: actor.uid },
        },
        { idempotencyKey: `refund_${p.id}` }, // a double click can't refund twice
      );
    } catch (e) {
      console.error("[refund]", p.slug, e?.code ?? e?.message ?? e);
      throw new AppError(
        "Stripe couldn't process this refund. It may already be refunded or too old.",
        502,
      );
    }
    return {
      data: { status: refund.status },
      audit: {
        action: "payment.refund_requested",
        resource: "payment",
        resourceId: p.id,
        resourceSlug: p.slug,
        metadata: {
          reason: input.reason,
          stripeRefund: refund.id,
          amount: p.amount,
          currency: p.currency,
        },
      },
    };
  },
});

