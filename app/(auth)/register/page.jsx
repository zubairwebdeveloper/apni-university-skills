import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create account",
  description: "Create your Apni University account and start learning.",
};

export default async function RegisterPage() {
 

  return (
    <AuthCard
      title="Create your account"
      description="Start learning for free. No card needed."
      footer={
        <div className="flex flex-wrap items-center justify-center gap-1 text-sm">
          <span className="text-muted-foreground">
            Already have an account?
          </span>

          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Log in
          </Link>
        </div>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
