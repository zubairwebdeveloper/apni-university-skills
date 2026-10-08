// components/public/faqUtils.js
// Pure helpers (no "use client") — usable from server and client files.

const RULES = [
  [
    "Payments",
    [
      "pay",
      "price",
      "refund",
      "stripe",
      "card",
      "cost",
      "fee",
      "subscription",
      "free",
    ],
  ],
  ["Certificates", ["certificate", "certified", "completion"]],
  ["Reviews", ["review", "rating", "feedback"]],
  [
    "Account",
    [
      "account",
      "password",
      "sign in",
      "sign up",
      "login",
      "log in",
      "email",
      "profile",
    ],
  ],
  [
    "Courses",
    ["course", "lesson", "enroll", "video", "preview", "learn", "instructor"],
  ],
];

export function getFaqCategory(faq) {
  if (faq?.category) return String(faq.category);

  const text = `${faq?.q ?? ""}`.toLowerCase();
  for (const [name, words] of RULES) {
    if (words.some((w) => text.includes(w))) return name;
  }
  return "General";
}
