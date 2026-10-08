// services/paymentService.js

import "server-only";

import { getStripe } from "@/lib/stripe/server";

import { courseRepository } from "@/repositories/courseRepository";
import { enrollmentRepository } from "@/repositories/enrollmentRepository";
import { paymentRepository } from "@/repositories/paymentRepository";

import { couponService } from "@/services/couponService";

import { AppError } from "@/lib/errors";

export const priceOf = (course) =>
  course.salePrice != null && course.salePrice < course.price
    ? course.salePrice
    : course.price;

export const paymentService = {
  async createCheckoutSession({ user, courseSlug, couponCode }) {
    const course = await courseRepository.findBySlug(courseSlug);

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    if (course.isFree) {
      throw new AppError("This course is free. Use Enroll Free.", 400);
    }

    if (await enrollmentRepository.findActive(user.uid, course.id)) {
      throw new AppError("You're already enrolled in this course.", 409);
    }

    // Always calculate the price from the database.
    // Never trust a price sent by the client.
    const price = priceOf(course);

    let final = price;
    let discount = 0;
    let reservationId = null;
    let appliedCode = null;

    if (couponCode) {
      const quote = await couponService.quote({
        code: couponCode,
        course,
        price,
        studentId: user.uid,
      });

      reservationId = await couponService.reserve({
        coupon: quote.coupon,
        studentId: user.uid,
        courseId: course.id,
        discount: quote.discount,
      });

      final = quote.final;
      discount = quote.discount;
      appliedCode = quote.coupon.code;
    }

    try {
      const unitAmount = Math.round(final * 100);

      // Stripe's minimum charge is approximately $0.50
      // for USD; the exact minimum can vary by currency.
      if (!(unitAmount >= 50)) {
        throw new AppError("This course can't be purchased right now.", 400);
      }

      const site = process.env.NEXT_PUBLIC_SITE_URL;

      if (!site) {
        throw new AppError("Payment configuration is incomplete.", 500);
      }

      const metadata = {
        studentId: user.uid,
        courseId: course.id,
        courseSlug: course.slug,
        ...(reservationId ? { reservationId } : {}),
      };

      const session = await getStripe().checkout.sessions.create({
        mode: "payment",

        customer_email: user.email ?? undefined,

        client_reference_id: user.uid,

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: course.currency.toLowerCase(),
              unit_amount: unitAmount,
              product_data: {
                name: course.title,
              },
            },
          },
        ],

        metadata,

        payment_intent_data: {
          metadata,
        },

        ...(reservationId
          ? {
              expires_at: Math.floor(Date.now() / 1000) + 35 * 60,
            }
          : {}),

        success_url: `${site}/student/courses/${course.slug}?paid=1`,
        cancel_url: `${site}/courses/${course.slug}`,
      });

      await paymentRepository.createPending({
        studentId: user.uid,
        courseId: course.id,
        courseSlug: course.slug,
        courseTitle: course.title,
        stripeSessionId: session.id,
        amount: final,
        originalAmount: price,
        discountAmount: discount,
        couponCode: appliedCode,
        reservationId,
        currency: course.currency,
      });

      if (reservationId) {
        await couponService.attach(reservationId, session.id);
      }

      return session.url;
    } catch (error) {
      if (reservationId) {
        await couponService.release(reservationId).catch(() => {});
      }

      throw error;
    }
  },

  async previewCoupon({ user, courseSlug, code }) {
    const course = await courseRepository.findBySlug(courseSlug);

    if (!course || course.isFree) {
      throw new AppError("Coupons apply to paid courses only.", 400);
    }

    const price = priceOf(course);

    const quote = await couponService.quote({
      code,
      course,
      price,
      studentId: user.uid,
    });

    return {
      code: quote.coupon.code,
      discount: quote.discount,
      final: quote.final,
    };
  },

  listForStudent: (uid) => paymentRepository.listByStudent(uid),
};

