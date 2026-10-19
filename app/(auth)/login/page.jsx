// app/(auth)/login/page.jsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { ResumeSession } from "@/components/auth/ResumeSession";
import { getSessionUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/utils/url";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const target = safeNext(next);

  const user = await getSessionUser(); // sirf valid token par user
  if (user) redirect(target);

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to pick up where you left off."
      footer={
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <span>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </span>
          <Link
            href="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      }
    >
      <ResumeSession next={target} />
      <LoginForm next={target} />
    </AuthCard>
  );
}
