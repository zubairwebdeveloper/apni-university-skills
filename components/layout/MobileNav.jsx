"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiChevronRight,
  FiCompass,
  FiCpu,
  FiCreditCard,
  FiFileText,
  FiGift,
  FiHelpCircle,
  FiHome,
  FiInfo,
  FiMail,
  FiMenu,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { AuthNav } from "@/components/auth/AuthNav";
import { primaryNav, moreNav } from "@/config/site";
import { cn } from "@/lib/utils";

// Route -> icon. If a link in config has its own `icon`, that wins.
const ICONS = {
  "/": FiHome,
  "/courses": FiBookOpen,
  "/careers": FiCompass,
  "/jobs": FiBriefcase,
  "/blog": FiFileText,
  "/instructors": FiUsers,
  "/pricing": FiCreditCard,
  "/about": FiInfo,
  "/faq": FiHelpCircle,
  "/contact": FiMail,
  "/technology": FiCpu,
  "/ai": FiCpu,
};

function getIcon(link) {
  return link.icon || ICONS[link.href] || FiChevronRight;
}

function isActive(pathname, href) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 18 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

function Logo({ onNavigate }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="group flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Apni University, home"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-highlight text-primary-foreground shadow-sm transition-transform duration-300 group-hover:rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0">
        <FiBookOpen className="size-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-base font-semibold">
          Apni University
        </span>
        <span className="block text-[11px] text-muted-foreground">
          Learn skills. Build your future.
        </span>
      </span>
    </Link>
  );
}

function NavList({ links, pathname, onNavigate, reduce }) {
  return (
    <motion.ul
      className="space-y-1"
      variants={listVariants}
      initial={reduce ? false : "hidden"}
      animate="show"
    >
      {links.map((l) => {
        const Icon = getIcon(l);
        const active = isActive(pathname, l.href);
        return (
          <motion.li key={l.href} variants={reduce ? undefined : itemVariants}>
            <Link
              href={l.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                active
                  ? "bg-primary/10 text-primary"
                  : "hover:translate-x-1 hover:bg-accent motion-reduce:hover:translate-x-0",
              )}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-1 rounded-full bg-primary"
                />
              )}
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg transition-colors duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="flex-1">{l.label}</span>
              <FiChevronRight
                aria-hidden="true"
                className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none"
              />
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

export function MobileNav() {
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const [previousPathname, setPreviousPathname] = useState(pathname);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const close = () => setOpen(false);

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) setQuery("");
  }

  // Reset the menu when the route changes.
  if (previousPathname !== pathname) {
    setPreviousPathname(pathname);
    setOpen(false);
    setQuery("");
  }

  const q = query.trim().toLowerCase();

  const primary = useMemo(
    () =>
      q
        ? primaryNav.filter((l) => l.label.toLowerCase().includes(q))
        : primaryNav,
    [q],
  );
  const more = useMemo(
    () =>
      q ? moreNav.filter((l) => l.label.toLowerCase().includes(q)) : moreNav,
    [q],
  );
  const noResults = q && primary.length === 0 && more.length === 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "group lg:hidden",
        )}
        aria-label="Open menu"
      >
        <FiMenu
          className="size-5 transition-transform duration-200 group-hover:scale-110 group-active:scale-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-[88vw] max-w-sm flex-col gap-0 p-0"
      >
        <SheetHeader className="border-b p-4 pr-12">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
          <Logo onNavigate={close} />
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <nav aria-label="Mobile" className="space-y-5 p-4">
            {/* Search the menu */}
            <div className="relative">
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the menu"
                aria-label="Search the menu"
                className="h-10 w-full rounded-xl border bg-background pl-9 pr-9 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <FiX aria-hidden="true" className="size-4" />
                </button>
              )}
            </div>

            {/* Quick actions (hidden while searching) */}
            {!q && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="space-y-2.5"
              >
                <Link
                  href="/courses"
                  onClick={close}
                  className={buttonVariants({
                    className: "group w-full justify-between",
                  })}
                >
                  <span className="inline-flex items-center gap-2">
                    <FiBookOpen aria-hidden="true" />
                    Browse courses
                  </span>
                  <FiArrowRight
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/courses?price=free"
                    onClick={close}
                    className="group flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <FiGift
                      aria-hidden="true"
                      className="size-4 text-primary transition-transform duration-200 group-hover:rotate-12 motion-reduce:transition-none"
                    />
                    Free courses
                  </Link>
                  <Link
                    href="/careers"
                    onClick={close}
                    className="group flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <FiCompass
                      aria-hidden="true"
                      className="size-4 text-primary transition-transform duration-200 group-hover:rotate-12 motion-reduce:transition-none"
                    />
                    Careers
                  </Link>
                </div>
              </motion.div>
            )}

            {primary.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Explore
                </p>
                <NavList
                  links={primary}
                  pathname={pathname}
                  onNavigate={close}
                  reduce={reduce}
                />
              </div>
            )}

            {primary.length > 0 && more.length > 0 && <Separator />}

            {more.length > 0 && (
              <div>
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  More
                </p>
                <NavList
                  links={more}
                  pathname={pathname}
                  onNavigate={close}
                  reduce={reduce}
                />
              </div>
            )}

            {noResults && (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FiSearch aria-hidden="true" className="size-4" />
                </span>
                <p className="mt-3 text-sm font-medium">No matches</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try another word, or browse all courses.
                </p>
                <Link
                  href="/courses"
                  onClick={close}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "mt-3",
                  })}
                >
                  Browse courses
                </Link>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* Pinned footer: account actions */}
        <div className="border-t bg-card/60 p-4 backdrop-blur">
          <div onClick={close}>
            <AuthNav stacked />
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Apni University
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
