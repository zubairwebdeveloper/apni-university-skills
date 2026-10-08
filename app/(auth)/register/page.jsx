// app/(auth)/register/page.jsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getSessionUser()) redirect("/student");
  return (
    <AuthCard
      title="Create your account"
      description="Start learning for free. No card needed."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}

