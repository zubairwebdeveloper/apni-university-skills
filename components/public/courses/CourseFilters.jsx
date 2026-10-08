// components/public/courses/CourseFilters.jsx
"use client";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { LANGUAGES, LEVELS, SORT_OPTIONS } from "@/config/courses";

const ALL = "all"; // Radix Select items can't have an empty-string value

function FilterSelect({ id, label, value, onChange, options, allLabel }) {
  return (
    <Field>
      <FieldLabel htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </FieldLabel>
      <Select value={value ?? ALL} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
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

export function CourseFilters({ categories = [], hideCategory = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

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

  return (
    <div className="space-y-4" aria-busy={pending}>
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
          <Input
            id="course-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search courses, e.g. React, Python, AI"
            maxLength={60}
          />
        </Field>
        <Button type="submit">
          <FiSearch aria-hidden="true" /> Search
        </Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {!hideCategory && (
          <FilterSelect
            id="f-category"
            label="Category"
            value={params.get("category")}
            onChange={(v) => update({ category: v })}
            allLabel="All categories"
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          />
        )}
        <FilterSelect
          id="f-level"
          label="Level"
          value={params.get("level")}
          onChange={(v) => update({ level: v })}
          allLabel="All levels"
          options={LEVELS}
        />
        <FilterSelect
          id="f-price"
          label="Price"
          value={params.get("price")}
          onChange={(v) => update({ price: v })}
          allLabel="Free & paid"
          options={[
            { value: "free", label: "Free" },
            { value: "paid", label: "Paid" },
          ]}
        />
        <FilterSelect
          id="f-language"
          label="Language"
          value={params.get("language")}
          onChange={(v) => update({ language: v })}
          allLabel="Any language"
          options={LANGUAGES.map((l) => ({ value: l, label: l }))}
        />
        <FilterSelect
          id="f-sort"
          label="Sort by"
          value={params.get("sort") ?? "newest"}
          onChange={(v) => update({ sort: v })}
          options={SORT_OPTIONS}
        />
      </div>

      <div className="flex min-h-6 items-center gap-3">
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
          <p role="status" className="text-sm text-muted-foreground">
            Updating results…
          </p>
        )}
      </div>
    </div>
  );
}

