// app/(auth)/login/page.jsx
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
    <AuthCard /* apne purane props yahan rakhein */>
      <ResumeSession next={target} />
      <LoginForm next={target} />
    </AuthCard>
  );
}
