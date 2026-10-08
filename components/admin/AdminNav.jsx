// components/admin/AdminNav.jsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

import { adminNav } from "@/config/adminNav";
import { cn } from "@/lib/utils";

const CLOSED_KEY = "admin:nav-closed";

function readClosed() {
  try {
    const raw = localStorage.getItem(CLOSED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function writeClosed(list) {
  try {
    localStorage.setItem(CLOSED_KEY, JSON.stringify(list));
  } catch {
    // Storage can be blocked; remembering collapsed groups is optional.
  }
}

// Permission filtering here is a UI convenience only.
// Pages and actions enforce permissions on the server.
export function AdminNav({ permissions, collapsed = false, onNavigate }) {
  const pathname = usePathname();
  const containerRef = useRef(null);

  const groups = adminNav
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => permissions.includes(i.permission)),
    }))
    .filter((g) => g.items.length);

  const isActive = ({ href, exact }) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const activeGroup = groups.find((g) => g.items.some(isActive))?.group;
  // Restore collapsed groups during initialization; the active group stays open.
  const [navState, setNavState] = useState(() => ({
    activeGroup,
    closed: readClosed().filter((name) => name !== activeGroup),
  }));

  // Adjust state when the active group changes, before rendering its contents.
  if (navState.activeGroup !== activeGroup) {
    setNavState((prev) => ({
      activeGroup,
      closed: activeGroup
        ? prev.closed.filter((name) => name !== activeGroup)
        : prev.closed,
    }));
  }
  const closed = navState.closed;

  const toggleGroup = (name) => {
    setNavState((prev) => {
      const next = prev.closed.includes(name)
        ? prev.closed.filter((n) => n !== name)
        : [...prev.closed, name];
      writeClosed(next);
      return { ...prev, closed: next };
    });
  };

  // Arrow Up / Down / Home / End move focus between links and group headings.
  const onKeyDown = (e) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;

    const nodes = [
      ...containerRef.current.querySelectorAll("[data-nav-focusable]"),
    ].filter((n) => !n.closest("[inert]"));
    const current = nodes.indexOf(document.activeElement);
    if (current === -1) return;

    e.preventDefault();
    let next = current;
    if (e.key === "ArrowDown") next = (current + 1) % nodes.length;
    if (e.key === "ArrowUp") next = (current - 1 + nodes.length) % nodes.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = nodes.length - 1;
    nodes[next]?.focus();
  };

  return (
    // div, not <nav>: the parent (sidebar or mobile sheet) already provides the nav landmark.
    <div
      ref={containerRef}
      onKeyDown={onKeyDown}
      className={cn("space-y-5", collapsed && "space-y-4")}
    >
      {groups.map((g, index) => {
        const open = collapsed || !closed.includes(g.group);
        const headingId = `admin-nav-${index}`;
        const panelId = `admin-nav-panel-${index}`;
        const groupHasActive = g.group === activeGroup;

        return (
          <div
            key={g.group}
            role="group"
            aria-labelledby={headingId}
            className={cn(index > 0 && collapsed && "border-t pt-4")}
          >
            {/* Group heading */}
            {collapsed ? (
              <p id={headingId} className="sr-only">
                {g.group}
              </p>
            ) : (
              <button
                type="button"
                data-nav-focusable
                onClick={() => toggleGroup(g.group)}
                aria-expanded={open}
                aria-controls={panelId}
                className="group/head mb-1.5 flex w-full items-center gap-2 rounded-md px-3 py-1 text-left outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  id={headingId}
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 transition-colors group-hover/head:text-foreground"
                >
                  {g.group}
                </span>

                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gradient-to-r from-border to-transparent"
                />

                {/* Shown only while the group is collapsed */}
                {!open ? (
                  <span className="flex items-center gap-1.5">
                    {groupHasActive ? (
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-primary"
                      />
                    ) : null}
                    <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium leading-4 text-muted-foreground">
                      {g.items.length}
                    </span>
                  </span>
                ) : null}

                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
                    !open && "-rotate-90",
                  )}
                />
              </button>
            )}

            {/* Collapsible panel (smooth height animation) */}
            <div
              id={panelId}
              inert={!open}
              className={cn(
                "grid",
                !collapsed &&
                  "transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div
                className={cn(
                  "min-h-0",
                  // -mx-3 / px-3 gives the accent bar (-left-3) room inside the clip area.
                  !collapsed &&
                    "-mx-3 overflow-hidden px-3 transition-opacity duration-200 motion-reduce:transition-none",
                  !collapsed && (open ? "opacity-100" : "opacity-0"),
                )}
              >
                <ul className="space-y-1">
                  {g.items.map((item) => {
                    const {
                      label,
                      href,
                      icon: Icon,
                      ready,
                      badge,
                      isNew,
                    } = item;
                    const active = isActive(item);

                    const hasBadge =
                      badge !== undefined && badge !== null && badge !== 0;
                    const badgeText =
                      typeof badge === "number" && badge > 99 ? "99+" : badge;

                    const row = cn(
                      "group relative flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm font-medium outline-none",
                      collapsed && "justify-center px-0",
                    );

                    const tile = (
                      <span
                        className={cn(
                          "relative grid size-9 shrink-0 place-items-center rounded-lg transition-all duration-200 motion-reduce:transition-none",
                          !ready
                            ? "bg-muted/50 text-muted-foreground/60"
                            : active
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/60 text-muted-foreground group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary motion-reduce:group-hover:scale-100",
                        )}
                      >
                        <Icon aria-hidden="true" className="size-4" />

                        {/* Collapsed: show a dot instead of the pill */}
                        {collapsed && hasBadge && ready ? (
                          <span
                            aria-hidden="true"
                            className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-background"
                          />
                        ) : null}
                      </span>
                    );

                    const text = (
                      <span
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-2",
                          collapsed && "sr-only",
                        )}
                      >
                        <span className="truncate">{label}</span>

                        {isNew && ready ? (
                          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-emerald-600 dark:text-emerald-400">
                            New
                          </span>
                        ) : null}

                        {collapsed && hasBadge && ready ? (
                          <span className="sr-only">({badgeText} pending)</span>
                        ) : null}
                      </span>
                    );

                    const tooltip = collapsed ? (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-md border bg-popover px-2.5 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                      >
                        {label}
                        {!ready ? (
                          <span className="font-normal text-muted-foreground">
                            (coming soon)
                          </span>
                        ) : null}
                        {ready && hasBadge ? (
                          <span className="rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-white">
                            {badgeText}
                          </span>
                        ) : null}
                      </span>
                    ) : null;

                    return (
                      <li key={href}>
                        {ready ? (
                          <Link
                            href={href}
                            data-nav-focusable
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              row,
                              "transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                              active
                                ? "bg-gradient-to-r from-primary/10 to-transparent text-foreground"
                                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                            )}
                          >
                            {/* Active accent bar */}
                            {active ? (
                              <span
                                aria-hidden="true"
                                className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                              />
                            ) : null}

                            {tile}
                            {text}

                            {!collapsed && hasBadge ? (
                              <span className="grid min-w-5 place-items-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                                {badgeText}
                              </span>
                            ) : null}

                            {/* Arrow: slides in on hover / focus, stays visible on the active page */}
                            {!collapsed ? (
                              <ChevronRight
                                aria-hidden="true"
                                className={cn(
                                  "size-4 shrink-0 transition-all duration-200 ease-out motion-reduce:transition-none",
                                  active
                                    ? "translate-x-0 text-primary opacity-100 group-hover:translate-x-0.5"
                                    : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                                )}
                              />
                            ) : null}

                            {tooltip}
                          </Link>
                        ) : (
                          <span
                            aria-disabled="true"
                            className={cn(
                              row,
                              "cursor-not-allowed text-muted-foreground/60",
                            )}
                          >
                            {tile}
                            {text}

                            {!collapsed && (
                              <span className="ml-auto rounded-full border border-dashed px-1.5 py-0.5 text-[10px] font-medium uppercase leading-none tracking-wide">
                                Soon
                              </span>
                            )}

                            {tooltip}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
