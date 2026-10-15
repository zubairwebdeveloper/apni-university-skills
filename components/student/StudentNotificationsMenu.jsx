"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Bell,
  BellOff,
  BookOpen,
  CheckCheck,
  Megaphone,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getHeaderNotifications,
  markAllNotificationsRead,
  setNotificationsRead,
} from "@/app/actions/notificationInbox";

const POLL_MS = 60_000;

function timeAgo(ms) {
  if (!ms) return "";
  const mins = Math.floor(Math.max(0, Date.now() - ms) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(ms).toLocaleDateString();
}

function iconFor(href) {
  const l = (href ?? "").toLowerCase();
  if (l.includes("certificate")) return Award;
  if (l.includes("course") || l.includes("learning")) return BookOpen;
  return Megaphone;
}

export function StudentNotificationsMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getHeaderNotifications();
      if (res?.ok) {
        setItems(res.items ?? []);
        setUnread(res.unread ?? 0);
      }
    } catch {
      // Keep whatever is already shown if the request fails.
    } finally {
      setLoaded(true);
    }
  }, []);

  // Load on mount and whenever the page changes (e.g. after reading on the full page)
  useEffect(() => {
    load();
  }, [load, pathname]);

  // Light polling + refresh when the tab regains focus
  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && load();
    const id = window.setInterval(tick, POLL_MS);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", tick);
    };
  }, [load]);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (next) load(); // always show fresh data when opened
  };

  async function openItem(n) {
    setOpen(false);

    if (!n.read) {
      setItems((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((c) => Math.max(0, c - 1));
      setNotificationsRead({ ids: [n.id], read: true })
        .then((res) => !res?.ok && load())
        .catch(() => load());
    }

    router.push(n.href || "/student/notifications");
  }

  async function markAll() {
    setItems((l) => l.map((x) => ({ ...x, read: true })));
    setUnread(0);
    try {
      const res = await markAllNotificationsRead();
      if (!res?.ok) load();
    } catch {
      load();
    }
    router.refresh();
  }

  const visible = tab === "unread" ? items.filter((n) => !n.read) : items;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        aria-label={`Notifications, ${unread} unread`}
        className="group relative inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:text-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary active:scale-95"
      >
        <Bell className="size-[18px] transition-transform duration-300 group-hover:rotate-[-8deg]" />

        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-[17px] items-center justify-center rounded-full border-2 border-background bg-primary text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(23rem,calc(100vw-1rem))] rounded-2xl p-0"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {unread ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>

          {unread > 0 && (
            <button
              type="button"
              onClick={markAll}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="flex gap-1 border-b border-border px-3 py-2">
          {["all", "unread"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                tab === t
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="max-h-[min(55vh,24rem)] overflow-y-auto p-2">
          {!loaded ? (
            <div className="space-y-2 p-2" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-muted/60"
                />
              ))}
            </div>
          ) : visible.length ? (
            visible.map((n) => {
              const Icon = iconFor(n.href);
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => openItem(n)}
                  className={cn(
                    "flex w-full cursor-pointer gap-3 rounded-xl p-3 text-left transition-all duration-200 hover:translate-x-0.5 hover:bg-muted/70",
                    !n.read && "bg-primary/[0.04]",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          "line-clamp-2 text-sm",
                          n.read ? "font-medium" : "font-semibold",
                        )}
                      >
                        {n.title}
                      </span>
                      {!n.read && (
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </span>

                    {n.body && (
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                        {n.body}
                      </span>
                    )}

                    <span className="mt-1.5 block text-[10px] text-muted-foreground">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-10 text-center">
              <BellOff className="mx-auto mb-3 size-7 text-muted-foreground/60" />
              <p className="text-sm font-semibold">
                {tab === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Announcements from our team will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border p-2">
          <Link
            href="/student/notifications"
            onClick={() => setOpen(false)}
            className="group flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            View all notifications
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default StudentNotificationsMenu;
