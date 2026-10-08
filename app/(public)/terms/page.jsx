
// app/(public)/terms/page.jsx

import { refundPolicy } from "@/config/legal";
import TermsContent from "@/components/public/legal/TermsContent";

export const metadata = {
  title: "Terms of Service | Apni University",
  description:
    "Read the terms that govern your use of Apni University, including courses, payments, refunds, accounts, content, reviews, and platform responsibilities.",
  alternates: {
    canonical: "/terms",
  },
};

const sections = [
  {
    id: "using-apni-university",
    heading: "Using Apni University",
    body: [
      "By creating an account or using Apni University, you agree to these Terms of Service. If you do not agree with these terms, please do not use the platform.",
      "You are responsible for providing accurate information, maintaining the security of your account, protecting your password, and notifying us if you believe your account has been accessed without permission.",
      "Apni University is designed to provide practical learning resources, courses, projects, career guidance, and educational opportunities. You agree to use the platform only for lawful and responsible purposes.",
    ],
  },
  {
    id: "accounts",
    heading: "Accounts and eligibility",
    body: [
      "Some features require you to create an account. You should use your own account and provide information that is accurate and reasonably up to date.",
      "You must not impersonate another person, create accounts for fraudulent purposes, or attempt to gain unauthorized access to another user's account.",
      "We may restrict, suspend, or terminate accounts that violate these Terms, compromise platform security, or are used for abusive or unlawful activity.",
    ],
  },
  {
    id: "courses-access",
    heading: "Courses and learning access",
    body: [
      "When you enroll in a course, Apni University grants you a personal, limited, non-transferable license to access the course materials for your own educational use.",
      "Course access does not transfer ownership of the underlying videos, lessons, projects, documents, graphics, code examples, or other educational materials.",
      "You may not copy, reproduce, resell, publicly redistribute, upload, publish, share account access, or commercially exploit course materials without appropriate permission.",
      "Course availability, curriculum, instructors, lessons, and educational resources may change over time as we improve the learning experience.",
    ],
  },
  {
    id: "payments",
    heading: "Payments and purchases",
    body: [
      "Paid courses and other paid services are presented with their applicable price and currency before you complete a purchase.",
      "Payments may be processed through Stripe or another authorized payment provider. Apni University does not intentionally store your complete card number or sensitive card authentication information.",
      "Course access may be granted after our server receives and verifies successful payment confirmation.",
      "You must not attempt fraudulent transactions, chargeback abuse, payment manipulation, or unauthorized use of another person's payment method.",
    ],
  },
  {
    id: "refunds",
    heading: "Refunds and cancellations",
    body: [refundPolicy],
    note:
      "Please review the applicable refund policy before completing a purchase.",
  },
  {
    id: "reviews",
    heading: "Reviews and community conduct",
    body: [
      "We want Apni University to remain a useful and respectful learning environment. Reviews, comments, and other public submissions should be honest, relevant, and based on genuine experience.",
      "You must not publish unlawful, threatening, abusive, hateful, fraudulent, misleading, or intentionally harmful content.",
      "We may moderate, edit, hide, or remove content that violates our policies or negatively affects the safety and integrity of the platform.",
    ],
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    body: [
      "You may not attempt to bypass authentication, exploit vulnerabilities, interfere with platform availability, scrape protected information, distribute malicious software, or access areas that you are not authorized to use.",
      "You must not use Apni University to facilitate fraud, harassment, abuse, unauthorized commercial activity, or any other unlawful activity.",
      "Security testing or automated access should only be performed with explicit authorization.",
    ],
  },
  {
    id: "jobs",
    heading: "Jobs and third-party services",
    body: [
      "Apni University may display job opportunities, career resources, external learning resources, or links to third-party websites.",
      "Job listings are provided for informational purposes. Apni University does not employ the organizations listed on the platform and does not guarantee interviews, employment, salary, or career outcomes.",
      "Third-party websites operate under their own terms and privacy policies. We are not responsible for their content, availability, security, or practices.",
    ],
  },
  {
    id: "educational-content",
    heading: "Educational content and career guidance",
    body: [
      "Our courses, tutorials, projects, career guides, and other educational resources are provided for learning and informational purposes.",
      "Technology, tools, frameworks, employment markets, and industry practices change frequently. We therefore cannot guarantee that every piece of educational content will remain current indefinitely.",
      "You are responsible for evaluating information and deciding how to apply what you learn.",
    ],
  },
  {
    id: "no-guarantees",
    heading: "No guarantees",
    body: [
      "Completing a course does not guarantee employment, freelance work, clients, income, certification, admission, promotion, or any specific professional result.",
      "Your results depend on many factors, including your skills, effort, experience, market conditions, opportunities, and how you apply what you learn.",
    ],
  },
  {
    id: "intellectual-property",
    heading: "Intellectual property",
    body: [
      "The Apni University name, logo, branding, platform design, original content, and other site materials belong to Apni University or their respective owners.",
      "Course content may also be owned by instructors, creators, licensors, or other rights holders.",
      "Nothing in these Terms gives you ownership of our intellectual property. You receive only the limited rights necessary to use the platform and purchased educational content as permitted by these Terms.",
    ],
  },
  {
    id: "user-content",
    heading: "User-generated content",
    body: [
      "If you submit reviews, comments, feedback, suggestions, or other content to Apni University, you remain responsible for that content.",
      "By submitting content intended to be displayed publicly, you grant Apni University permission to use, display, reproduce, and distribute that content as reasonably necessary to operate and promote the platform.",
      "Do not submit confidential information, copyrighted material that you do not have permission to share, or personal information belonging to another person.",
    ],
  },
  {
    id: "availability",
    heading: "Platform availability",
    body: [
      "We work to keep Apni University reliable and available, but we cannot guarantee uninterrupted access.",
      "The platform may occasionally be unavailable because of maintenance, infrastructure problems, security incidents, third-party services, network failures, or other circumstances outside our reasonable control.",
    ],
  },
  {
    id: "limitation",
    heading: "Limitation of liability",
    body: [
      "To the maximum extent permitted by applicable law, Apni University provides the platform and its educational resources on an 'as is' and 'as available' basis.",
      "To the extent permitted by law, we are not responsible for indirect, incidental, special, consequential, or business losses resulting from your use of or inability to use the platform.",
    ],
  },
  {
    id: "changes",
    heading: "Changes to these Terms",
    body: [
      "We may update these Terms from time to time as Apni University grows, adds new features, changes its services, or responds to legal and operational requirements.",
      "When we make material changes, we may update the date displayed on this page and provide additional notice where appropriate.",
      "Your continued use of Apni University after updated Terms become effective means you accept the revised Terms.",
    ],
  },
  {
    id: "contact",
    heading: "Questions and contact",
    body: [
      "If you have questions about these Terms, payments, refunds, courses, or your account, please contact the Apni University team.",
      "We encourage you to contact us before making a purchase if you are unsure about any important part of these Terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <TermsContent
      sections={sections}
      refundPolicy={refundPolicy}
    />
  );
}
