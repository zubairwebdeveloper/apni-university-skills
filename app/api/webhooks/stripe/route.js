// app/api/webhooks/stripe/route.js
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { handleStripeEvent } from "@/services/stripeWebhookService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const signature = req.headers.get("stripe-signature");
  if (!signature)
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event;
  try {
    // Must be the raw body, exactly as Stripe sent it
    event = getStripe().webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[stripe webhook]", event.type, e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 }); // Stripe retries with backoff
  }
}

