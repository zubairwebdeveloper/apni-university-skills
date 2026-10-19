// app/admin/admin-users/page.jsx
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MailCheck,
  Pencil,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";

import { AdminHeaderBackdrop } from "@/components/admin/admin-users/AdminHeaderBackdrop";
import { AdminUsersTable } from "@/components/admin/admin-users/AdminUsersTable";
import { buttonVariants } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const metadata = { title: "Admin users" };

const tips = [
  {
    icon: UserPlus,
    title: "Add an admin",
    text: "Give a new person access to the dashboard.",
    href: "/admin/admin-users/create",
    cta: "Add admin",
  },
  {
    icon: Pencil,
    title: "Edit details",
    text: "Open an admin from the table to change their name, photo or role.",
  },
  {
    icon: MailCheck,
    title: "Access is by email",
    text: "Only the emails in this list can open the dashboard.",
  },
];

function TableSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading admin users"
      className="space-y-3 rounded-2xl border border-border bg-card p-4"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="size-10 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
          <div className="hidden h-6 w-20 animate-pulse rounded-full bg-muted motion-reduce:animate-none sm:block" />
        </div>
      ))}
    </div>
  );
}

export default async function AdminUsersPage() {
  await requirePermission(P.ADMIN_ACCESS);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header card */}
      <header className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none sm:p-8">
        <AdminHeaderBackdrop />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            >
              <Users className="size-6" />
            </span>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Admin users
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                The people who can sign in to this dashboard.
              </p>
            </div>
          </div>

          <Link
            href="/admin/admin-users/create"
            className={buttonVariants({
              className:
                "group relative overflow-hidden border-0 bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 active:scale-95 motion-reduce:active:scale-100 sm:shrink-0",
            })}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[320%] motion-reduce:hidden"
            />
            <Plus aria-hidden="true" className="relative mr-2 size-4" />
            <span className="relative">Add admin</span>
          </Link>
        </div>
      </header>

      {/* Quick guide */}
      <ul
        className="grid gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none sm:grid-cols-3"
        style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
      >
        {tips.map(({ icon: Icon, title, text, href, cta }) => {
          const body = (
            <>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/25 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{title}</span>
                <span className="block text-sm text-muted-foreground">
                  {text}
                </span>
                {cta && (
                  <span className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {cta}
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </span>
                )}
              </span>
            </>
          );
          const base =
            "group relative flex h-full items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 motion-reduce:transition-none";
          return (
            <li key={title}>
              {href ? (
                <Link
                  href={href}
                  className={`${base} hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                >
                  {body}
                </Link>
              ) : (
                <div className={base}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Table (existing component, unchanged) */}
      <section
        aria-label="Admin users list"
        className="animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
        style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
      >
        <Suspense fallback={<TableSkeleton />}>
          <AdminUsersTable />
        </Suspense>
      </section>
    </div>
  );
}
