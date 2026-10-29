// services/paymentService.js
// NOTE: merge this with your existing paymentService.js. The parts that matter are
// createCheckoutSession (coupon quote -> reserve -> Stripe) and the two webhook helpers.
import "server-only";
import { stripe } from "@/lib/stripe"; // <-- adjust to your Stripe client path
import { AppError } from "@/lib/errors";
import { courseService } from "@/services/courseService";
import { enrollmentService } from "@/services/enrollmentService";
import { couponService } from "@/services/couponService";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://apni-university-skills-lurc.vercel.app/";

// Stripe wants the smallest currency unit (2-decimal currencies like USD/PKR).
// If you sell in zero-decimal currencies (JPY etc.) handle that here.
const toMinor = (amount) => Math.round(amount * 100);

export const paymentService = {
  async createCheckoutSession({ user, courseSlug, couponCode = null }) {
    const course = await courseService.getCourseBySlug(courseSlug);
    if (!course) throw new AppError("Course not found.", 404);
    if (course.isFree) throw new AppError("This course is free.", 400);

    const existing = await enrollmentService.getActiveEnrollment(
      user.uid,
      course.id,
    );
    if (existing) throw new AppError("You're already enrolled.", 409);

    const price = Number(course.salePrice ?? course.price ?? 0);
    if (!Number.isFinite(price) || price <= 0)
      throw new AppError("Invalid course price.", 400);

    // 1) Re-validate the coupon on the server. Never trust the client's discount.
    let quote = null;
    let redemptionId = null;
    if (couponCode) {
      quote = await couponService.quote({
        code: couponCode,
        course,
        price,
        studentId: user.uid,
      });
      // 2) Reserve it (transaction) so limits can't be exceeded by concurrent checkouts.
      redemptionId = await couponService.reserve({
        coupon: quote.coupon,
        studentId: user.uid,
        courseId: course.id,
        discount: quote.discount,
      });
    }

    const finalPrice = quote ? quote.final : price;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: user.email,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: String(course.currency).toLowerCase(),
              unit_amount: toMinor(finalPrice),
              product_data: {
                name: course.title,
                ...(quote
                  ? { description: `Coupon ${quote.coupon.code} applied` }
                  : {}),
              },
            },
          },
        ],
        metadata: {
          uid: user.uid,
          courseId: course.id,
          courseSlug: course.slug,
          couponCode: quote?.coupon.code ?? "",
          redemptionId: redemptionId ?? "",
        },
        success_url: `${siteUrl}/student/learning/${course.slug}?checkout=success`,
        cancel_url: `${siteUrl}/courses/${course.slug}?checkout=cancelled`,
        // Stripe minimum is 30 minutes; unpaid reservations get released on expiry.
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });

      if (redemptionId) await couponService.attach(redemptionId, session.id);
      return session.url;
    } catch (error) {
      // Stripe failed: give the coupon slot back.
      if (redemptionId) await couponService.release(redemptionId);
      throw error;
    }
  },

  /** Call from the webhook on checkout.session.completed (after enrolling the user). */
  async onCheckoutCompleted(session) {
    await couponService.redeem(session.metadata?.redemptionId || null);
  },

  /** Call from the webhook on checkout.session.expired. */
  async onCheckoutExpired(session) {
    await couponService.release(session.metadata?.redemptionId || null);
  },
};
