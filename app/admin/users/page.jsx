import { z } from "zod";
import {
  ArrowUpRight,
  CheckCircle2,
  KeyRound,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  UserCog,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTableToolbar } from "@/components/admin/table/DataTableToolbar";
import { UsersTable } from "@/components/admin/people/PeopleTables";
import { CursorPagination } from "@/components/shared/CursorPagination";

import { requirePermission } from "@/lib/auth/authorize";
import { PERMISSIONS as P, permissionsFor } from "@/lib/constants/permissions";
import { ROLE_LABELS, ROLE_LIST } from "@/lib/constants/roles";

import { RANGE_OPTIONS, sortOptions } from "@/config/adminTable";
import { FLAG_FILTERS, flagOptions } from "@/config/adminPeople";
import { parseListParams, rangeFilter } from "@/lib/admin/listParams";

import {
  USER_SORTS,
  userAdminRepository,
} from "@/repositories/admin/userAdminRepository";

export const metadata = {
  title: "Users & Roles",
};

function OverviewCard({ icon: Icon, label, value, description, accent }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${accent} transition-transform duration-300 group-hover:scale-105`}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default async function AdminUsersPage({ searchParams }) {
  const user = await requirePermission(P.USERS_READ);

  const p = parseListParams(await searchParams, {
    sorts: USER_SORTS,
    filters: {
      ...FLAG_FILTERS,
      role: z.enum(ROLE_LIST),
    },
  });

  const { items, nextCursor, total } = await userAdminRepository.list({
    role: p.role,
    active: p.active ? p.active === "active" : undefined,
    verified: p.verified ? p.verified === "yes" : undefined,
    keyword: p.keyword,
    sort: p.sort,
    after: p.after,
    range: rangeFilter(p.range),
  });

  const { after, keyword, ...linkParams } = p;

  const activeFilterCount = [
    p.role,
    p.active,
    p.verified,
    p.range,
    keyword,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">
      {/* Premium page heading */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-16 size-52 rounded-full bg-purple-500/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 size-48 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative p-4 sm:p-6 lg:p-7">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-purple-600 dark:text-purple-400">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Identity & access
            </span>

            <span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
              ADMIN WORKSPACE
            </span>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <AdminPageHeader
                title="Users & Roles"
                description="Manage platform accounts, review assigned roles and oversee account access from one central workspace."
              />
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border/70 bg-background/80 p-3 sm:min-w-52">
              <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Users className="size-5" aria-hidden="true" />
              </div>

              <div>
                <p className="text-xl font-bold leading-tight tracking-tight text-foreground">
                  {total.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Matching accounts
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-purple-500 to-transparent" />
      </div>

      {/* Current query overview */}
      <section
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="User directory overview"
      >
        <OverviewCard
          icon={Users}
          label="Matching accounts"
          value={total.toLocaleString()}
          description="Accounts returned by the current query and filters."
          accent="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />

        <OverviewCard
          icon={KeyRound}
          label="Available roles"
          value={ROLE_LIST.length}
          description="Role types defined by your application."
          accent="bg-yellow-400/15 text-amber-600 dark:text-yellow-400"
        />

        <OverviewCard
          icon={Search}
          label="Applied filters"
          value={activeFilterCount}
          description="Search, role, account status, email verification and join date."
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
      </section>

      {/* Role overview */}
      <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/15 text-amber-600 dark:text-yellow-400">
            <UserCog className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold tracking-tight text-foreground">
              Role directory
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Filter accounts by the roles configured in your application.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {ROLE_LIST.map((role) => {
            const selected = p.role === role;

            return (
              <div
                key={role}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  selected
                    ? "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    : "border-border/70 bg-muted/20 text-muted-foreground"
                }`}
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                {ROLE_LABELS[role]}
                {selected ? (
                  <span className="size-1.5 rounded-full bg-purple-500" />
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Users table */}
      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-5" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold tracking-tight text-foreground">
                All accounts
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                Search accounts and inspect their current access roles.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500" />
            Permission controlled
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <div className="mb-4 rounded-xl border border-border/60 bg-muted/20 p-2 sm:p-3">
            <DataTableToolbar
              searchPlaceholder="Search by name or email..."
              total={total}
              sorts={sortOptions(USER_SORTS)}
              filters={[
                {
                  key: "role",
                  label: "Role",
                  allLabel: "All roles",
                  options: ROLE_LIST.map((role) => ({
                    value: role,
                    label: ROLE_LABELS[role],
                  })),
                },
                ...flagOptions,
                {
                  key: "range",
                  label: "Joined",
                  allLabel: "Any time",
                  options: RANGE_OPTIONS,
                },
              ]}
            />
          </div>

          {activeFilterCount > 0 ? (
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Search className="size-3.5" aria-hidden="true" />
              <span>Active filters</span>

              {keyword ? (
                <span className="rounded-md border border-border/70 bg-background px-2 py-1 font-medium text-foreground">
                  Search: {keyword}
                </span>
              ) : null}

              {p.role ? (
                <span className="rounded-md border border-border/70 bg-background px-2 py-1 font-medium text-foreground">
                  Role: {ROLE_LABELS[p.role]}
                </span>
              ) : null}

              {p.active ? (
                <span className="rounded-md border border-border/70 bg-background px-2 py-1 font-medium text-foreground">
                  Account: {p.active}
                </span>
              ) : null}

              {p.verified ? (
                <span className="rounded-md border border-border/70 bg-background px-2 py-1 font-medium text-foreground">
                  Email: {p.verified === "yes" ? "Verified" : "Not verified"}
                </span>
              ) : null}

              {p.range ? (
                <span className="rounded-md border border-border/70 bg-background px-2 py-1 font-medium text-foreground">
                  Join date filter applied
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="min-w-0">
            <UsersTable
              rows={items}
              perms={permissionsFor(user.role)}
              selfUid={user.uid}
            />
          </div>

          <div className="mt-4 border-t border-border/70 pt-4">
            <CursorPagination
              basePath="/admin/users"
              params={linkParams}
              after={after}
              nextCursor={nextCursor}
            />
          </div>
        </div>
      </section>

      {/* Access and audit notice */}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Handle role changes carefully
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
              Role changes can affect platform access and may sign the affected
              user out. Confirm the intended permissions before making changes.
            </p>
          </div>
        </div>

        <div className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Audited changes
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
