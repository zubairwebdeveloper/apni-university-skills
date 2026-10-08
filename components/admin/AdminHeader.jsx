// components/admin/AdminHeader.jsx
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { AdminUserMenu } from "./AdminUserMenu";
import { AdminSearch } from "./AdminSearch";
import { AdminAttention } from "./AdminAttention";
import { getAttention } from "@/services/admin/attentionService";

// Fetches the attention items on its own so the rest of the header
// never waits for it. Falls back to an empty list on any error.
async function AttentionSlot({ role }) {
  const items = await getAttention(role).catch(() => []);
  return <AdminAttention items={items} />;
}

function AttentionSkeleton() {
  return (
    <Skeleton aria-hidden="true" className="size-9 shrink-0 rounded-full" />
  );
}

export function AdminHeader({ person, role, permissions }) {
  return (
    <header
      aria-label="Admin header"
      className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/85 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:gap-3 sm:px-6 lg:px-8"
    >
      {/* Keyboard users can jump straight past the header */}
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to main content
      </a>

      <AdminMobileNav permissions={permissions} />

      <div className="min-w-0 flex-1">
        <AdminBreadcrumbs />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <AdminSearch />

        <Suspense fallback={<AttentionSkeleton />}>
          <AttentionSlot role={role} />
        </Suspense>

        <div
          aria-hidden="true"
          className="mx-1 hidden h-6 w-px bg-border sm:block"
        />

        <AdminUserMenu person={person} role={role} />
      </div>
    </header>
  );
}
