// app/(auth)/reset-password/page.jsx
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }) {
  const { oobCode } = await searchParams;
  return (
    <AuthCard title="Choose a new password">
      <ResetPasswordForm oobCode={typeof oobCode === "string" ? oobCode : ""} />
    </AuthCard>
  );
}

