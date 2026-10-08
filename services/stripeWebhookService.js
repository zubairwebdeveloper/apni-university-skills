import { couponService } from "@/services/couponService";
import { emailService } from "@/services/email/emailService";

import { paymentRepository } from "@/repositories/paymentRepository";
import { courseRepository } from "@/repositories/courseRepository";
import { enrollmentRepository } from "@/repositories/enrollmentRepository";
import { userRepository } from "@/repositories/userRepository";

import { writeAudit, SYSTEM_ACTOR } from "@/lib/audit/auditLog";
import { formatPrice } from "@/lib/utils/format";

/**
 * Safely extract an ID from a Stripe object or string.
 */
function idOf(value) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id ?? null;
}

/**
 * Send purchase + enrollment emails after successful payment.
 */
async function notifyPurchase(payment, course) {
  const student = await userRepository.getById(payment.studentId);

  if (!student?.email) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const name = student.displayName ?? student.name ?? "Student";

  await emailService.send(
    "payment",
    student.email,
    {
      name,
      course: course.title,
      amount: formatPrice(payment.amount, payment.currency),
      ref: payment.slug,
    },
    {
      flag: "payment",
    },
  );

  await emailService.send(
    "enrollment",
    student.email,
    {
      name,
      course: course.title,
      url: `${site}/student/learning/${course.slug}`,
    },
    {
      flag: "enrollment",
    },
  );
}

/**
 * Fulfill a completed Stripe Checkout session.
 *
 * This function is intentionally idempotent:
 * Stripe may deliver the same webhook more than once.
 */
async function fulfill(session) {
  const sessionId = session.id;

  const payment = await paymentRepository.getBySessionId(sessionId);

  if (!payment) {
    console.error(
      "[stripe] unknown checkout session, ignoring:",
      sessionId,
    );
    return;
  }

  // Already fulfilled/refunded.
  if (payment.status === "paid" || payment.status === "refunded") {
    return;
  }

  const expectedAmount = Math.round(Number(payment.amount) * 100);

  const receivedAmount = Number(session.amount_total ?? 0);

  const receivedCurrency = String(session.currency ?? "").toLowerCase();
  const expectedCurrency = String(payment.currency ?? "").toLowerCase();

  /**
   * Never enroll the student if Stripe's amount/currency
   * does not match our payment record.
   */
  if (
    receivedAmount !== expectedAmount ||
    receivedCurrency !== expectedCurrency
  ) {
    await paymentRepository.update(sessionId, {
      status: "failed",
      flag: "amount_mismatch",
    });

    if (payment.reservationId) {
      await couponService.release(payment.reservationId);
    }

    console.error(
      "[stripe] amount/currency mismatch, enrollment withheld:",
      sessionId,
    );

    return;
  }

  const course = await courseRepository.findById(payment.courseId);

  if (!course) {
    throw new Error(
      `Course ${payment.courseId} missing for paid session ${sessionId}`,
    );
  }

  await paymentRepository.update(sessionId, {
    status: "paid",
    stripePaymentIntentId: idOf(session.payment_intent),
    paymentMethod: session.payment_method_types?.[0] ?? null,
    paidAt: new Date(),
  });

  const { created } = await enrollmentRepository.enroll({
    studentId: payment.studentId,
    course,
    price: payment.amount,
    currency: payment.currency,
    paymentId: sessionId,
  });

  /**
   * Coupon redemption should be idempotent.
   */
  if (payment.reservationId) {
    await couponService.redeem(payment.reservationId);
  }

  /**
   * Only send emails when a new enrollment was actually created.
   * Stripe retries therefore won't send duplicate emails.
   */
  if (created) {
    await notifyPurchase(payment, course);
  }
}

/**
 * Mark a pending payment as failed/expired/canceled
 * and release its coupon reservation.
 */
async function markIfPending(sessionId, status) {
  const payment = await paymentRepository.getBySessionId(sessionId);

  if (!payment || payment.status !== "pending") {
    return;
  }

  await paymentRepository.update(sessionId, {
    status,
  });

  if (payment.reservationId) {
    await couponService.release(payment.reservationId);
  }
}

/**
 * Handle a Stripe refund.
 */
async function handleRefund(charge) {
  const paymentIntentId = idOf(charge.payment_intent);

  if (!paymentIntentId) {
    console.warn(
      "[stripe] refund received without payment_intent:",
      charge.id,
    );
    return;
  }

  const payment =
    await paymentRepository.getByStripePaymentIntentId(paymentIntentId);

  if (!payment) {
    console.warn(
      "[stripe] refund payment not found:",
      paymentIntentId,
    );
    return;
  }

  /**
   * Already refunded — webhook retry.
   */
  if (payment.status === "refunded") {
    return;
  }

  await paymentRepository.update(payment.id, {
    status: "refunded",
    refundedAt: new Date(),
    refundAmount: Number(charge.amount_refunded ?? 0) / 100,
  });

  await writeAudit(SYSTEM_ACTOR, {
    action: "payment.refunded",
    resource: "payment",
    resourceId: payment.id,
    resourceSlug: payment.slug,
    metadata: {
      amount: Number(charge.amount_refunded ?? 0) / 100,
      currency: payment.currency,
      stripePaymentIntentId: paymentIntentId,
      stripeChargeId: charge.id,
    },
  });
}

/**
 * Main Stripe webhook event handler.
 *
 * This is the function imported by:
 *
 * app/api/webhooks/stripe/route.js
 */
export async function handleStripeEvent(event) {
  switch (event.type) {
    case "checkout.session.completed": {
      await fulfill(event.data.object);
      break;
    }

    case "checkout.session.expired": {
      await markIfPending(event.data.object.id, "expired");
      break;
    }

    case "checkout.session.async_payment_failed": {
      await markIfPending(event.data.object.id, "failed");
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;

      const payment =
        await paymentRepository.getByStripePaymentIntentId(
          paymentIntent.id,
        );

      if (payment?.status === "pending") {
        await paymentRepository.update(payment.id, {
          status: "failed",
        });

        if (payment.reservationId) {
          await couponService.release(payment.reservationId);
        }
      }

      break;
    }

    case "charge.refunded": {
      await handleRefund(event.data.object);
      break;
    }

    default: {
      console.log(
        `[stripe] unhandled event: ${event.type}`,
      );
    }
  }
}
