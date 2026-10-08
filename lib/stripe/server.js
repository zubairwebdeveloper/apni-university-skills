// lib/stripe/server.js: lazy, so builds don't fail when keys are absent
import "server-only";
import Stripe from "stripe";

let client;
export function getStripe() {
  if (!client) {
    if (!process.env.STRIPE_SECRET_KEY)
      throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

