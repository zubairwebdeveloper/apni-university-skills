"use client";

import { useEffect, useState } from "react";
import { FiLoader, FiSearch, FiX } from "react-icons/fi";

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

import { useDebouncedValue } from "@/hooks/useDebounce";
import { useUrlParams } from "@/hooks/useUrlParams";

const ALL = "all";

const pressable =
  "transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

function ToolbarSelect({ id, label, value, onChange, options, allLabel }) {
  return (
    <Field className="min-w-0 lg:w-44">
      <FieldLabel
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </FieldLabel>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="w-full focus-visible:border-yellow-400 focus-visible:ring-yellow-400/30"
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {allLabel && <SelectItem value={ALL}>{allLabel}</SelectItem>}

          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/**
 * filters:
 * [
 *   {
 *     key,
 *     label,
 *     allLabel,
 *     options: [{ value, label }]
 *   }
 * ]
 *
 * Everything lives in the URL, so filtered/sorted views
 * are shareable and browser-navigation friendly.
 */
export function DataTableToolbar({
  searchable = true,
  searchLabel = "Search",
  searchPlaceholder = "Search…",
  searchHint = "Search matches the start of words (2+ characters).",
  filters = [],
  sorts,
  defaultSort = "newest",
  total,
}) {
  const { params, set, clear, pending } = useUrlParams();

  const urlQ = params.get("q") ?? "";

  const [q, setQ] = useState(urlQ);
  const [previousUrlQ, setPreviousUrlQ] = useState(urlQ);

  const debounced = useDebouncedValue(q, 400);

  // URL changed from outside (for example, "Clear").
  // Mirror it without interfering with active typing.
  if (urlQ !== previousUrlQ) {
    setPreviousUrlQ(urlQ);
    setQ(urlQ);
  }

  // Debounced typing -> URL.
  // Fewer than 2 characters means "no search".
  useEffect(() => {
    const next = debounced.trim();
    const value = next.length >= 2 ? next : "";

    if (value !== urlQ) {
      set({ q: value });
    }
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  const keys = [
    ...(searchable ? ["q"] : []),
    ...filters.map((filter) => filter.key),
    ...(sorts ? ["sort"] : []),
  ];

  const activeCount = keys.filter((key) => params.has(key)).length;
  const active = activeCount > 0;

  return (
    <div
      className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4"
      aria-busy={pending}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {searchable && (
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="admin-search" className="sr-only">
              {searchLabel}
            </FieldLabel>

            <div className="relative">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <Input
                id="admin-search"
                type="search"
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder={searchPlaceholder}
                maxLength={60}
                className="pl-9 focus-visible:border-yellow-400 focus-visible:ring-yellow-400/30"
                autoComplete="off"
              />
            </div>
          </Field>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
          {filters.map((filter) => (
            <ToolbarSelect
              key={filter.key}
              id={`tb-${filter.key}`}
              label={filter.label}
              allLabel={filter.allLabel}
              options={filter.options}
              value={params.get(filter.key) ?? ALL}
              onChange={(value) => set({ [filter.key]: value })}
            />
          ))}

          {sorts && (
            <ToolbarSelect
              id="tb-sort"
              label="Sort by"
              options={sorts}
              value={params.get("sort") ?? defaultSort}
              onChange={(value) =>
                set({
                  sort: value === defaultSort ? "" : value,
                })
              }
            />
          )}
        </div>
      </div>

      <div className="flex min-h-7 flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
        {typeof total === "number" && (
          <p aria-live="polite" className="flex items-center gap-1.5">
            <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-violet-500/25 bg-violet-500/10 px-1.5 py-0.5 text-xs font-semibold leading-4 tabular-nums text-violet-700 dark:text-violet-300">
              {total.toLocaleString("en-US")}
            </span>
            <span>{total === 1 ? "result" : "results"}</span>
          </p>
        )}

        {searchable && searchHint !== null && (
          <p className="hidden text-xs leading-5 sm:block">{searchHint}</p>
        )}

        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            className={`gap-1.5 ${pressable}`}
          >
            <FiX aria-hidden="true" className="size-4" />
            Clear filters
            <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-foreground">
              {activeCount}
            </span>
          </Button>
        )}

        {pending && (
          <p
            role="status"
            className="ml-auto flex items-center gap-1.5 text-xs"
          >
            <FiLoader
              aria-hidden="true"
              className="size-3.5 animate-spin motion-reduce:animate-none"
            />
            Updating…
          </p>
        )}
      </div>
    </div>
  );
}
