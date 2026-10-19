// app/(auth)/forgot-password/page.jsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email on your account and we'll send you a link to set a new one."
      footer={
        <Link
          href="/login"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
        >
          <ArrowLeft
            size={14}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Back to log in
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
