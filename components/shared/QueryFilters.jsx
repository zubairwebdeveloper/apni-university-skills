// components/shared/QueryFilters.jsx: generic URL-driven selects (jobs, and reusable in Part 2)
"use client";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

export function QueryFilters({ fields }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key, value) {
    const next = new URLSearchParams(params.toString());
    value && value !== ALL ? next.set(key, value) : next.delete(key);
    next.delete("after"); // any filter change returns to page one
    const qs = next.toString();
    startTransition(() =>
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }),
    );
  }

  const active = fields.some((f) => params.has(f.key));
  return (
    <div className="space-y-3" aria-busy={pending}>
      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map((f) => (
          <Field key={f.key}>
            <FieldLabel
              htmlFor={`qf-${f.key}`}
              className="text-xs text-muted-foreground"
            >
              {f.label}
            </FieldLabel>
            <Select
              value={params.get(f.key) ?? ALL}
              onValueChange={(v) => update(f.key, v)}
            >
              <SelectTrigger id={`qf-${f.key}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{f.allLabel}</SelectItem>
                {f.options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ))}
      </div>
      <div className="flex min-h-6 items-center gap-3">
        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              startTransition(() => router.replace(pathname, { scroll: false }))
            }
          >
            Clear filters
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

