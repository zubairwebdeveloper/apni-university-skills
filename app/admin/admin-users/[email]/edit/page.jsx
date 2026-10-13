// app/admin/admin-users/[email]/edit/page.jsx
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";

import { EditAdminLoader } from "@/components/admin/admin-users/EditAdminLoader";
import { CopyEmailButton } from "@/components/admin/admin-users/CopyEmailButton";
import { buttonVariants } from "@/components/ui/button";
import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P } from "@/lib/constants/permissions";

export const metadata = { title: "Edit admin" };

const editable = [
  {
    icon: User,
    label: "Name",
    text: "How this admin appears across the dashboard.",
  },
  { icon: Camera, label: "Photo", text: "Their profile picture." },
  { icon: ShieldCheck, label: "Role", text: "What they are allowed to do." },
];

/* ---------- 3D header background (pure CSS, motion-safe) ---------- */

function Cube({ size = 64, duration = 28, from = [-25, 35], className }) {
  const h = size / 2;
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];
  return (
    <div
      className={className}
      style={{ width: size, height: size, perspective: 600 }}
    >
      <div
        className="ea-spin relative size-full"
        style={{
          transformStyle: "preserve-3d",
          animationDuration: `${duration}s`,
          "--rx": `${from[0]}deg`,
          "--ry": `${from[1]}deg`,
          transform: "rotateX(var(--rx)) rotateY(var(--ry))",
        }}
      >
        {faces.map((transform, i) => (
          <span
            key={i}
            className="absolute inset-0 border border-[rgb(var(--ea-a)/0.5)] bg-[rgb(var(--ea-a)/0.06)]"
            style={{ transform }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 size-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--ea-b))]"
          style={{ boxShadow: "0 0 18px 5px rgb(var(--ea-b) / 0.55)" }}
        />
      </div>
    </div>
  );
}

function HeaderBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <style>{`
        @keyframes ea-spin { from { transform: rotateX(var(--rx)) rotateY(var(--ry)); } to { transform: rotateX(calc(var(--rx) + 360deg)) rotateY(calc(var(--ry) + 360deg)); } }
        @keyframes ea-orbit { to { transform: rotate(360deg); } }
        @keyframes ea-grid { from { transform: translateY(0); } to { transform: translateY(40px); } }
        @keyframes ea-drift { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(40px,18px,0); } }
        @media (prefers-reduced-motion: no-preference) {
          .ea-spin { animation: ea-spin 28s linear infinite; }
          .ea-orbit { animation: ea-orbit 24s linear infinite; }
          .ea-grid { animation: ea-grid 3s linear infinite; }
          .ea-drift { animation: ea-drift 18s ease-in-out infinite; }
        }
      `}</style>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, rgb(var(--ea-a) / 0.10), transparent 50%, rgb(var(--ea-b) / 0.10))",
        }}
      />
      <div
        className="ea-drift absolute -left-16 -top-24 h-72 w-72 rounded-full will-change-transform"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--ea-a) / 0.22), transparent)",
        }}
      />

      {/* Perspective grid floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/4 overflow-hidden text-[rgb(var(--ea-a))] [mask-image:linear-gradient(to_top,black_15%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_15%,transparent)]"
        style={{ perspective: 360 }}
      >
        <div
          className="absolute inset-x-[-60%] -top-[40%] h-[220%] opacity-[0.28]"
          style={{ transform: "rotateX(64deg)" }}
        >
          <div
            className="ea-grid absolute inset-x-0 -top-10 bottom-0 will-change-transform"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      {/* Orbit ring + cube, right side (hidden on small screens) */}
      <div
        className="absolute -right-10 top-1/2 hidden -translate-y-1/2 sm:block"
        style={{ width: 280, height: 280, perspective: 800 }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: "rotateX(72deg)" }}
        >
          <div className="ea-orbit relative size-full rounded-full border border-[rgb(var(--ea-b)/0.3)] text-[rgb(var(--ea-b))]">
            <span
              className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
              style={{ boxShadow: "0 0 14px 3px currentColor" }}
            />
          </div>
        </div>
        <Cube size={56} className="absolute left-1/2 top-1/2 -ml-7 -mt-7" />
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
      role="status"
      aria-label="Loading admin details"
    >
      <div className="flex items-center gap-4">
        <div className="size-16 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </div>
      </div>
      <div className="h-10 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      <div className="h-10 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      <div className="h-10 w-32 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
    </div>
  );
}

/* ---------- Page ---------- */

export default async function EditAdminPage({ params }) {
  await requirePermission(P.USERS_ROLES);
  const { email } = await params;
  const clean = decodeURIComponent(email).toLowerCase();
  const initial = clean.trim().charAt(0).toUpperCase() || "A";

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
          Edit
        </span>
      </nav>

      {/* Header card */}
      <header className="relative isolate overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none sm:p-8">
        <HeaderBackdrop />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[rgb(var(--ea-a))] to-[rgb(var(--ea-b))] text-xl font-semibold text-white shadow-lg shadow-[rgb(var(--ea-a)/0.25)] dark:text-[#080B12]"
            >
              {initial}
            </span>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Edit admin
              </h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Update the name, photo or role for{" "}
                <span className="break-all font-medium text-foreground">
                  {clean}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <CopyEmailButton email={clean} />
            <Link
              href="/admin/admin-users"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "bg-background/60 backdrop-blur-sm",
              })}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              All admins
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Form (existing loader, unchanged) */}
        <section
          aria-label="Edit admin form"
          className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none"
          style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
        >
          <Suspense fallback={<FormSkeleton />}>
            <EditAdminLoader email={clean} />
          </Suspense>
        </section>

        {/* Side panel */}
        <aside
          className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none lg:sticky lg:top-6 lg:self-start"
          style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
        >
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">What you can change</h2>
            <ul className="mt-4 space-y-4">
              {editable.map(({ icon: Icon, label, text }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgb(var(--ea-a)/0.12)] text-[rgb(var(--ea-a))] ring-1 ring-[rgb(var(--ea-a)/0.25)]">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-sm text-muted-foreground">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--ea-a))] to-transparent"
            />
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck
                aria-hidden="true"
                className="size-4 text-[rgb(var(--ea-a))]"
              />
              Restricted page
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Only people with permission to manage roles can open this page, so
              double-check the role before you save.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
