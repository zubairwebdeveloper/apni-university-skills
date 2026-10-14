// app/admin/admin-users/create/page.jsx
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  ShieldCheck,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";

import { AdminHeaderBackdrop } from "@/components/admin/admin-users/AdminHeaderBackdrop";
import { AdminUserForm } from "@/components/admin/admin-users/AdminUserForm";

import { buttonVariants } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const metadata = { title: "Add admin" };

const steps = [
  {
    icon: UserPlus,
    title: "Fill in their details",
    text: "Add their name and the email they will sign in with.",
  },
  {
    icon: ShieldCheck,
    title: "Choose a role",
    text: "The role decides what they can see and do in the dashboard.",
  },
  {
    icon: UserRoundCheck,
    title: "They sign in",
    text: "They use that email and see only what their role allows.",
  },
];

export default async function CreateAdminPage() {
  await requirePermission(P.USERS_ROLES);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 [--ea-a:5_150_105] [--ea-b:37_99_235] dark:[--ea-a:52_211_153] dark:[--ea-b:79_140_255] sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-muted-foreground animate-in fade-in duration-500 motion-reduce:animate-none"
      >
        <Link
          href="/admin/admin-users"
          className="transition-colors hover:text-foreground"
        >
          Admin users
        </Link>
        <ChevronRight aria-hidden="true" className="size-3.5" />
        <span className="font-medium text-foreground" aria-current="page">
          Add admin
        </span>
      </nav>

      {/* Header card */}
      <header className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none sm:p-8">
        <AdminHeaderBackdrop />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[rgb(var(--ea-a))] to-[rgb(var(--ea-b))] text-white shadow-lg shadow-[rgb(var(--ea-a)/0.25)] dark:text-[#080B12]"
            >
              <UserPlus className="size-6" />
            </span>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Add a new admin
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Give someone access to the dashboard. They will sign in with
                this email and see only what their role allows.
              </p>
            </div>
          </div>

          <Link
            href="/admin/admin-users"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "bg-background/60 backdrop-blur-sm sm:shrink-0",
            })}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            All admins
          </Link>
        </div>
      </header>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Form (existing component, unchanged) */}
        <section
          aria-label="Add admin form"
          className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
          style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
        >
          <AdminUserForm mode="create" />
        </section>

        {/* Side panel */}
        <aside
          className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none lg:sticky lg:top-6 lg:self-start"
          style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
        >
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">How it works</h2>
            <ol className="relative mt-4 space-y-5">
              {/* connecting line */}
              <span
                aria-hidden="true"
                className="absolute bottom-4 left-[17px] top-4 w-px bg-gradient-to-b from-[rgb(var(--ea-a)/0.5)] to-[rgb(var(--ea-b)/0.5)]"
              />
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="relative flex items-start gap-3">
                  <span className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-[rgb(var(--ea-a)/0.3)] bg-card text-[rgb(var(--ea-a))]">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      <span className="sr-only">Step {i + 1}: </span>
                      {title}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--ea-a))] to-transparent"
            />
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Mail
                aria-hidden="true"
                className="size-4 text-[rgb(var(--ea-a))]"
              />
              Check the email first
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              They sign in with the exact email you enter, so make sure it is
              spelled correctly before you save.
            </p>
            <Link
              href="/admin/admin-users"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[rgb(var(--ea-a))] transition-colors hover:underline"
            >
              See current admins
              <ChevronRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
