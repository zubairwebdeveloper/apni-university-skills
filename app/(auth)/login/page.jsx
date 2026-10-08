// app/(auth)/login/page.jsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/utils/url";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const next = safeNext((await searchParams).next);
  if (await getSessionUser()) redirect(next);
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to continue learning."
      footer={
        <>
          New here?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthCard>
  );
}

