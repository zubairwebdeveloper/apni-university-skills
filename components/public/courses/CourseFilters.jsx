// components/public/courses/CourseFilters.jsx
"use client";
import { useId, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LANGUAGES, LEVELS, SORT_OPTIONS } from "@/config/courses";

const ALL = "all"; // Radix Select items can't have an empty-string value

const PRICE_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const labelOf = (options, value) =>
  options.find((option) => option.value === value)?.label ?? value;

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  allLabel,
  active = false,
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </FieldLabel>
      <Select value={value ?? ALL} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className={cn(
            "w-full transition-colors",
            active && "border-primary/50 bg-primary/5",
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

// Removable summary of one active filter.
function FilterChip({ kind, label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${kind} ${label}`}
      className="group inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 py-1 pl-3 pr-2 text-xs transition-colors hover:border-primary/60 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="text-muted-foreground">{kind}</span>
      <span className="truncate font-medium text-foreground">{label}</span>
      <X
        className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
    </button>
  );
}

export function CourseFilters({ categories = [], hideCategory = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const panelId = useId();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false); // filter panel on small screens

  function update(changes) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes))
      !v || v === ALL ? next.delete(k) : next.set(k, v);
    next.delete("after"); // any filter change returns to page one
    const qs = next.toString();
    startTransition(() =>
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }),
    );
  }

  const hasActive = [
    "q",
    "category",
    "level",
    "price",
    "language",
    "sort",
  ].some((k) => params.has(k));
  const q = params.get("q") ?? "";

  const categoryOptions = categories.map((c) => ({
    value: c.slug,
    label: c.name,
  }));
  const languageOptions = LANGUAGES.map((l) => ({ value: l, label: l }));

  // One chip per active filter, so people can see and remove them quickly.
  const chips = [
    q && { key: "q", kind: "Search", label: `“${q}”` },
    !hideCategory &&
      params.get("category") && {
        key: "category",
        kind: "Category",
        label: labelOf(categoryOptions, params.get("category")),
      },
    params.get("level") && {
      key: "level",
      kind: "Level",
      label: labelOf(LEVELS, params.get("level")),
    },
    params.get("price") && {
      key: "price",
      kind: "Price",
      label: labelOf(PRICE_OPTIONS, params.get("price")),
    },
    params.get("language") && {
      key: "language",
      kind: "Language",
      label: params.get("language"),
    },
    params.get("sort") && {
      key: "sort",
      kind: "Sort",
      label: labelOf(SORT_OPTIONS, params.get("sort")),
    },
  ].filter(Boolean);

  // Filters that live inside the collapsible panel (everything except search).
  const panelActiveCount = chips.filter((chip) => chip.key !== "q").length;

  return (
    <div
      className="relative space-y-4 overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5"
      aria-busy={pending}
    >
      {/* Thin progress line while results refresh. */}
      <AnimatePresence>
        {pending && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-border/50"
          >
            <motion.div
              className="h-full w-1/3 bg-primary"
              animate={reduce ? undefined : { x: ["-100%", "300%"] }}
              transition={{
                duration: 1.1,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <form
        role="search"
        key={q}
        onSubmit={(e) => {
          e.preventDefault();
          update({
            q: String(new FormData(e.currentTarget).get("q") ?? "").trim(),
          });
        }}
        className="flex gap-2"
      >
        <Field className="flex-1">
          <FieldLabel htmlFor="course-search" className="sr-only">
            Search courses
          </FieldLabel>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="course-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search courses, e.g. React, Python, AI"
              maxLength={60}
              className="h-11 pl-9 pr-10 [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                onClick={() => update({ q: "" })}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </Field>

        <Button type="submit" className="h-11 px-4 sm:px-5" aria-label="Search">
          {pending ? (
            <Loader2
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Search</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-11 px-3 lg:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Filters</span>
          {panelActiveCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {panelActiveCount}
            </span>
          )}
        </Button>
      </form>

      <div
        id={panelId}
        className={cn(
          "gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]",
          open ? "grid" : "hidden",
        )}
      >
        {!hideCategory && (
          <FilterSelect
            id="f-category"
            label="Category"
            value={params.get("category")}
            onChange={(v) => update({ category: v })}
            allLabel="All categories"
            options={categoryOptions}
            active={params.has("category")}
          />
        )}
        <FilterSelect
          id="f-level"
          label="Level"
          value={params.get("level")}
          onChange={(v) => update({ level: v })}
          allLabel="All levels"
          options={LEVELS}
          active={params.has("level")}
        />
        <FilterSelect
          id="f-price"
          label="Price"
          value={params.get("price")}
          onChange={(v) => update({ price: v })}
          allLabel="Free & paid"
          options={PRICE_OPTIONS}
          active={params.has("price")}
        />
        <FilterSelect
          id="f-language"
          label="Language"
          value={params.get("language")}
          onChange={(v) => update({ language: v })}
          allLabel="Any language"
          options={languageOptions}
          active={params.has("language")}
        />
        <FilterSelect
          id="f-sort"
          label="Sort by"
          value={params.get("sort") ?? "newest"}
          onChange={(v) => update({ sort: v })}
          options={SORT_OPTIONS}
          active={params.has("sort")}
        />
      </div>

      <div className="flex min-h-8 flex-wrap items-center gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {chips.map((chip) => (
            <motion.div
              key={chip.key}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="max-w-full"
            >
              <FilterChip
                kind={chip.kind}
                label={chip.label}
                onRemove={() => update({ [chip.key]: "" })}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {hasActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              startTransition(() => router.replace(pathname, { scroll: false }))
            }
          >
            Clear all filters
          </Button>
        )}

        {pending && (
          <p
            role="status"
            className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Loader2
              className="size-3.5 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Updating results…
          </p>
        )}
      </div>
    </div>
  );
}
