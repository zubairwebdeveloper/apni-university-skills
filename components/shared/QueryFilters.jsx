// components/shared/QueryFilters.jsx: generic URL-driven selects (jobs, and reusable in Part 2)
"use client";
import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
      <div
        className={cn(
          "grid gap-3 transition-opacity duration-200 sm:grid-cols-3",
          pending && "opacity-70",
        )}
      >
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
              <SelectTrigger
                id={`qf-${f.key}`}
                className="w-full transition-shadow focus-visible:shadow-sm"
              >
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
        <AnimatePresence initial={false}>
          {active && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  startTransition(() =>
                    router.replace(pathname, { scroll: false }),
                  )
                }
              >
                <X aria-hidden="true" className="size-3.5" />
                Clear filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {pending && (
          <p
            role="status"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            Updating results…
          </p>
        )}
      </div>
    </div>
  );
}
