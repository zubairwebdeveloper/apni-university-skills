"use client";

import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

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

function ToolbarSelect({ id, label, value, onChange, options, allLabel }) {
  return (
    <Field className="lg:w-44">
      <FieldLabel htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </FieldLabel>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
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

  const active = keys.some((key) => params.has(key));

  return (
    <div className="space-y-3" aria-busy={pending}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {searchable && (
          <Field className="flex-1">
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
                className="pl-9"
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

      <div className="flex min-h-6 flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {typeof total === "number" && (
          <p aria-live="polite">
            {total.toLocaleString("en-US")} {total === 1 ? "result" : "results"}
          </p>
        )}

        {searchable && searchHint !== null && (
          <p className="hidden sm:block">{searchHint}</p>
        )}

        {active && (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            Clear filters
          </Button>
        )}

        {pending && <p role="status">Updating…</p>}
      </div>
    </div>
  );
}
