// app/(auth)/reset-password/page.jsx
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Choose a new password" };

const backToLoginFooter = (
  <Link
    href="/login"
    className="font-medium text-primary underline-offset-4 hover:underline"
  >
    Back to log in
  </Link>
);

export default async function ResetPasswordPage({ searchParams }) {
  const { oobCode } = await searchParams;
  const code = typeof oobCode === "string" ? oobCode : "";

  if (!code) {
    return (
      <AuthCard
        title="Reset link invalid"
        description="This password reset link is missing or has expired. Request a new one to continue."
        footer={backToLoginFooter}
      >
        <Link
          href="/forgot-password"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Enter a new password for your account."
      footer={backToLoginFooter}
    >
      <ResetPasswordForm oobCode={code} />
    </AuthCard>
  );
}
