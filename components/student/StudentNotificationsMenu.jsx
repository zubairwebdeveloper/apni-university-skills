// components/student/StudentNotificationsMenu.jsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Bell,
  BellOff,
  BookOpen,
  CheckCheck,
  Megaphone,
  RefreshCw,
  TriangleAlert,
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

/* Design tokens: yellow = unread highlight, violet = selected states */
const FOCUS =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const FOCUS_INSET =
  "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8B5CF6]";

const TABS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
];

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

// Icon + tone per notification type (derived from the link, as before)
function metaFor(href) {
  const l = (href ?? "").toLowerCase();
  if (l.includes("certificate"))
    return {
      Icon: Award,
      tone: "bg-[#FACC15]/15 text-amber-700 dark:text-[#FACC15]",
      label: "Certificate",
    };
  if (l.includes("course") || l.includes("learning"))
    return {
      Icon: BookOpen,
      tone: "bg-[#8B5CF6]/10 text-violet-700 dark:text-violet-300",
      label: "Course",
    };
  return {
    Icon: Megaphone,
    tone: "bg-muted text-muted-foreground",
    label: "Announcement",
  };
}

export function StudentNotificationsMenu() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getHeaderNotifications();
      if (res?.ok) {
        setItems(res.items ?? []);
        setUnread(res.unread ?? 0);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch {
      // Keep whatever is already shown if the request fails.
      setFailed(true);
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
    <MotionConfig reducedMotion="user">
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger
          aria-label={`Notifications, ${unread} unread`}
          className={cn(
            "group relative inline-flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-all duration-200 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/[0.06] hover:text-[#8B5CF6] active:scale-95 data-[popup-open]:border-[#8B5CF6]/50 data-[popup-open]:bg-[#8B5CF6]/[0.06] data-[popup-open]:text-[#8B5CF6]",
            FOCUS,
          )}
        >
          <Bell className="size-[18px] transition-transform duration-300 group-hover:-rotate-[8deg]" />

          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-background bg-[#FACC15] px-1 text-[9px] font-extrabold leading-none text-[#111318]"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-[min(23rem,calc(100vw-1rem))] overflow-hidden rounded-2xl p-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight">Notifications</p>
              <p
                className="mt-0.5 text-xs text-muted-foreground"
                aria-live="polite"
              >
                {unread
                  ? `${unread} unread ${unread === 1 ? "message" : "messages"}`
                  : "You're all caught up"}
              </p>
            </div>

            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/[0.06]",
                  FOCUS,
                )}
              >
                <CheckCheck className="size-3.5 text-[#8B5CF6]" />
                Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Filter notifications"
            className="flex gap-1 border-b border-border px-3 pb-2"
          >
            {TABS.map((t) => {
              const selected = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "relative inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    FOCUS,
                    selected
                      ? "text-violet-700 dark:text-violet-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="notif-tab"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-0 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/10"
                    />
                  )}
                  <span className="relative">{t.label}</span>
                  {t.id === "unread" && unread > 0 && (
                    <span className="relative rounded-full bg-[#FACC15] px-1.5 py-px text-[10px] font-bold leading-none text-[#111318]">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div
            role="tabpanel"
            className="max-h-[min(55vh,24rem)] overflow-y-auto p-2"
          >
            {!loaded ? (
              <div className="space-y-1 p-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-3 rounded-xl p-3">
                    <div className="size-9 shrink-0 animate-pulse rounded-xl bg-muted" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-2.5 w-full animate-pulse rounded bg-muted/70" />
                      <div className="h-2 w-1/4 animate-pulse rounded bg-muted/60" />
                    </div>
                  </div>
                ))}
              </div>
            ) : failed && !items.length ? (
              <div className="px-4 py-10 text-center">
                <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/50">
                  <TriangleAlert className="size-5 text-amber-600 dark:text-[#FACC15]" />
                </span>
                <p className="text-sm font-semibold">
                  Couldn&apos;t load notifications
                </p>
                <p className="mx-auto mt-1 max-w-[15rem] text-xs leading-relaxed text-muted-foreground">
                  Check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={load}
                  className={cn(
                    "mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold transition-colors hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/[0.06]",
                    FOCUS,
                  )}
                >
                  <RefreshCw className="size-3.5" />
                  Try again
                </button>
              </div>
            ) : visible.length ? (
              <>
                {failed && (
                  <p
                    role="status"
                    className="mb-1 flex items-center gap-1.5 rounded-lg bg-[#FACC15]/10 px-3 py-2 text-[11px] font-medium text-amber-800 dark:text-[#FACC15]"
                  >
                    <TriangleAlert className="size-3.5 shrink-0" />
                    Couldn&apos;t refresh. Showing your last update.
                  </p>
                )}

                <ul className="space-y-0.5">
                  {visible.map((n, index) => {
                    const { Icon, tone, label } = metaFor(n.href);
                    return (
                      <motion.li
                        key={n.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.22,
                          delay: Math.min(index, 6) * 0.03,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => openItem(n)}
                          className={cn(
                            "group/item relative flex w-full cursor-pointer gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/70",
                            FOCUS_INSET,
                            !n.read && "bg-[#FACC15]/[0.06]",
                          )}
                        >
                          {!n.read && (
                            <span
                              aria-hidden
                              className="absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-[#FACC15]"
                            />
                          )}

                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-xl",
                              tone,
                            )}
                          >
                            <Icon className="size-4" aria-hidden="true" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span
                                className={cn(
                                  "line-clamp-2 text-sm leading-snug",
                                  n.read
                                    ? "font-medium text-foreground/80"
                                    : "font-semibold",
                                )}
                              >
                                {n.title}
                              </span>
                              {!n.read && (
                                <>
                                  <span
                                    aria-hidden
                                    className="mt-1.5 size-2 shrink-0 rounded-full bg-[#FACC15]"
                                  />
                                  <span className="sr-only">Unread</span>
                                </>
                              )}
                            </span>

                            {n.body && (
                              <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                                {n.body}
                              </span>
                            )}

                            <span className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                              <span>{label}</span>
                              {n.createdAt ? (
                                <>
                                  <span aria-hidden>·</span>
                                  <span>{timeAgo(n.createdAt)}</span>
                                </>
                              ) : null}
                            </span>
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="px-4 py-10 text-center">
                <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-border bg-muted/50">
                  <BellOff className="size-5 text-muted-foreground" />
                </span>
                <p className="text-sm font-semibold">
                  {tab === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
                <p className="mx-auto mt-1 max-w-[15rem] text-xs leading-relaxed text-muted-foreground">
                  {tab === "unread"
                    ? "You've read everything. Nice work staying on top of it."
                    : "Announcements from our team will appear here."}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/30 p-2">
            <Link
              href="/student/notifications"
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-[#8B5CF6]/10 hover:text-violet-700 dark:hover:text-violet-300",
                FOCUS,
              )}
            >
              View all notifications
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </MotionConfig>
  );
}

export default StudentNotificationsMenu;
