// components/public/PricingClientSections.jsx
"use client";

import {
  FiAward,
  FiCreditCard,
  FiGift,
  FiLock,
  FiSearch,
  FiUserPlus,
  FiZap,
} from "react-icons/fi";
import { TrustChips } from "@/components/public/PricingMotion";
import { FlowSteps } from "@/components/public/PricingTools";

const chips = [
  { icon: FiGift, text: "Many courses are free" },
  { icon: FiZap, text: "No subscriptions" },
  { icon: FiLock, text: "Secure Stripe Checkout" },
];

const flow = [
  {
    icon: FiSearch,
    title: "Find a course",
    text: "Browse the catalog and check the price, lessons and previews.",
  },
  {
    icon: FiUserPlus,
    title: "Create an account",
    text: "Free to sign up. It keeps your progress and certificates safe.",
  },
  {
    icon: FiCreditCard,
    title: "Pay securely",
    text: "Paid courses use Stripe Checkout. Free courses skip this step.",
  },
  {
    icon: FiAward,
    title: "Learn and certify",
    text: "Finish the lessons and get your certificate on completion.",
  },
];

export function PricingChips() {
  return <TrustChips items={chips} />;
}

export function PricingFlow() {
  return <FlowSteps steps={flow} />;
}
